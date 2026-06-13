import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { industries } from "@/data/clients";

interface ClientFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const ClientFilters = ({ activeFilter, onFilterChange }: ClientFiltersProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12"
    >
      {industries.map((filter) => (
        <Button
          key={filter.id}
          variant={activeFilter === filter.id ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(filter.id)}
          className="rounded-full transition-all duration-300 text-xs md:text-sm"
        >
          {filter.label}
          <span className="ml-1.5 text-[10px] opacity-70">({filter.count})</span>
        </Button>
      ))}
    </motion.div>
  );
};
