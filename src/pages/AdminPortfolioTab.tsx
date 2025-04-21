
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PlusCircle, Building, Globe, Calendar, Tag, AlertCircle, Loader2, Trash2, Pencil, Upload, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { fetchPortfolioCompanies, addPortfolioCompany } from '../utils/adminApi';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

// Helper: Returns logo URL or placeholder
const getLogoUrl = (company: any) =>
  company.logo_url
    ? company.logo_url
    : 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=facearea&w=128&h=128';

const AdminPortfolioTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    founded_year: '',
    investment_year: '',
    website: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<null | {
    id: string;
    name: string;
    description?: string;
    industry?: string;
    founded_year?: string;
    investment_year?: string;
    website?: string;
    logo_url?: string;
  }>(null);
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);

  const { data: portfolioCompanies = [], isLoading, error: fetchError } = useQuery({
    queryKey: ['portfolioCompanies'],
    queryFn: fetchPortfolioCompanies
  });

  const addCompanyMutation = useMutation({
    mutationFn: (companyData: any) => addPortfolioCompany(companyData),
    onSuccess: (data) => {
      setIsSubmitting(false);
      resetForm();
      setIsAddDialogOpen(false);
      setNewCompanyName(formData.name);
      setSuccessDialogOpen(true);
      queryClient.invalidateQueries({ queryKey: ['portfolioCompanies'] });
    },
    onError: (error: any) => {
      setError(error.message || "Failed to add portfolio company");
      toast({
        title: "Error",
        description: `Failed to add portfolio company: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  const filteredCompanies = portfolioCompanies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (company.industry && company.industry.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Logo upload handling for add
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  // For edit dialog
  const handleEditLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setEditLogoFile(file);
    setEditPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      industry: '',
      founded_year: '',
      investment_year: '',
      website: ''
    });
    setLogoFile(null);
    setPreviewUrl(null);
    setError(null);
    setIsSubmitting(false);
  };

  const handleAddCompany = async () => {
    setError(null);
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Company name is required",
        variant: "destructive",
      });
      setError("Company name is required");
      return;
    }
    setIsSubmitting(true);
    let logo_url: string | undefined = undefined;
    try {
      // If logo selected, upload to Supabase storage
      if (logoFile) {
        const { data: user } = await supabase.auth.getUser();
        const ext = logoFile.name.split('.').pop();
        const safeName = formData.name.replace(/[^\w\d-]/g, '_').toLowerCase();
        const filePath = `${user?.user?.id || "admin"}/${safeName}-${Date.now()}.${ext}`;
        const { data, error: uploadError } = await supabase
          .storage
          .from('portfolio-logos')
          .upload(filePath, logoFile, { upsert: true });
        if (uploadError) throw uploadError;
        // Get public URL
        const { data: urlData } = supabase.storage.from('portfolio-logos').getPublicUrl(filePath);
        logo_url = urlData?.publicUrl || undefined;
      }
      // Call mutation with logo_url if uploaded
      addCompanyMutation.mutate({ 
        ...formData, 
        founded_year: formData.founded_year ? parseInt(formData.founded_year) : undefined,
        investment_year: formData.investment_year ? parseInt(formData.investment_year) : undefined,
        logo_url 
      });
    } catch (error) {
      setError(error.message || "Failed to upload logo");
      toast({
        title: "Error",
        description: `Error uploading logo: ${error.message || "Unknown"}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_companies')
        .delete()
        .eq('id', companyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['portfolioCompanies'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete company",
        variant: "destructive",
      });
    }
  };

  const handleEditCompany = async () => {
    if (!editingCompany) return;
    setIsSubmitting(true);
    let logo_url: string | undefined = editingCompany.logo_url;
    try {
      // If a new logo file was selected, upload it and get url
      if (editLogoFile) {
        const { data: user } = await supabase.auth.getUser();
        const ext = editLogoFile.name.split('.').pop();
        const safeName = (editingCompany.name || "company").replace(/[^\w\d-]/g, '_').toLowerCase();
        const filePath = `${user?.user?.id || "admin"}/${safeName}-${Date.now()}.${ext}`;
        const { data, error: uploadError } = await supabase
          .storage
          .from('portfolio-logos')
          .upload(filePath, editLogoFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('portfolio-logos').getPublicUrl(filePath);
        logo_url = urlData?.publicUrl || undefined;
      }
      
      console.log('Updating company with data:', {
        id: editingCompany.id,
        name: editingCompany.name,
        description: editingCompany.description || null,
        industry: editingCompany.industry || null,
        founded_year: editingCompany.founded_year ? parseInt(editingCompany.founded_year) : null,
        investment_year: editingCompany.investment_year ? parseInt(editingCompany.investment_year) : null,
        website: editingCompany.website || null,
        logo_url: logo_url || null
      });
      
      const { error } = await supabase
        .from('portfolio_companies')
        .update({
          name: editingCompany.name,
          description: editingCompany.description || null,
          industry: editingCompany.industry || null,
          founded_year: editingCompany.founded_year ? parseInt(editingCompany.founded_year) : null,
          investment_year: editingCompany.investment_year ? parseInt(editingCompany.investment_year) : null,
          website: editingCompany.website || null,
          logo_url: logo_url || null
        })
        .eq('id', editingCompany.id);

      if (error) {
        console.error('Error updating company:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Company updated successfully",
      });

      setIsEditDialogOpen(false);
      setEditingCompany(null);
      setEditLogoFile(null);
      setEditPreviewUrl(null);
      queryClient.invalidateQueries({ queryKey: ['portfolioCompanies'] });
    } catch (error: any) {
      console.error('Failed to update company:', error);
      toast({
        title: "Error",
        description: `Failed to update company: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (company: any) => {
    setEditingCompany({
      ...company,
      founded_year: company.founded_year?.toString() || '',
      investment_year: company.investment_year?.toString() || ''
    });
    setEditLogoFile(null);
    setEditPreviewUrl(null);
    setIsEditDialogOpen(true);
  };

  const closeDialog = () => {
    if (!isSubmitting) {
      resetForm();
      setIsAddDialogOpen(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Portfolio Companies</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      ) : fetchError ? (
        <Card>
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Error loading portfolio companies. Please try again.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Founded</TableHead>
                    <TableHead>Investment Year</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Logo</TableHead>
                    <TableHead className="w-24 text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No companies found matching your search criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.industry || "—"}</TableCell>
                        <TableCell>{company.founded_year || "—"}</TableCell>
                        <TableCell>{company.investment_year || "—"}</TableCell>
                        <TableCell>
                          {company.website ? (
                            <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                               target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {company.website}
                            </a>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <img
                            src={getLogoUrl(company)}
                            alt={`${company.name} logo`}
                            className="w-12 h-12 object-cover rounded-md border bg-gray-100"
                          />
                        </TableCell>
                        <TableCell className="text-right align-middle">
                          <div className="flex justify-end items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                              onClick={() => handleEditClick(company)}
                              aria-label={`Edit ${company.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  aria-label={`Delete ${company.name}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Company</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the company <span className="font-semibold">{company.name}</span>? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteCompany(company.id)}
                                    className="bg-red-500 text-white hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Portfolio Company</DialogTitle>
            <DialogDescription>
              Fill out the details to add a new company to your portfolio.
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center mb-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="name" className="flex items-center">
                <Building className="h-4 w-4 mr-2 text-gray-500" />
                Company Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="description" className="flex items-center">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="industry" className="flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-gray-500" />
                  Industry
                </Label>
                <Input
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website" className="flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-gray-500" />
                  Website
                </Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="e.g. company.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="founded_year" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  Founded Year
                </Label>
                <Input
                  id="founded_year"
                  name="founded_year"
                  type="number"
                  value={formData.founded_year}
                  onChange={handleInputChange}
                  placeholder="e.g. 2020"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="investment_year" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  Investment Year
                </Label>
                <Input
                  id="investment_year"
                  name="investment_year"
                  type="number"
                  value={formData.investment_year}
                  onChange={handleInputChange}
                  placeholder="e.g. 2023"
                />
              </div>
            </div>
            {/* Logo Upload */}
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="logo" className="flex items-center">
                <Image className="h-4 w-4 mr-2 text-gray-500" />
                Company Logo (optional)
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                {previewUrl && (
                  <img src={previewUrl} alt="Preview" className="h-12 w-12 rounded-md object-cover border" />
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleAddCompany} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : 'Add Company'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Portfolio Company</DialogTitle>
            <DialogDescription>
              Update the company details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="edit-name" className="flex items-center">
                <Building className="h-4 w-4 mr-2 text-gray-500" />
                Company Name *
              </Label>
              <Input
                id="edit-name"
                value={editingCompany?.name || ''}
                onChange={(e) => setEditingCompany(prev => prev ? {...prev, name: e.target.value} : null)}
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editingCompany?.description || ''}
                onChange={(e) => setEditingCompany(prev => prev ? {...prev, description: e.target.value} : null)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-industry" className="flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-gray-500" />
                  Industry
                </Label>
                <Input
                  id="edit-industry"
                  value={editingCompany?.industry || ''}
                  onChange={(e) => setEditingCompany(prev => prev ? {...prev, industry: e.target.value} : null)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-website" className="flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-gray-500" />
                  Website
                </Label>
                <Input
                  id="edit-website"
                  value={editingCompany?.website || ''}
                  onChange={(e) => setEditingCompany(prev => prev ? {...prev, website: e.target.value} : null)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-founded-year" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  Founded Year
                </Label>
                <Input
                  id="edit-founded-year"
                  type="number"
                  value={editingCompany?.founded_year || ''}
                  onChange={(e) => setEditingCompany(prev => prev ? {...prev, founded_year: e.target.value} : null)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-investment-year" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  Investment Year
                </Label>
                <Input
                  id="edit-investment-year"
                  type="number"
                  value={editingCompany?.investment_year || ''}
                  onChange={(e) => setEditingCompany(prev => prev ? {...prev, investment_year: e.target.value} : null)}
                />
              </div>
            </div>
            {/* Logo Upload for Edit */}
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="edit-logo" className="flex items-center">
                <Image className="h-4 w-4 mr-2 text-gray-500" />
                Company Logo
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="edit-logo"
                  name="edit-logo"
                  type="file"
                  accept="image/*"
                  onChange={handleEditLogoChange}
                />
                {(editPreviewUrl || editingCompany?.logo_url) && (
                  <img
                    src={editPreviewUrl || editingCompany?.logo_url}
                    alt="Logo Preview"
                    className="h-12 w-12 rounded-md object-cover border"
                  />
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCompany} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success alert */}
      <AlertDialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Company Added Successfully</AlertDialogTitle>
            <AlertDialogDescription>
              {newCompanyName} has been added to your portfolio companies.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPortfolioTab;
