import { useState, lazy, Suspense, useEffect } from "react";
import { useVisitorLog } from "@/hooks/useVisitorLog";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import { StickyCTA } from "@/components/ui/PremiumCTA";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { CustomerAuthProvider } from "./context/CustomerAuthContext";

// ─── Lazy-loaded pages (code-split for fast initial load) ─────────────────────
const FloatingChatWidget    = lazy(() => import("@/components/FloatingChatWidget"));
const AIChatbot             = lazy(() => import("@/components/chat/AIChatbot").then(m => ({ default: m.AIChatbot })));
const GreetingBanner        = lazy(() => import("@/components/layout/GreetingBanner"));
const IFCCIMembershipBanner = lazy(() => import("@/components/IFCCIMembershipBanner"));
const About               = lazy(() => import("./pages/About"));
const Services            = lazy(() => import("./pages/Services"));
const Contact             = lazy(() => import("./pages/Contact"));
const Quote               = lazy(() => import("./pages/Quote"));
const Events              = lazy(() => import("./pages/Events"));
const Gallery             = lazy(() => import("./pages/Gallery"));
const TrackConsignment    = lazy(() => import("./pages/TrackConsignment"));
const BookConsignment     = lazy(() => import("./pages/BookConsignment"));
const TrackQuote          = lazy(() => import("./pages/TrackQuote"));
const TrackServiceInquiry = lazy(() => import("./pages/TrackServiceInquiry"));
const TrackRequest        = lazy(() => import("./pages/TrackRequest"));
const PayOnline           = lazy(() => import("./pages/PayOnline"));
const DetectFraud         = lazy(() => import("./pages/DetectFraud"));
const Clients             = lazy(() => import("./pages/Clients"));
const Reviews             = lazy(() => import("./pages/Reviews"));
const Brochure            = lazy(() => import("./pages/Brochure"));
const PrivacyPolicy       = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService      = lazy(() => import("./pages/TermsOfService"));
const Sitemap             = lazy(() => import("./pages/Sitemap"));
const Partner             = lazy(() => import("./pages/Partner"));
const FAQ                 = lazy(() => import("./pages/FAQ"));
const Branches            = lazy(() => import("./pages/Branches"));
const WorkspaceRelocation = lazy(() => import("./pages/WorkspaceRelocation"));
const AdminLogin          = lazy(() => import("./pages/AdminLogin"));
const Admin               = lazy(() => import("./pages/Admin"));
const EasyCoverWarranty   = lazy(() => import("./pages/EasyCoverWarranty"));
const BlogIndex           = lazy(() => import("./pages/Blog/BlogIndex"));
const BlogPost            = lazy(() => import("./pages/Blog/BlogPost"));
const LocationPage        = lazy(() => import("./pages/locations/LocationPage"));
const PackersMoversDelhi  = lazy(() => import("./pages/locations/PackersMoversDelhi"));
const PackersMoversGurgaon= lazy(() => import("./pages/locations/PackersMoversGurgaon"));
const PackersMoversNoida  = lazy(() => import("./pages/locations/PackersMoversNoida"));
const InternationalMoversDelhi = lazy(() => import("./pages/locations/InternationalMoversDelhi"));
const CustomerTracking    = lazy(() => import("./pages/CustomerTracking"));

// ─── Portal Pages ──────────────────
const PortalLogin         = lazy(() => import("./pages/portal/PortalLogin"));
const PortalRegister      = lazy(() => import("./pages/portal/PortalRegister"));
const PortalForgotPassword= lazy(() => import("./pages/portal/PortalForgotPassword"));
const PortalDashboard     = lazy(() => import("./pages/portal/PortalDashboard"));

// ─── Public Client Portal Pages ────────
const ClientQuoteView     = lazy(() => import("./pages/client/ClientQuoteView"));
const ClientInvoiceView   = lazy(() => import("./pages/client/ClientInvoiceView"));

// ─── Lazy-loaded service pages ──────────────────
const LocalMoving           = lazy(() => import("./pages/services/LocalMoving"));
const LongDistanceMoving    = lazy(() => import("./pages/services/LongDistanceMoving"));
const InternationalMoving   = lazy(() => import("./pages/services/InternationalMoving"));
const VehicleTransport      = lazy(() => import("./pages/services/VehicleTransport"));
const PetRelocation         = lazy(() => import("./pages/services/PetRelocation"));
const StorageServices       = lazy(() => import("./pages/services/StorageServices"));
const OfficeRelocation      = lazy(() => import("./pages/services/OfficeRelocation"));
const ITDataCenterRelocation= lazy(() => import("./pages/services/ITDataCenterRelocation"));
const IndustrialRelocation  = lazy(() => import("./pages/services/IndustrialRelocation"));
const HealthcareRelocation  = lazy(() => import("./pages/services/HealthcareRelocation"));
const LabRelocation         = lazy(() => import("./pages/services/LabRelocation"));
const SchoolSearch          = lazy(() => import("./pages/services/SchoolSearch"));
const HouseSearch           = lazy(() => import("./pages/services/HouseSearch"));
const RentalCar             = lazy(() => import("./pages/services/RentalCar"));
const PestControl           = lazy(() => import("./pages/services/PestControl"));
const ExitCleanService      = lazy(() => import("./pages/services/ExitCleanService"));
const HandymanServices      = lazy(() => import("./pages/services/HandymanServices"));
const CorporateServices     = lazy(() => import("./pages/services/CorporateServices"));
const FineArtService        = lazy(() => import("./pages/services/FineArtService"));
const ScrapService          = lazy(() => import("./pages/services/ScrapService"));
import ScrollToTop from "./components/layout/ScrollToTop";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const useIdleReady = (delay = 2500) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const markReady = () => setReady(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(markReady, { timeout: delay });
      return () => window.cancelIdleCallback(id);
    }

    const id = window.setTimeout(markReady, delay);
    return () => window.clearTimeout(id);
  }, [delay]);

  return ready;
};

const VisitorLogger = () => {
  useVisitorLog();
  return null;
};

// Silent tracker — fires log on route change and manages global widgets
const RouterEffects = () => {
  const analyticsReady = useIdleReady();
  const location = useLocation();
  
  useEffect(() => {
    if (!analyticsReady) return;

    // Only show Tawk.to on contact page
    const shouldShow = location.pathname === '/contact' || location.pathname === '/contact/';
    
    const interval = setInterval(() => {
      // @ts-ignore
      if (window.Tawk_API && typeof window.Tawk_API.hideWidget === 'function') {
        if (shouldShow) {
          // @ts-ignore
          window.Tawk_API.showWidget();
        } else {
          // @ts-ignore
          window.Tawk_API.hideWidget();
        }
        clearInterval(interval);
      }
    }, 500);

    setTimeout(() => clearInterval(interval), 10000);
    return () => clearInterval(interval);
  }, [analyticsReady, location.pathname]);

  return analyticsReady ? <VisitorLogger /> : null;
};

// Global UI Wrapper (Hidden on admin routes)
const GlobalUI = ({ openAIChat, setOpenAIChat }: { openAIChat: boolean, setOpenAIChat: (val: boolean) => void }) => {
  const location = useLocation();
  const widgetsReady = useIdleReady(3500);

  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/portal') || location.pathname.startsWith('/client')) {
    return (
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
    );
  }

  if (!widgetsReady) return null;
  
  return (
    <>
      <Suspense fallback={null}>
        <GreetingBanner />
      </Suspense>
      <Suspense fallback={null}>
        <IFCCIMembershipBanner />
      </Suspense>
      <Suspense fallback={null}>
        <FloatingChatWidget onOpenChatbot={() => setOpenAIChat(true)} />
      </Suspense>
      <Suspense fallback={null}>
        <AIChatbot forceOpen={openAIChat} onClose={() => setOpenAIChat(false)} />
      </Suspense>
    </>
  );
};

const App = () => {
  const [openAIChat, setOpenAIChat] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
       
         <TooltipProvider>
           <Toaster />
           <Sonner />
           <BrowserRouter>
              <CustomerAuthProvider>
              <RouterEffects />
              <ScrollToTop />
             <div className="min-h-screen flex flex-col">
               <StickyCTA />
               {/* Main page content */}
               <main className="flex-1">
                <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-secondary border-t-transparent animate-spin" /></div>}>
                <Routes>
                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/*" element={<Admin />} />
                  
                  {/* Customer Portal Routes */}
                  <Route path="/portal/login" element={<PortalLogin />} />
                  <Route path="/portal/register" element={<PortalRegister />} />
                  <Route path="/portal/forgot-password" element={<PortalForgotPassword />} />
                  <Route path="/portal/dashboard" element={<PortalDashboard />} />

                  {/* Public Client Portal Routes */}
                  <Route path="/client/quote/:id" element={<ClientQuoteView />} />
                  <Route path="/client/invoice/:id" element={<ClientInvoiceView />} />

                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/quote" element={<Quote />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/book-consignment" element={<BookConsignment />} />
                  <Route path="/track" element={<TrackConsignment />} />
                  <Route path="/track-shipment" element={<CustomerTracking />} />
                  <Route path="/track-quote" element={<TrackQuote />} />
                  <Route
                    path="/track-inquiry"
                    element={<TrackServiceInquiry />}
                  />
                  <Route path="/track-request" element={<TrackRequest />} />
                  <Route path="/pay" element={<PayOnline />} />
                  <Route path="/detect-fraud" element={<DetectFraud />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/brochure" element={<Brochure />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/sitemap" element={<Sitemap />} />
                  <Route path="/partner" element={<Partner />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/branches" element={<Branches />} />
                  <Route
                    path="/workspace-relocation"
                    element={<WorkspaceRelocation />}
                  />
                  {/* Home Relocation Services */}
                  <Route
                    path="/services/local-moving"
                    element={<LocalMoving />}
                  />
                  <Route
                    path="/services/long-distance"
                    element={<LongDistanceMoving />}
                  />
                  <Route
                    path="/services/international"
                    element={<InternationalMoving />}
                  />
                  <Route
                    path="/services/vehicle-transport"
                    element={<VehicleTransport />}
                  />
                  <Route
                    path="/services/pet-relocation"
                    element={<PetRelocation />}
                  />
                  <Route
                    path="/services/storage"
                    element={<StorageServices />}
                  />
                  {/* Workplace Relocation Services */}
                  <Route
                    path="/services/office-relocation"
                    element={<OfficeRelocation />}
                  />
                  <Route
                    path="/services/it-datacenter"
                    element={<ITDataCenterRelocation />}
                  />
                  <Route
                    path="/services/industrial"
                    element={<IndustrialRelocation />}
                  />
                  <Route
                    path="/services/healthcare"
                    element={<HealthcareRelocation />}
                  />
                  <Route
                    path="/services/lab-relocation"
                    element={<LabRelocation />}
                  />
                  {/* Mobility Services */}
                  <Route
                    path="/services/school-search"
                    element={<SchoolSearch />}
                  />
                  <Route
                    path="/services/house-search"
                    element={<HouseSearch />}
                  />
                  <Route path="/services/car-rental" element={<RentalCar />} />
                  {/* Additional Services */}
                  <Route
                    path="/services/pest-control"
                    element={<PestControl />}
                  />

                  <Route
                    path="/services/exit-clean"
                    element={<ExitCleanService />}
                  />
                  <Route
                    path="/services/handyman"
                    element={<HandymanServices />}
                  />
                  {/* Premium Services */}
                  <Route
                    path="/services/fine-art"
                    element={<FineArtService />}
                  />
                  <Route
                    path="/services/scrap-service"
                    element={<ScrapService />}
                  />
                  {/* Easy Cover Warranty */}
                  <Route
                    path="/easy-cover-warranty"
                    element={<EasyCoverWarranty />}
                  />
                  {/* Corporate Services */}
                  <Route
                    path="/services/corporate-services"
                    element={<CorporateServices />}
                  />
                  {/* Blog */}
                  <Route path="/blog" element={<BlogIndex />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  {/* Custom Location SEO Pages */}
                  <Route
                    path="/packers-movers-delhi"
                    element={<PackersMoversDelhi />}
                  />
                  <Route
                    path="/packers-movers-gurgaon"
                    element={<PackersMoversGurgaon />}
                  />
                  <Route
                    path="/packers-movers-noida"
                    element={<PackersMoversNoida />}
                  />
                  <Route
                    path="/packers-movers-gurugram"
                    element={<Navigate to="/packers-movers-gurgaon" replace />}
                  />
                  <Route
                    path="/international-packers-movers-delhi"
                    element={<InternationalMoversDelhi />}
                  />

                  {/* Location SEO Pages */}
                  <Route
                    path="/packers-movers/:slug"
                    element={<LocationPage />}
                  />
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </Suspense>
              </main>
              {/* Floating / Global UI - LAZY LOADED with Suspense */}
              <GlobalUI openAIChat={openAIChat} setOpenAIChat={setOpenAIChat} />
            </div>
            </CustomerAuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      
    </QueryClientProvider>
  );
};

export default App;
