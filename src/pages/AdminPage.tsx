
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PlusCircle, 
  Users, 
  Building, 
  MessageSquare, 
  ClipboardList,
  Shield
} from 'lucide-react';
import AdminHelpRequestsTab from './AdminHelpRequestsTab';
import AdminNetworkTab from './AdminNetworkTab';
import AdminPortfolioTab from './AdminPortfolioTab';
import { useQuery } from '@tanstack/react-query';
import { fetchNetworkContacts, fetchPortfolioCompanies, fetchHelpRequests } from '../utils/adminApi';

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
                <div className="flex justify-end">
                  <button 
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-sm mt-4 hover:bg-indigo-700"
                    onClick={() => setActiveTab('requests')}
                  >
                    Manage
                  </button>
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
