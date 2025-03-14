
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Building, User, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const PortfolioPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();
  
  const portfolioCompanies = [
    {
      id: 1,
      name: 'Quantum AI',
      category: 'Artificial Intelligence',
      description: 'Pioneering quantum machine learning algorithms for real-world applications in finance, healthcare, and logistics.',
      ceo: 'Elena Vasquez',
      website: 'quantumai.example.com'
    },
    {
      id: 2,
      name: 'EcoSphere',
      category: 'CleanTech',
      description: 'Developing sustainable packaging solutions using biodegradable materials derived from agricultural waste.',
      ceo: 'Michael Chen',
      website: 'ecosphere.example.com'
    },
    {
      id: 3,
      name: 'HealthPulse',
      category: 'HealthTech',
      description: 'Creating wearable technology that continuously monitors vital signs and provides early warning for health issues.',
      ceo: 'Sarah Johnson',
      website: 'healthpulse.example.com'
    },
    {
      id: 4,
      name: 'DataFlow',
      category: 'Enterprise Software',
      description: 'Building next-generation data integration platform for modern enterprises with AI-powered insights.',
      ceo: 'James Wilson',
      website: 'dataflow.example.com'
    },
    {
      id: 5,
      name: 'UrbanMobility',
      category: 'Transportation',
      description: 'Reimagining urban transportation with electric, autonomous vehicles optimized for city infrastructure.',
      ceo: 'Lisa Park',
      website: 'urbanmobility.example.com'
    },
    {
      id: 6,
      name: 'CyberShield',
      category: 'Cybersecurity',
      description: 'Protecting critical infrastructure with AI-driven threat detection and automated response systems.',
      ceo: 'David Kumar',
      website: 'cybershield.example.com'
    }
  ];

  const handleRequestIntro = (company) => {
    // Create a new request object
    const newRequest = {
      id: Date.now().toString(),
      type: 'intro',
      company: company.name,
      status: 'pending',
      date: new Date().toISOString(),
      details: `Introduction request to ${company.name}`
    };
    
    // Get existing requests from localStorage or initialize empty array
    const existingRequests = JSON.parse(localStorage.getItem('userRequests') || '[]');
    
    // Add new request to the array
    const updatedRequests = [newRequest, ...existingRequests];
    
    // Save back to localStorage
    localStorage.setItem('userRequests', JSON.stringify(updatedRequests));
    
    toast({
      title: "Introduction Requested",
      description: `Your introduction request to ${company.name} has been submitted.`,
    });
  };

  const handleViewDetails = (company) => {
    setSelectedCompany(company);
    setDetailsOpen(true);
  };

  const filteredCompanies = portfolioCompanies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            placeholder="Search companies by name, sector..."
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
                    {company.category}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-3">
                {company.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  <span>CEO: {company.ceo}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Globe className="h-4 w-4 mr-2" />
                  <span>{company.website}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <Button 
                  variant="outline" 
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                  onClick={() => handleRequestIntro(company)}
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

      {/* Company Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedCompany && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedCompany.name}</DialogTitle>
                <DialogDescription className="text-sm text-purple-600">
                  {selectedCompany.category}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">About</h3>
                <p className="text-gray-700 mb-4">{selectedCompany.description}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="border p-3 rounded-md">
                    <h4 className="text-xs text-gray-500 mb-1">CEO</h4>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-purple-600" />
                      <span>{selectedCompany.ceo}</span>
                    </div>
                  </div>
                  <div className="border p-3 rounded-md">
                    <h4 className="text-xs text-gray-500 mb-1">Website</h4>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-purple-600" />
                      <a href={`https://${selectedCompany.website}`} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                        {selectedCompany.website}
                      </a>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  onClick={() => {
                    handleRequestIntro(selectedCompany);
                    setDetailsOpen(false);
                  }}
                >
                  Request Introduction
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortfolioPage;
