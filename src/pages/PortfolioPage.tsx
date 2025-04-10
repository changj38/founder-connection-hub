
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Building, User, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery } from '@tanstack/react-query';
import { fetchPortfolioCompanies } from '../utils/adminApi';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

const PortfolioPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [introDialogOpen, setIntroDialogOpen] = useState(false);
  const [introReason, setIntroReason] = useState('');
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Fetch portfolio companies from Supabase
  const { data: portfolioCompanies = [], isLoading, error } = useQuery({
    queryKey: ['portfolioCompanies'],
    queryFn: fetchPortfolioCompanies
  });

  const handleRequestIntro = async (company) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to request an introduction.",
        variant: "destructive",
      });
      return;
    }

    try {
      // @ts-ignore - Ignoring type checking for database schema
      const { error } = await supabase
        .from('help_requests')
        .insert({
          user_id: currentUser.id,
          request_type: 'intro',
          message: `Introduction request to ${company.name}. Reason: ${introReason}`,
          status: 'Pending'
        });
      
      if (error) throw error;
      
      toast({
        title: "Introduction Requested",
        description: `Your introduction request to ${company.name} has been submitted.`,
      });
  
      setIntroDialogOpen(false);
      setIntroReason('');
    } catch (error) {
      console.error('Error submitting introduction request:', error);
      toast({
        title: "Error",
        description: "There was a problem submitting your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (company) => {
    setSelectedCompany(company);
    setDetailsOpen(true);
  };

  const handleOpenIntroDialog = (company) => {
    setSelectedCompany(company);
    setIntroDialogOpen(true);
  };

  const filteredCompanies = portfolioCompanies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (company.industry && company.industry.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="text-center p-6 text-red-500">
        <p>Error loading portfolio companies. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-purple-700 mb-2">Portfolio Companies</h1>
      <p className="text-gray-600 text-lg mb-8">
        Browse through the companies we've invested in. You can view detailed information and
        request introductions to their founders.
      </p>
      
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <Input
            type="text"
            placeholder="Search companies by name, industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 pr-10 py-2 w-full"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="text-gray-500">
          Showing {filteredCompanies.length} of {portfolioCompanies.length} companies
        </div>
      </div>
      
      {filteredCompanies.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No companies found matching your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="overflow-hidden border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Building className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-1">{company.name}</h3>
                    <span className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">
                      {company.industry || 'Technology'}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {company.description || 'No description available.'}
                </p>
                
                <div className="space-y-2 mb-4">
                  {company.founded_year && (
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>Founded: {company.founded_year}</span>
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="h-4 w-4 mr-2" />
                      <span>{company.website}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    className="text-purple-600 border-purple-200 hover:bg-purple-50"
                    onClick={() => handleOpenIntroDialog(company)}
                  >
                    Request Intro
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-1"
                    onClick={() => handleViewDetails(company)}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Company Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedCompany && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedCompany.name}</DialogTitle>
                <DialogDescription className="text-sm text-purple-600">
                  {selectedCompany.industry || 'Technology'}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">About</h3>
                <p className="text-gray-700 mb-4">{selectedCompany.description || 'No description available.'}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {selectedCompany.founded_year && (
                    <div className="border p-3 rounded-md">
                      <h4 className="text-xs text-gray-500 mb-1">Founded</h4>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-purple-600" />
                        <span>{selectedCompany.founded_year}</span>
                      </div>
                    </div>
                  )}
                  {selectedCompany.investment_year && (
                    <div className="border p-3 rounded-md">
                      <h4 className="text-xs text-gray-500 mb-1">Invested</h4>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-purple-600" />
                        <span>{selectedCompany.investment_year}</span>
                      </div>
                    </div>
                  )}
                  {selectedCompany.website && (
                    <div className="border p-3 rounded-md">
                      <h4 className="text-xs text-gray-500 mb-1">Website</h4>
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-purple-600" />
                        <a href={selectedCompany.website.startsWith('http') ? selectedCompany.website : `https://${selectedCompany.website}`} 
                           target="_blank" rel="noopener noreferrer" 
                           className="text-purple-600 hover:underline">
                          {selectedCompany.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  onClick={() => {
                    setDetailsOpen(false);
                    handleOpenIntroDialog(selectedCompany);
                  }}
                >
                  Request Introduction
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Introduction Request Dialog */}
      <Dialog open={introDialogOpen} onOpenChange={setIntroDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedCompany && (
            <>
              <DialogHeader>
                <DialogTitle>Request Introduction</DialogTitle>
                <DialogDescription>
                  Tell us why you'd like to be introduced to {selectedCompany.name}.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3 p-3 border rounded-md bg-gray-50">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Building className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{selectedCompany.name}</h4>
                    <p className="text-sm text-gray-500">
                      {selectedCompany.industry || 'Technology'} 
                      {selectedCompany.founded_year ? ` • Founded: ${selectedCompany.founded_year}` : ''}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reason">Why would you like an introduction?</Label>
                  <Textarea
                    id="reason"
                    placeholder="Briefly explain the purpose of the introduction and how it might be valuable to both parties."
                    value={introReason}
                    onChange={(e) => setIntroReason(e.target.value)}
                    rows={5}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIntroDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={() => handleRequestIntro(selectedCompany)}
                  disabled={!introReason.trim()}
                >
                  Send Request
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortfolioPage;
