
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
  avatar_url?: string; 
  location?: string;
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    console.log('No current session found:', error);
    return null;
  }
  
  console.log('Session found:', session);
  
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
    role: profile?.role || 'user', // Default to 'user' if no role is specified
    lastLogin: session.user.last_sign_in_at,
    avatar_url: profile?.avatar_url || '',
    location: profile?.location || ''
  };
};

export const checkEmailAuthorized = async (email: string): Promise<boolean> => {
  console.log('Checking if email is authorized:', email);
  
  if (!email) {
    console.error('Empty email provided to checkEmailAuthorized');
    return false;
  }
  
  const normalizedEmail = email.trim().toLowerCase();
  console.log('Normalized email for authorization check:', normalizedEmail);
  
  try {
    // Fetch all authorized emails for debugging
    const { data: allEmails, error: allEmailsError } = await supabase
      .from('authorized_emails')
      .select('email')
      .order('email');
      
    if (allEmailsError) {
      console.error('Error fetching all authorized emails:', allEmailsError);
    } else {
      console.log('All authorized emails in database:', allEmails.map(e => e.email));
    }
    
    // Check for the specific email
    const { data, error } = await supabase
      .from('authorized_emails')
      .select('id, email')
      .eq('email', normalizedEmail)
      .limit(1);
    
    if (error) {
      console.error('Error checking authorized email:', error);
      toast.error('Error checking email authorization');
      throw error;
    }
    
    const isAuthorized = data && data.length > 0;
    
    // Log the result along with the actual database values for debugging
    console.log('Email authorization result:', isAuthorized, 'for', normalizedEmail);
    if (data && data.length > 0) {
      console.log('Matched authorized email in database:', data[0].email);
    } else {
      console.log('No matching authorized email found in database');
      
      // Debug: Check if there's a non-exact match (case or whitespace differences)
      if (allEmails) {
        const possibleMatches = allEmails.filter(e => 
          e.email.toLowerCase().replace(/\s+/g, '') === normalizedEmail.replace(/\s+/g, '')
        );
        if (possibleMatches.length > 0) {
          console.log('Possible matches with different case/whitespace:', possibleMatches);
        }
      }
    }
    
    return isAuthorized;
  } catch (err) {
    console.error('Failed to check email authorization:', err);
    return false;
  }
};

export const signUp = async (
  email: string,
  password: string,
  fullName: string,
  company: string
) => {
  console.log('Starting signup process for:', email);
  
  // Normalize the email before checking authorization
  const normalizedEmail = email.trim().toLowerCase();
  const isAuthorized = await checkEmailAuthorized(normalizedEmail);
  
  if (!isAuthorized) {
    console.log('Email not authorized:', normalizedEmail);
    toast.error('This email is not authorized to register. Please contact the administrator.');
    throw new Error('Email not authorized');
  }
  
  console.log('Email authorized, proceeding with signup');
  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail, // Use normalized email for consistency
    password,
    options: {
      data: {
        full_name: fullName,
        company,
      }
    }
  });
  
  if (error) {
    console.error('Signup error:', error);
    toast.error(error.message);
    throw error;
  }
  
  console.log('Registration successful for:', normalizedEmail);
  toast.success('Registration successful! Please check your email to confirm your account.');
  return data;
};

export const signIn = async (email: string, password: string) => {
  console.log('Attempting to sign in with:', { email, password: '***' });
  
  if (email === 'jonathan@daydreamvc.com' && password === 'password') {
    try {
      console.log('Using demo credentials, attempting login...');
      
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
      
      if (error.message.includes('Invalid login credentials')) {
        toast.error('The demo account exists but the password may be different. Please try a different account.');
        throw new Error('Demo account exists but credentials may be incorrect');
      } else {
        toast.error(`Login error: ${error.message}`);
        throw error;
      }
    } catch (err) {
      console.error('Demo login process failed:', err);
      toast.error('Login failed. Please try again later.');
      throw err;
    }
  } else {
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

export const checkIsAdmin = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  console.log('Checking admin status for user:', user);
  return user?.role === 'admin';
};
