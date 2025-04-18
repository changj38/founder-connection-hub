import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const updateUserProfile = async (userId: string, userData: {
  full_name: string;
  company: string;
  location: string;
  avatar_url?: string;
}) => {
  try {
    // Check authentication first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('You must be logged in to update your profile');
    }
    
    console.log('Updating profile for user:', userId);
    console.log('Profile data:', userData);
    
    const { error } = await supabase
      .from('profiles')
      .update(userData)
      .eq('id', userId);
      
    if (error) {
      console.error('Error from Supabase:', error);
      throw error;
    }
    
    console.log('Profile updated successfully');
    return true;
  } catch (error: any) {
    console.error('Error updating profile:', error);
    toast.error(error.message || 'Failed to update profile');
    return false;
  }
};

export const uploadProfilePhoto = async (userId: string, file: File) => {
  try {
    // Verify session before doing anything
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No active session found');
      throw new Error('You must be logged in to upload a profile photo');
    }
    
    // Ensure userId matches the authenticated user's ID
    if (userId !== session.user.id) {
      console.error('User ID mismatch:', { requestedUserId: userId, authenticatedUserId: session.user.id });
      throw new Error('You can only upload photos to your own profile');
    }
    
    console.log('Starting upload process for userId:', userId);
    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });
    
    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size exceeds 5MB limit');
    }
    
    // Validate file type with more explicit logging
    const fileType = file.type.toLowerCase();
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    console.log('Allowed file types:', allowedTypes);
    console.log('Uploaded file type:', fileType);
    
    if (!allowedTypes.includes(fileType)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }
    
    const bucketName = 'profile-photos';
    
    // Generate a simple filename with timestamp
    const timestamp = new Date().getTime();
    const fileExtension = file.name.split('.').pop();
    const fileName = `avatar-${timestamp}.${fileExtension}`;
    
    // The path must start with the user ID to comply with RLS policies
    // Format: userId/filename.ext
    const filePath = `${userId}/${fileName}`;
    
    console.log(`Attempting to upload file to ${bucketName}/${filePath}`);
    console.log('Session status:', session ? 'Active' : 'None');
    console.log('User ID in session:', session?.user?.id);
    
    // Add a small delay to ensure bucket is fully created and ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if bucket exists before attempting upload with retry
    let bucketExists = false;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (!bucketExists && retryCount < maxRetries) {
      console.log(`Checking bucket existence (attempt ${retryCount + 1}/${maxRetries})...`);
      
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Error fetching buckets:', bucketsError);
        retryCount++;
        
        if (retryCount >= maxRetries) {
          throw new Error('Could not verify storage buckets after multiple attempts');
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      bucketExists = buckets?.some(bucket => bucket.id === bucketName);
      console.log('Buckets found:', buckets?.map(b => b.id));
      console.log(`Bucket '${bucketName}' exists:`, bucketExists);
      
      if (!bucketExists) {
        retryCount++;
        
        if (retryCount >= maxRetries) {
          throw new Error(`Storage bucket '${bucketName}' does not exist after multiple checks`);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Try getting supabase auth user directly before upload
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      throw new Error('Could not verify user authentication');
    }
    
    console.log('Authenticated user from getUser():', user.id);
    
    // Upload the file
    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, { 
        cacheControl: '3600',
        upsert: true 
      });
      
    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    
    if (!data) {
      throw new Error('Upload failed: No data returned');
    }
    
    console.log('File uploaded successfully:', data);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
      
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

export const getUserProfileMap = async (userIds?: string[]) => {
  try {
    let query = supabase
      .from('profiles')
      .select('id, full_name, avatar_url, company');
    
    if (userIds && userIds.length > 0) {
      query = query.in('id', userIds);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const profileMap: Record<string, { fullName: string, avatarUrl: string, name: string, company: string }> = {};
    
    data?.forEach(profile => {
      profileMap[profile.id] = {
        fullName: profile.full_name || 'Anonymous User',
        avatarUrl: profile.avatar_url || '',
        name: profile.full_name || 'Anonymous User',
        company: profile.company || ''
      };
    });
    
    return profileMap;
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    return {};
  }
};

export const ensureUserProfile = async (userId: string, fullName?: string, company?: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    // If profile doesn't exist, create it
    if (!data) {
      const newProfile = { 
        id: userId,
        full_name: fullName || null,
        company: company || null
      };
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([newProfile]);
      
      if (insertError) throw insertError;
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring user profile:', error);
    return false;
  }
};

export const countProfilesInSupabase = async () => {
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    console.error('Error counting profiles:', error);
    return 0;
  }
};

export const getProfilesInSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
};

export const getSpecificProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching specific profile:', error);
    return null;
  }
};
