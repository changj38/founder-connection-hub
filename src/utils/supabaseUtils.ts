
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const countProfilesInSupabase = async () => {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error counting profiles:', error);
    return null;
  }

  console.log('Number of profiles:', count);
  return count;
};

export const getProfilesInSupabase = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, company, role');

  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }

  console.log('Profiles retrieved:', data);
  return data;
};

export const getSpecificProfile = async (userId: string) => {
  if (!userId) {
    console.error('Cannot fetch profile: userId is empty or undefined');
    return null;
  }

  console.log(`Fetching profile for user ${userId}`);
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, company, role')
    .eq('id', userId)
    .single();

  if (error) {
    console.error(`Error fetching profile for user ${userId}:`, error);
    
    if (error.code === 'PGRST116') {
      console.log(`No profile found for user ${userId}, creating a default profile`);
      
      const defaultProfile = {
        id: userId,
        full_name: 'Anonymous User',
        company: '',
        role: 'user'
      };
      
      const { data: newData, error: insertError } = await supabase
        .from('profiles')
        .insert([defaultProfile])
        .select()
        .single();
      
      if (insertError) {
        console.error(`Error creating default profile for user ${userId}:`, insertError);
        return defaultProfile;
      }
      
      console.log(`Default profile created for user ${userId}:`, newData);
      return newData;
    }
    
    return null;
  }

  console.log(`Profile found for user ${userId}:`, data);
  return data;
};

export const getUserProfileMap = async (userIds: string[]) => {
  if (!userIds || userIds.length === 0) {
    console.log('No user IDs provided for profile mapping');
    return {};
  }

  console.log('Attempting to fetch profiles for user IDs:', userIds);
  
  const validUserIds = userIds.filter(id => id && typeof id === 'string');
  
  if (validUserIds.length === 0) {
    console.log('No valid user IDs to fetch profiles for');
    return {};
  }

  console.log('Fetching profiles for users:', validUserIds);
  
  const { data: allProfiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, company, role');

  if (error) {
    console.error('Error fetching profiles:', error);
    return {};
  }

  console.log(`Retrieved ${allProfiles?.length || 0} total profiles from database`);
  
  const profileMap: Record<string, any> = {};
  
  if (allProfiles && allProfiles.length > 0) {
    allProfiles.forEach(profile => {
      profileMap[profile.id] = {
        name: profile.full_name || 'Anonymous User',
        company: profile.company || '',
        role: profile.role || 'user'
      };
    });
    
    let foundCount = 0;
    validUserIds.forEach(id => {
      if (profileMap[id]) {
        foundCount++;
      }
    });
    
    console.log(`Found ${foundCount} profiles out of ${validUserIds.length} requested user IDs`);
  }
  
  validUserIds.forEach(id => {
    if (!profileMap[id]) {
      console.warn(`No profile found for user ID: ${id}, creating default entry`);
      profileMap[id] = {
        name: 'Anonymous User',
        company: '',
        role: 'user'
      };
    }
  });
  
  return profileMap;
};

export const ensureUserProfile = async (userId: string, fullName?: string, company?: string) => {
  if (!userId) {
    console.error('Cannot ensure profile: userId is empty or undefined');
    return null;
  }
  
  const { data: existingProfile, error: checkError } = await supabase
    .from('profiles')
    .select('id, full_name, company')
    .eq('id', userId)
    .single();
    
  if (checkError) {
    if (checkError.code === 'PGRST116') {
      console.log(`No profile found for user ${userId}, creating one...`);
      
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      const newProfile = {
        id: userId,
        full_name: fullName || userData?.user?.user_metadata?.full_name || 'Anonymous User',
        company: company || userData?.user?.user_metadata?.company || ''
      };
      
      const { data, error: insertError } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating profile:', insertError);
        return null;
      }
      
      console.log('Profile created successfully:', data);
      return data;
    } else {
      console.error('Error checking for existing profile:', checkError);
      return null;
    }
  }
  
  console.log('Profile already exists:', existingProfile);
  return existingProfile;
};

export const uploadProfilePhoto = async (userId: string, file: File) => {
  try {
    console.log('Starting upload process:', {
      userId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    // List available buckets with more comprehensive logging
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    console.log('Available buckets:', buckets ? buckets.map(b => b.name) : 'No buckets found');
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      throw new Error(`Failed to list storage buckets: ${bucketsError.message}`);
    }
    
    // Explicitly create the bucket if it doesn't exist
    if (!buckets?.some(b => b.name === 'profile-photos')) {
      console.log('Creating profile-photos bucket...');
      const { data, error } = await supabase.storage.createBucket('profile-photos', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });
      
      if (error) {
        console.error('Error creating profile-photos bucket:', error);
        throw new Error(`Failed to create profile-photos bucket: ${error.message}`);
      }
      
      console.log('Profile-photos bucket created successfully');
    }

    // Create a unique filename including timestamp to prevent conflicts
    const timestamp = new Date().getTime();
    const fileExtension = file.name.split('.').pop();
    const filePath = `${userId}/profile-${timestamp}.${fileExtension}`;
    console.log('Uploading to path:', filePath);

    // First check if folder exists
    try {
      const { data: existingFiles, error: listError } = await supabase.storage
        .from('profile-photos')
        .list(userId);
        
      if (listError) {
        console.error('Error listing existing files:', listError);
        // Continue anyway - folder might not exist yet
      } else {
        console.log('Existing files in folder:', existingFiles);
        
        // Remove existing profile photos to save storage space
        if (existingFiles && existingFiles.length > 0) {
          console.log('Removing existing files:', existingFiles);
          const filesToRemove = existingFiles.map(file => `${userId}/${file.name}`);
          const { error: removeError } = await supabase.storage
            .from('profile-photos')
            .remove(filesToRemove);
            
          if (removeError) {
            console.error('Error removing existing files:', removeError);
            // Continue anyway - this isn't critical
          } else {
            console.log('Successfully removed old files');
          }
        }
      }
    } catch (listError) {
      console.error('Error listing existing files:', listError);
      // Continue with upload anyway
    }

    // Upload the new file - make sure we're using the correct API
    console.log('Starting file upload to', filePath);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, { 
        upsert: true,
        contentType: file.type
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      
      // Add more detailed error messages
      if (uploadError.message.includes('Permission denied')) {
        throw new Error('Permission denied. The storage bucket may have restrictive policies.');
      } else if (uploadError.message.includes('Request entity too large')) {
        throw new Error('File is too large. Please upload a smaller file (max 5MB).');
      } else {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
    }

    console.log('Upload successful, data:', uploadData);

    // Get public URL - make sure we use the correct API format and bucket name
    const { data: publicUrlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath);
    
    const publicUrl = publicUrlData.publicUrl;
    console.log('Generated public URL:', publicUrl);
    
    // Add cache buster to prevent browser caching
    const finalUrl = `${publicUrl}?t=${timestamp}`;
    console.log('Final URL with cache buster:', finalUrl);
    
    // Test URL accessibility
    try {
      const response = await fetch(finalUrl, { method: 'HEAD' });
      console.log('URL accessibility test:', {
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type')
      });
      
      if (!response.ok) {
        console.warn('URL may not be accessible, status:', response.status);
      }
    } catch (checkError) {
      console.warn('Could not verify URL accessibility:', checkError);
      // Continue anyway - this is just a validation check
    }
    
    toast.success('Profile photo uploaded successfully');
    return finalUrl;
  } catch (error: any) {
    console.error('Profile photo upload failed:', error);
    toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
    throw error;
  }
};

export const updateUserProfile = async (
  userId: string, 
  profileData: {
    full_name?: string, 
    company?: string, 
    location?: string, 
    avatar_url?: string
  }
) => {
  try {
    console.log(`Updating profile for user ${userId} with data:`, profileData);
    
    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
    
    console.log('Profile updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};
