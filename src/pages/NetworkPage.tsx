
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Search, Linkedin, Mail, Building, Filter, Pencil, Globe } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { fetchNetworkContacts, updateNetworkContact, CONTACT_CATEGORIES } from '../utils/adminApi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type NetworkContact = {
  id: string;
  name: string;
  company?: string;
  position?: string;
  linkedin_url?: string;
  website?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  category?: string;
  avatar_url?: string;
  is_lp?: boolean;
};

const NetworkPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<NetworkContact | null>(null);
  const [introReason, setIntroReason] = useState('');
  const [isIntroDialogOpen, setIsIntroDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const { currentUser, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [editFormData, setEditFormData] = useState({
    name: '',
    company: '',
    position: '',
    linkedin_url: '',
    website: '',
    notes: '',
    is_lp: false,
    category: 'investor'
  });

  const { data: networkContactsRaw = [], isLoading, error } = useQuery({
    queryKey: ['networkContacts'],
    queryFn: fetchNetworkContacts
  });

  const networkContacts: NetworkContact[] = networkContactsRaw.map((contact: any) => ({
    ...contact,
    category: contact.category || 'Other',
    avatar_url: contact.avatar_url || undefined,
    website: contact.website || ''
  }));

  const uniqueCategories = networkContacts && networkContacts.length 
    ? ['all', ...new Set(networkContacts.map(contact => contact.category || 'Other'))] 
    : ['all'];
  
  const categories = uniqueCategories.map(category => ({
    value: category,
    label: category === 'all' ? 'All' : CONTACT_CATEGORIES.find(cat => cat.value === category)?.label || category
  }));

  const filteredContacts = networkContacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.position && contact.position.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
          status: 'Pending',
          requester_email: currentUser.email
        });
      
      if (error) throw error;
      
      toast.success(`Introduction request to ${selectedContact.name} has been sent`);
      setIsIntroDialogOpen(false);
      setIntroReason('');
    } catch (error) {
      console.error('Error submitting introduction request:', error);
      toast.error('Failed to send introduction request. Please try again.');
    }
  };

  const handleEditContact = (contact: NetworkContact) => {
    setSelectedContact(contact);
    setEditFormData({
      name: contact.name || '',
      company: contact.company || '',
      position: contact.position || '',
      linkedin_url: contact.linkedin_url || '',
      website: contact.website || '',
      notes: contact.notes || '',
      is_lp: contact.is_lp || false,
      category: contact.category || 'investor'
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateContact = async () => {
    if (!selectedContact) return;
    
    try {
      await updateNetworkContact(selectedContact.id, editFormData);
      toast.success('Contact updated successfully');
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['networkContacts'] });
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Failed to update contact. Please try again.');
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
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
            placeholder="Search by name, company..."
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
                Filter the network by categories
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {filteredContacts.map((contact) => (
                <Card key={contact.id} className="overflow-hidden border-gray-200 hover:shadow-md transition-shadow flex flex-col">
                  <CardHeader className="pb-2 p-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-sm leading-tight truncate">{contact.name}</CardTitle>
                        {contact.is_lp && (
                          <Badge 
                            variant="secondary" 
                            className="bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5 flex-shrink-0"
                          >
                            LP
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 leading-tight truncate">{contact.position || 'N/A'}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3 p-3 pt-0 flex flex-col flex-1">
                    <div className="mb-2 flex items-center gap-2 text-xs text-gray-600">
                      <Building className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{contact.company || 'Independent'}</span>
                    </div>
                    <div className="flex gap-2 mt-2 mb-3">
                      {contact.website && (
                        <a
                          href={contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-daydream-blue transition-colors"
                        >
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
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
                    </div>
                    <div className="flex flex-col gap-1.5 mt-auto">
                      {isAdmin() && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => handleEditContact(contact)}
                        >
                          <Pencil className="h-3 w-3 mr-1" /> 
                          Edit
                        </Button>
                      )}
                      <Dialog open={isIntroDialogOpen && selectedContact?.id === contact.id} onOpenChange={(open) => {
                        setIsIntroDialogOpen(open);
                        if (!open) setSelectedContact(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setSelectedContact(contact);
                              setIsIntroDialogOpen(true);
                            }}
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
                            <div className="p-3 border rounded-md bg-gray-50">
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
                            <Button variant="outline" onClick={() => setIsIntroDialogOpen(false)}>Cancel</Button>
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
          <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{contact.name}</div>
                        {contact.is_lp && (
                          <Badge 
                            variant="secondary" 
                            className="bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5"
                          >
                            LP
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.position || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.company || 'Independent'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        {contact.website && (
                          <a
                            href={contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-daydream-blue transition-colors"
                          >
                            <Globe className="h-4 w-4" />
                          </a>
                        )}
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
                        <Dialog open={isIntroDialogOpen && selectedContact?.id === contact.id} onOpenChange={(open) => {
                          setIsIntroDialogOpen(open);
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
                              <div className="p-3 border rounded-md bg-gray-50">
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
                              <Button variant="outline" onClick={() => setIsIntroDialogOpen(false)}>Cancel</Button>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Update the contact information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={editFormData.name}
                onChange={handleEditInputChange}
                required
              />
            </div>

            {isAdmin() && (
              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={editFormData.category}
                  onValueChange={(value) => setEditFormData({ ...editFormData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  name="company"
                  value={editFormData.company}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  name="position"
                  value={editFormData.position}
                  onChange={handleEditInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  name="linkedin_url"
                  value={editFormData.linkedin_url}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={editFormData.website}
                  onChange={handleEditInputChange}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={editFormData.notes}
                onChange={handleEditInputChange}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateContact}>Update Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NetworkPage;
