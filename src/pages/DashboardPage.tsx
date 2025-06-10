
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { HelpCircle, Users, Building2, MessageSquare, ClipboardList, MessageCircle } from 'lucide-react';
import { fetchUserRequests, Request } from '../utils/requestsApi';

const DashboardPage = () => {
  const { currentUser } = useAuth();

  const {
    data: requestData = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['userRequests'],
    queryFn: fetchUserRequests
  });

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
      case 'intro':
        return 'Introduction Request';
      case 'portfolio':
        return 'Portfolio Ask';
      default:
        return 'Request';
    }
  };

  const filteredPortfolioRequests = requestData.filter(request => request.type === 'portfolio');
  const filteredIntroRequests = requestData.filter(request => request.type === 'intro');

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Completed
          </span>;
      case 'rejected':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            Declined
          </span>;
      case 'pending':
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Pending
          </span>;
    }
  };

  const formatRequestDetails = (request: Request) => {
    return <div>
        <div className="text-sm text-slate-600">{request.details}</div>
        {request.resolution_notes && <div className="mt-2 pt-2 border-t border-slate-100">
            <div className="flex items-center text-sm text-slate-600 mb-1">
              <MessageCircle className="h-4 w-4 mr-1 text-blue-500" />
              <span className="font-medium">Admin response:</span>
            </div>
            <div className="text-sm text-slate-700 pl-5">{request.resolution_notes}</div>
          </div>}
      </div>;
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-medium tracking-tight text-slate-900">
          Welcome back, <span className="text-blue-600">{currentUser?.fullName}</span>
        </h1>
        <p className="text-slate-500">
          Last login: {formatDate(currentUser?.lastLogin)} GMT
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            title: 'Portfolio Ask',
            description: 'Have a question to ask our DayDream Team? Ask Here!',
            icon: <HelpCircle className="w-5 h-5" />,
            link: '/help',
            buttonText: 'Ask Now'
          },
          {
            title: 'Access CRM',
            description: 'Browse our network of contacts and request introductions.',
            icon: <Users className="w-5 h-5" />,
            link: '/network',
            buttonText: 'View Contacts'
          },
          {
            title: 'Portfolio Companies',
            description: 'Explore our portfolio and connect with founders.',
            icon: <Building2 className="w-5 h-5" />,
            link: '/portfolio',
            buttonText: 'View Portfolio'
          },
          {
            title: 'Founder Forum',
            description: 'Connect with other founders and share experiences.',
            icon: <MessageSquare className="w-5 h-5" />,
            link: '/forum',
            buttonText: 'Join Discussion'
          }
        ].map((item, index) => (
          <Link key={index} to={item.link} className="block h-full">
            <Card className="bg-white border-slate-200/60 hover:border-blue-300 hover:shadow-xl transition-all duration-200 h-full cursor-pointer group">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800 group-hover:text-blue-600 transition-colors">
                  {React.cloneElement(item.icon, { className: 'text-blue-500 group-hover:text-blue-600 transition-colors' })}
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-[calc(100%-4rem)]">
                <p className="text-sm text-slate-600 mb-4 flex-grow group-hover:text-slate-700 transition-colors">{item.description}</p>
                <Button 
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-auto"
                  variant="default"
                >
                  {item.buttonText}
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="border-slate-200/60">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
            <ClipboardList className="w-5 h-5 text-blue-500" />
            Your Requests
          </CardTitle>
          <p className="text-sm text-slate-500">
            Track the status of your portfolio asks and introduction requests
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-100">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              className="ml-auto block border-slate-200 text-slate-600 hover:text-slate-700 hover:bg-slate-50"
            >
              Refresh Requests
            </Button>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <div className="px-4 border-b border-slate-100">
              <TabsList className="w-full justify-start -mb-px">
                <TabsTrigger 
                  value="all"
                  className="data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
                >
                  All Requests
                </TabsTrigger>
                <TabsTrigger 
                  value="portfolio"
                  className="data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
                >
                  Portfolio Asks
                </TabsTrigger>
                <TabsTrigger 
                  value="intro"
                  className="data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
                >
                  Intro Requests
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500">Failed to load requests</p>
                </div>
              ) : requestData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {requestData.map(request => <tr key={request.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {formatDate(request.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {getRequestTypeLabel(request.type)}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {formatRequestDetails(request)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {getStatusDisplay(request.status)}
                          </td>
                        </tr>)}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500">No requests found</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="portfolio" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500">Failed to load requests</p>
                </div>
              ) : filteredPortfolioRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPortfolioRequests.map(request => <tr key={request.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {formatDate(request.date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {formatRequestDetails(request)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {getStatusDisplay(request.status)}
                          </td>
                        </tr>)}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500">No portfolio asks found</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="intro" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500">Failed to load requests</p>
                </div>
              ) : filteredIntroRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredIntroRequests.map(request => <tr key={request.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {formatDate(request.date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            <div>
                              <div className="text-sm text-slate-600">{request.company}</div>
                              {request.resolution_notes && <div className="mt-2 pt-2 border-t border-gray-100">
                                  <div className="flex items-center text-sm text-slate-600 mb-1">
                                    <MessageCircle className="h-4 w-4 mr-1 text-blue-500" />
                                    <span className="font-medium">Admin response:</span>
                                  </div>
                                  <div className="text-sm text-slate-700 pl-5">{request.resolution_notes}</div>
                                </div>}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {getStatusDisplay(request.status)}
                          </td>
                        </tr>)}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500">No intro requests found</p>
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
