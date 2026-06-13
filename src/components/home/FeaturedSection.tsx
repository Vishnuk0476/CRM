import { motion } from "framer-motion";
import { ArrowRight, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FeaturedSection = () => {
  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-secondary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-primary/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* About Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Side with Parallax */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop"
                alt="Panya Global Team"
                width={800}
                height={600}
                className="w-full h-[400px] object-cover"
                loading="lazy" 
                decoding="async" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />

              {/* Overlay Card */}
              <motion.div
                className="absolute bottom-6 left-6 right-6 bg-background/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Award className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-foreground">Established 2010</p>
                    <p className="text-sm text-muted-foreground">New Delhi, India</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Floating Badge */}
            <motion.div
              className="absolute -top-4 -right-4 bg-secondary text-secondary-foreground rounded-2xl px-6 py-3 shadow-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              animate={{ y: [0, -8, 0] }}
            >
              <p className="text-sm font-bold">Trusted Since</p>
              <p className="text-2xl font-heading font-bold">2010</p>
            </motion.div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-4">
              About Us
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
              Your Trusted Partner in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">
                Relocation
              </span>
            </h2>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              At Panya Global Relocation, we're redefining the moving experience for the modern era. Since 2010, we've
              combined cutting-edge logistics technology with personalized care to deliver seamless relocations across
              India and worldwide. Our commitment to excellence has earned us the trust of over 9,500 families,
              corporations, and expatriates who demand nothing less than perfection.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              From AI-powered tracking systems to eco-friendly packing solutions, we leverage innovation to make your
              move effortless. Our certified team of specialists ensures every item-from delicate antiques to entire
              data centers-reaches its destination safely. Experience the future of relocation with a partner that truly
              understands your needs.
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="inline-flex items-center gap-1.5 bg-secondary/10 text-secondary px-3 py-1.5 rounded-full text-sm font-medium">
                <Award className="h-3.5 w-3.5" />
                ISO 9001:2015
              </span>
              <span className="inline-flex items-center gap-1.5 bg-secondary/10 text-secondary px-3 py-1.5 rounded-full text-sm font-medium">
                <Award className="h-3.5 w-3.5" />
                ISO 14001:2015
              </span>
              <span className="inline-flex items-center gap-1.5 bg-secondary/10 text-secondary px-3 py-1.5 rounded-full text-sm font-medium">
                <Award className="h-3.5 w-3.5" />
                ISO 45001:2018
              </span>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              <Link to="/about">
                <Button size="lg" className="group">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a href="brochure" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg">
                  Download Brochure
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
