
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const ProtectedRoute = () => {
  const { currentUser, loading, error, resetLoadingState } = useAuth();
  const [showTimeout, setShowTimeout] = useState(false);

  // Show timeout message after 12 seconds of loading (increased from 8)
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowTimeout(true);
      }, 12000);
      
      return () => clearTimeout(timer);
    } else {
      setShowTimeout(false);
    }
  }, [loading]);

  // Show error state only for non-network errors
  if (error && !error.includes('timeout') && !error.includes('network')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <Button onClick={resetLoadingState} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={() => window.location.href = '/login'} className="w-full">
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state with enhanced timeout handling
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-4">
            {showTimeout ? 'This is taking longer than expected...' : 'Checking authentication...'}
          </p>
          {showTimeout && (
            <div className="space-y-2">
              <Button onClick={resetLoadingState} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Loading
              </Button>
              <p className="text-sm text-gray-500">
                Network issues can cause delays. If the problem persists, try refreshing the page.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default ProtectedRoute;
