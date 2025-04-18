
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
    console.log(`Uploading profile photo for user ${userId}`);
    
    // Validate file type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      throw new Error('Unsupported file type. Please upload a valid image (JPG, PNG, GIF, or WEBP).');
    }
    
    // Create folder structure with user ID - using user ID as the folder name ensures
    // that users can only access their own folders with RLS policies
    const filePath = `${userId}/profile.${fileExt}`;
    
    console.log(`Storage path for upload: ${filePath}`);

    // Upload the file with upsert: true to replace existing files
    const { data, error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, { 
        upsert: true,
        contentType: file.type // Explicitly set the content type
      });

    if (uploadError) {
      console.error('Error uploading profile photo:', uploadError);
      throw uploadError;
    }

    console.log('Upload successful:', data);

    // Important: Need to get the public URL after a successful upload
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath);

    console.log('Public URL:', publicUrl);
    
    // Add a cache busting parameter to ensure the browser fetches the new image
    const cacheBustedUrl = `${publicUrl}?t=${new Date().getTime()}`;
    return cacheBustedUrl;
  } catch (error) {
    console.error('Error uploading profile photo:', error);
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
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};
