import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, User, Mail, Briefcase, Linkedin, MoreHorizontal, Building, Pencil, Image, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchNetworkContacts, addNetworkContact, updateNetworkContact } from '../utils/adminApi';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';

type NetworkContact = {
  id: string;
  name: string;
  company?: string;
  position?: string;
  email?: string;
  linkedin_url?: string;
  notes?: string;
  is_lp?: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  avatar_url?: string;
};

const AdminNetworkTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<NetworkContact | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    position: '',
    email: '',
    linkedin_url: '',
    notes: '',
    is_lp: false,
    avatar_url: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  const { data: networkContacts = [], isLoading, error } = useQuery({
    queryKey: ['networkContacts'],
    queryFn: fetchNetworkContacts
  });

  const filteredContacts = networkContacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.company && contact.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (contact.position && contact.position.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      company: '',
      position: '',
      email: '',
      linkedin_url: '',
      notes: '',
      is_lp: false,
      avatar_url: ''
    });
    setIsEditMode(false);
    setCurrentContact(null);
  };

  const handleEditContact = (contact: NetworkContact) => {
    setCurrentContact(contact);
    setFormData({
      name: contact.name || '',
      company: contact.company || '',
      position: contact.position || '',
      email: contact.email || '',
      linkedin_url: contact.linkedin_url || '',
      notes: contact.notes || '',
      is_lp: contact.is_lp || false,
      avatar_url: contact.avatar_url || ''
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleSaveContact = async () => {
    try {
      if (!formData.name.trim()) {
        toast({
          title: "Error",
          description: "Name is required",
          variant: "destructive",
        });
        return;
      }

      if (isEditMode && currentContact) {
        await updateNetworkContact(currentContact.id, formData);
        toast({
          title: "Success",
          description: "Network contact updated successfully",
        });
      } else {
        await addNetworkContact(formData);
        toast({
          title: "Success",
          description: "Network contact added successfully",
        });
      }
      
      resetForm();
      setIsDialogOpen(false);
      
      queryClient.invalidateQueries({ queryKey: ['networkContacts'] });
    } catch (error) {
      console.error("Error saving network contact:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'add'} network contact`,
        variant: "destructive",
      });
    }
  };

  const handleLPToggle = (checked) => {
    setFormData({ ...formData, is_lp: checked });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('network_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['networkContacts'] });
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Network Contacts</h2>
        <Button onClick={() => {
          resetForm();
          setIsDialogOpen(true);
        }}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-500">Error loading network contacts. Please try again.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>LinkedIn</TableHead>
                    <TableHead>LP</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No contacts found matching your search criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              {contact.avatar_url ? (
                                <AvatarImage src={contact.avatar_url} alt={contact.name} />
                              ) : (
                                <AvatarFallback className="bg-daydream-blue text-white text-xs">
                                  {getInitials(contact.name)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <span className="font-medium">{contact.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{contact.company || "—"}</TableCell>
                        <TableCell>{contact.position || "—"}</TableCell>
                        <TableCell>
                          {contact.email ? (
                            <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                              {contact.email}
                            </a>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {contact.linkedin_url ? (
                            <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Profile
                            </a>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {contact.is_lp && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              LP
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEditContact(contact)}
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit contact</span>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete contact</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this contact? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteContact(contact.id)}
                                    className="bg-red-500 text-white hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Network Contact' : 'Add New Network Contact'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update the details of this contact.' : 'Fill out the details to add a new contact to your network.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="name" className="flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="company" className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-gray-500" />
                  Company
                </Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="position" className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                  Position
                </Label>
                <Input
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="linkedin_url" className="flex items-center">
                  <Linkedin className="h-4 w-4 mr-2 text-gray-500" />
                  LinkedIn URL
                </Label>
                <Input
                  id="linkedin_url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="avatar_url" className="flex items-center">
                <Image className="h-4 w-4 mr-2 text-gray-500" />
                Profile Picture URL
              </Label>
              <Input
                id="avatar_url"
                name="avatar_url"
                value={formData.avatar_url}
                onChange={handleInputChange}
                placeholder="Enter direct URL to profile image"
              />
              {formData.avatar_url && (
                <div className="mt-2 flex justify-center">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={formData.avatar_url} alt="Preview" />
                    <AvatarFallback className="bg-daydream-blue text-white">
                      {getInitials(formData.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes" className="flex items-center">
                <MoreHorizontal className="h-4 w-4 mr-2 text-gray-500" />
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="is_lp" className="flex items-center">
                Limited Partner (LP)
              </Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_lp"
                  checked={formData.is_lp}
                  onCheckedChange={handleLPToggle}
                />
                <Label htmlFor="is_lp">
                  {formData.is_lp ? 'Yes' : 'No'}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetForm();
              setIsDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveContact}>{isEditMode ? 'Update' : 'Add'} Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNetworkTab;
