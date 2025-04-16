
import { supabase } from '../integrations/supabase/client';

export interface Request {
  id: string;
  type: 'intro' | 'portfolio';
  company?: string;
  status: 'pending' | 'completed' | 'rejected';
  date: string;
  details: string;
  resolution_notes?: string; // Added resolution notes
}

// Function to fetch all requests for the current user
export const fetchUserRequests = async (): Promise<Request[]> => {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user?.id) {
    console.error('User not authenticated');
    return [];
  }
  
  const { data, error } = await supabase
    .from('help_requests')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching user requests:', error);
    return [];
  }
  
  // Transform the data to match the Request interface
  return data.map(item => ({
    id: item.id,
    type: item.request_type as 'intro' | 'portfolio',
    company: item.request_type === 'intro' ? item.message.split(' ').slice(0, 2).join(' ') : undefined,
    status: mapStatus(item.status),
    date: item.created_at,
    details: item.message,
    resolution_notes: item.resolution_notes // Include resolution notes in the transformed data
  }));
};

// Helper function to map Supabase status values to our local status format
const mapStatus = (status: string): 'pending' | 'completed' | 'rejected' => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'completed';
    case 'declined':
      return 'rejected';
    case 'in progress':
    case 'pending':
    default:
      return 'pending';
  }
};
