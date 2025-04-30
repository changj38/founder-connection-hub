
// Just updating the handleDeleteContact function
const handleDeleteContact = async (contactId: string) => {
  try {
    const { error } = await supabase
      .from('network_contacts')
      .delete()
      .eq('id', contactId as string);

    if (error) throw error;

    toast({
      title: "Success",
      description: "Contact deleted successfully",
    });
    queryClient.invalidateQueries({ queryKey: ['networkContacts'] });
  } catch (error) {
    console.error('Error deleting contact:', error);
    toast({
      title: "Error",
      description: "Failed to delete contact",
      variant: "destructive",
    });
  }
};
