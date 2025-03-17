
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Network, 
  Briefcase, 
  MessagesSquare, 
  HelpCircle, 
  LogOut, 
  Menu, 
  X,
  User,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/portfolio', label: 'Portfolio', icon: <Briefcase className="w-5 h-5" /> },
    { path: '/network', label: 'DayDream Network', icon: <Network className="w-5 h-5" /> },
    { path: '/help', label: 'Portfolio Ask', icon: <HelpCircle className="w-5 h-5" /> },
    { path: '/forum', label: 'Founder Forum', icon: <MessagesSquare className="w-5 h-5" /> },
  ];

  // Only show admin tab if user is admin
  const adminNavItem = { path: '/admin', label: 'Admin', icon: <Settings className="w-5 h-5" /> };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top navigation bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Link to="/dashboard" className="flex items-center">
                <img 
                  src="/lovable-uploads/29aac53d-4e8a-4190-8ceb-8d4edb8e6a1c.png" 
                  alt="DayDream Ventures" 
                  className="h-8 w-auto"
                />
              </Link>
              <span className="text-xl font-semibold ml-2">Founder OS</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-indigo-600'
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {isAdmin() && (
                <Link
                  to={adminNavItem.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === adminNavItem.path
                      ? 'text-indigo-600'
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  {adminNavItem.label}
                </Link>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50"
              >
                Logout
              </Button>
            </div>
            
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-black bg-opacity-50">
          <div className="fixed inset-y-0 left-0 flex flex-col w-full max-w-xs bg-white shadow-lg">
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
              <Link to="/dashboard" className="flex items-center">
                <img 
                  src="/lovable-uploads/29aac53d-4e8a-4190-8ceb-8d4edb8e6a1c.png" 
                  alt="DayDream Ventures" 
                  className="h-8 w-auto"
                />
                <span className="text-xl font-semibold ml-2">Founder OS</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-4">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-indigo-100 text-indigo-800">
                      {getInitials(currentUser?.name || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{currentUser?.name}</div>
                    <div className="text-sm text-gray-500">{currentUser?.company}</div>
                  </div>
                </div>
                <Separator className="my-4" />
              </div>
              
              <nav className="space-y-1 px-2">
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
                
                {isAdmin() && (
                  <Link
                    to={adminNavItem.path}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      location.pathname === adminNavItem.path
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {adminNavItem.icon}
                    {adminNavItem.label}
                  </Link>
                )}
              </nav>
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600" 
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
