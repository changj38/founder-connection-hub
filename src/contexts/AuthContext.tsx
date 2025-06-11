
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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

// Enhanced timeout utilities with retry logic
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

// Retry utility for network operations
const withRetry = async <T,>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.log(`Attempt ${attempt + 1} failed:`, error);
      
      // Don't retry on authentication errors, only on network/timeout errors
      if (error instanceof Error && 
          !error.message.includes('timeout') && 
          !error.message.includes('network') &&
          !error.message.includes('fetch')) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
  
  throw lastError!;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initializingRef = useRef(false);
  const userDataTimeoutRef = useRef<NodeJS.Timeout>();

  // Enhanced loading state timeout protection
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (loading && !initializingRef.current) {
        console.warn('Auth loading state exceeded 15 seconds, forcing reset');
        setLoading(false);
        setError('Authentication check timed out. Please refresh the page.');
      }
    }, 15000); // Increased from 10 seconds

    return () => clearTimeout(loadingTimeout);
  }, [loading]);

  // Function to reset loading state manually
  const resetLoadingState = () => {
    console.log('Manually resetting auth loading state');
    setLoading(false);
    setError(null);
    initializingRef.current = false;
  };

  // Enhanced function to refresh user data with retry logic
  const refreshUserData = async (): Promise<AuthUser | null> => {
    console.log('Refreshing user data...');
    if (session) {
      try {
        const user = await withRetry(
          () => withTimeout(
            getCurrentUser(),
            10000, // Increased timeout
            'User data fetch timed out'
          ),
          2, // Retry up to 2 times
          1500 // Start with 1.5 second delay
        );
        console.log('Refreshed user data:', user);
        setCurrentUser(user);
        setError(null);
        return user;
      } catch (err) {
        console.error('Error refreshing user data:', err);
        // Only set error if it's not a timeout or network issue
        if (err instanceof Error && 
            !err.message.includes('timeout') && 
            !err.message.includes('network')) {
          setError(err.message);
        } else {
          console.warn('Network issue refreshing user data, but keeping session');
        }
      }
    }
    return null;
  };

  // Debounced user data fetch to prevent race conditions
  const debouncedFetchUserData = (session: Session) => {
    if (userDataTimeoutRef.current) {
      clearTimeout(userDataTimeoutRef.current);
    }
    
    userDataTimeoutRef.current = setTimeout(async () => {
      try {
        const user = await withRetry(
          () => withTimeout(
            getCurrentUser(),
            10000,
            'User data fetch after auth change timed out'
          ),
          2,
          1500
        );
        console.log('User data after auth change:', user);
        setCurrentUser(user);
        setError(null);
      } catch (err) {
        console.error('Error getting user after auth change:', err);
        // Only clear user data if it's an auth error, not a network error
        if (err instanceof Error && 
            !err.message.includes('timeout') && 
            !err.message.includes('network')) {
          setCurrentUser(null);
          setError(err instanceof Error ? err.message : 'Failed to load user after auth change');
        }
      }
    }, 300); // 300ms debounce
  };

  useEffect(() => {
    console.log('Initializing auth system...');
    initializingRef.current = true;
    
    // Initial session check with enhanced timeout and retry
    const initAuth = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get initial session with timeout and retry
        const { data: { session } } = await withRetry(
          () => withTimeout(
            supabase.auth.getSession(),
            12000, // Increased timeout
            'Session check timed out'
          ),
          2,
          2000
        );
        
        console.log('Initial session check:', session ? 'Session found' : 'No session');
        setSession(session);
        
        if (session) {
          debouncedFetchUserData(session);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        // Be more forgiving of network errors during initialization
        if (err instanceof Error && 
            (err.message.includes('timeout') || err.message.includes('network'))) {
          console.warn('Network issue during auth init, will retry on next interaction');
          setError(null);
        } else {
          setError(err instanceof Error ? err.message : 'Authentication initialization failed');
        }
      } finally {
        setLoading(false);
        initializingRef.current = false;
      }
      
      // Listen for auth changes with improved error handling
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
          setSession(session);
          
          if (session) {
            debouncedFetchUserData(session);
          } else {
            setCurrentUser(null);
            setError(null);
            // Clear any pending user data fetches
            if (userDataTimeoutRef.current) {
              clearTimeout(userDataTimeoutRef.current);
            }
          }
          
          // Only set loading to false if we're not in the middle of initialization
          if (!initializingRef.current) {
            setLoading(false);
          }
        }
      );
      
      // Cleanup subscription on unmount
      return () => {
        console.log('Cleaning up auth subscription');
        subscription.unsubscribe();
        if (userDataTimeoutRef.current) {
          clearTimeout(userDataTimeoutRef.current);
        }
      };
    };
    
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('Login attempt for:', email);
    setLoading(true);
    setError(null);
    try {
      await withRetry(
        () => withTimeout(
          signIn(email, password),
          15000, // Increased timeout
          'Login request timed out'
        ),
        1, // Only retry once for login
        2000
      );
      console.log('Login successful');
    } catch (err) {
      console.error('Login error:', err);
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
      await withRetry(
        () => withTimeout(
          signUp(email, password, name, company),
          15000, // Increased timeout
          'Registration request timed out'
        ),
        1, // Only retry once for registration
        2000
      );
      console.log('Registration successful');
    } catch (err) {
      console.error('Registration error:', err);
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
        8000, // Keep logout timeout reasonable
        'Logout request timed out'
      );
      setCurrentUser(null);
      setSession(null);
      // Clear any pending user data fetches
      if (userDataTimeoutRef.current) {
        clearTimeout(userDataTimeoutRef.current);
      }
    } catch (err) {
      console.error('Logout error:', err);
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
        10000, // Increased timeout
        'Password reset request timed out'
      );
      
      if (error) throw error;
    } catch (err) {
      console.error('Password reset error:', err);
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
        10000, // Increased timeout
        'Password update timed out'
      );
      
      if (error) throw error;
    } catch (err) {
      console.error('Password update error:', err);
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
