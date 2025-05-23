import { supabase } from '@/integrations/supabase/client';

export type HelpRequest = {
  id: string;
  created_at: string;
  user_id: string;
  request_type: string;
  message: string;
  status: string;
  requester_email?: string;
  resolution_notes?: string;
  assigned_to?: string;
  updated_at: string;
  profiles: {
    id: string;
    full_name?: string;
    company?: string;
    role?: string;
  } | null;
  user_email?: string;
};

export type NetworkContact = {
  id: string;
  created_at: string;
  name: string;
  company?: string;
  position?: string;
  email?: string;
  linkedin_url?: string;
  notes?: string;
  avatar_url?: string;
  website?: string;
  category: string;
  is_lp?: boolean;
};

export type PortfolioCompany = {
  id: string;
  created_at: string;
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  founded_year?: number;
  investment_year?: number;
  logo_url?: string;
};

export type HelpRequestStats = {
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
};

export const CONTACT_CATEGORIES = [
  { value: 'founder', label: 'Founder' },
  { value: 'investor', label: 'Investor' },
  { value: 'advisor', label: 'Advisor' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'partner', label: 'Partner' },
  { value: 'other', label: 'Other' }
];

export const fetchNetworkContacts = async () => {
  console.log('AdminAPI: Fetching network contacts');
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('network_contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('AdminAPI: Error fetching network contacts:', error);
      throw error;
    }

    console.log('AdminAPI: Successfully fetched network contacts:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('AdminAPI: Unexpected error fetching network contacts:', error);
    throw error;
  }
};

export const addNetworkContact = async (contact: Omit<NetworkContact, 'id' | 'created_at'>) => {
  console.log('AdminAPI: Adding network contact');
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('network_contacts')
      .insert([{
        ...contact,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('AdminAPI: Error adding network contact:', error);
      throw error;
    }

    console.log('AdminAPI: Successfully added network contact');
    return data;
  } catch (error) {
    console.error('AdminAPI: Unexpected error adding network contact:', error);
    throw error;
  }
};

export const updateNetworkContact = async (id: string, updates: Partial<NetworkContact>) => {
  console.log('AdminAPI: Updating network contact');
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('network_contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('AdminAPI: Error updating network contact:', error);
      throw error;
    }

    console.log('AdminAPI: Successfully updated network contact');
    return data;
  } catch (error) {
    console.error('AdminAPI: Unexpected error updating network contact:', error);
    throw error;
  }
};

export const bulkImportNetworkContacts = async (contacts: Array<Partial<NetworkContact>>) => {
  console.log('AdminAPI: Bulk importing network contacts');
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Validate and filter contacts to ensure required fields
    const validContacts = contacts.filter(contact => 
      contact.name && contact.category
    ).map(contact => ({
      name: contact.name || 'Unknown',
      category: contact.category || 'other',
      company: contact.company || null,
      position: contact.position || null,
      email: contact.email || null,
      linkedin_url: contact.linkedin_url || null,
      notes: contact.notes || null,
      avatar_url: contact.avatar_url || null,
      website: contact.website || null,
      is_lp: contact.is_lp || false,
      created_by: user.id
    }));

    if (validContacts.length === 0) {
      throw new Error('No valid contacts to import');
    }

    const { data, error } = await supabase
      .from('network_contacts')
      .insert(validContacts)
      .select();

    if (error) {
      console.error('AdminAPI: Error bulk importing network contacts:', error);
      throw error;
    }

    console.log('AdminAPI: Successfully bulk imported network contacts:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('AdminAPI: Unexpected error bulk importing network contacts:', error);
    throw error;
  }
};

export const fetchPortfolioCompanies = async () => {
  console.log('AdminAPI: Fetching portfolio companies');
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('portfolio_companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('AdminAPI: Error fetching portfolio companies:', error);
      throw error;
    }

    console.log('AdminAPI: Successfully fetched portfolio companies:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('AdminAPI: Unexpected error fetching portfolio companies:', error);
    throw error;
  }
};

export const addPortfolioCompany = async (company: Omit<PortfolioCompany, 'id' | 'created_at'>) => {
  console.log('AdminAPI: Adding portfolio company');
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('portfolio_companies')
      .insert([{
        ...company,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('AdminAPI: Error adding portfolio company:', error);
      throw error;
    }

    console.log('AdminAPI: Successfully added portfolio company');
    return data;
  } catch (error) {
    console.error('AdminAPI: Unexpected error adding portfolio company:', error);
    throw error;
  }
};

export const bulkImportPortfolioCompanies = async (companies: Array<Partial<PortfolioCompany>>) => {
  console.log('AdminAPI: Bulk importing portfolio companies');
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Validate and filter companies to ensure required fields
    const validCompanies = companies.filter(company => 
      company.name
    ).map(company => ({
      name: company.name || 'Unknown Company',
      description: company.description || null,
      industry: company.industry || null,
      founded_year: company.founded_year || null,
      investment_year: company.investment_year || null,
      website: company.website || null,
      logo_url: company.logo_url || null,
      created_by: user.id
    }));

    if (validCompanies.length === 0) {
      throw new Error('No valid companies to import');
    }

    const { data, error } = await supabase
      .from('portfolio_companies')
      .insert(validCompanies)
      .select();

    if (error) {
      console.error('AdminAPI: Error bulk importing portfolio companies:', error);
      throw error;
    }

    console.log('AdminAPI: Successfully bulk imported portfolio companies:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('AdminAPI: Unexpected error bulk importing portfolio companies:', error);
    throw error;
  }
};

export const fetchHelpRequests = async () => {
  console.log('AdminAPI: Fetching help requests');
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('help_requests')
      .select(`
        *,
        profiles!help_requests_user_id_fkey (
          id,
          full_name,
          company,
          role
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('AdminAPI: Error fetching help requests:', error);
      throw error;
    }

    console.log('AdminAPI: Successfully fetched help requests:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('AdminAPI: Unexpected error fetching help requests:', error);
    throw error;
  }
};

export const updateHelpRequestStatus = async (id: string, status: string, resolutionNotes?: string) => {
  console.log('AdminAPI: Updating help request status');
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (resolutionNotes) {
      updates.resolution_notes = resolutionNotes;
    }

    const { data, error } = await supabase
      .from('help_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('AdminAPI: Error updating help request status:', error);
      throw error;
    }

    console.log('AdminAPI: Successfully updated help request status');
    return data;
  } catch (error) {
    console.error('AdminAPI: Unexpected error updating help request status:', error);
    throw error;
  }
};

export const getHelpRequestStats = async (): Promise<HelpRequestStats> => {
  console.log('AdminAPI: Fetching help request stats');
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('help_requests')
      .select('status, request_type');

    if (error) {
      console.error('AdminAPI: Error fetching help request stats:', error);
      throw error;
    }

    const total = data.length;
    const pending = data.filter(req => req.status === 'Pending').length;
    const inProgress = data.filter(req => req.status === 'In Progress').length;
    const completed = data.filter(req => req.status === 'Completed').length;
    const declined = data.filter(req => req.status === 'Declined').length;
    const intro = data.filter(req => req.request_type === 'intro').length;
    const portfolio = data.filter(req => req.request_type === 'portfolio').length;
    const other = data.filter(req => req.request_type === 'other').length;

    const stats: HelpRequestStats = {
      total,
      pending,
      inProgress,
      completed,
      declined,
      byType: {
        intro,
        portfolio,
        other
      }
    };

    console.log('AdminAPI: Successfully fetched help request stats:', stats);
    return stats;
  } catch (error) {
    console.error('AdminAPI: Unexpected error fetching help request stats:', error);
    throw error;
  }
};
