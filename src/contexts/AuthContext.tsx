
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { AuthUser, getCurrentUser, signIn, signOut, signUp, checkEmailAuthorized } from '../integrations/supabase/auth';

interface AuthContextType {
  session: Session | null;
  currentUser: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, company: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  isAdmin: () => boolean;
  refreshUserData: () => Promise<AuthUser | null>; 
  checkEmailAuthorized: (email: string) => Promise<boolean>;
  resetLoadingState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Timeout utilities
const createTimeoutPromise = (ms: number, message: string) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
};

const withTimeout = async <T,>(promise: Promise<T>, ms: number, timeoutMessage: string): Promise<T> => {
  return Promise.race([
    promise,
    createTimeoutPromise(ms, timeoutMessage)
  ]) as Promise<T>;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Loading state timeout protection
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading state exceeded 10 seconds, forcing reset');
        setLoading(false);
        setError('Authentication check timed out. Please refresh the page.');
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(loadingTimeout);
  }, [loading]);

  // Function to reset loading state manually
  const resetLoadingState = () => {
    console.log('Manually resetting auth loading state');
    setLoading(false);
    setError(null);
  };

  // Function to refresh user data with timeout
  const refreshUserData = async () => {
    console.log('Refreshing user data...');
    if (session) {
      try {
        const user = await withTimeout(
          getCurrentUser(),
          5000,
          'User data fetch timed out'
        );
        console.log('Refreshed user data:', user);
        setCurrentUser(user);
        setError(null);
        return user;
      } catch (err) {
        console.error('Error refreshing user data:', err);
        setError(err instanceof Error ? err.message : 'Failed to refresh user data');
      }
    }
    return null;
  };

  useEffect(() => {
    console.log('Initializing auth system...');
    
    // Initial session check with timeout
    const initAuth = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get initial session with timeout
        const { data: { session } } = await withTimeout(
          supabase.auth.getSession(),
          8000,
          'Session check timed out'
        );
        
        console.log('Initial session check:', session ? 'Session found' : 'No session');
        setSession(session);
        
        if (session) {
          try {
            const user = await withTimeout(
              getCurrentUser(),
              5000,
              'User data fetch timed out'
            );
            console.log('Current user loaded:', user);
            setCurrentUser(user);
          } catch (err) {
            console.error('Error loading current user:', err);
            setError(err instanceof Error ? err.message : 'Failed to load user data');
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err instanceof Error ? err.message : 'Authentication initialization failed');
      } finally {
        setLoading(false);
      }
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
          setSession(session);
          
          if (session) {
            try {
              const user = await withTimeout(
                getCurrentUser(),
                5000,
                'User data fetch after auth change timed out'
              );
              console.log('User data after auth change:', user);
              setCurrentUser(user);
              setError(null);
            } catch (err) {
              console.error('Error getting user after auth change:', err);
              setCurrentUser(null);
              setError(err instanceof Error ? err.message : 'Failed to load user after auth change');
            }
          } else {
            setCurrentUser(null);
            setError(null);
          }
          
          setLoading(false);
        }
      );
      
      // Cleanup subscription on unmount
      return () => {
        console.log('Cleaning up auth subscription');
        subscription.unsubscribe();
      };
    };
    
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('Login attempt for:', email);
    setLoading(true);
    setError(null);
    try {
      await withTimeout(
        signIn(email, password),
        10000,
        'Login request timed out'
      );
      console.log('Login successful');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, company: string) => {
    console.log('Registration attempt for:', email);
    setLoading(true);
    setError(null);
    try {
      await withTimeout(
        signUp(email, password, name, company),
        10000,
        'Registration request timed out'
      );
      console.log('Registration successful');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await withTimeout(
        signOut(),
        5000,
        'Logout request timed out'
      );
      setCurrentUser(null);
      setSession(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await withTimeout(
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        }),
        8000,
        'Password reset request timed out'
      );
      
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await withTimeout(
        supabase.auth.updateUser({
          password: newPassword
        }),
        8000,
        'Password update timed out'
      );
      
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = () => {
    console.log('Checking admin role:', currentUser?.role);
    return currentUser?.role === 'admin';
  };

  const value = {
    currentUser,
    session,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    isAdmin,
    refreshUserData,
    checkEmailAuthorized,
    resetLoadingState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
