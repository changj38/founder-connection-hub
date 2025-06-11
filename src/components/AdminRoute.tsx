
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../layouts/AdminLayout';
import { useEffect, useState } from 'react';

const AdminRoute = () => {
  const { currentUser, loading, isAdmin, error } = useAuth();
  const [authStable, setAuthStable] = useState(false);

  // Wait for auth state to stabilize before making routing decisions
  useEffect(() => {
    if (!loading) {
      // Give a small delay to ensure auth state is fully resolved
      const timer = setTimeout(() => {
        setAuthStable(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Show loading while auth is initializing or stabilizing
  if (loading || !authStable) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // Handle auth errors gracefully
  if (error) {
    console.log('AdminRoute - Auth error:', error);
    return <Navigate to="/login" replace />;
  }

  console.log('AdminRoute - Current user:', currentUser);
  console.log('AdminRoute - Is admin check:', isAdmin());
  
  if (!currentUser || !isAdmin()) {
    console.log('Access denied: User is not admin or not authenticated');
    return <Navigate to="/login" replace />;
  }

  console.log('Admin access granted for user:', currentUser.email);
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default AdminRoute;
