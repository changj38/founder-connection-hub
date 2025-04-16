
import { supabase } from '../integrations/supabase/client';

// Network contacts functions
export const fetchNetworkContacts = async () => {
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

export const addNetworkContact = async (contactData: any) => {
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

export const updateNetworkContact = async (id: string, contactData: any) => {
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

// Portfolio companies functions
export const fetchPortfolioCompanies = async () => {
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

export const addPortfolioCompany = async (companyData: any) => {
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
export const fetchHelpRequests = async () => {
  const { data, error } = await supabase
    .from('help_requests')
    .select('*, profiles(*)')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching help requests:', error);
    throw error;
  }
  
  return data || [];
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
