import { motion } from "framer-motion";
import { Home, Building2, Users, Sparkles, Car, PawPrint, Recycle, ArrowRight, Briefcase } from "lucide-react";
import homePacking from "@/assets/gallery/home-packing.webp";
import crewOffice from "@/assets/gallery/crew-office-packing.webp";
import labOfficePacking from "@/assets/gallery/lab-office-packing.webp";

const solutions = [
  {
    icon: Home,
    title: "Household Relocation",
    description: "Safe, insured, and professionally managed household shifting for individuals and families.",
    features: [
      "Professional packing & labeling",
      "Secure transportation",
      "Unpacking & placement",
      "Damage-minimization SOPs"
    ],
    image: homePacking,
  },
  {
    icon: Users,
    title: "Corporate Employee Relocation",
    description: "End-to-end employee relocation programs, reducing HR workload and improving employee experience.",
    features: [
      "Bulk relocation handling",
      "Employee dashboards & tracking",
      "Centralized billing",
      "Policy-based execution"
    ],
    image: crewOffice,
  },
  {
    icon: Building2,
    title: "Office & Commercial",
    description: "Planned office moves with minimal downtime and zero asset loss.",
    features: [
      "IT equipment handling",
      "Asset tagging",
      "Phased relocation execution",
      "Post-move setup support"
    ],
    image: labOfficePacking,
  }
];

const additionalServices = [
  { icon: Home, label: "Temporary accommodation" },
  { icon: Briefcase, label: "House hunting" },
  { icon: Sparkles, label: "Handyman services" },
  { icon: Car, label: "Vehicle relocation" },
  { icon: PawPrint, label: "Pet relocation" },
  { icon: Recycle, label: "Scrap management" },
];

const CoreSolutions = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-secondary/5 to-transparent rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 max-w-3xl mx-auto"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            Our Core Solutions
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            Comprehensive
            <span className="text-secondary"> Relocation Services</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            From homes to offices to entire workforces-we handle it all with precision and care.
          </p>
        </motion.div>

        {/* Main Solutions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              viewport={{ once: true }}
              className="group bg-card rounded-3xl overflow-hidden border border-border hover:border-secondary/30 hover:shadow-2xl transition-all duration-500"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  src={solution.image}
                  alt={solution.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center shadow-lg">
                    <solution.icon className="w-7 h-7 text-secondary-foreground" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-heading text-xl font-bold text-foreground mb-3">
                  {solution.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
                  {solution.description}
                </p>
                <ul className="space-y-2.5">
                  {solution.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm"
        >
          <div className="text-center mb-6">
            <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
              Settling-In & <span className="text-secondary">Specialized Services</span>
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Relocation doesn't end at delivery. We help employees and families settle faster.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {additionalServices.map((service, index) => (
              <motion.div
                key={service.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-muted/50 hover:bg-secondary/10 border border-transparent hover:border-secondary/20 transition-all duration-300 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <service.icon className="w-6 h-6 text-secondary" />
                </div>
                <span className="text-sm font-medium text-foreground">{service.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CoreSolutions;
