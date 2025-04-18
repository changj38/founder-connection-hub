
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Menu, X, Bell, Search, Home, Users, Building, MessageSquare, HelpCircle, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { path: '/network', label: 'My Network', icon: <Users className="w-5 h-5" /> },
    { path: '/portfolio', label: 'Portfolio', icon: <Building className="w-5 h-5" /> },
    { path: '/forum', label: 'Forum', icon: <MessageSquare className="w-5 h-5" /> },
    { path: '/help', label: 'Help', icon: <HelpCircle className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center">
                <img 
                  src="/lovable-uploads/29aac53d-4e8a-4190-8ceb-8d4edb8e6a1c.png" 
                  alt="DayDream Ventures" 
                  className="h-8 w-auto"
                />
              </Link>
            </div>
            
            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none">
                <Bell className="h-6 w-6" />
              </button>
              
              <div className="flex items-center">
                <div className="relative">
                  <Link to="/profile/settings">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser?.avatar_url} />
                      <AvatarFallback className="bg-indigo-600 text-white">
                        {currentUser?.fullName?.charAt(0) || currentUser?.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Mobile nav toggle */}
            <div className="md:hidden">
              <button
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - desktop */}
        <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200">
          <nav className="flex-1 px-2 py-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              
              {/* Profile Settings Link */}
              <Link
                to="/profile/settings"
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === '/profile/settings'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                }`}
              >
                <User className="w-5 h-5" />
                Profile Settings
              </Link>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </nav>
        </aside>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
            <div className="fixed inset-y-0 left-0 flex flex-col w-80 max-w-full bg-white shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <Link 
                  to="/dashboard" 
                  className="flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <img 
                    src="/lovable-uploads/29aac53d-4e8a-4190-8ceb-8d4edb8e6a1c.png" 
                    alt="DayDream Ventures" 
                    className="h-8 w-auto"
                  />
                </Link>
                <button
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <nav className="flex-1 px-4 py-3 overflow-y-auto">
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        location.pathname === item.path
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                  
                  {/* Profile Settings Link */}
                  <Link
                    to="/profile/settings"
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      location.pathname === '/profile/settings'
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    Profile Settings
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </nav>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
