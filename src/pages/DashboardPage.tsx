
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Network, Briefcase, MessagesSquare, HelpCircle } from 'lucide-react';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  
  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'GMT'
    }).format(new Date(date));
  };

  const menuItems = [
    {
      title: 'DayDream Network',
      icon: <Network className="w-10 h-10 text-daydream-blue" />,
      description: 'Connect with our extended network of partners, advisors, and experts.',
      link: '/network'
    },
    {
      title: 'Portfolio Companies',
      icon: <Briefcase className="w-10 h-10 text-daydream-purple" />,
      description: 'View and connect with other companies in the DayDream portfolio.',
      link: '/portfolio'
    },
    {
      title: 'Founder Forum',
      icon: <MessagesSquare className="w-10 h-10 text-daydream-pink" />,
      description: 'Share knowledge and discuss challenges with fellow founders.',
      link: '/forum'
    },
    {
      title: 'Request Help',
      icon: <HelpCircle className="w-10 h-10 text-gray-800" />,
      description: 'Need support? Reach out to the DayDream team for assistance.',
      link: '/help'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {currentUser?.name}</h1>
        <p className="text-gray-500 mt-1">
          Last login: {formatDate(currentUser?.lastLogin)} GMT
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuItems.map((item, index) => (
          <Card key={index} className="overflow-hidden border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                {item.icon}
              </div>
              <CardTitle className="text-xl mt-2">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to={item.link}>
                <Button variant="secondary" className="w-full">
                  Explore
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-2">What's New</h2>
        <p className="text-gray-600 mb-4">
          Latest updates from the DayDream Ventures team.
        </p>
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-500">November 15, 2023</p>
            <h3 className="font-medium">New Portfolio Company: Quantum AI</h3>
            <p className="text-gray-600 text-sm mt-1">
              We're excited to welcome Quantum AI to the DayDream family! They're revolutionizing the AI space with their quantum computing approach.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-500">October 27, 2023</p>
            <h3 className="font-medium">Upcoming Founder Summit</h3>
            <p className="text-gray-600 text-sm mt-1">
              Mark your calendars for the annual DayDream Founder Summit, February 12-14, 2024 in San Francisco.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
