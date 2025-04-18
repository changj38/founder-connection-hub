
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User } from 'lucide-react';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Inside the mobile menu and desktop navigation, add a profile settings link
  return (
    <div>
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
      {children}
    </div>
  );
};

export default DashboardLayout;
