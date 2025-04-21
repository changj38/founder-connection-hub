
import React, { useState, useEffect } from 'react';
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
import { Mail, Plus, UserX, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAuthorizedEmails, addAuthorizedEmail, removeAuthorizedEmail } from '@/utils/adminApi';

interface AuthorizedEmail {
  id: string;
  email: string;
  created_at: string;
}

const AdminAuthorizedEmailsTab = () => {
  const [newEmail, setNewEmail] = useState('');
  const { currentUser, refreshUserData } = useAuth();
  const queryClient = useQueryClient();

  // Use isAdmin value from auth context
  const isAdmin = currentUser?.role === 'admin';
  
  // Effect to ensure user data is fully loaded with current role
  useEffect(() => {
    const loadUserData = async () => {
      try {
        await refreshUserData();
        console.log('User data refreshed, admin status:', currentUser?.role === 'admin');
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    };
    
    loadUserData();
  }, [refreshUserData]);

  // Fetch authorized emails
  const { data: authorizedEmails = [], isLoading, error, refetch } = useQuery({
    queryKey: ['authorizedEmails'],
    queryFn: async () => {
      console.log('Fetching authorized emails, admin status:', isAdmin);
      
      // Check if user is admin before proceeding
      if (!isAdmin) {
        console.error('Permission denied: User is not an admin');
        throw new Error('Permission denied: Only admins can view authorized emails');
      }
      
      try {
        const emails = await fetchAuthorizedEmails();
        console.log('Fetched authorized emails:', emails);
        return emails as AuthorizedEmail[];
      } catch (err) {
        console.error('Error fetching authorized emails:', err);
        throw new Error(`Failed to fetch emails: ${err instanceof Error ? err.message : String(err)}`);
      }
    },
    enabled: isAdmin, // Only run query if user is admin
    refetchOnWindowFocus: false
  });

  // Add new authorized email
  const addEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      console.log('Adding email:', email);
      
      if (!isAdmin) {
        throw new Error('Permission denied: Only admins can add authorized emails');
      }
      
      try {
        await addAuthorizedEmail(email);
        return true;
      } catch (err) {
        console.error('Error adding email:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authorizedEmails'] });
      setNewEmail('');
      toast.success('Email added to authorized list');
    },
    onError: (error: Error) => {
      console.error('Error adding email:', error);
      
      if (error.message.includes('already authorized')) {
        toast.error('This email is already in the authorized list');
      } else {
        toast.error(`Failed to add email: ${error.message}`);
      }
    }
  });

  // Remove authorized email
  const removeEmailMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Removing email with ID:', id);
      
      if (!isAdmin) {
        throw new Error('Permission denied: Only admins can remove authorized emails');
      }
      
      try {
        await removeAuthorizedEmail(id);
        return true;
      } catch (err) {
        console.error('Error removing email:', err);
        throw new Error(`Failed to remove email: ${err instanceof Error ? err.message : String(err)}`);
      }
    },
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

  const errorMessage = error ? (error as Error).message : '';
  const permissionError = errorMessage.includes('permission denied') || errorMessage.includes('Permission denied');

  const handleRefresh = async () => {
    await refreshUserData();
    refetch();
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
          {!isAdmin ? (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>
                You do not have admin permissions required to manage authorized emails.
                {currentUser ? (
                  <div className="mt-2">
                    <Button variant="outline" onClick={handleRefresh}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Status
                    </Button>
                  </div>
                ) : (
                  <div className="mt-2">Please log in with an admin account.</div>
                )}
              </AlertDescription>
            </Alert>
          ) : (
            <>
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
                  onClick={handleRefresh}
                  title="Refresh email list"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </form>

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {permissionError 
                      ? 'You do not have permission to view authorized emails. This may be a database configuration issue.'
                      : errorMessage || 'Error loading emails. Please try refreshing.'}
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        onClick={handleRefresh}
                        className="mr-2"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {isLoading ? (
                <div className="text-center py-4">Loading authorized emails...</div>
              ) : error ? (
                <div className="text-center py-4">
                  <Button 
                    variant="outline" 
                    onClick={handleRefresh}
                    className="mx-auto"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuthorizedEmailsTab;
