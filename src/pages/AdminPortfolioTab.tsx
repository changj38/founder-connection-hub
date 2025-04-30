
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PlusCircle, Briefcase, MoreHorizontal, Building, Pencil, Image, Trash2, Globe, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPortfolioCompanies, addPortfolioCompany, bulkImportPortfolioCompanies } from '../utils/adminApi';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import CSVImporter from '@/components/CSVImporter';

type PortfolioCompany = {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  founded_year?: number;
  investment_year?: number;
  website?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
};

const AdminPortfolioTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<PortfolioCompany | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    founded_year: undefined as number | undefined,
    investment_year: undefined as number | undefined,
    website: '',
    logo_url: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const { data: portfolioCompanies = [], isLoading, error } = useQuery({
    queryKey: ['portfolioCompanies'],
    queryFn: fetchPortfolioCompanies
  });

  const filteredCompanies = portfolioCompanies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (company.industry && company.industry.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (company.description && company.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'founded_year' || name === 'investment_year') {
      // Convert to number or undefined if empty
      setFormData({ ...formData, [name]: value ? parseInt(value, 10) : undefined });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      industry: '',
      founded_year: undefined,
      investment_year: undefined,
      website: '',
      logo_url: ''
    });
    setIsEditMode(false);
    setCurrentCompany(null);
  };

  const handleEditCompany = (company: PortfolioCompany) => {
    setCurrentCompany(company);
    setFormData({
      name: company.name || '',
      description: company.description || '',
      industry: company.industry || '',
      founded_year: company.founded_year || undefined,
      investment_year: company.investment_year || undefined,
      website: company.website || '',
      logo_url: company.logo_url || ''
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleSaveCompany = async () => {
    try {
      if (!formData.name.trim()) {
        toast({
          title: "Error",
          description: "Company name is required",
          variant: "destructive",
        });
        return;
      }

      if (isEditMode && currentCompany) {
        // Update company logic
        const { error } = await supabase
          .from('portfolio_companies')
          .update({
            name: formData.name,
            description: formData.description || null,
            industry: formData.industry || null,
            founded_year: formData.founded_year || null,
            investment_year: formData.investment_year || null,
            website: formData.website || null,
            logo_url: formData.logo_url || null
          })
          .eq('id', currentCompany.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Portfolio company updated successfully",
        });
      } else {
        await addPortfolioCompany(formData);
        toast({
          title: "Success",
          description: "Portfolio company added successfully",
        });
      }
      
      resetForm();
      setIsDialogOpen(false);
      
      queryClient.invalidateQueries({ queryKey: ['portfolioCompanies'] });
    } catch (error: any) {
      console.error("Error saving portfolio company:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'add'} portfolio company: ${error?.message || ''}`,
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
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
      console.error('Error deleting company:', error);
      toast({
        title: "Error",
        description: "Failed to delete company",
        variant: "destructive",
      });
    }
  };

  const handleImportCompanies = async (companies: Partial<PortfolioCompany>[]) => {
    try {
      // Filter out companies without a name
      const validCompanies = companies.filter(company => company.name && company.name.trim() !== '');
      
      if (validCompanies.length === 0) {
        toast({
          title: "Error",
          description: "No valid companies found in the CSV file",
          variant: "destructive",
        });
        return;
      }
      
      await bulkImportPortfolioCompanies(validCompanies);
      
      toast({
        title: "Success",
        description: `Successfully imported ${validCompanies.length} companies`,
      });
      
      setIsImportDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['portfolioCompanies'] });
    } catch (error: any) {
      console.error("Error importing companies:", error);
      toast({
        title: "Error",
        description: `Failed to import companies: ${error?.message || ''}`,
        variant: "destructive",
      });
    }
  };

  const expectedCSVFields = ['name', 'description', 'industry', 'founded_year', 'investment_year', 'website', 'logo_url'];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Portfolio Companies</h2>
        <div className="flex gap-2">
          <Button onClick={() => setIsImportDialogOpen(true)} variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Company
          </Button>
        </div>
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
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-500">Error loading portfolio companies. Please try again.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-6 text-center text-gray-500">
                No companies found matching your search criteria.
              </CardContent>
            </Card>
          ) : (
            filteredCompanies.map((company) => (
              <Card key={company.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      {company.logo_url ? (
                        <AvatarImage src={company.logo_url} alt={company.name} />
                      ) : (
                        <AvatarFallback className="bg-daydream-blue text-white">
                          {getInitials(company.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      {company.industry && (
                        <CardDescription>{company.industry}</CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  {company.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {company.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    {company.founded_year && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <span className="font-medium">Founded:</span> {company.founded_year}
                      </div>
                    )}
                    {company.investment_year && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <span className="font-medium">Investment:</span> {company.investment_year}
                      </div>
                    )}
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        Website
                      </a>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-4 border-t flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCompany(company)}
                    className="flex items-center gap-1"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Company</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {company.name}? This action cannot be undone.
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
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Add/Edit Company Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Portfolio Company' : 'Add New Portfolio Company'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update the details of this company.' : 'Fill out the details to add a new company to your portfolio.'}
            </DialogDescription>
          </DialogHeader>
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
            <div className="grid gap-2">
              <Label htmlFor="description" className="flex items-center">
                <MoreHorizontal className="h-4 w-4 mr-2 text-gray-500" />
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
                  <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
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
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="founded_year">Founded Year</Label>
                <Input
                  id="founded_year"
                  name="founded_year"
                  type="number"
                  value={formData.founded_year || ''}
                  onChange={handleInputChange}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="investment_year">Investment Year</Label>
                <Input
                  id="investment_year"
                  name="investment_year"
                  type="number"
                  value={formData.investment_year || ''}
                  onChange={handleInputChange}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="logo_url" className="flex items-center">
                <Image className="h-4 w-4 mr-2 text-gray-500" />
                Logo URL
              </Label>
              <Input
                id="logo_url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleInputChange}
                placeholder="Enter direct URL to company logo"
              />
              {formData.logo_url && (
                <div className="mt-2 flex justify-center">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={formData.logo_url} alt="Preview" />
                    <AvatarFallback className="bg-daydream-blue text-white">
                      {getInitials(formData.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetForm();
              setIsDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveCompany}>
              {isEditMode ? 'Update' : 'Add'} Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import CSV Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import Portfolio Companies</DialogTitle>
            <DialogDescription>
              Upload a CSV file to bulk import portfolio companies. The CSV should include columns for name, description, industry, etc.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <CSVImporter
              onImport={handleImportCompanies}
              expectedFields={expectedCSVFields}
              entityName="portfolio companies"
              buttonText="Select CSV File"
            />
            
            <div className="mt-6 border rounded-md p-4 bg-gray-50">
              <h3 className="text-sm font-medium mb-2">CSV Format Guidelines:</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                <li>First row should contain column headers</li>
                <li>Required field: <code className="bg-gray-200 px-1 rounded">name</code></li>
                <li>Optional fields: description, industry, founded_year, investment_year, website, logo_url</li>
                <li>For year fields, use numeric values (e.g., 2018)</li>
                <li>Save your file with UTF-8 encoding</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPortfolioTab;
