import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Shield,
  Clock,
  Users,
  Headphones,
  DollarSign,
  ThumbsUp,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Easy Cover Warranty",
    description:
      "Protection against transit damage and loss. Simple, transparent coverage without complicated claim processes.",
  },
  {
    icon: Clock,
    title: "On-Time Pickup & Delivery",
    description:
      "We respect your schedule. Our teams follow planned timelines to ensure smooth and punctual execution.",
  },
  {
    icon: Users,
    title: "Trained Relocation Experts",
    description:
      "Professionally trained staff who handle packing, loading, and delivery with care and discipline.",
  },
  {
    icon: Headphones,
    title: "24/7 Customer Support",
    description:
      "Dedicated support team available round-the-clock to assist you before, during, and after your move.",
  },
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    description:
      "Clear quotations with no hidden charges. What we commit is exactly what you pay.",
  },
  {
    icon: ThumbsUp,
    title: "Customer Satisfaction First",
    description:
      "Thousands of successful relocations completed with consistently high customer satisfaction ratings.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const WhyChooseUs = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-bold uppercase tracking-widest mb-4">
            Why Choose Panya Global
          </span>

          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            A Relocation Experience Built on{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">
              Trust & Accountability
            </span>
          </h2>

          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            We don’t just move goods - we manage responsibility. From Easy Cover
            Warranty to disciplined execution, every move is handled with
            clarity, care, and control.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="h-full p-8 rounded-2xl bg-background border border-border hover:border-secondary/50 transition-all duration-300 hover:shadow-xl hover:shadow-secondary/5 relative overflow-hidden">
                {/* Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/0 via-transparent to-secondary/0 group-hover:from-secondary/5 transition-all duration-500" />

                {/* Icon */}
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-secondary transition-all duration-300 relative z-10"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 12 }}
                >
                  <feature.icon className="w-8 h-8 text-secondary group-hover:text-secondary-foreground transition-colors" />
                </motion.div>

                {/* Content */}
                <h3 className="font-heading text-xl font-bold text-foreground mb-3 relative z-10 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>

                <p className="text-muted-foreground text-sm leading-relaxed relative z-10">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
