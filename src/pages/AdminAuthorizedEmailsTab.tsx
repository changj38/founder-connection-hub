
import React, { useState } from 'react';
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
import { Mail, Plus, UserX } from 'lucide-react';
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
  const { data: authorizedEmails = [], isLoading } = useQuery({
    queryKey: ['authorizedEmails'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('authorized_emails')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AuthorizedEmail[];
    }
  });

  // Add new authorized email
  const addEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase
        .from('authorized_emails')
        .insert([{ email: email.toLowerCase() }]);
      
      if (error) throw error;
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
      const { error } = await supabase
        .from('authorized_emails')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
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
            <Button type="submit" disabled={!newEmail}>
              <Plus className="w-4 h-4 mr-2" />
              Add Email
            </Button>
          </form>

          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : authorizedEmails.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No authorized emails yet</p>
            </div>
          ) : (
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
                      {new Date(item.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEmailMutation.mutate(item.id)}
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuthorizedEmailsTab;
