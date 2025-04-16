import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

const HelpPage = () => {
  const [helpRequest, setHelpRequest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!helpRequest.trim()) {
      toast({
        title: "Error",
        description: "Please describe what you need help with.",
        variant: "destructive",
      });
      return;
    }
    
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a help request.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert the help request into the Supabase database
      // @ts-ignore - Ignoring type checking for database schema
      const { error } = await supabase
        .from('help_requests')
        .insert({
          user_id: currentUser.id,
          request_type: 'portfolio',
          message: helpRequest,
          status: 'Pending',
          requester_email: currentUser.email // Store the user's email in the new column
        });
      
      if (error) throw error;
      
      toast({
        title: "Request Submitted",
        description: "Your help request has been sent to the DayDream team.",
      });
      
      setHelpRequest('');
    } catch (error) {
      console.error('Error submitting help request:', error);
      toast({
        title: "Error",
        description: "There was a problem submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Request for Help</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>How can we help?</CardTitle>
              <CardDescription>
                Describe what you need assistance with, and our team will get back to you promptly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="I need help with..." 
                className="min-h-[200px]"
                value={helpRequest}
                onChange={(e) => setHelpRequest(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Common Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="text-sm">• Introductions to potential clients</li>
              <li className="text-sm">• Connecting with industry experts</li>
              <li className="text-sm">• Recruiting assistance</li>
              <li className="text-sm">• Fundraising guidance</li>
              <li className="text-sm">• Legal or compliance questions</li>
              <li className="text-sm">• Marketing and PR support</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HelpPage;
