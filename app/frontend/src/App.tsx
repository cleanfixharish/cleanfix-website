import { lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from './pages/Index';
import AccessibilityMenu from './components/AccessibilityMenu';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));
const WhyTrustUsPage = lazy(() => import('./pages/WhyTrustUsPage'));
const PartnersPage = lazy(() => import('./pages/PartnersPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const QuotePage = lazy(() => import('./pages/QuotePage'));
const PublicQuotePage = lazy(() => import('./pages/PublicQuotePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const AuthError = lazy(() => import('./pages/AuthError'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const AccessibilityPage = lazy(() => import('./pages/AccessibilityPage'));

const queryClient = new QueryClient();

function RouteFallback() {
  return <div className="min-h-[40vh] bg-[#f7f2ea]" aria-hidden="true" />;
}

const AppRoutes = () => (
  <Suspense fallback={<RouteFallback />}>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/why-trust-us" element={<WhyTrustUsPage />} />
      <Route path="/partners" element={<PartnersPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/quote" element={<QuotePage />} />
      <Route path="/quote/:token" element={<PublicQuotePage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/accessibility" element={<AccessibilityPage />} />
      <Route
        path="/admin"
        element={
          import.meta.env.DEV ? (
            <AdminPage />
          ) : (
            <ProtectedAdminRoute>
              <AdminPage />
            </ProtectedAdminRoute>
          )
        }
      />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/error" element={<AuthError />} />
    </Routes>
  </Suspense>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AppRoutes />
            <AccessibilityMenu />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
export { AppRoutes };
