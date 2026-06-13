import { motion } from "framer-motion";
import { ClipboardCheck, Package, Truck, Home, MessageSquare, CheckCircle2 } from "lucide-react";
import itemPacking from "@/assets/gallery/item-packing.webp";

const steps = [
  {
    icon: ClipboardCheck,
    number: "01",
    title: "Plan",
    description: "Pre-move planning & assessment with defined SOPs for every move type"
  },
  {
    icon: Package,
    number: "02",
    title: "Pack",
    description: "Professional packing with quality materials and systematic labeling"
  },
  {
    icon: Truck,
    number: "03",
    title: "Move",
    description: "Secure transportation with real-time tracking and updates"
  },
  {
    icon: Home,
    number: "04",
    title: "Deliver",
    description: "Careful unloading, placement, and setup at destination"
  },
  {
    icon: MessageSquare,
    number: "05",
    title: "Support",
    description: "Post-move feedback, closure, and ongoing assistance"
  }
];

const differentiators = [
  "Dedicated coordination & supervision",
  "Real-time updates & communication",
  "Quality checkpoints at every stage",
  "Post-move feedback & closure"
];

const HowWeWork = () => {
  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-1/2 right-0 w-1/3 h-1/2 bg-gradient-to-l from-secondary/5 to-transparent rounded-full blur-3xl -translate-y-1/2" />
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            Our Approach
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            How We <span className="text-secondary">Work</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Relocation fails when execution is reactive. We work systematically with defined 
            processes that allow us to scale without losing quality.
          </p>
        </motion.div>

        {/* Process Steps with Image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center mb-16">
          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group flex items-start gap-5 p-5 rounded-2xl bg-card border border-border hover:border-secondary/30 hover:shadow-lg transition-all duration-300"
              >
                {/* Number & Icon */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                    <step.icon className="w-7 h-7 text-secondary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-heading text-xl font-bold text-foreground mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden sm:block absolute -bottom-4 left-7 w-0.5 h-4 bg-secondary/30" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <motion.img
                initial={{ scale: 1.1 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                src={itemPacking}
                alt="Professional packing process"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>

        {/* Key Differentiators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-muted/50 rounded-3xl p-8 md:p-10 border border-border"
        >
          <h3 className="font-heading text-xl font-bold text-foreground mb-6 text-center">
            This Structure Is What Allows Us To <span className="text-secondary">Scale Without Losing Quality</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {differentiators.map((item, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
              >
                <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowWeWork;
