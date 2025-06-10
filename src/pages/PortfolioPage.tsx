
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Building, User, Globe, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery } from '@tanstack/react-query';
import { fetchPortfolioCompanies } from '../utils/adminApi';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const PortfolioPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [introDialogOpen, setIntroDialogOpen] = useState(false);
  const [introReason, setIntroReason] = useState('');
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const {
    data: portfolioCompanies = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['portfolioCompanies'],
    queryFn: fetchPortfolioCompanies
  });

  const handleRequestIntro = async (company) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to request an introduction.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.from('help_requests').insert({
        user_id: currentUser.id,
        request_type: 'intro',
        message: `Introduction request to ${company.name}. Reason: ${introReason}`,
        status: 'Pending'
      });

      if (error) throw error;

      toast({
        title: "Introduction Requested",
        description: `Your introduction request to ${company.name} has been submitted.`
      });
      setIntroDialogOpen(false);
      setIntroReason('');
    } catch (error) {
      console.error('Error submitting introduction request:', error);
      toast({
        title: "Error",
        description: "There was a problem submitting your request. Please try again.",
        variant: "destructive"
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

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const filteredCompanies = portfolioCompanies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (company.industry && company.industry.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 text-destructive">
        <p>Error loading portfolio companies. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Portfolio Companies</h1>
        <p className="text-muted-foreground text-lg">
          Browse through the companies we've invested in. You can view detailed information and
          request introductions to their founders.
        </p>
      </div>
      
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search companies by name, industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredCompanies.length} of {portfolioCompanies.length} companies
        </div>
      </div>
      
      {filteredCompanies.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-muted-foreground">No companies found matching your search criteria.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-12 w-12">
                    {company.logo_url ? (
                      <AvatarImage src={company.logo_url} alt={`${company.name} logo`} />
                    ) : (
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(company.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{company.name}</h3>
                    {company.industry && (
                      <span className="inline-block bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full mt-1">
                        {company.industry}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pb-4 flex flex-col flex-1">
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
                  {company.description || 'No description available.'}
                </p>
                
                <div className="space-y-2 mb-4">
                  {company.founded_year && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="h-4 w-4 mr-2" />
                      <span>Founded: {company.founded_year}</span>
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Globe className="h-4 w-4 mr-2" />
                      <a
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenIntroDialog(company)}
                  >
                    Request Intro
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(company)}
                  >
                    Details
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
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-12 w-12">
                    {selectedCompany.logo_url ? (
                      <AvatarImage src={selectedCompany.logo_url} alt={`${selectedCompany.name} logo`} />
                    ) : (
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(selectedCompany.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl">{selectedCompany.name}</DialogTitle>
                    <DialogDescription className="text-sm text-primary">
                      {selectedCompany.industry || 'Technology'}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">About</h3>
                <p className="text-muted-foreground mb-4">
                  {selectedCompany.description || 'No description available.'}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {selectedCompany.founded_year && (
                    <Card className="p-3">
                      <h4 className="text-xs text-muted-foreground mb-1">Founded</h4>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-primary" />
                        <span>{selectedCompany.founded_year}</span>
                      </div>
                    </Card>
                  )}
                  {selectedCompany.investment_year && (
                    <Card className="p-3">
                      <h4 className="text-xs text-muted-foreground mb-1">Invested</h4>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-primary" />
                        <span>{selectedCompany.investment_year}</span>
                      </div>
                    </Card>
                  )}
                  {selectedCompany.website && (
                    <Card className="p-3 sm:col-span-2">
                      <h4 className="text-xs text-muted-foreground mb-1">Website</h4>
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-primary" />
                        <a
                          href={selectedCompany.website.startsWith('http') ? selectedCompany.website : `https://${selectedCompany.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {selectedCompany.website}
                        </a>
                      </div>
                    </Card>
                  )}
                </div>
                
                <Button className="w-full" onClick={() => {
                  setDetailsOpen(false);
                  handleOpenIntroDialog(selectedCompany);
                }}>
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
                <Card className="p-3 bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {selectedCompany.logo_url ? (
                        <AvatarImage src={selectedCompany.logo_url} alt={`${selectedCompany.name} logo`} />
                      ) : (
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(selectedCompany.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{selectedCompany.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedCompany.industry || 'Technology'} 
                        {selectedCompany.founded_year ? ` • Founded: ${selectedCompany.founded_year}` : ''}
                      </p>
                    </div>
                  </div>
                </Card>
                
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
                <Button onClick={() => handleRequestIntro(selectedCompany)} disabled={!introReason.trim()}>
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
