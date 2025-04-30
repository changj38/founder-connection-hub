
// Just updating the type-related error in handleCompanyUpdate and handleDeleteCompany functions
const handleCompanyUpdate = async (companyId: string, formData) => {
  try {
    // Type cast formData to be compatible with the database schema
    const updateData = {
      name: formData.name,
      description: formData.description,
      industry: formData.industry,
      founded_year: formData.founded_year,
      investment_year: formData.investment_year,
      website: formData.website,
      logo_url: formData.logo_url
    };

    const { error } = await supabase
      .from('portfolio_companies')
      .update(updateData)
      .eq('id', companyId as string);

    if (error) throw error;

    toast.success('Company updated successfully');
    setIsDialogOpen(false);
    resetForm();
    refetch();
  } catch (error) {
    console.error('Error updating company:', error);
    toast.error('Failed to update company');
  }
};

const handleDeleteCompany = async (companyId: string) => {
  try {
    const { error } = await supabase
      .from('portfolio_companies')
      .delete()
      .eq('id', companyId as string);

    if (error) throw error;

    toast.success('Company deleted successfully');
    refetch();
  } catch (error) {
    console.error('Error deleting company:', error);
    toast.error('Failed to delete company');
  }
};
