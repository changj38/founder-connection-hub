
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle, Info, Loader2 } from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'unchecked' | 'checking' | 'authorized' | 'unauthorized'>('unchecked');
  const { register, currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (emailStatus !== 'authorized') {
      setError('This email is not authorized to register. Please contact the administrator.');
      return;
    }
    
    setIsSubmitting(true);

    try {
      await register(name, email, password, company);
      // Navigate to dashboard will happen automatically via auth state change
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // We'll check the email authorization status when the email field loses focus
  const handleEmailBlur = async () => {
    if (!email || email.trim() === '' || !email.includes('@')) return;
    
    try {
      setIsCheckingEmail(true);
      setEmailStatus('checking');
      
      // This will call the checkEmailAuthorized function internally
      const isAuthorized = await import('../integrations/supabase/auth')
        .then(module => module.checkEmailAuthorized(email));
      
      setEmailStatus(isAuthorized ? 'authorized' : 'unauthorized');
      
      if (!isAuthorized) {
        setError('This email is not authorized to register. Please contact the administrator.');
      } else {
        setError('');
      }
    } catch (err) {
      console.error('Error checking email authorization:', err);
      setEmailStatus('unchecked');
    } finally {
      setIsCheckingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container mx-auto px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>

      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="text-center mb-8">
              <img 
                src="/lovable-uploads/29aac53d-4e8a-4190-8ceb-8d4edb8e6a1c.png" 
                alt="DayDream Ventures" 
                className="h-10 w-auto mx-auto mb-6"
              />
              <h2 className="text-2xl font-bold text-gray-900">Invite-Only Access</h2>
              <p className="text-gray-600 mt-2">Create your account for the founder portal</p>
            </div>

            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                Registration is by invitation only. Only pre-authorized email addresses can register.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center justify-between">
                  <span>Email</span>
                  {isCheckingEmail && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
                  {emailStatus === 'authorized' && !isCheckingEmail && (
                    <span className="text-xs text-green-600">Email authorized ✓</span>
                  )}
                  {emailStatus === 'unauthorized' && !isCheckingEmail && (
                    <span className="text-xs text-red-600">Email not authorized</span>
                  )}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailStatus('unchecked');
                  }}
                  onBlur={handleEmailBlur}
                  placeholder="youremail@example.com"
                  required
                  className={emailStatus === 'authorized' ? 'border-green-500' : emailStatus === 'unauthorized' ? 'border-red-500' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Your Startup"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || emailStatus === 'unauthorized' || emailStatus === 'checking'}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-gray-500">
            <p>© {new Date().getFullYear()} DayDream Ventures</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
