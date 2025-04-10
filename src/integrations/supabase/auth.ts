
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
    return null;
  }
  
  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
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
