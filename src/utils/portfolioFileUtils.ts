
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const uploadPortfolioLogo = async (file: File, companyName: string) => {
  try {
    // Verify session before doing anything
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No active session found');
      throw new Error('You must be logged in to upload a logo');
    }
    
    console.log('Starting logo upload process for company:', companyName);
    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size exceeds 5MB limit');
    }
    
    // Validate file type
    const fileType = file.type.toLowerCase();
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    
    if (!allowedTypes.includes(fileType)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }
    
    const bucketName = 'portfolio-logos';
    
    // Generate a filename with timestamp and sanitized company name
    const timestamp = new Date().getTime();
    const fileExtension = file.name.split('.').pop();
    const sanitizedCompanyName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const fileName = `${sanitizedCompanyName}-${timestamp}.${fileExtension}`;
    
    // The path format: company-name/filename.ext
    const filePath = `${sanitizedCompanyName}/${fileName}`;
    
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
    console.error('Portfolio logo upload failed:', error);
    toast.error(error.message || 'Failed to upload logo');
    throw error;
  }
};
