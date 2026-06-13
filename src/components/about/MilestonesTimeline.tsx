import { motion } from "framer-motion";
import { Calendar, Users, Building2, Globe, Award, TrendingUp, Target, Rocket, Image as ImageIcon } from "lucide-react";
import heroBg from "@/assets/gallery/crew-office-packing.webp";

const MilestonesTimeline = () => {
  const milestones = [
    {
      year: "2010",
      title: "Company Founded",
      description: "Panya Global Relocation established in Delhi with a vision to transform the relocation industry.",
      icon: Rocket,
      stats: "1 Office",
      color: "from-primary to-primary/70",
      // Using the hero image as a placeholder for the "image" request
      image: heroBg 
    },
    {
      year: "2012",
      title: "First Corporate Client",
      description: "Secured first major corporate relocation contract, marking entry into B2B segment.",
      icon: Building2,
      stats: "50+ Moves",
      color: "from-secondary to-secondary/70",
      image: heroBg
    },
    {
      year: "2014",
      title: "Pan-India Expansion",
      description: "Expanded operations to 10 major cities across India with dedicated teams.",
      icon: Globe,
      stats: "10 Cities",
      color: "from-accent to-accent/70",
      image: heroBg
    },
    {
      year: "2016",
      title: "ISO Certification",
      description: "Achieved ISO 9001:2015 certification for quality management systems.",
      icon: Award,
      stats: "ISO 9001",
      color: "from-primary to-primary/70",
      image: heroBg
    },
    {
      year: "2018",
      title: "4000+ Moves Milestone",
      description: "Successfully completed over 4,000 relocations with 98% customer satisfaction.",
      icon: TrendingUp,
      stats: "4000+ Moves",
      color: "from-secondary to-secondary/70",
      image: heroBg
    },
    {
      year: "2020",
      title: "Corporate Mobility Division",
      description: "Launched dedicated corporate mobility solutions for enterprise clients.",
      icon: Users,
      stats: "100+ Corporates",
      color: "from-accent to-accent/70",
      image: heroBg
    },
    {
      year: "2024",
      title: "Technology Integration",
      description: "Introduced AI-powered tracking and digital dashboards for clients.",
      icon: Target,
      stats: "Smart Tracking",
      color: "from-primary to-primary/70",
      image: heroBg
    },
    {
      year: "2026",
      title: "Industry Leader",
      description: "Recognized as a leading relocation partner with 280+ cities coverage.",
      icon: Award,
      stats: "280+ Cities",
      color: "from-secondary to-secondary/70",
      image: heroBg
    }
  ];

  return (
    <section className="py-20 bg-primary relative overflow-hidden">
      {/* Matching Background from AboutHero */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-primary/90" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-4">
            Our Journey
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary-foreground mb-4">
            Milestones That <span className="text-secondary">Define Us</span>
          </h2>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto">
            From humble beginnings to industry leadership—our journey of growth, innovation, and excellence.
          </p>
        </motion.div>

        {/* Modern Timeline Grid */}
        <div className="relative">
          {/* Center Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-secondary via-primary to-secondary hidden md:block opacity-20" />
          
          {/* Mobile Line */}
          <div className="absolute left-8 h-full w-0.5 bg-gradient-to-b from-secondary via-primary to-secondary md:hidden opacity-20" />

          <div className="space-y-16 md:space-y-24">
            {milestones.map((milestone, index) => {
              const Icon = milestone.icon;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={milestone.year}
                  className={`relative flex items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  initial={{ opacity: 0, y: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {/* Content Card */}
                  <div className={`w-full md:w-[45%] pl-16 md:pl-0 ${isEven ? 'md:pr-8 md:text-left' : 'md:pl-8 md:text-right'}`}>
                    <motion.div
                      className="bg-background/10 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:border-secondary/30 transition-all duration-500 group relative overflow-hidden"
                      whileHover={{ y: -10 }}
                    >
                      {/* Image Element (Visual Interest) */}
                      <div className={`absolute top-0 ${isEven ? 'right-0' : 'left-0'} h-full w-32 opacity-10 group-hover:opacity-20 transition-opacity`}>
                         <img src={milestone.image} alt="milestone" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                      </div>

                      <div className={`flex items-center gap-3 mb-4 ${isEven ? 'md:justify-start' : 'md:justify-end'}`}>
                        <span className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${milestone.color} bg-clip-text text-transparent`}>
                          {milestone.year}
                        </span>
                        <span className="px-3 py-1 bg-secondary/20 text-secondary text-xs font-semibold rounded-full border border-secondary/30">
                          {milestone.stats}
                        </span>
                      </div>
                      
                      <div className={`flex items-start gap-4 mb-3 ${isEven ? 'md:justify-start' : 'md:justify-end'}`}>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${milestone.color} flex items-center justify-center shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-primary-foreground">
                          {milestone.title}
                        </h3>
                      </div>

                      <p className="text-primary-foreground/70 leading-relaxed relative z-10">
                        {milestone.description}
                      </p>
                    </motion.div>
                  </div>

                  {/* Center Icon on Line */}
                  <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 z-10">
                    <motion.div
                      className={`w-16 h-16 rounded-full bg-background border-4 border-primary flex items-center justify-center shadow-xl`}
                      whileHover={{ scale: 1.2 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${milestone.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Empty Space for Alternate Side */}
                  <div className="hidden md:block w-[45%]" />
                </motion.div>
              );
            })}
          </div>

          {/* Progress Indicator (Bottom) */}
          <motion.div
            className="absolute left-1/2 transform -translate-x-1/2 bottom-0 hidden md:block"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-2xl border-4 border-primary">
              <div className="text-center">
                <span className="text-white font-bold text-2xl">16+</span>
                <span className="text-white/90 text-xs block">Years</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Summary Stats (Glass Cards) */}
        <motion.div
          className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            { value: "9,500+", label: "Happy Clients" },
            { value: "98%", label: "Successful Moves" },
            { value: "280+", label: "Cities Covered" },
            { value: "150+", label: "Corporate Partners" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center p-6 md:p-8 bg-background/10 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-background/20 transition-all duration-300"
              whileHover={{ y: -5 }}
            >
              <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                {stat.value}
              </span>
              <p className="text-primary-foreground/60 text-sm mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default MilestonesTimeline;
