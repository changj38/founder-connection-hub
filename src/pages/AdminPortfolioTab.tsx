
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PlusCircle, Building, Globe, Calendar, Tag, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { fetchPortfolioCompanies, addPortfolioCompany } from '../utils/adminApi';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');

  // Fetch portfolio companies from Supabase
  const { data: portfolioCompanies = [], isLoading, error: fetchError } = useQuery({
    queryKey: ['portfolioCompanies'],
    queryFn: fetchPortfolioCompanies
  });

  // Setup mutation for adding a company
  const addCompanyMutation = useMutation({
    mutationFn: (companyData: any) => addPortfolioCompany(companyData),
    onSuccess: (data) => {
      console.log('Company added successfully:', data);
      // Reset form
      resetForm();
      // Close dialog
      setIsAddDialogOpen(false);
      // Show success toast and dialog
      setNewCompanyName(formData.name);
      setSuccessDialogOpen(true);
      // Refresh companies list
      queryClient.invalidateQueries({ queryKey: ['portfolioCompanies'] });
    },
    onError: (error: any) => {
      console.error('Error in mutation:', error);
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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      industry: '',
      founded_year: '',
      investment_year: '',
      website: ''
    });
    setError(null);
    setIsSubmitting(false);
  };

  const handleAddCompany = async () => {
    try {
      console.log('AdminPortfolioTab: handleAddCompany called');
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

      // Process year fields to be numbers or null
      const companyData = {
        name: formData.name.trim(), // Ensure name is included and not empty
        description: formData.description,
        industry: formData.industry,
        founded_year: formData.founded_year ? parseInt(formData.founded_year) : undefined,
        investment_year: formData.investment_year ? parseInt(formData.investment_year) : undefined,
        website: formData.website
      };

      console.log('AdminPortfolioTab: Submitting company data:', companyData);
      // Use the mutation to add the company
      addCompanyMutation.mutate(companyData);
    } catch (error) {
      console.error("AdminPortfolioTab: Error in handleAddCompany:", error);
      setError(error.message || "Failed to add portfolio company");
      toast({
        title: "Error",
        description: `Failed to add portfolio company: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Company Dialog */}
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

      {/* Success Dialog */}
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
