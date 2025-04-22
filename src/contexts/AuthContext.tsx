
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { AuthUser, getCurrentUser, signIn, signOut, signUp, checkEmailAuthorized } from '../integrations/supabase/auth';

interface AuthContextType {
  session: Session | null;
  currentUser: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, company: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  isAdmin: () => boolean;
  refreshUserData: () => Promise<AuthUser | null>; // Updated return type to match implementation
  checkEmailAuthorized: (email: string) => Promise<boolean>; // Added function to check if email is authorized
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to refresh user data
  const refreshUserData = async () => {
    console.log('Refreshing user data...');
    if (session) {
      try {
        const user = await getCurrentUser();
        console.log('Refreshed user data:', user);
        setCurrentUser(user);
        return user;
      } catch (err) {
        console.error('Error refreshing user data:', err);
      }
    }
    return null;
  };

  useEffect(() => {
    console.log('Initializing auth system...');
    
    // Initial session check
    const initAuth = async () => {
      setLoading(true);
      
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Initial session check:', session ? 'Session found' : 'No session');
      setSession(session);
      
      if (session) {
        try {
          const user = await getCurrentUser();
          console.log('Current user loaded:', user);
          setCurrentUser(user);
        } catch (err) {
          console.error('Error loading current user:', err);
        }
      }
      
      setLoading(false);
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
          setSession(session);
          
          if (session) {
            try {
              const user = await getCurrentUser();
              console.log('User data after auth change:', user);
              setCurrentUser(user);
            } catch (err) {
              console.error('Error getting user after auth change:', err);
              setCurrentUser(null);
            }
          } else {
            setCurrentUser(null);
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
    try {
      await signIn(email, password);
      console.log('Login successful');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, company: string) => {
    console.log('Registration attempt for:', email);
    setLoading(true);
    try {
      await signUp(email, password, name, company);
      console.log('Registration successful');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut();
      setCurrentUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
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
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    isAdmin,
    refreshUserData,
    checkEmailAuthorized // Exposing this function for components that need to check authorization
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
