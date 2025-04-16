import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { 
  HelpCircle, 
  Users, 
  Building2, 
  MessageSquare, 
  ClipboardList,
  MessageCircle
} from 'lucide-react';
import { fetchUserRequests, Request } from '../utils/requestsApi';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  
  // Use React Query to fetch user requests
  const { data: requestData = [], isLoading, error, refetch } = useQuery({
    queryKey: ['userRequests'],
    queryFn: fetchUserRequests
  });
  
  // Effect to log request data for debugging
  useEffect(() => {
    console.log('Request data received in component:', requestData);
  }, [requestData]);
  
  const formatDate = (date?: Date | string) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'GMT'
    }).format(new Date(date));
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'intro': return 'Introduction Request';
      case 'portfolio': return 'Portfolio Ask';
      default: return 'Request';
    }
  };

  const filteredPortfolioRequests = requestData.filter(request => request.type === 'portfolio');
  const filteredIntroRequests = requestData.filter(request => request.type === 'intro');

  // Show appropriate status label with color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Completed
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            Declined
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
    }
  };

  // Format request details display
  const formatRequestDetails = (request: Request) => {
    return (
      <div>
        <div className="text-sm text-gray-600">{request.details}</div>
        {request.resolution_notes && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <MessageCircle className="h-4 w-4 mr-1 text-indigo-500" />
              <span className="font-medium">Admin response:</span>
            </div>
            <div className="text-sm text-gray-700 pl-5">{request.resolution_notes}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Welcome back, <span className="text-daydream-blue">{currentUser?.fullName}</span></h1>
        <p className="text-gray-500 mt-1 flex items-center">
          <span className="mr-1">Last login:</span> {formatDate(currentUser?.lastLogin)} GMT
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="overflow-hidden hover:shadow-md transition-shadow flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <HelpCircle className="w-5 h-5 mr-2 text-indigo-500" />
              Portfolio Ask
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow">
            <p className="text-gray-600 mb-4 flex-grow">
              Have questions about our portfolio companies? Ask for information or request introductions.
            </p>
            <div className="mt-auto pb-3">
              <Link to="/help" className="block">
                <Button variant="sleek" className="w-full py-3 text-base font-medium shadow-sm">
                  Ask Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-md transition-shadow flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-500" />
              Access CRM
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow">
            <p className="text-gray-600 mb-4 flex-grow">
              Browse our network of contacts and request introductions to potential partners.
            </p>
            <div className="mt-auto pb-3">
              <Link to="/network" className="block">
                <Button variant="sleek" className="w-full py-3 text-base font-medium shadow-sm">
                  View Contacts
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-md transition-shadow flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-indigo-500" />
              Portfolio Companies
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow">
            <p className="text-gray-600 mb-4 flex-grow">
              Explore our portfolio of companies and connect with founders in our network.
            </p>
            <div className="mt-auto pb-3">
              <Link to="/portfolio" className="block">
                <Button variant="sleek" className="w-full py-3 text-base font-medium shadow-sm">
                  View Portfolio
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-md transition-shadow flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-indigo-500" />
              Founder Forum
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow">
            <p className="text-gray-600 mb-4 flex-grow">
              Connect with other founders, share experiences, and ask questions in our community forum.
            </p>
            <div className="mt-auto pb-3">
              <Link to="/forum" className="block">
                <Button variant="sleek" className="w-full py-3 text-base font-medium shadow-sm">
                  Join Discussion
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className="w-5 h-5 mr-2" />
            Your Requests
          </CardTitle>
          <p className="text-sm text-gray-500">
            Track the status of your portfolio asks and introduction requests
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Refresh Requests
            </Button>
          </div>
          <Tabs defaultValue="all">
            <TabsList className="w-full justify-start mb-4">
              <TabsTrigger value="all">All Requests</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio Asks</TabsTrigger>
              <TabsTrigger value="intro">Intro Requests</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              {isLoading ? (
                <div className="text-center py-10 border rounded-md">
                  <p className="text-gray-500">Loading requests...</p>
                </div>
              ) : error ? (
                <div className="text-center py-10 border rounded-md">
                  <p className="text-red-500">Failed to load requests</p>
                </div>
              ) : requestData.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {requestData.map((request) => (
                        <tr key={request.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(request.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getRequestTypeLabel(request.type)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatRequestDetails(request)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {getStatusDisplay(request.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 border rounded-md">
                  <p className="text-gray-500">No requests found</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="portfolio" className="mt-0">
              {isLoading ? (
                <div className="text-center py-10 border rounded-md">
                  <p className="text-gray-500">Loading requests...</p>
                </div>
              ) : error ? (
                <div className="text-center py-10 border rounded-md">
                  <p className="text-red-500">Failed to load requests</p>
                </div>
              ) : filteredPortfolioRequests.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPortfolioRequests.map((request) => (
                        <tr key={request.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(request.date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatRequestDetails(request)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {getStatusDisplay(request.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 border rounded-md">
                  <p className="text-gray-500">No portfolio asks found</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="intro" className="mt-0">
              {isLoading ? (
                <div className="text-center py-10 border rounded-md">
                  <p className="text-gray-500">Loading requests...</p>
                </div>
              ) : error ? (
                <div className="text-center py-10 border rounded-md">
                  <p className="text-red-500">Failed to load requests</p>
                </div>
              ) : filteredIntroRequests.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredIntroRequests.map((request) => (
                        <tr key={request.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(request.date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div>
                              <div className="text-sm text-gray-600">{request.company}</div>
                              {request.resolution_notes && (
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                  <div className="flex items-center text-sm text-gray-600 mb-1">
                                    <MessageCircle className="h-4 w-4 mr-1 text-indigo-500" />
                                    <span className="font-medium">Admin response:</span>
                                  </div>
                                  <div className="text-sm text-gray-700 pl-5">{request.resolution_notes}</div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {getStatusDisplay(request.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 border rounded-md">
                  <p className="text-gray-500">No intro requests found</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
