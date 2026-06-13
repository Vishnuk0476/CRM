import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CaseStudy {
  title: string;
  description: string;
  stats: { label: string; value: string }[];
}

interface Client {
  name: string;
  image: string;
  industry: string;
  caseStudy?: CaseStudy;
}

interface CaseStudyModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CaseStudyModal = ({ client, isOpen, onClose }: CaseStudyModalProps) => {
  if (!client) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl md:w-full bg-card rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-4">
                <div className="bg-white rounded-xl p-3 shadow-lg">
                  <img 
                    src={client.image}
                    alt={client.name}
                    className="h-12 w-auto object-contain"
                  loading="lazy" decoding="async" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{client.name}</h3>
                  <p className="text-primary-foreground/80 text-sm">{client.industry}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {client.caseStudy ? (
                <>
                  <h4 className="text-lg font-semibold text-foreground mb-3">
                    {client.caseStudy.title}
                  </h4>
                  <p className="text-muted-foreground mb-6">
                    {client.caseStudy.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    {client.caseStudy.stats.map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center p-4 bg-muted/50 rounded-xl"
                      >
                        <p className="text-2xl font-bold text-primary">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Success indicators */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Zero Damage</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>On-Time Delivery</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4 text-secondary" />
                      <span>Cost Efficient</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    We have successfully completed multiple relocation projects for {client.name}.
                  </p>
                  <Button className="mt-4">Request Case Study</Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
