
import { supabase } from '../integrations/supabase/client';

// Define types
interface NetworkContact {
  id: string;
  name: string;
  company?: string;
  position?: string;
  email?: string;
  linkedin_url?: string;
  notes?: string;
  avatar_url?: string;
  is_lp?: boolean;
  created_at: string;
  created_by: string;
  updated_at: string;
}

interface PortfolioCompany {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  founded_year?: number;
  investment_year?: number;
  website?: string;
  logo_url?: string;
  created_at: string;
  created_by: string;
  updated_at: string;
}

interface Profile {
  id: string;
  full_name?: string;
  company?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

interface HelpRequest {
  id: string;
  user_id: string;
  message: string;
  request_type: string;
  status: string;
  resolution_notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

// Extended interface with profiles
interface HelpRequestWithProfile extends HelpRequest {
  profiles: Profile | null;
}

interface HelpRequestStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  declined: number;
  byType: {
    intro: number;
    portfolio: number;
    other: number;
  };
}

// Network contacts functions
export const fetchNetworkContacts = async (): Promise<NetworkContact[]> => {
  const { data, error } = await supabase
    .from('network_contacts')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching network contacts:', error);
    throw error;
  }
  
  return data || [];
};

export const addNetworkContact = async (contactData: Partial<NetworkContact>) => {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user?.id) {
    throw new Error('User not authenticated');
  }
  
  const { error } = await supabase
    .from('network_contacts')
    .insert({
      ...contactData,
      created_by: userData.user.id
    });
  
  if (error) {
    console.error('Error adding network contact:', error);
    throw error;
  }
  
  return true;
};

export const updateNetworkContact = async (id: string, contactData: Partial<NetworkContact>) => {
  const { error } = await supabase
    .from('network_contacts')
    .update(contactData)
    .eq('id', id);
  
  if (error) {
    console.error('Error updating network contact:', error);
    throw error;
  }
  
  return true;
};

export const updateContactAvatar = async (id: string, avatarUrl: string) => {
  const { error } = await supabase
    .from('network_contacts')
    .update({ avatar_url: avatarUrl })
    .eq('id', id);
  
  if (error) {
    console.error('Error updating contact avatar:', error);
    throw error;
  }
  
  return true;
};

// Note: LinkedIn doesn't provide a simple API to fetch profile pictures
// This function is provided as a placeholder for a future implementation
// that might use a third-party service or manual URL input
export const fetchLinkedInProfilePicture = async (linkedinUrl: string) => {
  // This would require LinkedIn API access with proper authentication
  // which is beyond the scope of this implementation
  console.log('LinkedIn profile URL:', linkedinUrl);
  return null;
};

// Portfolio companies functions
export const fetchPortfolioCompanies = async (): Promise<PortfolioCompany[]> => {
  const { data, error } = await supabase
    .from('portfolio_companies')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching portfolio companies:', error);
    throw error;
  }
  
  return data || [];
};

export const addPortfolioCompany = async (companyData: Partial<PortfolioCompany>) => {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user?.id) {
    throw new Error('User not authenticated');
  }
  
  const { error } = await supabase
    .from('portfolio_companies')
    .insert({
      ...companyData,
      created_by: userData.user.id
    });
  
  if (error) {
    console.error('Error adding portfolio company:', error);
    throw error;
  }
  
  return true;
};

// Help requests functions
export const fetchHelpRequests = async (): Promise<HelpRequestWithProfile[]> => {
  // Get help requests without trying to join with profiles
  const { data: helpRequests, error } = await supabase
    .from('help_requests')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching help requests:', error);
    throw error;
  }
  
  // Now fetch user profiles separately to get user information
  if (helpRequests && helpRequests.length > 0) {
    const userIds = [...new Set(helpRequests.map(request => request.user_id))];
    
    // Fetch profiles for these users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);
    
    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError);
      // Continue without profiles rather than failing completely
    }
    
    // Create a map of user IDs to their profile data for easy lookup
    const profilesMap = (profiles || []).reduce((acc: Record<string, Profile>, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {});
    
    // Add profile data to each help request
    const helpRequestsWithProfiles = helpRequests.map(request => ({
      ...request,
      profiles: profilesMap[request.user_id] || null
    }));
    
    return helpRequestsWithProfiles;
  }
  
  return helpRequests.map(request => ({ ...request, profiles: null }));
};

export const updateHelpRequestStatus = async (id: string, status: string, resolutionNotes?: string) => {
  const updateData: { status: string; resolution_notes?: string } = { status };
  
  if (resolutionNotes) {
    updateData.resolution_notes = resolutionNotes;
  }
  
  const { error } = await supabase
    .from('help_requests')
    .update(updateData)
    .eq('id', id);
  
  if (error) {
    console.error('Error updating help request status:', error);
    throw error;
  }
  
  return true;
};

// Function to get help request statistics
export const getHelpRequestStats = async (): Promise<HelpRequestStats> => {
  const { data, error } = await supabase
    .from('help_requests')
    .select('status, request_type');
  
  if (error) {
    console.error('Error fetching help request stats:', error);
    throw error;
  }
  
  // Calculate statistics
  const stats = {
    total: data.length,
    pending: data.filter(req => req.status === 'Pending').length,
    inProgress: data.filter(req => req.status === 'In Progress').length,
    completed: data.filter(req => req.status === 'Completed').length,
    declined: data.filter(req => req.status === 'Declined').length,
    byType: {
      intro: data.filter(req => req.request_type === 'intro').length,
      portfolio: data.filter(req => req.request_type === 'portfolio').length,
      other: data.filter(req => !['intro', 'portfolio'].includes(req.request_type)).length
    }
  };
  
  return stats;
};

// Function to assign a request to an admin
export const assignHelpRequest = async (requestId: string, adminId: string) => {
  const { error } = await supabase
    .from('help_requests')
    .update({ assigned_to: adminId })
    .eq('id', requestId);
  
  if (error) {
    console.error('Error assigning help request:', error);
    throw error;
  }
  
  return true;
};
