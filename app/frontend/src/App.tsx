import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from './pages/Index';
import ServicesPage from './pages/ServicesPage';
import HowItWorksPage from './pages/HowItWorksPage';
import WhyTrustUsPage from './pages/WhyTrustUsPage';
import PartnersPage from './pages/PartnersPage';
import AboutPage from './pages/AboutPage';
import QuotePage from './pages/QuotePage';
import AdminPage from './pages/AdminPage';
import AuthCallback from './pages/AuthCallback';
import AuthError from './pages/AuthError';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/services" element={<ServicesPage />} />
    <Route path="/how-it-works" element={<HowItWorksPage />} />
    <Route path="/why-trust-us" element={<WhyTrustUsPage />} />
    <Route path="/partners" element={<PartnersPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/quote" element={<QuotePage />} />
    <Route
      path="/admin"
      element={
        <ProtectedAdminRoute>
          <AdminPage />
        </ProtectedAdminRoute>
      }
    />
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/auth/error" element={<AuthError />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
export { AppRoutes };
