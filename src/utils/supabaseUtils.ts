
import { supabase } from '@/integrations/supabase/client';

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

  // Filter out any invalid IDs
  const validUserIds = userIds.filter(id => id && typeof id === 'string');
  
  if (validUserIds.length === 0) {
    console.log('No valid user IDs to fetch profiles for');
    return {};
  }

  console.log('Fetching profiles for users:', validUserIds);
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, company, role')
    .in('id', validUserIds);

  if (error) {
    console.error('Error fetching profiles:', error);
    return {};
  }

  console.log(`Retrieved ${data?.length || 0} profiles out of ${validUserIds.length} requested user IDs`);
  
  // Convert to a map for easy lookup
  const profileMap: Record<string, any> = {};
  
  if (data && data.length > 0) {
    data.forEach(profile => {
      profileMap[profile.id] = {
        name: profile.full_name || 'Anonymous User',
        company: profile.company || '',
        role: profile.role || 'user'
      };
    });
  }
  
  // For any user IDs that don't have profiles, create default entries
  validUserIds.forEach(id => {
    if (!profileMap[id]) {
      console.warn(`No profile found for user ID: ${id}`);
      profileMap[id] = {
        name: 'Anonymous User',
        company: '',
        role: 'user'
      };
    }
  });
  
  return profileMap;
};

// Create a profile for a user if it doesn't exist
export const ensureUserProfile = async (userId: string, fullName?: string, company?: string) => {
  if (!userId) {
    console.error('Cannot ensure profile: userId is empty or undefined');
    return null;
  }
  
  // First check if the profile exists
  const { data: existingProfile, error: checkError } = await supabase
    .from('profiles')
    .select('id, full_name, company')
    .eq('id', userId)
    .single();
    
  if (checkError) {
    if (checkError.code === 'PGRST116') { // Record not found
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
