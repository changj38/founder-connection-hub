import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Menu, 
  X, 
  Home, 
  Users, 
  Building, 
  MessageSquare, 
  HelpCircle, 
  LogOut,
  UserRound,
  MapPin,
  Shield
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "@/components/ThemeToggle";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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

  const showAdminButton = isAdmin && isAdmin();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-8">
                <Link to="/dashboard" className="flex items-center">
                  <img 
                    src="/lovable-uploads/29aac53d-4e8a-4190-8ceb-8d4edb8e6a1c.png" 
                    alt="DayDream Ventures" 
                    className="h-8 w-auto"
                  />
                </Link>
                
                <div className="hidden md:flex items-center space-x-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        location.pathname === item.path
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                  
                  {showAdminButton && (
                    <Link
                      to="/admin"
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        location.pathname.startsWith('/admin')
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                      }`}
                    >
                      <Shield className="w-5 h-5" />
                      Admin
                    </Link>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <ThemeToggle />
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser?.avatar_url} alt={currentUser?.fullName} />
                        <AvatarFallback className="bg-indigo-600 text-white">
                          {currentUser?.fullName?.charAt(0) || currentUser?.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56" align="end">
                    <div className="flex items-center gap-2 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser?.avatar_url} />
                        <AvatarFallback className="bg-indigo-600 text-white">
                          {currentUser?.fullName?.charAt(0) || currentUser?.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{currentUser?.fullName}</span>
                        <span className="text-xs text-gray-500">{currentUser?.email}</span>
                      </div>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex flex-col space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => navigate('/profile/settings')}
                      >
                        <UserRound className="mr-2 h-4 w-4" />
                        Update Profile
                      </Button>
                      
                      {showAdminButton && (
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => navigate('/admin')}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

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
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setMobileMenuOpen(false)} />
            <nav className="fixed top-0 right-0 bottom-0 w-64 bg-white">
              <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                <div className="flex items-center">
                  <img 
                    src="/lovable-uploads/29aac53d-4e8a-4190-8ceb-8d4edb8e6a1c.png" 
                    alt="DayDream Ventures" 
                    className="h-8 w-auto"
                  />
                </div>
                <button
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
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
                
                {showAdminButton && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      location.pathname.startsWith('/admin')
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="w-5 h-5" />
                    Admin Dashboard
                  </Link>
                )}
                
                <Link
                  to="/profile/settings"
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
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
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </nav>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
};

export default DashboardLayout;
