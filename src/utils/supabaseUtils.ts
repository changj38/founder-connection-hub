
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const uploadProfilePhoto = async (userId: string, file: File) => {
  try {
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
    const fileName = `${timestamp}.${fileExtension}`;
    
    // The path must start with the user ID to comply with RLS policies
    // Format: userId/filename.ext
    const filePath = `${userId}/${fileName}`;
    
    console.log(`Attempting to upload file to ${bucketName}/${filePath}`);
    
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
