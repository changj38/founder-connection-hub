
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Check, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { fetchHelpRequests, updateHelpRequestStatus } from '../utils/adminApi';
import { formatDistanceToNow } from 'date-fns';

const AdminHelpRequestsTab = () => {
  const { toast } = useToast();
  const [helpRequests, setHelpRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  useEffect(() => {
    loadHelpRequests();
  }, []);
  
  const loadHelpRequests = async () => {
    try {
      setLoading(true);
      const data = await fetchHelpRequests();
      setHelpRequests(data);
    } catch (error) {
      console.error('Failed to load help requests:', error);
      toast({
        title: "Error",
        description: "Failed to load help requests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusUpdate = async (id, status) => {
    try {
      await updateHelpRequestStatus(id, status);
      
      toast({
        title: "Status Updated",
        description: `Request has been marked as ${status}.`,
      });
      
      // Refresh the help requests list
      loadHelpRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update request status.",
        variant: "destructive",
      });
    }
  };
  
  const handleResolveDialog = (request) => {
    setSelectedRequest(request);
    setResolutionNotes('');
    setDialogOpen(true);
  };
  
  const submitResolution = async () => {
    if (!selectedRequest) return;
    
    try {
      await updateHelpRequestStatus(selectedRequest.id, 'Completed', resolutionNotes);
      
      toast({
        title: "Request Resolved",
        description: "The help request has been marked as completed.",
      });
      
      setDialogOpen(false);
      loadHelpRequests();
    } catch (error) {
      console.error('Error resolving request:', error);
      toast({
        title: "Error",
        description: "Failed to resolve the request.",
        variant: "destructive",
      });
    }
  };
  
  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Help Requests</CardTitle>
        <CardDescription>Manage incoming help requests from founders</CardDescription>
      </CardHeader>
      <CardContent>
        {helpRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No help requests found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {helpRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-lg">{request.profiles?.full_name || 'Unknown User'}</h3>
                    <p className="text-sm text-gray-500">
                      {request.profiles?.company || 'No Company'} • {request.request_type}
                    </p>
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
                {request.resolution_notes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium text-gray-700">Resolution Notes:</p>
                    <p className="text-sm text-gray-600">{request.resolution_notes}</p>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">Received: {formatDate(request.created_at)}</div>
                  <div className="flex space-x-2">
                    {request.status !== 'In Progress' && request.status !== 'Completed' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusUpdate(request.id, 'In Progress')}
                      >
                        Mark In Progress
                      </Button>
                    )}
                    {request.status !== 'Completed' && (
                      <Button 
                        size="sm" 
                        variant="daydream"
                        onClick={() => handleResolveDialog(request)}
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
        )}
      </CardContent>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Help Request</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="resolution-notes">Resolution Notes (Optional)</Label>
            <Textarea 
              id="resolution-notes"
              placeholder="Add notes about how this request was resolved..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="mt-2"
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="daydream" onClick={submitResolution}>
              <Check className="w-4 h-4 mr-2" />
              Mark Completed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminHelpRequestsTab;
