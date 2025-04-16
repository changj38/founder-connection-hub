
// In the existing addNetworkContact function, include is_lp
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
