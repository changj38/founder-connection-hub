
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ClipboardList, Calendar, CheckCircle, XCircle, Clock, Eye, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchHelpRequests, updateHelpRequestStatus } from '../utils/adminApi';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Profile {
  id: string;
  full_name?: string;
  company?: string;
  role?: string;
}

interface HelpRequest {
  id: string;
  user_id: string;
  message: string;
  request_type: string;
  status: string;
  requester_email?: string;
  resolution_notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  profiles: Profile | null;
  user_email?: string;
}

const AdminHelpRequestsTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: helpRequests = [], isLoading, error, isError } = useQuery({
    queryKey: ['helpRequests'],
    queryFn: fetchHelpRequests,
    onError: (err) => {
      console.error('Error in help requests query:', err);
      toast({
        title: "Error Loading Help Requests",
        description: "There was a problem loading the help requests. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleOpenDetail = (request: HelpRequest) => {
    setSelectedRequest(request);
    setResolutionNotes(request.resolution_notes || '');
    setIsDetailOpen(true);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedRequest) return;
    
    try {
      await updateHelpRequestStatus(selectedRequest.id, status, resolutionNotes);
      
      toast({
        title: "Status Updated",
        description: `Request status changed to ${status}`,
      });
      
      setIsDetailOpen(false);
      queryClient.invalidateQueries({ queryKey: ['helpRequests'] });
    } catch (error) {
      console.error("Error updating help request status:", error);
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    }
  };

  const filteredRequests = helpRequests.filter(request => {
    const statusMatch = statusFilter === 'all' || request.status === statusFilter;
    const typeMatch = typeFilter === 'all' || request.request_type === typeFilter;
    return statusMatch && typeMatch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" /> Pending
        </Badge>;
      case 'In Progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Clock className="h-3 w-3 mr-1" /> In Progress
        </Badge>;
      case 'Completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" /> Completed
        </Badge>;
      case 'Declined':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="h-3 w-3 mr-1" /> Declined
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'intro':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Introduction</Badge>;
      case 'portfolio':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Portfolio Help</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{type}</Badge>;
    }
  };

  const getInitials = (name?: string) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const getUserDisplayName = (request: HelpRequest) => {
    if (request.profiles?.full_name) {
      return request.profiles.full_name;
    }
    if (request.requester_email) {
      return request.requester_email;
    }
    if (request.user_email) {
      return request.user_email;
    }
    return 'Unknown User';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Help Requests</h2>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm text-gray-500 mb-2 block">Filter by Status</label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-500 mb-2 block">Filter by Type</label>
              <Select
                value={typeFilter}
                onValueChange={setTypeFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="intro">Introduction</SelectItem>
                  <SelectItem value="portfolio">Portfolio Help</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Unable to Load Help Requests</h3>
              <p className="text-gray-500 mb-4">
                There was a problem connecting to the database. This may be due to a foreign key constraint issue.
              </p>
              <Button 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['helpRequests'] })}
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requested by</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No help requests found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleOpenDetail(request)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-indigo-100 text-indigo-700">
                                {getInitials(getUserDisplayName(request))}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{getUserDisplayName(request)}</p>
                              <p className="text-xs text-gray-500">{request.profiles?.company || ''}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(request.request_type)}</TableCell>
                        <TableCell>
                          <p className="truncate max-w-[250px]">{request.message}</p>
                        </TableCell>
                        <TableCell>{formatDate(request.created_at)}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
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

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getTypeBadge(selectedRequest.request_type)}
                  <span className="ml-2">Request Details</span>
                </DialogTitle>
                <DialogDescription>
                  Submitted on {formatDate(selectedRequest.created_at)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3 p-3 border rounded-md bg-gray-50">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-indigo-100 text-indigo-700">
                      {getInitials(getUserDisplayName(selectedRequest))}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">
                      {getUserDisplayName(selectedRequest)}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {selectedRequest.profiles?.company ? selectedRequest.profiles.company : ''}
                      {selectedRequest.profiles?.role ? ` • ${selectedRequest.profiles.role}` : ''}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Request Message</h4>
                  <div className="p-3 border rounded-md bg-white">
                    <p className="text-sm whitespace-pre-wrap">{selectedRequest.message}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Resolution Notes</h4>
                    <p className="text-xs text-gray-500">
                      Current Status: {getStatusBadge(selectedRequest.status)}
                    </p>
                  </div>
                  <Textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Add notes about how this request was handled..."
                    rows={4}
                  />
                </div>
              </div>
              
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                    onClick={() => handleUpdateStatus('In Progress')}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Mark In Progress
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                    onClick={() => handleUpdateStatus('Declined')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                </div>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleUpdateStatus('Completed')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHelpRequestsTab;
