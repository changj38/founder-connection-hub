
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
    console.log('Starting upload process for userId:', userId);
    
    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size exceeds 5MB limit');
    }
    
    // Validate file type
    const fileType = file.type.toLowerCase();
    if (!fileType.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
      throw new Error('Invalid file type. Please upload a JPG, PNG, GIF, or WEBP image');
    }
    
    // Check if bucket exists first and create it if it doesn't
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking buckets:', bucketsError);
      throw new Error(`Could not check storage buckets: ${bucketsError.message}`);
    }
    
    const bucketName = 'profile-photos';
    const bucketExists = buckets?.some(b => b.name === bucketName);
    
    if (!bucketExists) {
      console.log('Bucket does not exist, creating it now');
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        throw new Error(`Could not create bucket: ${createError.message}`);
      }
      
      console.log('Bucket created successfully');
    }
    
    // Generate a simple filename with timestamp
    const timestamp = new Date().getTime();
    const fileExtension = file.name.split('.').pop();
    const filePath = `${timestamp}.${fileExtension}`;
    
    console.log(`Uploading file ${filePath} to bucket ${bucketName}`);
    
    // Remove old files to avoid accumulation
    try {
      const { data: existingFiles } = await supabase.storage
        .from(bucketName)
        .list(userId);
        
      if (existingFiles && existingFiles.length > 0) {
        console.log('Found existing files to remove:', existingFiles);
        
        const filesToRemove = existingFiles.map(file => `${userId}/${file.name}`);
        const { error: removeError } = await supabase.storage
          .from(bucketName)
          .remove(filesToRemove);
          
        if (removeError) {
          console.warn('Could not remove old files:', removeError);
        } else {
          console.log('Successfully removed old files');
        }
      }
    } catch (error) {
      console.warn('Error checking existing files:', error);
      // Continue with upload even if cleanup fails
    }
    
    // Upload the file to a folder named with the userId
    const fullPath = `${userId}/${filePath}`;
    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fullPath, file, { 
        cacheControl: '3600',
        upsert: true 
      });
      
    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    
    if (!data) {
      throw new Error('Upload failed: No data returned');
    }
    
    console.log('File uploaded successfully:', data);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fullPath);
      
    if (!urlData?.publicUrl) {
      throw new Error('Could not get public URL for uploaded file');
    }
    
    // Add cache buster to URL
    const publicUrl = `${urlData.publicUrl}?t=${timestamp}`;
    console.log('Public URL:', publicUrl);
    
    return publicUrl;
  } catch (error: any) {
    console.error('Profile photo upload failed:', error);
    toast.error(error.message || 'Failed to upload profile photo');
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
    
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Error updating profile:', error);
      throw new Error(`Profile update failed: ${error.message}`);
    }
    
    console.log('Profile updated successfully:', data);
    return data || true;
  } catch (error: any) {
    console.error('Error updating profile:', error);
    throw new Error(error.message || 'Failed to update profile');
  }
};
