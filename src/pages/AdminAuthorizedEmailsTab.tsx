import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Mail, Plus, UserX, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthorizedEmail {
  id: string;
  email: string;
  created_at: string;
}

const AdminAuthorizedEmailsTab = () => {
  const [newEmail, setNewEmail] = useState('');
  const queryClient = useQueryClient();

  // Fetch authorized emails
  const { data: authorizedEmails = [], isLoading, error, refetch } = useQuery({
    queryKey: ['authorizedEmails'],
    queryFn: async () => {
      console.log('Fetching authorized emails...');
      const { data, error } = await supabase
        .from('authorized_emails')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching authorized emails:', error);
        throw error;
      }
      
      console.log('Fetched authorized emails:', data);
      return data as AuthorizedEmail[];
    }
  });

  // Effect to log when data is loaded
  useEffect(() => {
    console.log('Current authorized emails data:', authorizedEmails);
  }, [authorizedEmails]);

  // Add new authorized email
  const addEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      console.log('Adding email:', email);
      const { data, error } = await supabase
        .from('authorized_emails')
        .insert([{ email: email.toLowerCase() }]);
      
      if (error) {
        console.error('Error adding email:', error);
        throw error;
      }
      
      console.log('Email added successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authorizedEmails'] });
      setNewEmail('');
      toast.success('Email added to authorized list');
    },
    onError: (error) => {
      console.error('Error adding email:', error);
      toast.error('Failed to add email to authorized list');
    }
  });

  // Remove authorized email
  const removeEmailMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Removing email with ID:', id);
      const { error } = await supabase
        .from('authorized_emails')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error removing email:', error);
        throw error;
      }
      
      console.log('Email removed successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authorizedEmails'] });
      toast.success('Email removed from authorized list');
    },
    onError: (error) => {
      console.error('Error removing email:', error);
      toast.error('Failed to remove email from authorized list');
    }
  });

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    addEmailMutation.mutate(newEmail);
  };

  // Add a console log to show all authorized emails when the component loads
  useEffect(() => {
    const logAuthorizedEmails = async () => {
      const { data, error } = await supabase
        .from('authorized_emails')
        .select('*');
      
      if (error) {
        console.error('Error fetching authorized emails:', error);
        toast.error('Failed to fetch authorized emails');
        return;
      }
      
      console.log('Current Authorized Emails:', data);
      if (data && data.length === 0) {
        console.log('No authorized emails found in the database.');
      }
    };

    logAuthorizedEmails();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authorized Emails</CardTitle>
          <CardDescription>
            Manage email addresses that are allowed to register for an account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddEmail} className="flex gap-4 mb-6">
            <Input
              type="email"
              placeholder="Enter email to authorize"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!newEmail || addEmailMutation.isPending}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Email
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => refetch()}
              title="Refresh email list"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </form>

          {isLoading ? (
            <div className="text-center py-4">Loading authorized emails...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">
              Error loading emails. Please try refreshing.
            </div>
          ) : authorizedEmails.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No authorized emails yet</p>
              <p className="text-sm mt-2">Add emails above to allow users to register</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-2">
                Showing {authorizedEmails.length} authorized email{authorizedEmails.length !== 1 ? 's' : ''}
              </div>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Added On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {authorizedEmails.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.email}</TableCell>
                        <TableCell>
                          {new Date(item.created_at).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeEmailMutation.mutate(item.id)}
                            disabled={removeEmailMutation.isPending}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuthorizedEmailsTab;
