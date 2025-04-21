import { supabase } from '@/integrations/supabase/client';

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
  requester_email?: string;
  resolution_notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

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

interface AuthorizedEmail {
  id: string;
  email: string;
  created_at: string;
}

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
  const normalizedEmail = email.trim().toLowerCase();
  
  const { data: existingEmails, error: checkError } = await supabase
    .from('authorized_emails')
    .select('id')
    .eq('email', normalizedEmail);
  
  if (checkError) {
    console.error('Error checking existing email:', checkError);
    throw checkError;
  }
  
  if (existingEmails && existingEmails.length > 0) {
    throw new Error('This email is already authorized');
  }
  
  const { error: insertError } = await supabase
    .from('authorized_emails')
    .insert([{ email: normalizedEmail }]);
  
  if (insertError) {
    console.error('Error adding authorized email:', insertError);
    throw insertError;
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
  
  if (!contactData.name) {
    throw new Error('Name is required');
  }
  
  const { error } = await supabase
    .from('network_contacts')
    .insert({
      ...contactData,
      name: contactData.name,
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
  name: string;
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
        name: companyData.name,
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
    throw error;
  }
};

export const fetchHelpRequests = async (): Promise<HelpRequestWithProfile[]> => {
  try {
    const { data: helpRequests, error } = await supabase
      .from('help_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching help requests:', error);
      throw error;
    }
    
    if (!helpRequests || helpRequests.length === 0) {
      return [];
    }
    
    const userIds = helpRequests
      .filter(req => req.user_id)
      .map(req => req.user_id);
    
    let profilesMap: Record<string, Profile> = {};
    
    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      if (profilesError) {
        console.error('Error fetching user profiles:', profilesError);
      } else if (profiles) {
        profiles.forEach(profile => {
          profilesMap[profile.id] = profile;
        });
      }
    }
    
    const helpRequestsWithProfiles = helpRequests.map((request: HelpRequest) => {
      return {
        ...request,
        profiles: request.user_id && profilesMap[request.user_id] ? profilesMap[request.user_id] : null,
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
