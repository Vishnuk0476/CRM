import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";


interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  location: string | null;
  image_url: string | null;
  rating: number;
  content: string;
}

// Fallback data
const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Rahul Sharma",
    role: "Manager",
    location: "Delhi → Mumbai",
    image_url: null,
    rating: 5,
    content:
      "Excellent service! The team was professional and handled our belongings with care. The best experience I've had with movers.",
  },
  {
    id: "2",
    name: "Priya Verma",
    role: "Director",
    location: "Bangalore → Gurgaon",
    image_url: null,
    rating: 5,
    content:
      "Smooth relocation experience. Highly recommend Panya Global for corporate moves. Everything was packed perfectly.",
  },
  {
    id: "3",
    name: "Amit Kumar",
    role: "Architect",
    location: "Chennai → Delhi",
    image_url: null,
    rating: 5,
    content:
      "Best packers and movers! On-time delivery and zero damage. Very satisfied with the whole process.",
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch("/api/testimonials/list.php");
        const json = await res.json();
        const rawData = Array.isArray(json.data) ? json.data : (json.data?.testimonials || []);
        if (json.success && rawData.length > 0) {
          setTestimonials(
            rawData
              .filter((t: any) => !t.is_video)
              .slice(0, 6)
              .map((t: any) => ({
                id: t.id,
                name: t.name,
                role: t.role,
                location: t.location,
                image_url: t.image_url,
                rating: t.rating,
                content: t.content,
              }))
          );
        }
      } catch (err: unknown) {
        console.error("Failed to fetch testimonials:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(nextTestimonial, 5000);
  }, []);

  const nextTestimonial = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    resetTimer();
  }, [testimonials.length, resetTimer]);

  const prevTestimonial = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    resetTimer();
  }, [testimonials.length, resetTimer]);

  useEffect(() => {
    if (testimonials.length > 1) {
      intervalRef.current = setInterval(nextTestimonial, 5000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [testimonials.length, nextTestimonial]);

  const currentTestimonial = testimonials[currentIndex];

  return (
    // CHANGED: Removed 'overflow-hidden' from here to prevent cropping content
    <section ref={ref} className="py-20 bg-muted/50 relative">
      {/* CHANGED: Added specific wrapper for backgrounds with overflow-hidden */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
            Testimonials
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            What Our <span className="text-secondary">Clients Say</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our satisfied customers 
            have to say about their experience with Panya Global.
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative min-h-[400px]" // CHANGED: Added min-height to prevent layout shift
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                // CHANGED: Changed overflow-hidden to overflow-visible so the Quote Icon isn't cut
                className="bg-card rounded-3xl p-8 md:p-12 shadow-xl border border-border relative overflow-visible z-10"
              >
                {/* Quote Icon */}
                <div className="absolute -top-6 left-8">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shadow-lg">
                    <Quote className="w-6 h-6 text-secondary-foreground" />
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-6 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      // CHANGED: Color updated to Golden (Yellow-400)
                      className={`w-5 h-5 ${i < currentTestimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-muted"}`}
                    />
                  ))}
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-lg md:text-xl text-foreground leading-relaxed mb-8">
                  "{currentTestimonial.content}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  {currentTestimonial.image_url ? (
                    <img 
                      src={currentTestimonial.image_url}
                      alt={currentTestimonial.name}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-full object-cover border-2 border-secondary"
                    loading="lazy" decoding="async" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center border-2 border-secondary">
                      <span className="font-heading font-bold text-xl text-secondary">
                        {currentTestimonial.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-heading font-bold text-foreground">
                      {currentTestimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {currentTestimonial.role && `${currentTestimonial.role}`}
                      {currentTestimonial.role && currentTestimonial.location && " • "}
                      {currentTestimonial.location}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      resetTimer();
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-secondary w-8"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevTestimonial}
                  className="rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextTestimonial}
                  className="rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
