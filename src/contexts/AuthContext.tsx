
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  company?: string;
  lastLogin?: Date;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, company: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  isAdmin: () => boolean;
}

// Mock data for demo purposes - in a real app you'd use a backend service
const MOCK_USERS: User[] = [
  { 
    id: '1', 
    email: 'founder@example.com', 
    name: 'John Founder', 
    role: 'user', 
    company: 'Startup Inc.',
    lastLogin: new Date('2023-10-15T08:30:00')
  },
  { 
    id: '2', 
    email: 'jane@example.com', 
    name: 'Jane Startup', 
    role: 'user', 
    company: 'Tech Disrupt',
    lastLogin: new Date('2023-09-22T14:15:00')
  },
  { 
    id: '3', 
    email: 'admin@admin.com', 
    name: 'Admin User', 
    role: 'admin',
    lastLogin: new Date('2023-10-30T11:45:00')
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const savedUser = localStorage.getItem('daydreamUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('daydreamUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you would validate with a backend API
    const user = MOCK_USERS.find(u => u.email === email);
    
    if (!user) {
      setLoading(false);
      throw new Error('Invalid email or password');
    }
    
    // In a real app, you would validate the password properly
    if (password !== 'password') {
      setLoading(false);
      throw new Error('Invalid email or password');
    }
    
    // Update last login time
    const updatedUser = { 
      ...user, 
      lastLogin: new Date() 
    };
    
    setCurrentUser(updatedUser);
    localStorage.setItem('daydreamUser', JSON.stringify(updatedUser));
    setLoading(false);
    
    toast.success(`Welcome back, ${user.name}!`);
  };

  const register = async (name: string, email: string, password: string, company: string) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if email is already in use
    if (MOCK_USERS.some(user => user.email === email)) {
      setLoading(false);
      throw new Error('Email is already in use');
    }
    
    // In a real app, you would send this data to a backend API
    const newUser: User = {
      id: String(MOCK_USERS.length + 1),
      email,
      name,
      role: 'user',
      company,
      lastLogin: new Date()
    };
    
    setCurrentUser(newUser);
    localStorage.setItem('daydreamUser', JSON.stringify(newUser));
    setLoading(false);
    
    toast.success('Registration successful!');
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('daydreamUser');
    toast.success('Logged out successfully');
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you would trigger a password reset email via backend
    const user = MOCK_USERS.find(u => u.email === email);
    
    if (!user) {
      setLoading(false);
      throw new Error('No account found with this email');
    }
    
    setLoading(false);
    toast.success('Password reset instructions sent to your email');
  };

  const resetPassword = async (token: string, newPassword: string) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you would validate the token and update the password via backend
    
    setLoading(false);
    toast.success('Password has been reset successfully');
  };

  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
