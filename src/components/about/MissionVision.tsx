import { motion } from "framer-motion";
import { Target, Eye, Rocket, Quote } from "lucide-react";
import bubbleWrap from "@/assets/gallery/bubble-wrap-office.webp";

const MissionVision = () => {
  return (
    <section className="py-24 md:py-32 bg-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-20" />

      {/* Animated Gradients */}
      <motion.div
        animate={{
          x: [0, 60, 0],
          y: [0, -40, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, -60, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl"
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Mission & Vision Cards */}
          <div className="space-y-6">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-primary-foreground/5 backdrop-blur-sm rounded-3xl p-8 border border-primary-foreground/10 hover:border-primary-foreground/20 transition-colors"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center">
                  <Target className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-primary-foreground">
                  Our Mission
                </h3>
              </div>
              <p className="text-primary-foreground/85 leading-relaxed text-lg">
                To deliver stress-free, transparent, and reliable relocation
                experiences by combining disciplined processes, trained
                professionals, and customer-first execution.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-primary-foreground/5 backdrop-blur-sm rounded-3xl p-8 border border-primary-foreground/10 hover:border-primary-foreground/20 transition-colors"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center">
                  <Eye className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-primary-foreground">
                  Our Vision
                </h3>
              </div>
              <p className="text-primary-foreground/85 leading-relaxed text-lg">
                To become a trusted national relocation partner for corporates,
                HR teams, and institutions-recognized for consistency,
                compliance, and ethical operations.
              </p>
            </motion.div>
          </div>

          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src={bubbleWrap}
                alt="Professional packing"
                className="w-full h-[450px] object-cover"
              loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
            </div>

            {/* Quote Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              className="absolute -bottom-6 -left-6 bg-secondary text-secondary-foreground p-6 rounded-2xl shadow-xl max-w-xs"
            >
              <Quote className="w-6 h-6 mb-2 opacity-50" />
              <p className="text-sm font-medium leading-relaxed">
                "We don't compete on being the cheapest.  We compete on being dependable."
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Origin Story */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-primary-foreground/5 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-primary-foreground/10"
        >
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <Rocket className="w-8 h-8 text-secondary" />
            </div>
            <div>
              <h3 className="font-heading text-2xl font-bold text-primary-foreground mb-4">
                Why We Started
              </h3>
              <p className="text-primary-foreground/80 leading-relaxed text-lg max-w-4xl">
                Founded in 2010, Panya Global was created to fix a broken
                industry-where poor coordination, Stress, losses, and mistrust
                resulted from a lack of accountability and inexperienced
                handling. As of today, We are a full-service relocation partner
                for HR, corporations, and individuals. departments-handling
                everything from household moves to large-scale employee
                relocation programs.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MissionVision;
