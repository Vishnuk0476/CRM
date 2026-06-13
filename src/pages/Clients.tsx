import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Star, Quote, Building2, Users, Award, CheckCircle, Filter } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import CTA from "@/components/home/CTA";
import { ClientFilters } from "@/components/clients/ClientFilters";
import { ClientLogoGrid } from "@/components/clients/ClientLogoGrid";
import { CaseStudyModal } from "@/components/clients/CaseStudyModal";
import { InteractiveNetworkMap } from "@/components/clients/InteractiveNetworkMap";
import { clients, getClientsByIndustry, Client } from "@/data/clients";
import { Badge } from "@/components/ui/badge";

const testimonials = [
  {
    name: "Mr. Zeeshan Ali",
    role: "Former Indian Tennis Player",
    content: "Excellent service by Panya Global Relocation. They handled my entire household shifting from Delhi to Mumbai with utmost care. Highly professional team!",
    rating: 5,
  },
  {
    name: "Mr. Shishir Upadhyaya",
    role: "Corporate Professional",
    content: "Very satisfied with the packing and moving services. The team was punctual, professional, and handled all items with great care.",
    rating: 5,
  },
  {
    name: "Mr. Paursh Pandit",
    role: "AVP - Operations, Accenture",
    content: "Moved from Mumbai to Gurgaon with Panya Global. The entire process was seamless and stress-free. Highly recommend their services!",
    rating: 5,
  },
  {
    name: "Mrs. Priya Sharma",
    role: "IT Professional",
    content: "Best packers and movers in Delhi! They moved my office equipment without any damage. Very reliable and trustworthy.",
    rating: 5,
  },
  {
    name: "Mr. Rajesh Kumar",
    role: "Business Owner",
    content: "Panya Global made my relocation experience hassle-free. Their team is well-trained and courteous. Will definitely use their services again.",
    rating: 5,
  },
  {
    name: "Mrs. Anjali Gupta",
    role: "Homemaker",
    content: "Exceptional service! They packed and moved all my delicate items safely. The insurance coverage gave me peace of mind.",
    rating: 5,
  },
];

const stats = [
  { icon: Users, value: "9,500+", label: "Happy Clients" },
  { icon: Building2, value: "150+", label: "Corporate Partners" },
  { icon: Award, value: "16+", label: "Years Experience" },
  { icon: CheckCircle, value: "98%", label: "Success Rate" },
];

const Clients = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredClients = useMemo(() => 
    getClientsByIndustry(activeFilter), 
    [activeFilter]
  );

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 bg-gradient-to-br from-primary via-primary/95 to-primary/90 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920')] bg-cover bg-center opacity-10" />
          
          {/* Animated background elements */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-20 left-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl"
          />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <Badge variant="secondary" className="mb-4">Trusted by 500+ Corporates</Badge>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
                Our Valued Clients & Partners
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
                Serving India's leading organizations across IT, Banking, FMCG, Pharma, and Manufacturing sectors with world-class relocation solutions.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-card border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <stat.icon className="w-10 h-10 mx-auto mb-3 text-primary" />
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Client Logos Section with Filtering */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Filter by Industry</span>
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our Corporate Partners
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Trusted by leading organizations for their relocation needs. Click on any logo to view case studies.
              </p>
            </motion.div>

            <ClientFilters 
              activeFilter={activeFilter} 
              onFilterChange={setActiveFilter} 
            />

            <motion.p 
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm text-muted-foreground mb-8"
            >
              Showing {filteredClients.length} clients
            </motion.p>

            <ClientLogoGrid 
              clients={filteredClients} 
              onClientClick={handleClientClick}
            />
          </div>
        </section>

        {/* Interactive Network Map */}
        <InteractiveNetworkMap />

        {/* Testimonials Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge variant="secondary" className="mb-4">Testimonials</Badge>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                What Our Clients Say
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Read testimonials from our satisfied customers
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-card rounded-2xl p-6 shadow-lg border border-border relative group"
                >
                  <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10 group-hover:text-primary/20 transition-colors" />
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Video Testimonials */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge variant="secondary" className="mb-4">Video Reviews</Badge>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                Video Testimonials
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Watch what our clients have to say about their experience
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="rounded-2xl overflow-hidden shadow-lg border border-border"
              >
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube-nocookie.com/embed/v6HwOz6pyyI?rel=0"
                    title="Mr. Zeeshan Ali Testimonial"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                <div className="p-4 bg-card">
                  <p className="font-semibold text-foreground">Mr. Zeeshan Ali</p>
                  <p className="text-sm text-muted-foreground">Former Indian Tennis Player</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -5 }}
                className="rounded-2xl overflow-hidden shadow-lg border border-border"
              >
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube-nocookie.com/embed/Gxxwe9gdWzA?rel=0"
                    title="Mr. Shishir Upadhyaya Testimonial"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                <div className="p-4 bg-card">
                  <p className="font-semibold text-foreground">Mr. Shishir Upadhyaya</p>
                  <p className="text-sm text-muted-foreground">Corporate Professional</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -5 }}
                className="rounded-2xl overflow-hidden shadow-lg border border-border"
              >
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube-nocookie.com/embed/gpeqm1Ew3sE?rel=0"
                    title="Mr. Paursh Pandit Testimonial"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                <div className="p-4 bg-card">
                  <p className="font-semibold text-foreground">Mr. Paursh Pandit</p>
                  <p className="text-sm text-muted-foreground">AVP - Operations, Accenture</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <CTA />
      </main>

      <CityWiseLinks />
      <Footer />

      {/* Case Study Modal */}
      <CaseStudyModal
        client={selectedClient}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClient(null);
        }}
      />
    </div>
  );
};

export default Clients;
