import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Search, Linkedin, Mail, Building, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const networkContacts = [
  {
    id: 1,
    name: 'Emma Johnson',
    position: 'Partner',
    company: 'Sequoia Capital',
    image: '',
    linkedin: 'https://linkedin.com/in/emmajohnson',
    email: 'emma@sequoiacap.com',
    category: 'VC',
    expertise: ['Seed Funding', 'SaaS', 'Fintech']
  },
  {
    id: 2,
    name: 'David Chen',
    position: 'CTO',
    company: 'TechStars',
    image: '',
    linkedin: 'https://linkedin.com/in/davidchen',
    email: 'david@techstars.com',
    category: 'Accelerator',
    expertise: ['Technical Advisory', 'Product Development', 'AI/ML']
  },
  {
    id: 3,
    name: 'Sarah Williams',
    position: 'CEO',
    company: 'Growth Partners',
    image: '',
    linkedin: 'https://linkedin.com/in/sarahwilliams',
    email: 'sarah@growthpartners.com',
    category: 'Growth',
    expertise: ['Scaling', 'Go-to-Market', 'Leadership']
  },
  {
    id: 4,
    name: 'Michael Rodriguez',
    position: 'VP Engineering',
    company: 'Google',
    image: '',
    linkedin: 'https://linkedin.com/in/michaelrodriguez',
    email: 'michael@google.com',
    category: 'Tech',
    expertise: ['Engineering Leadership', 'Cloud Infrastructure', 'Mobile']
  },
  {
    id: 5,
    name: 'Jennifer Lopez',
    position: 'Chief Marketing Officer',
    company: 'HubSpot',
    image: '',
    linkedin: 'https://linkedin.com/in/jenniferlopez',
    email: 'jennifer@hubspot.com',
    category: 'Marketing',
    expertise: ['B2B Marketing', 'Content Strategy', 'Brand Building']
  },
  {
    id: 6,
    name: 'Robert Kim',
    position: 'Angel Investor',
    company: 'Independent',
    image: '',
    linkedin: 'https://linkedin.com/in/robertkim',
    email: 'robert@angelinvestor.com',
    category: 'Investor',
    expertise: ['Early Stage Investments', 'Consumer Apps', 'E-commerce']
  },
  {
    id: 7,
    name: 'Lisa Barnes',
    position: 'Head of Sales',
    company: 'Salesforce',
    image: '',
    linkedin: 'https://linkedin.com/in/lisabarnes',
    email: 'lisa@salesforce.com',
    category: 'Sales',
    expertise: ['Enterprise Sales', 'Pipeline Development', 'Sales Strategy']
  },
  {
    id: 8,
    name: 'James Wilson',
    position: 'Product Director',
    company: 'Amazon',
    image: '',
    linkedin: 'https://linkedin.com/in/jameswilson',
    email: 'james@amazon.com',
    category: 'Product',
    expertise: ['Product Management', 'UX Design', 'E-commerce']
  }
];

const NetworkPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [introReason, setIntroReason] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'VC', label: 'VC' },
    { value: 'Accelerator', label: 'Accelerator' },
    { value: 'Growth', label: 'Growth' },
    { value: 'Tech', label: 'Tech' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Investor', label: 'Investor' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Product', label: 'Product' }
  ];

  const filteredContacts = networkContacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.expertise.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || contact.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleIntroRequest = () => {
    if (!selectedContact) return;
    
    const newRequest = {
      id: Date.now().toString(),
      type: 'intro',
      company: selectedContact.company,
      status: 'pending',
      date: new Date().toISOString(),
      details: `Introduction request to ${selectedContact.name} at ${selectedContact.company}`
    };
    
    const existingRequests = JSON.parse(localStorage.getItem('userRequests') || '[]');
    
    const updatedRequests = [newRequest, ...existingRequests];
    
    localStorage.setItem('userRequests', JSON.stringify(updatedRequests));
    
    toast.success(`Introduction request to ${selectedContact.name} has been sent`);
    setIsDialogOpen(false);
    setIntroReason('');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">DayDream Network</h1>
        <p className="text-gray-500 mt-1">
          Connect with our curated network of partners, investors, and industry experts.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, company, expertise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filter Contacts</DialogTitle>
              <DialogDescription>
                Filter the network by expertise and categories
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Badge 
                      key={category.value}
                      variant={activeCategory === category.value ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setActiveCategory(category.value)}
                    >
                      {category.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setActiveCategory('all');
                  setSearchTerm('');
                }}
              >
                Reset Filters
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500">
            {filteredContacts.length} contacts
          </div>
          <TabsList>
            <TabsTrigger value="grid">Grid</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="grid" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((contact) => (
              <Card key={contact.id} className="overflow-hidden border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-daydream-blue text-white">
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{contact.name}</CardTitle>
                      <p className="text-sm text-gray-500">{contact.position}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                    <Building className="h-4 w-4" />
                    {contact.company}
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Expertise</p>
                    <div className="flex flex-wrap gap-1">
                      {contact.expertise.map((item, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <a 
                        href={contact.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-daydream-blue transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                      <a 
                        href={`mailto:${contact.email}`}
                        className="text-gray-600 hover:text-daydream-blue transition-colors"
                      >
                        <Mail className="h-5 w-5" />
                      </a>
                    </div>
                    
                    <Dialog open={isDialogOpen && selectedContact?.id === contact.id} onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (!open) setSelectedContact(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm"
                          onClick={() => setSelectedContact(contact)}
                        >
                          Request Intro
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Request Introduction</DialogTitle>
                          <DialogDescription>
                            Tell us why you'd like to be introduced to {selectedContact?.name}.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          <div className="flex items-center gap-3 p-3 border rounded-md bg-gray-50">
                            <Avatar>
                              <AvatarFallback className="bg-daydream-blue text-white">
                                {selectedContact ? getInitials(selectedContact.name) : ''}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{selectedContact?.name}</h4>
                              <p className="text-sm text-gray-500">{selectedContact?.position} at {selectedContact?.company}</p>
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
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                          <Button 
                            onClick={handleIntroRequest}
                            disabled={!introReason.trim()}
                          >
                            Send Request
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
          <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expertise</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-daydream-blue text-white text-xs">
                            {getInitials(contact.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{contact.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.company}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {contact.expertise.slice(0, 2).map((item, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                        {contact.expertise.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{contact.expertise.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <a 
                          href={contact.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-daydream-blue transition-colors"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                        <a 
                          href={`mailto:${contact.email}`}
                          className="text-gray-600 hover:text-daydream-blue transition-colors"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                        <Dialog open={isDialogOpen && selectedContact?.id === contact.id} onOpenChange={(open) => {
                          setIsDialogOpen(open);
                          if (!open) setSelectedContact(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="px-2 h-6"
                              onClick={() => setSelectedContact(contact)}
                            >
                              Request Intro
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Request Introduction</DialogTitle>
                              <DialogDescription>
                                Tell us why you'd like to be introduced to {selectedContact?.name}.
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              <div className="flex items-center gap-3 p-3 border rounded-md bg-gray-50">
                                <Avatar>
                                  <AvatarFallback className="bg-daydream-blue text-white">
                                    {selectedContact ? getInitials(selectedContact.name) : ''}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-medium">{selectedContact?.name}</h4>
                                  <p className="text-sm text-gray-500">{selectedContact?.position} at {selectedContact?.company}</p>
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
                              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                              <Button 
                                onClick={handleIntroRequest}
                                disabled={!introReason.trim()}
                              >
                                Send Request
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkPage;
