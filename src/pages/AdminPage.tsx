
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PlusCircle, 
  Users, 
  Building, 
  MessageSquare, 
  ClipboardList,
  Shield,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import AdminHelpRequestsTab from './AdminHelpRequestsTab';
import AdminNetworkTab from './AdminNetworkTab';
import AdminPortfolioTab from './AdminPortfolioTab';
import { useQuery } from '@tanstack/react-query';
import { fetchNetworkContacts, fetchPortfolioCompanies, fetchHelpRequests, getHelpRequestStats } from '../utils/adminApi';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch data for overview counts
  const { data: networkContacts = [] } = useQuery({
    queryKey: ['networkContacts'],
    queryFn: fetchNetworkContacts
  });
  
  const { data: portfolioCompanies = [] } = useQuery({
    queryKey: ['portfolioCompanies'],
    queryFn: fetchPortfolioCompanies
  });
  
  const { data: helpRequests = [] } = useQuery({
    queryKey: ['helpRequests'],
    queryFn: fetchHelpRequests
  });
  
  // Fetch help request statistics
  const { data: helpStats = { total: 0, pending: 0, inProgress: 0, completed: 0, declined: 0, byType: { intro: 0, portfolio: 0, other: 0 } } } = useQuery({
    queryKey: ['helpRequestStats'],
    queryFn: getHelpRequestStats,
    initialData: { 
      total: 0, 
      pending: 0, 
      inProgress: 0, 
      completed: 0, 
      declined: 0, 
      byType: { intro: 0, portfolio: 0, other: 0 } 
    }
  });
  
  // Listen for tab changes from AdminLayout
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      if (event.detail && event.detail.tab) {
        setActiveTab(event.detail.tab);
      }
    };

    const element = document.getElementById('admin-page');
    if (element) {
      element.addEventListener('tabChange', handleTabChange as EventListener);
    }

    return () => {
      if (element) {
        element.removeEventListener('tabChange', handleTabChange as EventListener);
      }
    };
  }, []);

  // Calculate help request by status for overview
  const pendingRequests = helpRequests.filter(req => req.status === 'Pending').length;
  const introRequests = helpRequests.filter(req => req.request_type === 'intro').length;
  const portfolioHelpRequests = helpRequests.filter(req => req.request_type === 'portfolio').length;

  return (
    <div id="admin-page" className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="network">Network Contacts</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio Companies</TabsTrigger>
          <TabsTrigger value="requests">Help Requests</TabsTrigger>
          <TabsTrigger value="forum">Forum Management</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <Users className="w-5 h-5 mr-2 text-daydream-blue" />
                  Network Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{networkContacts.length}</p>
                <div className="flex justify-end">
                  <button 
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-sm mt-4 hover:bg-indigo-700"
                    onClick={() => setActiveTab('network')}
                  >
                    Manage
                  </button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <Building className="w-5 h-5 mr-2 text-daydream-purple" />
                  Portfolio Companies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{portfolioCompanies.length}</p>
                <div className="flex justify-end">
                  <button 
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-sm mt-4 hover:bg-indigo-700"
                    onClick={() => setActiveTab('portfolio')}
                  >
                    Manage
                  </button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <ClipboardList className="w-5 h-5 mr-2 text-daydream-pink" />
                  Help Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{helpRequests.length}</p>
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-gray-500">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-yellow-500" /> 
                      {pendingRequests} pending
                    </span>
                  </div>
                  <button 
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                    onClick={() => setActiveTab('requests')}
                  >
                    Manage
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <Building className="w-5 h-5 mr-2 text-purple-500" />
                  Portfolio Help
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{portfolioHelpRequests}</p>
                <div className="flex justify-end">
                  <button 
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-sm mt-4 hover:bg-indigo-700"
                    onClick={() => {
                      setActiveTab('requests');
                      // You could set a filter here if you had a way to pass it to the requests tab
                    }}
                  >
                    View All
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-500" />
                  Introduction Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{introRequests}</p>
                <div className="flex justify-end">
                  <button 
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-sm mt-4 hover:bg-indigo-700"
                    onClick={() => {
                      setActiveTab('requests');
                      // You could set a filter here if you had a way to pass it to the requests tab
                    }}
                  >
                    View All
                  </button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-green-500" />
                  Forum Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">-</p>
                <div className="flex justify-end">
                  <button 
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-sm mt-4 hover:bg-indigo-700"
                    onClick={() => setActiveTab('forum')}
                  >
                    Manage
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Help Request Status</CardTitle>
                <CardDescription>Overview of help request status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-yellow-50 rounded-md">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <p className="text-2xl font-bold">{helpStats.pending}</p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-md">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">{helpStats.inProgress}</p>
                    <p className="text-sm text-gray-600">In Progress</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-md">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">{helpStats.completed}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-md">
                    <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                    <p className="text-2xl font-bold">{helpStats.declined}</p>
                    <p className="text-sm text-gray-600">Declined</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="network">
          <AdminNetworkTab />
        </TabsContent>
        
        <TabsContent value="portfolio">
          <AdminPortfolioTab />
        </TabsContent>
        
        <TabsContent value="requests">
          <AdminHelpRequestsTab />
        </TabsContent>
        
        <TabsContent value="forum">
          <Card>
            <CardHeader>
              <CardTitle>Forum Management</CardTitle>
              <CardDescription>Moderate forum discussions and manage content</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500">
                Forum management features coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure application settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500">
                Settings management features coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
