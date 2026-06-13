import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { MapPin, Phone, Mail, Clock, Navigation, Building2, Globe, Users, TrendingUp } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import CTA from "@/components/home/CTA";
import { Button } from "@/components/ui/button";

// ─── Branch data ──────────────────────────────────────────────────────────────
const branches = [
  {
    id: "delhi",
    city: "New Delhi",
    badge: "Head Office",
    isHQ: true,
    address: "18/1, Basement, Village Samalkha, Old Delhi Gurgaon Road, New Delhi-110037",
    phone: ["+91 11 42321118", "+91 11 41556447", "+91 8800446447"],
    email: "info@panyaglobal.in",
    timing: "Mon–Sat: 9:00 AM – 7:00 PM",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3505.5!2d77.0789!3d28.5089!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1b4439999991%3A0x25f86d8c7c4e7f0a!2sPanya%20Global%20Movers!5e0!3m2!1sen!2sin!4v1703123456789",
    coordinates: { lat: 28.5089, lng: 77.0789 },
    color: "hsl(213 55% 23%)",
    stats: "Est. 2005 · 1000+ moves/month",
  },
  { id: "mumbai",    city: "Mumbai",    badge: "West Hub",    isHQ: false, address: "Office No. 201, 2nd Floor, Sai Complex, Andheri East, Mumbai - 400069",    phone: ["+91 9876543210"], email: "mumbai@panyaglobal.in",    timing: "Mon–Sat: 9:00 AM – 7:00 PM", mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.9!2d72.8777!3d19.1136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c8541234abcd%3A0x1234567890abcdef!2sAndheri%20East%2C%20Mumbai!5e0!3m2!1sen!2sin!4v1703123456789", coordinates: { lat: 19.1136, lng: 72.8777 }, color: "hsl(199 89% 42%)", stats: "Serving 200+ clients/month" },
  { id: "bangalore", city: "Bangalore", badge: "South Tech Hub", isHQ: false, address: "123, 1st Floor, HSR Layout, Sector 2, Bangalore - 560102",               phone: ["+91 9876543211"], email: "bangalore@panyaglobal.in", timing: "Mon–Sat: 9:00 AM – 7:00 PM", mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.5!2d77.6408!3d12.9121!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1234567890ab%3A0xabcdef1234567890!2sHSR%20Layout%2C%20Bengaluru!5e0!3m2!1sen!2sin!4v1703123456789", coordinates: { lat: 12.9121, lng: 77.6408 }, color: "hsl(142 72% 38%)", stats: "IT corridor specialist" },
  { id: "hyderabad", city: "Hyderabad", badge: "Deccan Hub",  isHQ: false, address: "Plot No. 45, Madhapur, HITEC City, Hyderabad - 500081",                    phone: ["+91 9876543212"], email: "hyderabad@panyaglobal.in", timing: "Mon–Sat: 9:00 AM – 7:00 PM", mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.3!2d78.3915!3d17.4449!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9123456789ab%3A0x123456789abcdef0!2sHITEC%20City%2C%20Hyderabad!5e0!3m2!1sen!2sin!4v1703123456789", coordinates: { lat: 17.4449, lng: 78.3915 }, color: "hsl(258 90% 60%)", stats: "HITEC City specialists" },
  { id: "chennai",   city: "Chennai",   badge: "South Hub",   isHQ: false, address: "No. 56, Anna Nagar, Chennai - 600040",                                      phone: ["+91 9876543213"], email: "chennai@panyaglobal.in",   timing: "Mon–Sat: 9:00 AM – 7:00 PM", mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.4!2d80.2089!3d13.0827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52634567890abc%3A0xdef0123456789abc!2sAnna%20Nagar%2C%20Chennai!5e0!3m2!1sen!2sin!4v1703123456789", coordinates: { lat: 13.0827, lng: 80.2089 }, color: "hsl(25 95% 50%)", stats: "Port & industrial moves" },
  { id: "pune",      city: "Pune",      badge: "West Tech",   isHQ: false, address: "Office 302, 3rd Floor, IT Park, Hinjewadi, Pune - 411057",                  phone: ["+91 9876543214"], email: "pune@panyaglobal.in",      timing: "Mon–Sat: 9:00 AM – 7:00 PM", mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3781.2!2d73.7389!3d18.5912!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bbc123456789%3A0x9876543210fedcba!2sHinjewadi%2C%20Pune!5e0!3m2!1sen!2sin!4v1703123456789", coordinates: { lat: 18.5912, lng: 73.7389 }, color: "hsl(38 92% 48%)", stats: "Hinjewadi IT park focus" },
  { id: "kolkata",   city: "Kolkata",   badge: "East Hub",    isHQ: false, address: "15A, Salt Lake City, Sector V, Kolkata - 700091",                           phone: ["+91 9876543215"], email: "kolkata@panyaglobal.in",   timing: "Mon–Sat: 9:00 AM – 7:00 PM", mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.1!2d88.4336!3d22.5726!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a027567890abcde%3A0xfedcba9876543210!2sSalt%20Lake%20City%2C%20Kolkata!5e0!3m2!1sen!2sin!4v1703123456789", coordinates: { lat: 22.5726, lng: 88.4336 }, color: "hsl(340 82% 52%)", stats: "Eastern India gateway" },
  { id: "gurgaon",   city: "Gurgaon",   badge: "NCR Hub",     isHQ: false, address: "Tower B, DLF Cyber City, Gurgaon - 122002",                                 phone: ["+91 9876543216"], email: "gurgaon@panyaglobal.in",   timing: "Mon–Sat: 9:00 AM – 7:00 PM", mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3507.2!2d77.0889!3d28.4949!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d193456789abc%3A0xabcdef0123456789!2sDLF%20Cyber%20City%2C%20Gurugram!5e0!3m2!1sen!2sin!4v1703123456789", coordinates: { lat: 28.4949, lng: 77.0889 }, color: "hsl(199 89% 35%)", stats: "Corporate relocation experts" },
];

// ─── SVG Network Tree Component ────────────────────────────────────────────────
const TREE_W = 900;
const TREE_H = 520;

const nodePositions: Record<string, { x: number; y: number }> = {
  delhi:     { x: 450, y: 80 },
  gurgaon:   { x: 270, y: 200 },
  mumbai:    { x: 130, y: 340 },
  pune:      { x: 285, y: 420 },
  bangalore: { x: 540, y: 420 },
  chennai:   { x: 700, y: 340 },
  hyderabad: { x: 660, y: 220 },
  kolkata:   { x: 790, y: 140 },
};

const edges = [
  ["delhi", "gurgaon"], ["delhi", "hyderabad"], ["delhi", "kolkata"],
  ["gurgaon", "mumbai"], ["mumbai", "pune"], ["hyderabad", "bangalore"],
  ["hyderabad", "chennai"], ["bangalore", "chennai"],
];

const NetworkTree = ({ active, onSelect }: { active: string | null; onSelect: (id: string) => void }) => {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <svg viewBox={`0 0 ${TREE_W} ${TREE_H}`} className="w-full h-auto" style={{ maxHeight: 480 }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="hsl(213 55% 50% / 0.4)" />
        </marker>
      </defs>

      {/* Edges */}
      {edges.map(([a, b]) => {
        const pa = nodePositions[a];
        const pb = nodePositions[b];
        const isActive = active === a || active === b || hovered === a || hovered === b;
        return (
          <motion.line
            key={`${a}-${b}`}
            x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
            stroke={isActive ? "hsl(199 89% 55%)" : "hsl(213 55% 23% / 0.18)"}
            strokeWidth={isActive ? 2.5 : 1.5}
            strokeDasharray={isActive ? "none" : "6 4"}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, delay: Math.random() * 2 }}
          />
        );
      })}

      {/* Nodes */}
      {branches.map((b) => {
        const pos = nodePositions[b.id];
        const isActive = active === b.id;
        const isHovered = hovered === b.id;
        const r = b.isHQ ? 38 : 28;
        return (
          <g key={b.id} style={{ cursor: "pointer" }}
            onClick={() => onSelect(b.id)}
            onMouseEnter={() => setHovered(b.id)}
            onMouseLeave={() => setHovered(null)}>
            {/* Pulse ring for HQ */}
            {b.isHQ && (
              <motion.circle cx={pos.x} cy={pos.y} r={r + 12}
                fill="none" stroke={b.color} strokeWidth="1.5" opacity="0.3"
                animate={{ r: [r + 8, r + 20], opacity: [0.4, 0] }}
                transition={{ duration: 2, repeat: Infinity }} />
            )}
            {/* Active ring */}
            {(isActive || isHovered) && (
              <circle cx={pos.x} cy={pos.y} r={r + 8}
                fill="none" stroke={b.color} strokeWidth="2" opacity="0.5" />
            )}
            {/* Main circle */}
            <motion.circle cx={pos.x} cy={pos.y} r={r}
              fill={isActive ? b.color : isHovered ? b.color + "dd" : "white"}
              stroke={b.color} strokeWidth={isActive ? 3 : 2}
              filter={isActive || isHovered ? "url(#glow)" : undefined}
              animate={{ scale: isActive ? 1.1 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{ filter: isActive ? `drop-shadow(0 0 12px ${b.color})` : undefined }}
            />
            {/* City label */}
            <text x={pos.x} y={pos.y + 4} textAnchor="middle"
              fill={isActive ? "white" : b.color}
              fontSize={b.isHQ ? 11 : 9} fontWeight="700" fontFamily="Montserrat, sans-serif">
              {b.city.split(" ")[0]}
            </text>
            {b.isHQ && (
              <text x={pos.x} y={pos.y + 17} textAnchor="middle" fill={isActive ? "white" : b.color}
                fontSize="7" fontFamily="Montserrat, sans-serif" opacity="0.8">HQ</text>
            )}
            {/* Badge below node */}
            <rect x={pos.x - 28} y={pos.y + r + 6} width="56" height="14" rx="7"
              fill={b.color} opacity={isActive || isHovered ? 1 : 0.8} />
            <text x={pos.x} y={pos.y + r + 16} textAnchor="middle" fill="white" fontSize="7" fontFamily="Inter, sans-serif">
              {b.badge}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ─── Main Branches Component ──────────────────────────────────────────────────
const Branches = () => {
  const [selectedId, setSelectedId] = useState<string>("delhi");
  const selected = branches.find((b) => b.id === selectedId)!;
  const detailRef = useRef<HTMLDivElement>(null);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
  };

  const openInGoogleMaps = (lat: number, lng: number) =>
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-10" style={{ background: "hsl(199 89% 48%)", filter: "blur(80px)" }} />
          <div className="absolute -bottom-10 -right-10 w-96 h-96 rounded-full opacity-10" style={{ background: "hsl(258 90% 60%)", filter: "blur(100px)" }} />

          {/* Floating dots */}
          {[...Array(12)].map((_, i) => (
            <motion.div key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 6 + 3,
                height: Math.random() * 6 + 3,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: "hsl(199 89% 70%)",
                opacity: 0.3,
              }}
              animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
            />
          ))}

          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
                style={{ background: "hsl(199 89% 48% / 0.2)", color: "hsl(199 89% 75%)", border: "1px solid hsl(199 89% 48% / 0.3)" }}>
                <Globe className="w-4 h-4" />
                Pan-India Network
              </span>
              <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
                Our <span style={{ color: "hsl(199 89% 60%)" }}>Branches</span>
              </h1>
              <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto mb-10">
                8 strategic offices across India's major metro cities — always near you, always ready to move.
              </p>

              {/* Stats row */}
              <div className="inline-flex flex-wrap justify-center gap-8">
                {[
                  { icon: Building2, label: "Branch Offices", val: "8+" },
                  { icon: Globe, label: "Cities Served", val: "50+" },
                  { icon: Users, label: "Happy Clients", val: "25,000+" },
                  { icon: TrendingUp, label: "Moves Monthly", val: "1,000+" },
                ].map(({ icon: I, label, val }) => (
                  <div key={label} className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <I className="w-4 h-4" style={{ color: "hsl(199 89% 60%)" }} />
                      <span className="text-2xl font-extrabold text-white font-heading">{val}</span>
                    </div>
                    <p className="text-white/50 text-xs">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Interactive Network Tree + Detail Panel ── */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">Branch Network</h2>
              <p className="text-muted-foreground text-sm">Click any node to explore that branch's details</p>
            </motion.div>

            <div className="flex flex-col xl:flex-row gap-8 items-start">
              {/* Tree */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                className="xl:flex-1 bg-card border border-border rounded-3xl p-6 shadow-lg overflow-hidden">
                <NetworkTree active={selectedId} onSelect={handleSelect} />

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-4 justify-center">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-6 h-6 rounded-full border-2 border-primary" style={{ background: "hsl(213 55% 23%)" }} />
                    Head Office
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-5 h-5 rounded-full border-2 border-secondary bg-card" />
                    Regional Branch
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-8 border-t-2 border-dashed border-muted-foreground/40" />
                    Connection
                  </div>
                </div>
              </motion.div>

              {/* Detail panel */}
              <div ref={detailRef} className="xl:w-96 flex-shrink-0">
                <AnimatePresence mode="wait">
                  <motion.div key={selectedId}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
                    {/* Map */}
                    <div className="h-52 overflow-hidden relative">
                      <iframe src={selected.mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`${selected.city} Office`} className="scale-105" />
                      {/* Overlay badge */}
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg"
                          style={{ background: selected.color }}>
                          {selected.badge}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-5">
                        <div>
                          <h3 className="font-heading text-xl font-bold text-foreground">{selected.city}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{selected.stats}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: selected.color + "18", color: selected.color }}>
                          <Building2 className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: selected.color }} />
                          <p className="text-muted-foreground leading-snug">{selected.address}</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: selected.color }} />
                          <div className="space-y-0.5">
                            {selected.phone.map((p) => (
                              <a key={p} href={`tel:${p.replace(/\s/g, "")}`}
                                className="block text-muted-foreground hover:text-foreground transition-colors">{p}</a>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 flex-shrink-0" style={{ color: selected.color }} />
                          <a href={`mailto:${selected.email}`} className="text-muted-foreground hover:text-foreground transition-colors">{selected.email}</a>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 flex-shrink-0" style={{ color: selected.color }} />
                          <p className="text-muted-foreground">{selected.timing}</p>
                        </div>
                      </div>

                      <Button onClick={() => openInGoogleMaps(selected.coordinates.lat, selected.coordinates.lng)}
                        className="w-full mt-6 text-white font-semibold" style={{ background: selected.color }}>
                        <Navigation className="w-4 h-4 mr-2" />
                        Get Directions
                      </Button>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Quick switcher pills */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {branches.map((b) => (
                    <button key={b.id} onClick={() => handleSelect(b.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${selectedId === b.id ? "text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
                      style={selectedId === b.id ? { background: b.color } : {}}>
                      {b.city}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── All Branches Cards ── */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">All Office Locations</h2>
              <p className="text-muted-foreground text-sm">Detailed contact information for each branch</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {branches.map((branch, index) => (
                <motion.div key={branch.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}
                  onClick={() => { handleSelect(branch.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
                  {/* Color bar */}
                  <div className="h-1.5" style={{ background: branch.color }} />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-heading text-base font-bold text-foreground">{branch.city}</h3>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: branch.color + "18", color: branch.color }}>{branch.badge}</span>
                      </div>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: branch.color + "15", color: branch.color }}>
                        <Building2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: branch.color }} /><span className="line-clamp-2">{branch.address}</span></div>
                      <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: branch.color }} /><span>{branch.phone[0]}</span></div>
                      <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: branch.color }} /><span>{branch.timing}</span></div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{branch.stats}</span>
                      <button onClick={(e) => { e.stopPropagation(); openInGoogleMaps(branch.coordinates.lat, branch.coordinates.lng); }}
                        className="text-xs font-semibold flex items-center gap-1 transition-colors hover:opacity-80" style={{ color: branch.color }}>
                        <Navigation className="w-3 h-3" /> Directions
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Coverage Banner ── */}
        <section className="py-16" style={{ background: "var(--gradient-primary)" }}>
          <div className="container mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">Nationwide Coverage</h2>
              <p className="text-white/70 max-w-2xl mx-auto text-sm mb-8">
                Beyond our branch offices, our trusted partner network ensures door-to-door relocation across every major city and town in India.
              </p>
              <div className="flex flex-wrap justify-center gap-8">
                {[["50+", "Cities"], ["200+", "Service Points"], ["1,000+", "Monthly Moves"], ["18+", "Years of Trust"]].map(([val, label]) => (
                  <div key={label} className="text-center">
                    <p className="text-3xl font-extrabold text-white font-heading">{val}</p>
                    <p className="text-white/60 text-xs mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <CTA />
      </main>
      <CityWiseLinks />
      <Footer />
    </div>
  );
};

export default Branches;
