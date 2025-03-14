
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HelpCircle, 
  Users, 
  Building2, 
  MessageSquare, 
  ClipboardList 
} from 'lucide-react';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  
  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'GMT'
    }).format(new Date(date));
  };

  const requestData = [
    // Empty by default - would be populated from API in real implementation
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Welcome back, <span className="text-daydream-blue">{currentUser?.name}</span></h1>
        <p className="text-gray-500 mt-1 flex items-center">
          <span className="mr-1">Last login:</span> {formatDate(currentUser?.lastLogin)} GMT
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <HelpCircle className="w-5 h-5 mr-2 text-daydream-blue" />
              Portfolio Ask
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Have questions about our portfolio companies? Ask for information or request introductions.
            </p>
            <Link to="/help">
              <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600">
                Ask Now
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-500" />
              Access CRM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Browse our network of contacts and request introductions to potential partners.
            </p>
            <Link to="/network">
              <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600">
                View Contacts
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-pink-500" />
              Portfolio Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Explore our portfolio of companies and connect with founders in our network.
            </p>
            <Link to="/portfolio">
              <Button className="w-full bg-gradient-to-r from-pink-500 to-pink-600">
                View Portfolio
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-cyan-500" />
              Founder Forum
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Connect with other founders, share experiences, and ask questions in our community forum.
            </p>
            <Link to="/forum">
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600">
                Join Discussion
              </Button>
            </Link>
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
          <Tabs defaultValue="all">
            <TabsList className="w-full justify-start mb-4">
              <TabsTrigger value="all">All Requests</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio Asks</TabsTrigger>
              <TabsTrigger value="intro">Intro Requests</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              {requestData.length > 0 ? (
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
                      {requestData.map((request, index) => (
                        <tr key={index}>
                          {/* Table row data would go here */}
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
              <div className="text-center py-10 border rounded-md">
                <p className="text-gray-500">No portfolio asks found</p>
              </div>
            </TabsContent>
            
            <TabsContent value="intro" className="mt-0">
              <div className="text-center py-10 border rounded-md">
                <p className="text-gray-500">No intro requests found</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
