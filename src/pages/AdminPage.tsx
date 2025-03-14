
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const AdminPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="help">Help Requests</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Total Users</CardTitle>
                <CardDescription>Registered founders</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">24</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Active Users</CardTitle>
                <CardDescription>In the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">18</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Help Requests</CardTitle>
                <CardDescription>Pending responses</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">5</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage portal users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Founder {i}</div>
                      <div className="text-sm text-gray-500">founder{i}@example.com</div>
                    </div>
                    <div className="text-sm text-gray-500">Last login: {i} days ago</div>
                    <Separator className="my-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="help">
          <Card>
            <CardHeader>
              <CardTitle>Help Requests</CardTitle>
              <CardDescription>Manage incoming help requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="pb-2">
                    <div className="font-medium">Request from Founder {i}</div>
                    <div className="text-sm text-gray-700 my-1">
                      "We're looking for an introduction to potential enterprise clients in the financial sector..."
                    </div>
                    <div className="flex justify-between">
                      <div className="text-sm text-gray-500">Submitted: {i} days ago</div>
                      <div className="text-sm font-medium text-orange-500">Pending</div>
                    </div>
                    {i < 5 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>Manage portfolio companies and network data</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                This area will allow you to update portfolio company information, 
                manage network contacts, and control forum content.
              </p>
              <p className="text-gray-600">
                Content management features are currently in development.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
