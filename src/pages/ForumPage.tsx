
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const ForumPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Founder Forum</h1>
      
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to the DayDream Founder Forum</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Connect with other founders in the DayDream portfolio. Share insights, ask questions, and collaborate.
            </p>
            <p className="text-gray-600">
              This space is being developed. Soon you'll be able to create posts, comment, and interact with other founders.
            </p>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Discussions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="font-medium">Discussion topic {i}</div>
                    <div className="text-sm text-gray-500">Started by Founder {i} • 2 days ago</div>
                    {i < 3 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i}>
                    <div className="font-medium">Virtual Meetup {i}</div>
                    <div className="text-sm text-gray-500">Next Friday • 3:00 PM PST</div>
                    {i < 2 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForumPage;
