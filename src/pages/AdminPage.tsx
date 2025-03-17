
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { 
  PlusCircle, 
  Users, 
  Building, 
  MessageSquare, 
  ClipboardList,
  Trash2,
  Edit,
  Check,
  X 
} from 'lucide-react';

const AdminPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Form states
  const [newNetworkContact, setNewNetworkContact] = useState({
    name: '',
    company: '',
    position: '',
    email: '',
    linkedin: ''
  });
  
  const [newPortfolioCompany, setNewPortfolioCompany] = useState({
    name: '',
    description: '',
    foundedYear: '',
    investmentYear: '',
    industry: '',
    website: ''
  });
  
  // Dialog states
  const [networkDialogOpen, setNetworkDialogOpen] = useState(false);
  const [portfolioDialogOpen, setPortfolioDialogOpen] = useState(false);
  
  // Mock data
  const [helpRequests, setHelpRequests] = useState([
    {
      id: 1,
      founderName: 'Sarah Johnson',
      company: 'TechFlow AI',
      requestType: 'Introduction',
      message: 'Looking for an introduction to potential enterprise clients in the financial sector.',
      status: 'Pending',
      date: '2 days ago'
    },
    {
      id: 2,
      founderName: 'David Chen',
      company: 'Quantum Compute',
      requestType: 'Portfolio Ask',
      message: 'Need assistance with our Series B pitch deck review.',
      status: 'In Progress',
      date: '3 days ago'
    },
    {
      id: 3,
      founderName: 'Maria Garcia',
      company: 'HealthTech Solutions',
      requestType: 'Introduction',
      message: 'Seeking introductions to healthcare providers for potential pilots.',
      status: 'Completed',
      date: '1 week ago'
    }
  ]);
  
  const handleAddNetworkContact = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would make an API call to add the contact
    toast({
      title: "Contact Added",
      description: `${newNetworkContact.name} has been added to the network.`,
    });
    setNewNetworkContact({
      name: '',
      company: '',
      position: '',
      email: '',
      linkedin: ''
    });
    setNetworkDialogOpen(false);
  };
  
  const handleAddPortfolioCompany = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would make an API call to add the company
    toast({
      title: "Company Added",
      description: `${newPortfolioCompany.name} has been added to the portfolio.`,
    });
    setNewPortfolioCompany({
      name: '',
      description: '',
      foundedYear: '',
      investmentYear: '',
      industry: '',
      website: ''
    });
    setPortfolioDialogOpen(false);
  };
  
  const updateHelpRequestStatus = (id: number, status: string) => {
    setHelpRequests(
      helpRequests.map(request => 
        request.id === id ? { ...request, status } : request
      )
    );
    toast({
      title: "Status Updated",
      description: `Request has been marked as ${status}.`,
    });
  };

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

  // Network Contact Form Dialog
  const NetworkContactForm = () => (
    <form onSubmit={handleAddNetworkContact} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input 
          id="name" 
          value={newNetworkContact.name}
          onChange={(e) => setNewNetworkContact({...newNetworkContact, name: e.target.value})}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input 
          id="company" 
          value={newNetworkContact.company}
          onChange={(e) => setNewNetworkContact({...newNetworkContact, company: e.target.value})}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="position">Position</Label>
        <Input 
          id="position" 
          value={newNetworkContact.position}
          onChange={(e) => setNewNetworkContact({...newNetworkContact, position: e.target.value})}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email"
          value={newNetworkContact.email}
          onChange={(e) => setNewNetworkContact({...newNetworkContact, email: e.target.value})}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="linkedin">LinkedIn URL</Label>
        <Input 
          id="linkedin" 
          value={newNetworkContact.linkedin}
          onChange={(e) => setNewNetworkContact({...newNetworkContact, linkedin: e.target.value})}
        />
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => setNetworkDialogOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" variant="daydream">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </DialogFooter>
    </form>
  );

  // Portfolio Company Form Dialog
  const PortfolioCompanyForm = () => (
    <form onSubmit={handleAddPortfolioCompany} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="company-name">Company Name</Label>
        <Input 
          id="company-name" 
          value={newPortfolioCompany.name}
          onChange={(e) => setNewPortfolioCompany({...newPortfolioCompany, name: e.target.value})}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          value={newPortfolioCompany.description}
          onChange={(e) => setNewPortfolioCompany({...newPortfolioCompany, description: e.target.value})}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="founded-year">Founded Year</Label>
          <Input 
            id="founded-year" 
            value={newPortfolioCompany.foundedYear}
            onChange={(e) => setNewPortfolioCompany({...newPortfolioCompany, foundedYear: e.target.value})}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="investment-year">Investment Year</Label>
          <Input 
            id="investment-year" 
            value={newPortfolioCompany.investmentYear}
            onChange={(e) => setNewPortfolioCompany({...newPortfolioCompany, investmentYear: e.target.value})}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <Input 
          id="industry" 
          value={newPortfolioCompany.industry}
          onChange={(e) => setNewPortfolioCompany({...newPortfolioCompany, industry: e.target.value})}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input 
          id="website" 
          value={newPortfolioCompany.website}
          onChange={(e) => setNewPortfolioCompany({...newPortfolioCompany, website: e.target.value})}
        />
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => setPortfolioDialogOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" variant="daydream">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Company
        </Button>
      </DialogFooter>
    </form>
  );

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
                <p className="text-3xl font-bold">24</p>
                <div className="flex justify-end">
                  <Button 
                    variant="daydream" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => setActiveTab('network')}
                  >
                    Manage
                  </Button>
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
                <p className="text-3xl font-bold">18</p>
                <div className="flex justify-end">
                  <Button 
                    variant="daydream" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => setActiveTab('portfolio')}
                  >
                    Manage
                  </Button>
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
                <p className="text-3xl font-bold">5</p>
                <div className="flex justify-end">
                  <Button 
                    variant="daydream" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => setActiveTab('requests')}
                  >
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="network">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Network Contacts</h2>
            <Dialog open={networkDialogOpen} onOpenChange={setNetworkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="daydream">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Network Contact</DialogTitle>
                  <DialogDescription>Add a new contact to the DayDream network</DialogDescription>
                </DialogHeader>
                <NetworkContactForm />
              </DialogContent>
            </Dialog>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">Contact {i}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Company {i}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {["CEO", "CTO", "CFO", "VP Sales", "Investor"][i % 5]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="portfolio">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Portfolio Companies</h2>
            <Dialog open={portfolioDialogOpen} onOpenChange={setPortfolioDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="daydream">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Company
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Portfolio Company</DialogTitle>
                  <DialogDescription>Add a new company to the portfolio</DialogDescription>
                </DialogHeader>
                <PortfolioCompanyForm />
              </DialogContent>
            </Dialog>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">Portfolio Company {i}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {["SaaS", "FinTech", "HealthTech", "AI", "Robotics"][i % 5]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {["2021", "2022", "2023"][i % 3]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Help Requests</CardTitle>
              <CardDescription>Manage incoming help requests from founders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {helpRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-lg">{request.founderName}</h3>
                        <p className="text-sm text-gray-500">{request.company} • {request.requestType}</p>
                      </div>
                      <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                        request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {request.status}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">"{request.message}"</p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">Received: {request.date}</div>
                      <div className="flex space-x-2">
                        {request.status !== 'In Progress' && (
                          <Button 
                            size="sm" 
                            variant="daydream"
                            onClick={() => updateHelpRequestStatus(request.id, 'In Progress')}
                          >
                            Mark In Progress
                          </Button>
                        )}
                        {request.status !== 'Completed' && (
                          <Button 
                            size="sm" 
                            variant="daydream"
                            onClick={() => updateHelpRequestStatus(request.id, 'Completed')}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="forum">
          <Card>
            <CardHeader>
              <CardTitle>Forum Management</CardTitle>
              <CardDescription>Moderate forum discussions and manage content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">Discussion topic {i}</h3>
                      <div className="flex space-x-2">
                        <Button variant="daydream" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">Started by Founder {i} • {i} days ago</div>
                    <p className="text-gray-700 text-sm mb-2">
                      This is a sample discussion topic in the founder forum. In a real implementation, this would contain the actual content.
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">{3 + i} replies</div>
                      <Button size="sm" variant="daydream">View Discussion</Button>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">General Settings</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="site-name">Site Name</Label>
                        <Input id="site-name" defaultValue="DayDream Ventures Portal" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="support-email">Support Email</Label>
                        <Input id="support-email" type="email" defaultValue="support@daydreamvc.com" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="welcome-message">Welcome Message</Label>
                      <Textarea 
                        id="welcome-message" 
                        defaultValue="Welcome to the DayDream Ventures Portal. Connect with our portfolio, network with other founders, and get the help you need."
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Email Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="notify-requests" className="h-4 w-4 rounded border-gray-300" defaultChecked />
                      <Label htmlFor="notify-requests">Notify on new help requests</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="notify-forum" className="h-4 w-4 rounded border-gray-300" defaultChecked />
                      <Label htmlFor="notify-forum">Notify on new forum posts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="notify-registrations" className="h-4 w-4 rounded border-gray-300" defaultChecked />
                      <Label htmlFor="notify-registrations">Notify on new user registrations</Label>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-end">
                  <Button className="mr-2" variant="outline">Cancel</Button>
                  <Button variant="daydream">Save Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
