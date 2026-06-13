import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Users, TrendingUp, Star, X, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CityData {
  name: string;
  state: string;
  coordinates: { x: number; y: number };
  moves: number;
  rating: number;
  testimonial?: {
    name: string;
    content: string;
    company: string;
  };
}

// Major cities with approximate map coordinates (percentage-based for responsive)
const cities: CityData[] = [
  { name: "Delhi", state: "Delhi NCR", coordinates: { x: 47, y: 28 }, moves: 2500, rating: 4.9, testimonial: { name: "Rajesh Kumar", content: "Exceptional relocation service. Moved our entire office seamlessly.", company: "Tech Mahindra" } },
  { name: "Mumbai", state: "Maharashtra", coordinates: { x: 32, y: 52 }, moves: 2200, rating: 4.8, testimonial: { name: "Priya Sharma", content: "Best movers we've ever worked with. Highly professional!", company: "HDFC Bank" } },
  { name: "Bangalore", state: "Karnataka", coordinates: { x: 38, y: 72 }, moves: 1800, rating: 4.9, testimonial: { name: "Arjun Nair", content: "Zero damage, on-time delivery. Perfect service!", company: "Infosys" } },
  { name: "Chennai", state: "Tamil Nadu", coordinates: { x: 46, y: 76 }, moves: 1200, rating: 4.7, testimonial: { name: "Lakshmi Venkat", content: "Moved our manufacturing unit without any downtime.", company: "Ashok Leyland" } },
  { name: "Hyderabad", state: "Telangana", coordinates: { x: 42, y: 58 }, moves: 1500, rating: 4.8, testimonial: { name: "Sanjay Reddy", content: "Corporate relocation made easy. Great team!", company: "Wipro" } },
  { name: "Kolkata", state: "West Bengal", coordinates: { x: 68, y: 40 }, moves: 900, rating: 4.7, testimonial: { name: "Amit Ghosh", content: "Reliable and trustworthy. Highly recommend!", company: "ITC Limited" } },
  { name: "Pune", state: "Maharashtra", coordinates: { x: 34, y: 56 }, moves: 1100, rating: 4.8, testimonial: { name: "Neha Patil", content: "Smooth office relocation experience.", company: "Persistent Systems" } },
  { name: "Ahmedabad", state: "Gujarat", coordinates: { x: 28, y: 42 }, moves: 800, rating: 4.6 },
  { name: "Jaipur", state: "Rajasthan", coordinates: { x: 38, y: 34 }, moves: 600, rating: 4.7 },
  { name: "Lucknow", state: "Uttar Pradesh", coordinates: { x: 54, y: 32 }, moves: 500, rating: 4.6 },
  { name: "Gurgaon", state: "Haryana", coordinates: { x: 45, y: 30 }, moves: 1400, rating: 4.9, testimonial: { name: "Vikram Singh", content: "Enterprise-grade relocation service.", company: "Maruti Suzuki" } },
  { name: "Noida", state: "Uttar Pradesh", coordinates: { x: 49, y: 29 }, moves: 1300, rating: 4.8 },
  { name: "Chandigarh", state: "Punjab", coordinates: { x: 44, y: 22 }, moves: 400, rating: 4.7 },
  { name: "Coimbatore", state: "Tamil Nadu", coordinates: { x: 40, y: 78 }, moves: 350, rating: 4.6 },
  { name: "Kochi", state: "Kerala", coordinates: { x: 38, y: 82 }, moves: 300, rating: 4.7 },
  { name: "Indore", state: "Madhya Pradesh", coordinates: { x: 36, y: 44 }, moves: 280, rating: 4.5 },
  { name: "Bhopal", state: "Madhya Pradesh", coordinates: { x: 42, y: 42 }, moves: 250, rating: 4.6 },
  { name: "Nagpur", state: "Maharashtra", coordinates: { x: 44, y: 48 }, moves: 320, rating: 4.6 },
  { name: "Visakhapatnam", state: "Andhra Pradesh", coordinates: { x: 54, y: 58 }, moves: 280, rating: 4.5 },
  { name: "Thiruvananthapuram", state: "Kerala", coordinates: { x: 36, y: 88 }, moves: 220, rating: 4.6 },
];

const stats = [
  { icon: MapPin, value: "280+", label: "Cities Covered" },
  { icon: Users, value: "9,500+", label: "Happy Clients" },
  { icon: TrendingUp, value: "98%", label: "Success Rate" },
];

export const InteractiveNetworkMap = () => {
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  const sortedCities = useMemo(() => 
    [...cities].sort((a, b) => b.moves - a.moves), 
    []
  );

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4">Our Network</Badge>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Pan-India Presence
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Operating across 280+ cities with a network built on trust, reliability, and excellence
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-4 md:p-6 bg-card rounded-2xl border border-border shadow-sm"
            >
              <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Interactive Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative bg-card rounded-3xl border border-border shadow-xl overflow-hidden"
        >
          {/* India Map Background with SVG outline */}
          <div className="relative aspect-[4/3] md:aspect-[16/10] bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            {/* Simple India map outline SVG */}
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full opacity-20"
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                d="M45,5 L55,8 L60,15 L65,20 L70,25 L75,30 L78,38 L75,45 L72,50 L70,55 L68,62 L65,70 L60,75 L55,82 L50,88 L45,92 L40,88 L35,82 L32,75 L30,68 L28,60 L25,52 L22,45 L20,38 L22,30 L25,22 L30,15 L38,8 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-primary"
              />
            </svg>

            {/* City markers */}
            {sortedCities.map((city, index) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  position: 'absolute',
                  left: `${city.coordinates.x}%`,
                  top: `${city.coordinates.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="z-10"
              >
                <motion.button
                  whileHover={{ scale: 1.5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCity(city)}
                  onMouseEnter={() => setHoveredCity(city.name)}
                  onMouseLeave={() => setHoveredCity(null)}
                  className={`relative flex items-center justify-center w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${
                    city.moves > 1000 
                      ? 'bg-primary shadow-lg shadow-primary/50' 
                      : city.moves > 500 
                        ? 'bg-secondary' 
                        : 'bg-muted-foreground/50'
                  }`}
                >
                  {/* Pulse effect for major cities */}
                  {city.moves > 1000 && (
                    <motion.div
                      animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-primary"
                    />
                  )}
                </motion.button>

                {/* Hover tooltip */}
                <AnimatePresence>
                  {hoveredCity === city.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg whitespace-nowrap z-20"
                    >
                      <p className="font-semibold text-sm text-foreground">{city.name}</p>
                      <p className="text-xs text-muted-foreground">{city.moves}+ moves</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-secondary text-secondary" />
                        <span className="text-xs text-muted-foreground">{city.rating}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {/* Connection lines between major cities */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {sortedCities.slice(0, 8).map((city, i) => {
                const nextCity = sortedCities[(i + 1) % 8];
                return (
                  <motion.line
                    key={`${city.name}-${nextCity.name}`}
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 0.3 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 1 }}
                    x1={`${city.coordinates.x}%`}
                    y1={`${city.coordinates.y}%`}
                    x2={`${nextCity.coordinates.x}%`}
                    y2={`${nextCity.coordinates.y}%`}
                    stroke="hsl(var(--primary))"
                    strokeWidth="0.5"
                    strokeDasharray="4 4"
                  />
                );
              })}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-xl p-4 border border-border">
              <p className="text-xs font-semibold text-foreground mb-2">City Activity</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-xs text-muted-foreground">1000+ moves</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary" />
                  <span className="text-xs text-muted-foreground">500+ moves</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/50" />
                  <span className="text-xs text-muted-foreground">Active</span>
                </div>
              </div>
            </div>

            {/* Click prompt */}
            <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-border">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Click any city for details
              </p>
            </div>
          </div>
        </motion.div>

        {/* City Detail Modal */}
        <AnimatePresence>
          {selectedCity && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCity(null)}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full bg-card rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="relative bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedCity(null)}
                    className="absolute top-4 right-4 text-primary-foreground hover:bg-primary-foreground/20"
                  >
                    <X className="h-5 w-5" />
                  </Button>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-8 w-8" />
                    <div>
                      <h3 className="text-2xl font-bold">{selectedCity.name}</h3>
                      <p className="text-primary-foreground/80">{selectedCity.state}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-muted/50 rounded-xl">
                      <p className="text-2xl font-bold text-primary">{selectedCity.moves}+</p>
                      <p className="text-xs text-muted-foreground">Successful Moves</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-5 h-5 fill-secondary text-secondary" />
                        <p className="text-2xl font-bold text-foreground">{selectedCity.rating}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Client Rating</p>
                    </div>
                  </div>

                  {selectedCity.testimonial && (
                    <div className="bg-muted/30 rounded-xl p-4 border border-border">
                      <p className="text-sm text-muted-foreground italic mb-3">
                        "{selectedCity.testimonial.content}"
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-foreground">
                            {selectedCity.testimonial.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectedCity.testimonial.company}
                          </p>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-secondary text-secondary" />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <Button className="w-full mt-4" asChild>
                    <a href={`/packers-movers/${selectedCity.name.toLowerCase().replace(' ', '-')}`}>
                      View {selectedCity.name} Services <ChevronRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
