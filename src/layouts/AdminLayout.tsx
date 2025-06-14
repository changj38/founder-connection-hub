
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Building, 
  MessagesSquare, 
  HelpCircle, 
  Settings,
  LogOut, 
  Menu, 
  X,
  Shield,
  ArrowLeft,
  Mail,
  Calculator
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('help');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { tab: 'help', label: 'Help Requests', icon: <HelpCircle className="w-5 h-5" /> },
    { tab: 'network', label: 'Manage Users', icon: <Users className="w-5 h-5" /> },
    { tab: 'portfolio', label: 'Manage Portfolio', icon: <Building className="w-5 h-5" /> },
    { tab: 'forum', label: 'Manage Forum', icon: <MessagesSquare className="w-5 h-5" /> },
    { tab: 'authorized', label: 'Authorized Emails', icon: <Mail className="w-5 h-5" /> },
    { tab: 'funds', label: 'Fund Modeling', icon: <Calculator className="w-5 h-5" /> },
    { tab: 'simulator', label: 'Fund Simulator', icon: <Calculator className="w-5 h-5" /> },
  ];

  const handleNavClick = (tab: string) => {
    if (tab === 'simulator') {
      navigate('/admin/fund-simulator');
    } else {
      navigate(`/admin?tab=${tab}`);
    }
    setMobileMenuOpen(false);
  };

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

  // Set active tab based on URL search params
  useEffect(() => {
    const tab = searchParams.get('tab') || 'help';
    setActiveTab(tab);
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top navigation bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="flex items-center">
                <img 
                  src="/lovable-uploads/29aac53d-4e8a-4190-8ceb-8d4edb8e6a1c.png" 
                  alt="DayDream Ventures" 
                  className="h-8 w-auto"
                />
                <span className="ml-2 text-sm font-medium text-indigo-600">Admin</span>
              </Link>
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard" className="flex items-center text-sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {currentUser?.fullName || currentUser?.email}
              </span>
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-daydream-purple text-white">
                  {getInitials(currentUser?.fullName || '')}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-5 w-5" />
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

      <div className="flex flex-1">
        {/* Sidebar navigation - desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
          <nav className="flex-1 pt-5 pb-4 overflow-y-auto">
            <div className="px-4 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-5 w-5 text-daydream-purple" />
                <span className="text-sm font-medium text-gray-800">Admin Panel</span>
              </div>
              <Separator />
            </div>
            
            <div className="space-y-1 px-2">
              {navItems.map((item) => (
                <button
                  key={item.tab}
                  onClick={() => handleNavClick(item.tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left ${
                    activeTab === item.tab
                      ? 'bg-gray-100 text-daydream-purple'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-daydream-purple'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
          
          <div className="p-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2" 
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </Button>
          </div>
        </aside>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden bg-black bg-opacity-50">
            <div className="fixed inset-y-0 left-0 flex flex-col w-full max-w-xs bg-white shadow-lg">
              <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                <Link to="/admin" className="flex items-center">
                  <img 
                    src="/lovable-uploads/29aac53d-4e8a-4190-8ceb-8d4edb8e6a1c.png" 
                    alt="DayDream Ventures" 
                    className="h-8 w-auto"
                  />
                  <span className="ml-2 text-sm font-medium text-daydream-purple">Admin</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <nav className="space-y-1 p-2 mt-4">
                  {navItems.map((item) => (
                    <button
                      key={item.tab}
                      onClick={() => handleNavClick(item.tab)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left ${
                        activeTab === item.tab
                          ? 'bg-gray-100 text-daydream-purple'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-daydream-purple'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2" 
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
    </div>
  );
};

export default AdminLayout;
