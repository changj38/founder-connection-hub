import React, { useState, useEffect } from 'react';
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
import { fetchNetworkContacts } from '../utils/adminApi';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

type NetworkContact = {
  id: string;
  name: string;
  company?: string;
  position?: string;
  email?: string;
  linkedin_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  category?: string;
  expertise?: string[];
  avatar_url?: string;
  is_lp?: boolean;
};

const NetworkPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<NetworkContact | null>(null);
  const [introReason, setIntroReason] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const { currentUser } = useAuth();

  const { data: networkContactsRaw = [], isLoading, error } = useQuery({
    queryKey: ['networkContacts'],
    queryFn: fetchNetworkContacts
  });

  const networkContacts: NetworkContact[] = networkContactsRaw.map((contact: any) => ({
    ...contact,
    category: contact.category || 'Other',
    expertise: contact.expertise || [],
    avatar_url: contact.avatar_url || undefined
  }));
  
  const uniqueCategories = networkContacts && networkContacts.length 
    ? ['all', ...new Set(networkContacts.map(contact => contact.category || 'Other'))] 
    : ['all'];
  
  const categories = uniqueCategories.map(category => ({
    value: category,
    label: category === 'all' ? 'All' : category
  }));

  const filteredContacts = networkContacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.position && contact.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.expertise && contact.expertise.some(e => e.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesCategory = activeCategory === 'all' || contact.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleIntroRequest = async () => {
    if (!selectedContact || !currentUser) return;
    
    try {
      const { error } = await supabase
        .from('help_requests')
        .insert({
          user_id: currentUser.id,
          request_type: 'intro',
          message: `Introduction request to ${selectedContact.name} at ${selectedContact.company || 'N/A'}. Reason: ${introReason}`,
          status: 'Pending'
        });
      
      if (error) throw error;
      
      toast.success(`Introduction request to ${selectedContact.name} has been sent`);
      setIsDialogOpen(false);
      setIntroReason('');
    } catch (error) {
      console.error('Error submitting introduction request:', error);
      toast.error('Failed to send introduction request. Please try again.');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-daydream-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 text-red-500">
        <p>Error loading network contacts. Please try again later.</p>
      </div>
    );
  }

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
          {filteredContacts.length === 0 ? (
            <div className="text-center p-6 text-gray-500">
              <p>No contacts found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContacts.map((contact) => (
                <Card key={contact.id} className="overflow-hidden border-gray-200 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        {contact.avatar_url ? (
                          <AvatarImage src={contact.avatar_url} alt={contact.name} />
                        ) : (
                          <AvatarFallback className="bg-daydream-blue text-white">
                            {getInitials(contact.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{contact.name}</CardTitle>
                        <p className="text-sm text-gray-500">{contact.position || 'N/A'}</p>
                      </div>
                      {contact.is_lp && (
                        <Badge 
                          variant="secondary" 
                          className="bg-yellow-100 text-yellow-800 ml-2"
                        >
                          LP
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                      <Building className="h-4 w-4" />
                      {contact.company || 'Independent'}
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Expertise</p>
                      <div className="flex flex-wrap gap-1">
                        {contact.expertise && contact.expertise.length > 0 ? (
                          contact.expertise.map((item, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {item}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="secondary" className="text-xs">General</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        {contact.linkedin_url && (
                          <a 
                            href={contact.linkedin_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-daydream-blue transition-colors"
                          >
                            <Linkedin className="h-5 w-5" />
                          </a>
                        )}
                        {contact.email && (
                          <a 
                            href={`mailto:${contact.email}`}
                            className="text-gray-600 hover:text-daydream-blue transition-colors"
                          >
                            <Mail className="h-5 w-5" />
                          </a>
                        )}
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
                                <p className="text-sm text-gray-500">{selectedContact?.position || 'N/A'} at {selectedContact?.company || 'N/A'}</p>
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
          )}
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
          {filteredContacts.length === 0 ? (
            <div className="text-center p-6 text-gray-500">
              <p>No contacts found matching your criteria.</p>
            </div>
          ) : (
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
                        {contact.position || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contact.company || 'Independent'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {contact.expertise && contact.expertise.length > 0 ? (
                            <>
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
                            </>
                          ) : (
                            <Badge variant="secondary" className="text-xs">General</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          {contact.linkedin_url && (
                            <a 
                              href={contact.linkedin_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-daydream-blue transition-colors"
                            >
                              <Linkedin className="h-4 w-4" />
                            </a>
                          )}
                          {contact.email && (
                            <a 
                              href={`mailto:${contact.email}`}
                              className="text-gray-600 hover:text-daydream-blue transition-colors"
                            >
                              <Mail className="h-4 w-4" />
                            </a>
                          )}
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
                                    <p className="text-sm text-gray-500">{selectedContact?.position || 'N/A'} at {selectedContact?.company || 'N/A'}</p>
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
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkPage;
