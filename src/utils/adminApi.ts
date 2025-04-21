
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

// The base HelpRequest interface that matches the database schema
interface HelpRequest {
  id: string;
  user_id: string;
  message: string;
  request_type: string;
  status: string;
  requester_email?: string; // Now present in database schema
  resolution_notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

// Extended interface that includes profile information
interface HelpRequestWithProfile extends HelpRequest {
  profiles: Profile | null;
  user_email?: string;
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

// Authorized email interface
interface AuthorizedEmail {
  id: string;
  email: string;
  created_at: string;
  created_by?: string;
}

// Authorized emails functions
export const fetchAuthorizedEmails = async (): Promise<AuthorizedEmail[]> => {
  const { data, error } = await supabase
    .from('authorized_emails')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching authorized emails:', error);
    throw error;
  }
  
  return data || [];
};

export const addAuthorizedEmail = async (email: string): Promise<void> => {
  const { error } = await supabase
    .from('authorized_emails')
    .insert([{ email: email.toLowerCase() }]);
  
  if (error) {
    console.error('Error adding authorized email:', error);
    throw error;
  }
};

export const removeAuthorizedEmail = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('authorized_emails')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error removing authorized email:', error);
    throw error;
  }
};

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
  
  // Ensure name is provided as it's required in the database schema
  if (!contactData.name) {
    throw new Error('Name is required');
  }
  
  const { error } = await supabase
    .from('network_contacts')
    .insert({
      ...contactData,
      name: contactData.name, // Explicitly include name to satisfy TypeScript
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

export const fetchLinkedInProfilePicture = async (linkedinUrl: string) => {
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

export const addPortfolioCompany = async (companyData: { 
  name: string;  // Ensuring name is required
  description?: string;
  industry?: string;
  founded_year?: number;
  investment_year?: number;
  website?: string;
  logo_url?: string;
}) => {
  try {
    console.log('Starting addPortfolioCompany with data:', companyData);
    
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting current user:', userError);
      throw new Error('Authentication error: ' + userError.message);
    }
    
    if (!userData?.user?.id) {
      console.error('User not authenticated when adding portfolio company - no user ID found');
      throw new Error('User not authenticated');
    }
    
    // Ensure name is provided as it's required in the database schema
    if (!companyData.name) {
      console.error('Company name is required but was not provided');
      throw new Error('Company name is required');
    }
    
    console.log('Preparing to insert portfolio company with data:', {
      ...companyData,
      created_by: userData.user.id
    });
    
    const { data, error } = await supabase
      .from('portfolio_companies')
      .insert({
        ...companyData,
        name: companyData.name,  // Explicitly include name to satisfy TypeScript
        created_by: userData.user.id
      })
      .select();
    
    if (error) {
      console.error('Supabase error adding portfolio company:', error);
      throw error;
    }
    
    console.log('Successfully added company to database:', data);
    return data;
  } catch (error) {
    console.error('Exception in addPortfolioCompany:', error);
    throw error; // Re-throw to be handled by the caller
  }
};

// Help requests functions
export const fetchHelpRequests = async (): Promise<HelpRequestWithProfile[]> => {
  try {
    // Get all help requests directly without attempting to join
    const { data: helpRequests, error } = await supabase
      .from('help_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching help requests:', error);
      throw error;
    }
    
    // Return empty array if no help requests found
    if (!helpRequests || helpRequests.length === 0) {
      return [];
    }
    
    // If user_id is available, fetch profiles separately
    const userIds = helpRequests
      .filter(req => req.user_id) // Filter out any nulls
      .map(req => req.user_id);
    
    let profilesMap: Record<string, Profile> = {};
    
    if (userIds.length > 0) {
      // Fetch profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      if (profilesError) {
        console.error('Error fetching user profiles:', profilesError);
        // Continue without profiles rather than failing completely
      } else if (profiles) {
        // Create a map of user IDs to their profile data
        profiles.forEach(profile => {
          profilesMap[profile.id] = profile;
        });
      }
    }
    
    // Add profile data to each help request
    const helpRequestsWithProfiles = helpRequests.map((request: HelpRequest) => {
      return {
        ...request,
        profiles: request.user_id && profilesMap[request.user_id] ? profilesMap[request.user_id] : null,
        // First try to use the requester_email field if available
        // Then fall back to undefined if neither is available
        user_email: request.requester_email || undefined
      };
    });
    
    return helpRequestsWithProfiles;
  } catch (error) {
    console.error('Failed to load help requests:', error);
    throw error;
  }
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
  try {
    const { data, error } = await supabase
      .from('help_requests')
      .select('status, request_type');
    
    if (error) {
      console.error('Error fetching help request stats:', error);
      throw error;
    }
    
    if (!data) {
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        declined: 0,
        byType: {
          intro: 0,
          portfolio: 0,
          other: 0
        }
      };
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
  } catch (error) {
    console.error('Error calculating help request stats:', error);
    return {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      declined: 0,
      byType: {
        intro: 0,
        portfolio: 0,
        other: 0
      }
    };
  }
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
