
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Index from './pages/Index';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import NetworkPage from './pages/NetworkPage';
import PortfolioPage from './pages/PortfolioPage';
import PortfolioManagementPage from './pages/PortfolioManagementPage';
import ForumPage from './pages/ForumPage';
import HelpPage from './pages/HelpPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import AdminPage from './pages/AdminPage';
import AdminFundSimulator from './pages/AdminFundSimulator';
import NotFound from './pages/NotFound';

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            <Route path="/" element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/network" element={<NetworkPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/portfolio-management" element={<PortfolioManagementPage />} />
              <Route path="/forum" element={<ForumPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/profile-settings" element={<ProfileSettingsPage />} />
              <Route path="/index" element={<Index />} />
            </Route>
            
            <Route path="/admin" element={<AdminRoute />}>
              <Route index element={<AdminPage />} />
              <Route path="fund-simulator" element={<AdminFundSimulator />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
