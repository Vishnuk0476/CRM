import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowRight, CheckCircle2 } from "lucide-react";

const EasyCoverBanner = () => {
  return (
    <section className="py-4 bg-gradient-to-r from-primary via-primary/95 to-primary">
      <div className="container mx-auto px-4">
        <Link to="/easy-cover-warranty">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 cursor-pointer group"
          >
            {/* Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary/20 rounded-full">
              <Shield className="w-5 h-5 text-secondary" />
              <span className="text-sm font-bold text-secondary">Easy Cover Warranty</span>
            </div>
            
            {/* Message */}
            <div className="flex items-center gap-4 text-primary-foreground/90">
              <div className="hidden md:flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                <span className="text-sm">Transparent Protection</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                <span className="text-sm">No Hidden Clauses</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                <span className="text-sm">Fast Claim Resolution</span>
              </div>
            </div>
            
            {/* CTA */}
            <div className="flex items-center gap-2 text-secondary font-semibold group-hover:gap-3 transition-all duration-300">
              <span className="text-sm">Learn More</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>
        </Link>
      </div>
    </section>
  );
};

export default EasyCoverBanner;
