import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Truck, MapPin, Award } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: 9500,
    suffix: "+",
    label: "Happy Clients",
  },
  {
    icon: Truck,
    value: 98,
    suffix: "%",
    label: "Successful Moves",
  },
  {
    icon: MapPin,
    value: 280,
    suffix: "+",
    label: "Cities Served",
  },
  {
    icon: Award,
    value: 16,
    suffix: "",
    label: "Years Experience",
  },
];

const useCountUp = (end: number, duration: number = 2000, isInView: boolean) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, isInView]);

  return count;
};

const StatItem = ({ stat, index, isInView }: { stat: (typeof stats)[0]; index: number; isInView: boolean }) => {
  const count = useCountUp(stat.value, 2000, isInView);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="text-center group"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-foreground/10 mb-4 group-hover:scale-110 transition-transform duration-300">
        <stat.icon className="w-8 h-8 text-secondary" />
      </div>
      <div className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-2">
        {count.toLocaleString()}
        {stat.suffix}
      </div>
      <div className="text-primary-foreground/70 font-medium">{stat.label}</div>
    </motion.div>
  );
};

const Stats = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-50" />

      {/* Animated Background */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/20 rounded-full blur-3xl"
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <StatItem key={stat.label} stat={stat} index={index} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
