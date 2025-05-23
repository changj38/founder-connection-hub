import { supabase } from '@/integrations/supabase/client';

export type HelpRequest = {
  id: string;
  created_at: string;
  user_id: string;
  request_type: string;
  description: string;
  status: string;
  contact_info: string;
};

export type NetworkContact = {
  id: string;
  created_at: string;
  name: string;
  title: string;
  company: string;
  linkedin_profile: string;
  notes: string;
};

export type PortfolioCompany = {
  id: string;
  created_at: string;
  company_name: string;
  description: string;
  website: string;
  contact_person: string;
  contact_email: string;
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

export const fetchHelpRequests = async () => {
  console.log('AdminAPI: Fetching help requests');
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('help_requests')
      .select('*')
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
