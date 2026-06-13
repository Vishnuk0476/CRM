import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Globe, Users, Shield, Clock, Building2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-video.mp4";

const AboutHero = () => {
  return (
    <section className="relative pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-16 md:pb-20 lg:pb-24 min-h-[85vh] sm:min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Video with Performance Optimized Parallax Effect */}
      <motion.div 
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <video 
          src={heroBg} 
          autoPlay 
          loop 
          muted 
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
      </motion.div>
      
      {/* Enhanced Gradient Overlays with Better Visibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/98 via-primary/90 to-primary/75 sm:from-primary/95 sm:via-primary/85 sm:to-primary/65" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
      
      {/* Optimized Animated Decorative Elements - Simplified for Performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
        <motion.div
          animate={{ 
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-20 w-72 h-72 lg:w-96 lg:h-96 bg-secondary/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-20 w-96 h-96 lg:w-[500px] lg:h-[500px] bg-secondary/20 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl">
          {/* Enhanced Badge with Icon - Fully Responsive */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="inline-flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-secondary/25 backdrop-blur-md text-secondary text-xs sm:text-sm font-semibold mb-6 sm:mb-8 border border-secondary/40 shadow-xl"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-secondary animate-pulse shadow-lg shadow-secondary/50" />
              <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold">Trusted Since 2010</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-secondary/50" />
            <div className="flex items-center gap-2 text-secondary">
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-xs font-semibold">India's Leading Relocation Partner</span>
            </div>
          </motion.div>
          
          {/* Enhanced Main Heading - Clear on All Devices */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary-foreground mb-4 sm:mb-6 leading-[1.15] sm:leading-[1.1] tracking-tight drop-shadow-lg"
          >
            <span className="block">End-to-End Relocation</span>
            <span className="text-secondary block mt-1 sm:mt-2 drop-shadow-xl">& Corporate Mobility</span>
          </motion.h1>
          
          {/* Enhanced Subheading - Better Mobile Layout */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6"
          >
            <span className="text-xl sm:text-2xl md:text-3xl text-primary-foreground font-medium sm:font-light drop-shadow-md">Since 2010</span>
            <div className="hidden sm:block w-px h-8 bg-primary-foreground/40" />
            <div className="flex items-center gap-2 text-primary-foreground bg-primary-foreground/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-primary-foreground/20">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
              <span className="text-xs sm:text-sm font-semibold">ISO 9001:2015 Certified</span>
            </div>
          </motion.div>
          
          {/* Enhanced Description - Optimized for Mobile Readability */}
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-primary-foreground/95 max-w-3xl leading-relaxed sm:leading-relaxed mb-6 sm:mb-8 drop-shadow-md font-medium"
          >
            Panya Global Relocation Pvt. Ltd. is a professionally managed relocation and mobility 
            solutions company delivering structured, reliable, and compliant moving services across India. 
            Trusted by Fortune 500 companies and thousands of families nationwide. We specialize in 
            seamless transitions that transform the complex process of relocation into a smooth, 
            stress-free experience for individuals, families, and corporations alike.
          </motion.p>

          {/* Enhanced CTA Section - Stacked on Mobile */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center mb-6 sm:mb-0"
          >
            <Button 
              asChild 
              size="lg" 
              className="rounded-full px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base font-bold shadow-2xl hover:shadow-3xl transition-all bg-secondary hover:bg-secondary/90 text-white border-0 w-full sm:w-auto"
            >
              <Link to="/quote" className="flex items-center justify-center gap-2 sm:gap-3">
                <span>Get Free Quote</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="rounded-full px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base font-bold bg-primary-foreground/15 backdrop-blur-sm border-2 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/25 hover:border-primary-foreground/60 transition-all w-full sm:w-auto shadow-lg"
            >
              <Link to="/clients" className="flex items-center justify-center gap-2 sm:gap-3">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>View Our Clients</span>
              </Link>
            </Button>
          </motion.div>

          {/* Trust Indicators - Responsive Grid Layout */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-2 lg:flex lg:flex-wrap gap-3 sm:gap-4 mt-8 sm:mt-10 md:mt-12"
          >
            <div className="flex items-center gap-2 text-primary-foreground/90 text-xs sm:text-sm bg-primary-foreground/10 backdrop-blur-sm px-3 py-2 rounded-full border border-primary-foreground/20">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary flex-shrink-0" />
              <span className="font-medium whitespace-nowrap">100% Satisfaction</span>
            </div>
            
            <div className="flex items-center gap-2 text-primary-foreground/90 text-xs sm:text-sm bg-primary-foreground/10 backdrop-blur-sm px-3 py-2 rounded-full border border-primary-foreground/20">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary flex-shrink-0" />
              <span className="font-medium whitespace-nowrap">Insurance Covered</span>
            </div>
            
            <div className="flex items-center gap-2 text-primary-foreground/90 text-xs sm:text-sm bg-primary-foreground/10 backdrop-blur-sm px-3 py-2 rounded-full border border-primary-foreground/20">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary flex-shrink-0" />
              <span className="font-medium whitespace-nowrap">On-Time Delivery</span>
            </div>
            
            <div className="flex items-center gap-2 text-primary-foreground/90 text-xs sm:text-sm bg-primary-foreground/10 backdrop-blur-sm px-3 py-2 rounded-full border border-primary-foreground/20">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary flex-shrink-0" />
              <span className="font-medium whitespace-nowrap">Award Winning</span>
            </div>
          </motion.div>
        </div>
      </div>


    </section>
  );
};

export default AboutHero;
