import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import CTA from "@/components/home/CTA";

const categories = ["All", "Residential", "Commercial", "International", "Car Rental", "Events"];

const galleryItems = [
  {
    id: 1,
    category: "Residential",
    title: "Family Home Relocation",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    description: "Complete home moving service for a family of 4",
  },
  {
    id: 2,
    category: "Commercial",
    title: "Corporate Office Move",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
    description: "50,000 sq ft office relocation completed in 48 hours",
  },
  {
    id: 3,
    category: "International",
    title: "Overseas Relocation",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=600&fit=crop",
    description: "Full-service international move from NY to London",
  },
  {
    id: 4,
    category: "Car Rental",
    title: "Moving Truck Fleet",
    image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&h=600&fit=crop",
    description: "Our modern fleet of moving vehicles",
  },
  {
    id: 5,
    category: "Residential",
    title: "Apartment Move",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    description: "Efficient apartment moving in the city",
  },
  {
    id: 6,
    category: "Commercial",
    title: "Restaurant Relocation",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
    description: "Complete kitchen and equipment relocation",
  },
  {
    id: 7,
    category: "Residential",
    title: "Luxury Home Move",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    description: "Premium white-glove service for luxury properties",
  },
  {
    id: 8,
    category: "International",
    title: "Container Shipping",
    image: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800&h=600&fit=crop",
    description: "Sea freight for international relocations",
  },
  {
    id: 9,
    category: "Car Rental",
    title: "Compact Cars",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop",
    description: "Economy vehicles for personal transportation",
  },
  {
    id: 10,
    category: "Events",
    title: "Global Logistics Summit",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
    description: "Panya Global team at the Global Logistics Summit 2025",
  },
  {
    id: 11,
    category: "Events",
    title: "Award Ceremony",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop",
    description: "Receiving 'Best Corporate Relocation Provider' Award",
  },
];

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<typeof galleryItems[0] | null>(null);

  const filteredItems = activeCategory === "All"
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-50" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground text-sm font-semibold mb-6">
                Gallery
              </span>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
                Our <span className="text-secondary">Work</span>
              </h1>
              <p className="text-lg text-primary-foreground/80">
                Browse through our portfolio of successful relocations and see 
                the quality of our work firsthand.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 bg-background border-b border-border sticky top-20 z-30">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    activeCategory === category
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onClick={() => setSelectedImage(item)}
                  className="group cursor-pointer"
                >
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                    <img 
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <span className="inline-block px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium mb-2">
                        {item.category}
                      </span>
                      <h3 className="text-primary-foreground font-heading font-bold text-lg">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Lightbox */}
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-primary/95 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
            >
              <X className="w-6 h-6 text-primary-foreground" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage.image}
                alt={selectedImage.title}
                className="w-full rounded-2xl shadow-2xl"
              loading="lazy" decoding="async" />
              <div className="mt-6 text-center">
                <span className="inline-block px-4 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-2">
                  {selectedImage.category}
                </span>
                <h3 className="text-primary-foreground font-heading font-bold text-2xl mb-2">
                  {selectedImage.title}
                </h3>
                <p className="text-primary-foreground/70">
                  {selectedImage.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        <CTA />
      </main>
      
      <CityWiseLinks />
      <Footer />
    </div>
  );
};

export default Gallery;
