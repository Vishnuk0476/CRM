import { motion } from "framer-motion";
import { Award, Shield, CheckCircle, Star, FileCheck, Trophy } from "lucide-react";

const CertificationsSection = () => {
  const certifications = [
    {
      title: "ISO 9001:2015",
      subtitle: "Quality Management System",
      description: "Internationally recognized certification for quality management processes and continuous improvement.",
      icon: Award,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "ISO 14001:2015",
      subtitle: "Environmental Management",
      description: "Commitment to environmental responsibility and sustainable relocation practices.",
      icon: Shield,
      color: "from-green-500 to-green-600",
    },
    {
      title: "ISO 45001:2018",
      subtitle: "Occupational Health & Safety",
      description: "Ensuring the highest standards of workplace health and safety for our team and clients.",
      icon: CheckCircle,
      color: "from-orange-500 to-orange-600",
    },
  ];

  const awards = [
    { title: "Best Relocation Company", year: "2023", org: "India Moving Awards" },
    { title: "Excellence in Corporate Moving", year: "2022", org: "National Logistics Association" },
    { title: "Top 10 Packers & Movers", year: "2024", org: "Industry Association of India" },
    { title: "Customer Service Excellence", year: "2023", org: "Service Quality Awards" },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 sm:mb-14 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-secondary font-semibold text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4">
            Certifications & Recognition
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3 sm:mb-4 px-4">
            Triple ISO Certified Excellence
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            Our commitment to quality, safety, and environmental responsibility is validated by internationally recognized certifications.
          </p>
        </motion.div>

        {/* ISO Certifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-12 sm:mb-14 md:mb-16">
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.title}
              className="relative bg-card rounded-xl sm:rounded-2xl border border-border p-6 sm:p-7 md:p-8 text-center hover:shadow-xl transition-all duration-300 group overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cert.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              {/* Icon */}
              <motion.div
                className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-5 sm:mb-6 rounded-xl sm:rounded-2xl bg-gradient-to-br ${cert.color} flex items-center justify-center shadow-lg`}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <cert.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </motion.div>
              
              {/* Content */}
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">{cert.title}</h3>
              <p className="text-secondary font-medium text-xs sm:text-sm mb-2 sm:mb-3">{cert.subtitle}</p>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                {cert.description}
              </p>
              
              {/* Badge */}
              <div className="mt-5 sm:mt-6 inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-muted rounded-full text-xs font-medium text-foreground">
                <FileCheck className="w-3 h-3 text-green-500" />
                Verified & Current
              </div>
            </motion.div>
          ))}
        </div>

        {/* Awards Section */}
        <motion.div
          className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-500" />
              <span>Industry Awards & Recognition</span>
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-2 px-4">
              Recognized by industry bodies for excellence in relocation services
            </p>
          </div>
          
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {awards.map((award, index) => (
              <motion.div
                key={award.title}
                className="bg-background/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-5 text-center border border-border/50 hover:border-primary/30 transition-all duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-500 mx-auto mb-3" />
                <h4 className="font-semibold text-foreground text-xs sm:text-sm mb-1 leading-tight">
                  {award.title}
                </h4>
                <p className="text-xs text-muted-foreground mb-2 leading-snug">
                  {award.org}
                </p>
                <span className="inline-block px-2.5 sm:px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {award.year}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CertificationsSection;
