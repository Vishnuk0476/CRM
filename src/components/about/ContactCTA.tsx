import { motion } from "framer-motion";
import { Phone, Mail, MapPin, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBg from "@/assets/gallery/crew-office-packing.webp"; // Matching AboutHero background

const ContactCTA = () => {
  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      {/* Matching Background: Image + Dark Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-primary/90" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          {/* Badge */}
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-semibold mb-6 border border-secondary/30"
          >
            Get In Touch
          </motion.span>
          
          {/* Heading */}
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
            Ready to <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">
              Begin Your Move?
            </span>
          </h2>
          
          {/* Subtext */}
          <p className="text-lg text-primary-foreground/70 mb-12 max-w-2xl mx-auto leading-relaxed">
            Panya Global Relocation Pvt. Ltd. is prepared to manage your relocation professionally. Reach out today for a seamless experience.
          </p>

          {/* Contact Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            
            {/* Email Card */}
            <motion.a
              href="mailto:info@panyaglobal.in"
              whileHover={{ y: -5, scale: 1.02 }}
              className="group bg-background/10 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-4 hover:bg-background/20 transition-all duration-300 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-primary/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-6 h-6 text-secondary" />
              </div>
              <div className="text-center">
                <span className="block font-bold text-primary-foreground text-lg">Email Us</span>
                <span className="text-sm text-primary-foreground/60">info@panyaglobal.in</span>
              </div>
            </motion.a>

            {/* WhatsApp Card */}
            <motion.a
              href="https://wa.me/918800172802"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -5, scale: 1.02 }}
              className="group bg-background/10 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-4 hover:bg-background/20 transition-all duration-300 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-primary/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="w-6 h-6 text-[#25D366]" />
              </div>
              <div className="text-center">
                <span className="block font-bold text-primary-foreground text-lg">WhatsApp</span>
                <span className="text-sm text-primary-foreground/60">+91 88001 72802</span>
              </div>
            </motion.a>

            {/* Phone Card */}
            <motion.a
              href="tel:+918800331157" // Added specific domestic number
              whileHover={{ y: -5, scale: 1.02 }}
              className="group bg-background/10 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-4 hover:bg-background/20 transition-all duration-300 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-primary/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Phone className="w-6 h-6 text-secondary" />
              </div>
              <div className="text-center">
                <span className="block font-bold text-primary-foreground text-lg">Call Us</span>
                <span className="text-sm text-primary-foreground/60">+91 88003 31157</span>
              </div>
            </motion.a>

          </div>

          {/* Main Actions */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link to="/quote" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto group shadow-xl shadow-secondary/20 bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                Get Free Quote
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/contact" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto bg-white/5 border-white/20 text-primary-foreground hover:bg-white/10 hover:text-white backdrop-blur-md"
              >
                Visit Contact Page
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactCTA;
