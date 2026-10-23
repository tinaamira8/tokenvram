import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './components/site/theme-provider';
import { SiteFooter, SiteHeader } from './components/site/site-chrome';
import Index from './pages/Index';
import ApiCalculatorPage from './pages/ApiCalculatorPage';
import VramCalculatorPage from './pages/VramCalculatorPage';
import SeoCalculatorPage from './pages/SeoCalculatorPage';
import DirectoryPage from './pages/DirectoryPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import { PrivacyPolicyPage, TermsPage } from './pages/LegalPages';
import NotFoundPage from './pages/NotFoundPage';

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/api-calculator" element={<ApiCalculatorPage />} />
    <Route path="/api-calculator/:slug" element={<SeoCalculatorPage tool="api" />} />
    <Route path="/vram-calculator" element={<VramCalculatorPage />} />
    <Route path="/vram-calculator/:slug" element={<SeoCalculatorPage tool="vram" />} />
    <Route path="/directory" element={<DirectoryPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
    <Route path="/terms-of-service" element={<TermsPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main id="main" className="flex-1">
              <AppRoutes />
            </main>
            <SiteFooter />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
export { AppRoutes };
