
import { supabase } from './client';
import { toast } from 'sonner';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  name?: string; // Added this property for compatibility
  company?: string;
  role?: string;
  lastLogin?: Date | string; // Added this property for compatibility
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    console.log('No current session found:', error);
    return null;
  }
  
  console.log('Session found:', session);
  
  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  if (profileError) {
    console.error('Error fetching profile:', profileError);
  }
  
  console.log('Profile data:', profile);
  
  return {
    id: session.user.id,
    email: session.user.email || '',
    fullName: profile?.full_name || '',
    name: profile?.full_name || '', // Map full_name to name for compatibility
    company: profile?.company || '',
    role: profile?.role || '',
    lastLogin: session.user.last_sign_in_at
  };
};

export const signUp = async (
  email: string,
  password: string,
  fullName: string,
  company: string
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        company,
      }
    }
  });
  
  if (error) {
    toast.error(error.message);
    throw error;
  }
  
  toast.success('Registration successful! Please check your email to confirm your account.');
  return data;
};

export const signIn = async (email: string, password: string) => {
  console.log('Attempting to sign in with:', { email, password: '***' });
  
  // For demo user, use a special login flow
  if (email === 'jonathan@daydreamvc.com' && password === 'password') {
    try {
      console.log('Using demo credentials, attempting login...');
      
      // First try the normal sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (!error) {
        console.log('Sign in successful with demo credentials:', data);
        toast.success('Successfully logged in!');
        return data;
      }
      
      console.warn('Demo credentials login failed:', error.message);
      
      // If the user doesn't exist yet, create them
      if (error.message.includes('Invalid login credentials')) {
        console.log('Attempting to create demo user...');
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: 'Jonathan Admin',
              company: 'DayDream Ventures',
              role: 'admin'
            }
          }
        });
        
        if (signUpError) {
          console.error('Failed to create demo user:', signUpError);
          toast.error('Could not create demo user. Please try again.');
          throw signUpError;
        }
        
        console.log('Demo user created successfully:', signUpData);
        toast.success('Demo user created! Now logging in...');
        
        // Wait a moment before trying to sign in again
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try signing in again with the newly created user
        const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (retryError) {
          console.error('Login with newly created demo user failed:', retryError);
          toast.error('Login failed after creating demo user. Please try again later.');
          throw retryError;
        }
        
        console.log('Successfully logged in with new demo user:', retryData);
        toast.success('Successfully logged in with demo account!');
        return retryData;
      }
      
      // If error wasn't about invalid credentials, show a general error
      toast.error(`Login error: ${error.message}`);
      throw error;
    } catch (err) {
      console.error('Demo login process failed:', err);
      toast.error('Login failed. Please try again later.');
      throw err;
    }
  } else {
    // Regular login flow for non-demo users
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Login error:', error);
      
      if (error.message.includes('invalid credentials')) {
        toast.error('Invalid email or password. Please try again.');
      } else {
        toast.error(`Login failed: ${error.message}`);
      }
      
      throw error;
    }
    
    console.log('Sign in successful:', data);
    toast.success('Successfully logged in!');
    return data;
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    toast.error(error.message);
    throw error;
  }
  
  toast.success('Successfully logged out');
};

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  if (error) {
    toast.error(error.message);
    throw error;
  }
  
  toast.success('Password reset instructions sent to your email');
};

export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (error) {
    toast.error(error.message);
    throw error;
  }
  
  toast.success('Password updated successfully');
};
