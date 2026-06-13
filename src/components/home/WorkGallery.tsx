import { motion } from "framer-motion";
import { Users, Building2, FlaskConical, Package, Wrench, Monitor } from "lucide-react";

// New gallery images
import crewOfficePacking from "@/assets/gallery/crew-office-packing.webp";
import teamLabWork from "@/assets/gallery/team-lab-work.webp";
import linkedinOffice from "@/assets/gallery/linkedin-office.webp";
import crewLabEquipment from "@/assets/gallery/crew-lab-equipment.webp";
import stretchWrapTeam from "@/assets/gallery/stretch-wrap-team.webp";
import itemPacking from "@/assets/gallery/item-packing.webp";
import bubbleWrapOffice from "@/assets/gallery/bubble-wrap-office.webp";
import crewPacking from "@/assets/gallery/crew-packing.webp";
import wardrobeWrapping from "@/assets/gallery/wardrobe-wrapping.webp";
import foamTubePacking from "@/assets/gallery/foam-tube-packing.webp";
import homePacking from "@/assets/gallery/home-packing.webp";
import corrugatedPacking from "@/assets/gallery/corrugated-packing.webp";
import crewEquipmentPacking from "@/assets/gallery/crew-equipment-packing.webp";
import brandedBox from "@/assets/gallery/branded-box.webp";
import crewHoldingBox from "@/assets/gallery/crew-holding-box.webp";
import officeBubbleWrap from "@/assets/gallery/office-bubble-wrap.webp";

const galleryItems = [
  // Row 1
  {
    image: linkedinOffice,
    title: "LinkedIn India Office",
    subtitle: "Corporate relocation project",
    icon: Building2,
  },
  {
    image: crewEquipmentPacking,
    title: "Professional Packing",
    subtitle: "Equipment handling expertise",
    icon: Wrench,
  },
  {
    image: teamLabWork,
    title: "Lab Equipment Handling",
    subtitle: "Precision machinery team",
    icon: FlaskConical,
  },
  // Row 2
  {
    image: crewLabEquipment,
    title: "Lab Technician",
    subtitle: "Equipment setup expertise",
    icon: FlaskConical,
  },
  {
    image: stretchWrapTeam,
    title: "Stretch Wrapping",
    subtitle: "Team coordination",
    icon: Users,
  },
  {
    image: itemPacking,
    title: "Careful Packing",
    subtitle: "Delicate item protection",
    icon: Package,
  },
  // Row 3
  {
    image: bubbleWrapOffice,
    title: "Bubble Wrap Protection",
    subtitle: "Electronics packing",
    icon: Monitor,
  },
  {
    image: crewPacking,
    title: "Home Item Packing",
    subtitle: "Household goods handling",
    icon: Package,
  },
  {
    image: wardrobeWrapping,
    title: "Furniture Protection",
    subtitle: "Large item wrapping",
    icon: Wrench,
  },
  // Row 4
  {
    image: foamTubePacking,
    title: "Foam-Lined Packing",
    subtitle: "Premium tube protection",
    icon: Package,
  },
  {
    image: brandedBox,
    title: "Branded Packaging",
    subtitle: "Premium quality materials",
    icon: Package,
  },
  {
    image: crewHoldingBox,
    title: "Careful Handling",
    subtitle: "Trained crew members",
    icon: Users,
  },
];

const WorkGallery = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
            Our Work in Action
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Real Photos from <span className="text-primary">Real Relocations</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See our professional crew at work – from corporate offices to lab relocations, we handle every move
            with care and expertise.
          </p>
        </motion.div>

        {/* Gallery Grid - 3 columns, 4 rows */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group relative overflow-hidden rounded-xl bg-card shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={item.image}
                  alt={item.title}
                  width={400}
                  height={300}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-center gap-2 text-primary-foreground">
                  <item.icon className="w-5 h-5" />
                  <div>
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    <p className="text-xs text-primary-foreground/80">{item.subtitle}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkGallery;
