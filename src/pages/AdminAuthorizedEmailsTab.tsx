
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Mail, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { fetchAuthorizedEmails, addAuthorizedEmail, removeAuthorizedEmail } from '@/utils/adminApi';
import { useAuth } from '@/contexts/AuthContext';

interface AuthorizedEmail {
  id: string;
  email: string;
  created_at: string;
}

const AdminAuthorizedEmailsTab = () => {
  const [newEmail, setNewEmail] = useState('');
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin';

  // Fetch authorized emails
  const { data: authorizedEmails = [], isLoading, error } = useQuery({
    queryKey: ['authorizedEmails'],
    queryFn: fetchAuthorizedEmails,
    enabled: isAdmin,
    retry: 1, // Only retry once to avoid excessive error messages
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching authorized emails:', error);
        toast.error(`Failed to fetch authorized emails: ${error.message}`);
      }
    }
  });

  // Add new authorized email
  const addEmailMutation = useMutation({
    mutationFn: addAuthorizedEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authorizedEmails'] });
      setNewEmail('');
      toast.success('Email added to authorized list');
    },
    onError: (error: Error) => {
      console.error('Error adding email:', error);
      toast.error(`Failed to add email: ${error.message}`);
    }
  });

  // Remove authorized email
  const removeEmailMutation = useMutation({
    mutationFn: removeAuthorizedEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authorizedEmails'] });
      toast.success('Email removed from authorized list');
    },
    onError: (error: Error) => {
      console.error('Error removing email:', error);
      toast.error(`Failed to remove email: ${error.message}`);
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

  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to manage authorized emails.
        </AlertDescription>
      </Alert>
    );
  }

  return (
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
        </form>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error instanceof Error ? error.message : 'Failed to load emails'}</AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="text-center py-4">Loading authorized emails...</div>
        ) : authorizedEmails.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No authorized emails yet</p>
            <p className="text-sm mt-2">Add emails above to allow users to register</p>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Added On</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {authorizedEmails.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>
                      {new Date(item.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEmailMutation.mutate(item.id)}
                        disabled={removeEmailMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminAuthorizedEmailsTab;
