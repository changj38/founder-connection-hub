
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const PortfolioPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Portfolio Companies</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* This would eventually be populated with real data */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Portfolio Company {i}</CardTitle>
              <CardDescription>Series A • SaaS</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 mb-4 bg-gray-200 rounded">
                <Skeleton className="h-full w-full" />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                A cutting-edge startup revolutionizing their industry with innovative technology and exceptional leadership.
              </p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Founded: 2022</span>
                <span>DayDream Investment: 2023</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PortfolioPage;
