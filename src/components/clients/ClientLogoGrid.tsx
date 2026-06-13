import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface Client {
  name: string;
  image: string;
  industry: string;
  caseStudy?: {
    title: string;
    description: string;
    stats: { label: string; value: string }[];
  };
}

interface ClientLogoGridProps {
  clients: Client[];
  onClientClick: (client: Client) => void;
}

export const ClientLogoGrid = ({ clients, onClientClick }: ClientLogoGridProps) => {
  return (
    <motion.div 
      layout
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
    >
      <AnimatePresence mode="popLayout">
        {clients.map((client, index) => (
          <motion.div
            key={client.name}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: index * 0.02, duration: 0.3 }}
            whileHover={{ scale: 1.05, y: -5 }}
            onClick={() => onClientClick(client)}
            className="group relative bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border hover:shadow-lg hover:border-primary/30 cursor-pointer transition-all duration-300"
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative flex flex-col items-center justify-center aspect-square">
              <img 
                src={client.image}
                alt={client.name}
                className="max-h-12 md:max-h-16 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
              loading="lazy" decoding="async" />
              <p className="mt-3 text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors">
                {client.name}
              </p>
            </div>

            {/* Industry badge */}
            <Badge 
              variant="secondary" 
              className="absolute -top-2 -right-2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              {client.industry}
            </Badge>

            {/* Case study indicator */}
            {client.caseStudy && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[10px] text-primary font-medium">View Case Study →</span>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};
