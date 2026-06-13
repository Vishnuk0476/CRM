import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, ArrowRight, Star, Building, Users, Play, ImageIcon, ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import { SEO } from "@/components/SEO/SEO";
import { Button } from "@/components/ui/button";

const upcomingEvents = [
  {
    id: 1,
    title: "Global Logistics Summit 2026",
    date: "October 15-17, 2026",
    location: "Dubai World Trade Centre",
    description: "Join Panya Global at the premier event for supply chain and logistics professionals. We will be showcasing our latest innovations in cross-border relocation.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
    type: "Attending",
    featured: true,
  },
  {
    id: 2,
    title: "Panya Global Relocation Expo",
    date: "November 2-5, 2026",
    location: "New Delhi, India",
    description: "Our annual flagship event where we showcase the future of relocation. Connect with industry leaders and explore partnership opportunities.",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=80",
    type: "Organized by Us",
    featured: true,
  },
  {
    id: 3,
    title: "India Supply Chain Expo",
    date: "December 10-12, 2026",
    location: "Pragati Maidan, New Delhi",
    description: "Visit Booth A-45 to learn about our corporate relocation services and explore our state-of-the-art storage facilities.",
    image: "https://images.unsplash.com/photo-1558008258-3256797b43f3?w=800&q=80",
    type: "Attending",
    featured: false,
  }
];

const pastEvents = [
  {
    id: 101,
    year: "2025",
    title: "Logistics Asia Awards",
    organization: "Awarded 'Best Corporate Relocation Provider'",
    type: "Attended",
  },
  {
    id: 102,
    year: "2024",
    title: "IFCCI Annual General Meeting",
    organization: "Indo-French Chamber of Commerce and Industry",
    type: "Attended",
  },
  {
    id: 103,
    year: "2023",
    title: "Global Mobility Summit",
    organization: "London, UK",
    type: "Organized by Us",
  }
];

const eventGallery = [
  { id: 1, title: "Global Logistics Summit 2025", image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80", category: "Attended", size: "large" },
  { id: 2, title: "Team at IFCCI AGM", image: "https://images.unsplash.com/photo-1523580494112-071d1e21d80c?w=800&q=80", category: "Attended", size: "small" },
  { id: 3, title: "Award Ceremony 2024", image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80", category: "Attended", size: "medium" },
  { id: 4, title: "Panya Global Meetup", image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80", category: "Organized", size: "medium" },
  { id: 5, title: "Exhibition Booth", image: "https://images.unsplash.com/photo-1558008258-3256797b43f3?w=800&q=80", category: "Attended", size: "small" },
  { id: 6, title: "Networking Event", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80", category: "Organized", size: "large" },
];

const Events = () => {
  const [activeGalleryTab, setActiveGalleryTab] = useState("All");

  const filteredGallery = activeGalleryTab === "All" 
    ? eventGallery 
    : eventGallery.filter(item => item.category === activeGalleryTab);

  return (
    <div className="min-h-screen bg-[#050B14] flex flex-col font-sans text-white selection:bg-[#007AFF] selection:text-white">
      <SEO 
        title="Events & Gallery | Panya Global Relocation"
        description="Discover where Panya Global is heading next. View our event gallery, past participations, and upcoming organized summits."
      />
      <Navbar />

      <main className="flex-1 overflow-hidden">
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex items-center pt-24 pb-20 overflow-hidden">
          {/* Vivid Azure & Navy Abstract Background */}
          <div className="absolute inset-0 bg-[#02060D] z-0" />
          <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-[#007AFF]/10 blur-[150px] z-0 animate-pulse-glow" />
          <div className="absolute top-[40%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-[#003B8E]/20 blur-[180px] z-0" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070')] opacity-5 mix-blend-screen bg-cover bg-center z-0" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050B14]/80 to-[#050B14] z-0" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/30 text-[#4DB8FF] text-sm font-semibold mb-8 backdrop-blur-md"
              >
                <span className="w-2 h-2 rounded-full bg-[#007AFF] animate-ping" />
                Global Presence
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="text-6xl md:text-8xl lg:text-[7rem] font-black leading-[1.1] tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-[#007AFF]/50"
              >
                Events & <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#00D4FF]">
                  Exhibitions
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-12"
              >
                Connecting with the world's leading professionals. Explore the summits we organize, the expos we attend, and our journey captured in moments.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-wrap justify-center gap-4"
              >
                <Button className="bg-[#007AFF] hover:bg-[#005bb5] text-white rounded-full px-8 py-6 md:px-10 md:py-7 text-lg shadow-[0_0_30px_rgba(0,122,255,0.4)] transition-all hover:scale-105 border-0">
                  Explore Upcoming <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
                <Button variant="outline" className="rounded-full px-8 py-6 md:px-10 md:py-7 text-lg border-white/10 hover:bg-white/5 hover:text-white bg-white/5 backdrop-blur-md transition-all">
                  View Gallery
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* UPCOMING EVENTS SECTION */}
        <section className="py-32 relative z-10 bg-[#050B14]">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
              <div className="max-w-3xl">
                <h2 className="text-4xl md:text-6xl font-black mb-4">
                  Where We Are <span className="text-[#007AFF]">Going Next</span>
                </h2>
                <p className="text-slate-400 text-lg md:text-xl">
                  Meet our industry experts at these premier global logistics and mobility summits.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {upcomingEvents.filter(e => e.featured).map((event, idx) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: idx * 0.2 }}
                  className="group relative rounded-[2.5rem] overflow-hidden bg-[#0A1122] border border-white/5 hover:border-[#007AFF]/50 transition-all duration-500 shadow-2xl flex flex-col min-h-[500px]"
                >
                  <div className="absolute inset-0 h-2/3">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A1122]/80 to-[#0A1122]" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col justify-end h-full p-8 md:p-12 mt-auto">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#007AFF] text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(0,122,255,0.5)]">
                        {event.type === "Organized by Us" ? <Users className="w-3 h-3" /> : <Building className="w-3 h-3" />}
                        {event.type}
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-bold uppercase tracking-wider">
                        <Calendar className="w-4 h-4 text-[#4DB8FF]" /> {event.date}
                      </div>
                    </div>
                    
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight group-hover:text-[#4DB8FF] transition-colors duration-300">
                      {event.title}
                    </h3>
                    
                    <p className="text-slate-300 text-lg mb-8 line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-white">
                      <div className="w-14 h-14 rounded-full bg-[#007AFF]/10 flex items-center justify-center border border-[#007AFF]/20 group-hover:bg-[#007AFF] transition-colors duration-300">
                        <MapPin className="w-6 h-6 text-[#007AFF] group-hover:text-white transition-colors" />
                      </div>
                      <span className="font-semibold text-xl tracking-tight">{event.location}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Standard Events (List View) */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingEvents.filter(e => !e.featured).map((event, idx) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-gradient-to-r from-[#0A1122] to-[#050B14] rounded-[2rem] p-8 border border-white/5 hover:border-[#007AFF]/30 transition-all group flex flex-col md:flex-row gap-8 items-center"
                >
                  <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden shrink-0 relative">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-[#007AFF]/20 mix-blend-overlay" />
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-3 mb-3">
                      <span className="text-[#4DB8FF] font-semibold text-sm flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" /> {event.date}
                      </span>
                      <span className="text-slate-400 text-sm">• {event.type}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#4DB8FF] transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-slate-400 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                      <MapPin className="w-4 h-4 text-[#007AFF]" />
                      {event.location}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* EVENT GALLERY - MASONRY STYLE */}
        <section className="py-32 relative bg-[#02060D]">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col items-center text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
                Event <span className="text-[#007AFF]">Moments</span>
              </h2>
              <p className="text-slate-400 max-w-2xl text-lg md:text-xl mb-12">
                Capturing our worldwide journey, networking, and the magnificent events we organize and participate in.
              </p>

              {/* Gallery Filter */}
              <div className="flex flex-wrap justify-center gap-3 p-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10">
                {["All", "Attended", "Organized"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveGalleryTab(tab)}
                    className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
                      activeGalleryTab === tab 
                      ? "bg-[#007AFF] text-white shadow-lg" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Staggered Grid */}
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]"
            >
              <AnimatePresence>
                {filteredGallery.map((item, index) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    key={item.id}
                    className={`group relative rounded-[2rem] overflow-hidden cursor-pointer ${
                      item.size === 'large' ? 'md:row-span-2' : ''
                    }`}
                  >
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#02060D] via-[#02060D]/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                    
                    {/* Hover Glow */}
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#007AFF]/50 rounded-[2rem] transition-colors duration-500" />

                    <div className="absolute inset-0 p-8 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex items-center gap-2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        <span className="px-3 py-1 rounded-full bg-[#007AFF]/20 backdrop-blur-md border border-[#007AFF]/50 text-[#4DB8FF] text-xs font-bold uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-white leading-tight">
                        {item.title}
                      </h3>
                      
                      <div className="absolute bottom-8 right-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 group-hover:scale-110 border border-white/20">
                         <Play className="w-5 h-5 text-white translate-x-0.5" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            
            {/* Upload CTA for Admin */}
            <div className="mt-20">
              <div className="max-w-4xl mx-auto rounded-[3rem] bg-gradient-to-r from-[#003B8E] to-[#007AFF] p-1 shadow-[0_0_40px_rgba(0,122,255,0.3)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[80px] rounded-full" />
                <div className="bg-[#0A1122] rounded-[2.9rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-3">Add to our Gallery</h3>
                    <p className="text-slate-400 text-lg max-w-md">Company members can upload new event moments directly to showcase our growing journey.</p>
                  </div>
                  <Button className="bg-white text-[#0A1122] hover:bg-[#E5F1FF] rounded-full px-8 py-7 text-lg font-bold transition-all shadow-xl hover:scale-105">
                    <ImageIcon className="w-5 h-5 mr-3" /> Upload Photos
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PAST HIGHLIGHTS */}
        <section className="py-32 bg-[#050B14] relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute right-0 top-1/4 w-[40vw] h-[40vw] bg-[#007AFF]/5 blur-[120px] rounded-full" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-16 text-center">
                Our Proud <span className="text-[#007AFF]">History</span>
              </h2>

              <div className="space-y-6">
                {pastEvents.map((highlight, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    className="group flex flex-col md:flex-row items-center gap-8 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-[#007AFF]/30 p-8 md:p-10 rounded-[2rem] transition-all duration-300"
                  >
                    <div className="w-full md:w-48 text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#007AFF] to-[#003B8E] opacity-80 group-hover:opacity-100 transition-opacity">
                      {highlight.year}
                    </div>
                    <div className="w-px h-16 bg-white/10 hidden md:block" />
                    <div className="flex-1">
                      <div className="mb-3">
                         <span className="px-3 py-1.5 rounded-full bg-[#007AFF]/10 text-[#4DB8FF] text-xs font-bold uppercase tracking-wider border border-[#007AFF]/20">
                           {highlight.type}
                         </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-[#4DB8FF] transition-colors">
                        {highlight.title}
                      </h3>
                      <p className="text-slate-400 text-lg">
                        {highlight.organization}
                      </p>
                    </div>
                    <div className="hidden md:flex w-12 h-12 rounded-full border border-white/10 items-center justify-center group-hover:bg-[#007AFF] group-hover:border-[#007AFF] transition-colors">
                      <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>

      <CityWiseLinks />
      <Footer />
    </div>
  );
};

export default Events;
