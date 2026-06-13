import { motion } from "framer-motion";
import { Award } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SEO } from "@/components/seo/SEO";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import AboutHero from "@/components/about/AboutHero";
import WhoWeAre from "@/components/about/WhoWeAre";
import CoreSolutions from "@/components/about/CoreSolutions";
import MissionVision from "@/components/about/MissionVision";
import HowWeWork from "@/components/about/HowWeWork";
import MilestonesTimeline from "@/components/about/MilestonesTimeline";
import IndustriesServed from "@/components/about/IndustriesServed";
import WhyChoosePanya from "@/components/about/WhyChoosePanya";
import CertificationsSection from "@/components/about/CertificationsSection";
import PartnersSection from "@/components/home/PartnersSection";
import { PremiumCTA, SectionCTA } from "@/components/ui/PremiumCTA";
import ifcciLogo from "@/assets/clients/Ifcci.webp";

const About = () => {
  return (
    <div className="min-h-screen">
      <SEO 
        title="About Us | Top Rated Packers and Movers - Panya Global"
        description="Learn about Panya Global Relocation. We are a trusted moving company with over 10 years of experience in domestic, international, and workspace relocation."
      />
      <Navbar />
      
      <main>
        <AboutHero />
        <WhoWeAre />
        <CoreSolutions />
        <MissionVision />
        <HowWeWork />
        <MilestonesTimeline />
        <IndustriesServed />
        <WhyChoosePanya />
        <CertificationsSection />

        {/* ── IFCCI Membership Highlight ── */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-[#1B3A6B]/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#E63946]/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-6">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">Official Membership</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4">
                Proud Member of{" "}
                <span className="bg-gradient-to-r from-[#E63946] to-[#FF6B6B] bg-clip-text text-transparent">IFCCI</span>
              </h2>
              <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed">
                We are honoured to be a member of the Indo-French Chamber of Commerce & Industry (IFCCI), strengthening our commitment to world-class relocation services and Indo-French business excellence.
              </p>

              {/* Logo Card */}
              <motion.div
                className="inline-block"
                whileHover={{ scale: 1.05, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="relative">
                  {/* Glow behind */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1B3A6B] to-[#E63946] opacity-30 blur-xl" />
                  {/* Card */}
                  <div className="relative bg-white rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-200/10">
                    <img 
                      src={ifcciLogo}
                      alt="IFCCI - Indo-French Chamber of Commerce & Industry"
                      className="h-16 md:h-20 w-auto object-contain mx-auto"
                      loading="lazy"
                    decoding="async" />
                    <p className="mt-4 text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                      Indo-French Chamber of Commerce & Industry
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <PartnersSection />
        <SectionCTA
          title="Let's Plan Your Move"
          subtitle="Get a personalized quote or speak with our relocation experts today."
          primaryText="Get Free Quote"
          primaryHref="/quote"
          secondaryText="Call Expert"
          secondaryHref="tel:+911141556447"
        />
      </main>
      
      <CityWiseLinks />
      <Footer />
    </div>
  );
};

export default About;
