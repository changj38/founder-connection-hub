
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Extended user type that includes profile data
export interface ExtendedUser extends User {
  fullName?: string;
  company?: string;
  location?: string;
  avatar_url?: string;
  role?: string;
  lastLogin?: string | Date;
}

interface AuthContextType {
  user: ExtendedUser | null;
  currentUser: ExtendedUser | null; // Alias for backward compatibility
  session: Session | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  logout: () => Promise<void>; // Alias for signOut
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, company: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  checkEmailAuthorized: (email: string) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch and merge profile data with user
  const enrichUserWithProfile = async (baseUser: User): Promise<ExtendedUser> => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', baseUser.id)
        .single();

      if (profileError) {
        console.warn('AuthProvider: Could not fetch profile data:', profileError);
      }

      return {
        ...baseUser,
        fullName: profile?.full_name || baseUser.user_metadata?.full_name || '',
        company: profile?.company || baseUser.user_metadata?.company || '',
        location: profile?.location || '',
        avatar_url: profile?.avatar_url || '',
        role: profile?.role || 'user',
        lastLogin: baseUser.last_sign_in_at
      };
    } catch (err) {
      console.error('AuthProvider: Error enriching user with profile:', err);
      // Return user with minimal data if profile fetch fails
      return {
        ...baseUser,
        fullName: baseUser.user_metadata?.full_name || '',
        company: baseUser.user_metadata?.company || '',
        location: '',
        avatar_url: '',
        role: 'user',
        lastLogin: baseUser.last_sign_in_at
      };
    }
  };

  useEffect(() => {
    console.log('AuthProvider: Initializing auth state');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state changed:', event, session?.user?.email || 'No user');
        setSession(session);
        
        if (session?.user) {
          // Enrich user with profile data
          const enrichedUser = await enrichUserWithProfile(session.user);
          setUser(enrichedUser);
        } else {
          setUser(null);
        }
        
        setError(null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthProvider: Error getting session:', error);
          setError(error.message);
        } else {
          console.log('AuthProvider: Initial session:', session?.user?.email || 'No user');
          setSession(session);
          
          if (session?.user) {
            const enrichedUser = await enrichUserWithProfile(session.user);
            setUser(enrichedUser);
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error('AuthProvider: Unexpected error:', err);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log('AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthProvider: Error signing out:', error);
        setError(error.message);
      }
    } catch (err) {
      console.error('AuthProvider: Unexpected error during signout:', err);
      setError('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, company: string) => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            company: company
          }
        }
      });
      if (error) {
        throw error;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        throw error;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        throw error;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkEmailAuthorized = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('authorized_emails')
        .select('email')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
      if (error) {
        console.error('Error checking email authorization:', error);
        return false;
      }
      
      return !!data;
    } catch (err) {
      console.error('Error checking email authorization:', err);
      return false;
    }
  };

  const refreshUserData = async () => {
    try {
      const { data: { user: baseUser }, error } = await supabase.auth.getUser();
      if (error) {
        throw error;
      }
      if (baseUser) {
        const enrichedUser = await enrichUserWithProfile(baseUser);
        setUser(enrichedUser);
      }
    } catch (err: any) {
      console.error('Error refreshing user data:', err);
      setError(err.message);
    }
  };

  const isAdmin = (): boolean => {
    // Check if user has admin role
    return user?.role === 'admin' || user?.email === 'admin@daydreamventures.com';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      currentUser: user, // Alias for backward compatibility
      session, 
      loading, 
      error, 
      signOut,
      logout: signOut, // Alias for signOut
      login,
      register,
      forgotPassword,
      resetPassword,
      checkEmailAuthorized,
      refreshUserData,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
