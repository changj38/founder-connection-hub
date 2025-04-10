
import { supabase } from '../integrations/supabase/client';

// Helper function to fetch help requests
export const fetchHelpRequests = async () => {
  // @ts-ignore - Ignoring type checking for database schema
  const { data, error } = await supabase
    .from('help_requests')
    .select(`
      *,
      profiles:user_id (
        full_name,
        company
      )
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching help requests:', error);
    throw error;
  }
  
  return data || [];
};

// Helper function to update a help request status
export const updateHelpRequestStatus = async (id: string, status: string, resolution_notes?: string) => {
  // @ts-ignore - Ignoring type checking for database schema
  const { error } = await supabase
    .from('help_requests')
    .update({ 
      status, 
      resolution_notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
  
  if (error) {
    console.error('Error updating help request:', error);
    throw error;
  }
  
  return true;
};

// Helper function to fetch network contacts
export const fetchNetworkContacts = async () => {
  // @ts-ignore - Ignoring type checking for database schema
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

// Helper function to add a new network contact
export const addNetworkContact = async (contactData: any) => {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user?.id) {
    throw new Error('User not authenticated');
  }
  
  // @ts-ignore - Ignoring type checking for database schema
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

// Helper function to fetch portfolio companies
export const fetchPortfolioCompanies = async () => {
  // @ts-ignore - Ignoring type checking for database schema
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

// Helper function to add a new portfolio company
export const addPortfolioCompany = async (companyData: any) => {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user?.id) {
    throw new Error('User not authenticated');
  }
  
  // @ts-ignore - Ignoring type checking for database schema
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
