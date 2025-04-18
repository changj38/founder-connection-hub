
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { updateUserProfile, uploadProfilePhoto } from '@/utils/supabaseUtils';

const ProfileSettingsPage = () => {
  const { currentUser, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [company, setCompany] = useState(currentUser?.company || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Load user data
  useEffect(() => {
    if (currentUser) {
      console.log('Loading user data in profile settings:', currentUser);
      setFullName(currentUser.fullName || '');
      setCompany(currentUser.company || '');
      setLocation(currentUser.location || '');
      if (currentUser.avatar_url) {
        console.log('Setting avatar URL from user data:', currentUser.avatar_url);
        setPreviewUrl(currentUser.avatar_url);
      }
    }
  }, [currentUser]);

  // Clear preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log('File selected:', file.name, file.type, file.size);
      
      // Validate file size
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setUploadError('File size exceeds 5MB limit');
        toast.error('File size exceeds 5MB limit');
        return;
      }
      
      // Validate file type
      const fileType = file.type.toLowerCase();
      if (!fileType.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
        setUploadError('Invalid file type. Please upload a JPG, PNG, GIF, or WEBP image');
        toast.error('Invalid file type. Please upload a JPG, PNG, GIF, or WEBP image');
        return;
      }
      
      setSelectedFile(file);
      
      // Create a preview URL for the selected image
      const objectUrl = URL.createObjectURL(file);
      console.log('Created object URL for preview:', objectUrl);
      setPreviewUrl(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('You must be logged in to update your profile');
      return;
    }
    
    setIsSubmitting(true);
    setUploadError(null);

    try {
      // Upload profile photo if selected
      let avatarUrl = currentUser.avatar_url || '';
      if (selectedFile) {
        console.log('Starting profile photo upload process...');
        
        try {
          avatarUrl = await uploadProfilePhoto(currentUser.id, selectedFile);
          console.log('Upload successful, new avatar URL:', avatarUrl);
          
          // Test if the URL is accessible
          const testImg = new Image();
          testImg.onload = () => console.log('Image URL is valid and accessible');
          testImg.onerror = () => console.error('Image URL cannot be loaded');
          testImg.src = avatarUrl;
        } catch (error) {
          console.error('Error uploading profile photo:', error);
          setUploadError('Failed to upload profile photo. Please try again.');
          toast.error('Failed to upload profile photo. Please try again.');
          // Continue with the profile update even if the photo upload fails
        }
      }

      // Update profile
      const profileData = {
        full_name: fullName,
        company,
        location,
        avatar_url: avatarUrl
      };
      
      console.log('Updating profile with data:', profileData);
      await updateUserProfile(currentUser.id, profileData);
      
      // Refresh the user data in the auth context
      const updatedUser = await refreshUserData();
      console.log('Profile refreshed, updated user data:', updatedUser);

      toast.success('Profile updated successfully');
      
      // Force reload the avatar image if it exists
      if (avatarUrl) {
        const timestamp = new Date().getTime();
        const refreshedUrl = avatarUrl.includes('?') 
          ? `${avatarUrl}&_=${timestamp}` 
          : `${avatarUrl}?_=${timestamp}`;
        setPreviewUrl(refreshedUrl);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-md mx-auto space-y-6 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-center">Edit Profile</h1>
      
      <div className="flex justify-center mb-6">
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden" 
        />
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage 
              src={previewUrl || undefined} 
              alt="Profile photo" 
              onError={() => console.error('Error loading avatar image from URL:', previewUrl)}
            />
            <AvatarFallback>{currentUser?.fullName?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          <Button 
            variant="secondary" 
            size="icon" 
            className="absolute bottom-0 right-0 h-8 w-8 rounded-full" 
            onClick={triggerFileInput}
          >
            ✏️
          </Button>
        </div>
      </div>

      {uploadError && (
        <div className="text-red-500 text-sm text-center">{uploadError}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
            placeholder="Your full name" 
          />
        </div>

        <div className="space-y-2">
          <Label>Company</Label>
          <Input 
            value={company} 
            onChange={(e) => setCompany(e.target.value)} 
            placeholder="Your company" 
          />
        </div>

        <div className="space-y-2">
          <Label>Location</Label>
          <Input 
            value={location} 
            onChange={(e) => setLocation(e.target.value)} 
            placeholder="City, Country" 
          />
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Updating...' : 'Update Profile'}
        </Button>
      </form>
    </div>
  );
};

export default ProfileSettingsPage;
