
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
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [company, setCompany] = useState(currentUser?.company || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Load user data
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || '');
      setCompany(currentUser.company || '');
      setLocation(currentUser.location || '');
    }
  }, [currentUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('You must be logged in to update your profile');
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Upload profile photo if selected
      let avatarUrl = currentUser.avatar_url;
      if (selectedFile) {
        try {
          avatarUrl = await uploadProfilePhoto(currentUser.id, selectedFile);
        } catch (error) {
          console.error('Error uploading profile photo:', error);
          toast.error('Failed to upload profile photo');
          // Continue with the profile update even if the photo upload fails
        }
      }

      // Update profile
      await updateUserProfile(currentUser.id, {
        full_name: fullName,
        company,
        location,
        avatar_url: avatarUrl
      });

      toast.success('Profile updated successfully');
      navigate('/dashboard');
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
          accept="image/*"
          className="hidden" 
        />
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage 
              src={selectedFile 
                ? URL.createObjectURL(selectedFile) 
                : currentUser?.avatar_url || undefined
              } 
              alt="Profile photo" 
            />
            <AvatarFallback>{currentUser?.fullName?.charAt(0)}</AvatarFallback>
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
