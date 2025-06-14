
import React, { useState, useEffect } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Users, 
  Network, 
  Briefcase, 
  MessageSquareText, 
  HelpCircle,
  Settings,
  Mail,
  Calculator
} from 'lucide-react';
import AdminHelpRequestsTab from './AdminHelpRequestsTab';
import AdminNetworkTab from './AdminNetworkTab';
import AdminPortfolioTab from './AdminPortfolioTab';
import AdminForumTab from './AdminForumTab';
import AdminAuthorizedEmailsTab from './AdminAuthorizedEmailsTab';
import AdminFundModelingTab from './AdminFundModelingTab';
import { useSearchParams } from 'react-router-dom';

const AdminPage = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>('help');

  // Update active tab when URL search params change
  useEffect(() => {
    const tab = searchParams.get('tab') || 'help';
    setActiveTab(tab);
  }, [searchParams]);

  return (
    <div className="container mx-auto py-6 space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <TabsList>
            <TabsTrigger value="help" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Help Requests</span>
            </TabsTrigger>
            <TabsTrigger value="network" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              <span className="hidden sm:inline">Network</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="forum" className="flex items-center gap-2">
              <MessageSquareText className="h-4 w-4" />
              <span className="hidden sm:inline">Forum</span>
            </TabsTrigger>
            <TabsTrigger value="authorized" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Authorized</span>
            </TabsTrigger>
            <TabsTrigger value="funds" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Fund Modeling</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="help" className="space-y-4">
          <AdminHelpRequestsTab />
        </TabsContent>
        
        <TabsContent value="network" className="space-y-4">
          <AdminNetworkTab />
        </TabsContent>
        
        <TabsContent value="portfolio" className="space-y-4">
          <AdminPortfolioTab />
        </TabsContent>
        
        <TabsContent value="forum" className="space-y-4">
          <AdminForumTab />
        </TabsContent>
        
        <TabsContent value="authorized" className="space-y-4">
          <AdminAuthorizedEmailsTab />
        </TabsContent>
        
        <TabsContent value="funds" className="space-y-4">
          <AdminFundModelingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
