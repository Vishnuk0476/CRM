import { lazy, Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import PageTransition from "@/components/layout/PageTransition";
import SectionReveal from "@/components/layout/SectionReveal";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import { SEO } from "@/components/seo/SEO";

// Lazy load heavy below-the-fold sections
const FeaturedSection = lazy(() => import("@/components/home/FeaturedSection"));
const ToolsSection = lazy(() => import("@/components/home/ToolsSection"));
const WhyChooseUs = lazy(() => import("@/components/home/WhyChooseUs"));
const VideoTestimonials = lazy(() => import("@/components/home/VideoTestimonials"));
const Testimonials = lazy(() => import("@/components/home/Testimonials"));
const PartnersSection = lazy(() => import("@/components/home/PartnersSection"));
const WorkGallery = lazy(() => import("@/components/home/WorkGallery"));
const HomeSEOContent = lazy(() => import("@/components/home/HomeSEOContent"));

const Index = () => {
  const movingSchema = {
    "@context": "https://schema.org",
    "@type": "MovingCompany",
    "name": "Panya Global Relocation Pvt. Ltd.",
    "image": "https://www.panyaglobal.in/og-image.webp",
    "@id": "https://www.panyaglobal.in",
    "url": "https://www.panyaglobal.in",
    "telephone": "+911141556447",
    "email": "info@panyaglobal.in",
    "logo": "https://www.panyaglobal.in/logo.webp",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "New Delhi",
      "addressRegion": "Delhi",
      "postalCode": "110001",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "28.6139",
      "longitude": "77.2090"
    },
    "areaServed": [
      {"@type": "City", "name": "Delhi"},
      {"@type": "City", "name": "Gurgaon"},
      {"@type": "City", "name": "Noida"}
    ],
    "foundingDate": "2008",
    "description": "Expert packers and movers in Delhi, Gurgaon and Noida. 16+ years experience, 9600+ clients relocated across 280+ cities.",
    "sameAs": [
      "https://www.instagram.com/panyaglobal",
      "https://www.facebook.com/panyaglobal",
      "https://www.linkedin.com/company/panya-global"
    ],
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    }
  };

  return (
    <PageTransition>
      <SEO 
        title="Panya Global | Packers Movers Delhi, Gurgaon & Noida"
        description="Trusted packers and movers in Delhi, Gurgaon and Noida. 16+ years, 9,600+ clients, 280+ cities. International and corporate relocation. Call +91-11-41556447."
        schema={movingSchema}
      />
      {/* ❌ NO min-h-screen here */}
      <div className="flex flex-col">
        <Navbar />

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-hidden">
          <Hero />

          <Suspense fallback={<div className="h-[500px] w-full flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div></div>}>
            <SectionReveal direction="up">
              <FeaturedSection />
            </SectionReveal>

            <SectionReveal direction="up" delay={0.1}>
              <ToolsSection />
            </SectionReveal>

            <SectionReveal direction="left">
              <WhyChooseUs />
            </SectionReveal>

            <SectionReveal direction="up">
              <WorkGallery />
            </SectionReveal>

            <SectionReveal direction="right">
              <VideoTestimonials />
            </SectionReveal>

            <SectionReveal direction="up">
              <Testimonials />
            </SectionReveal>

            <SectionReveal direction="up" delay={0.1}>
              <PartnersSection />
            </SectionReveal>

            <SectionReveal direction="up">
              <HomeSEOContent />
            </SectionReveal>

          </Suspense>
        </main>

        <CityWiseLinks />
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;
