import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, BookOpen, Image, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import CTA from "@/components/home/CTA";
import { BrochureDownloadForm } from "@/components/brochure/BrochureDownloadForm";

interface DownloadItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  size: string;
  format: string;
  link: string;
}

const downloads: DownloadItem[] = [
  {
    title: "Company Brochure",
    description: "Complete overview of Panya Global Relocation services, capabilities, and company profile.",
    icon: BookOpen,
    size: "2.5 MB",
    format: "PDF",
    link: "/documents/brochure.pdf",
  },
  {
    title: "Service Catalog",
    description: "Detailed catalog of all our packing, moving, and relocation services.",
    icon: FileText,
    size: "1.8 MB",
    format: "PDF",
    link: "/documents/brochure.pdf",
  },
  {
    title: "Corporate Profile",
    description: "Our corporate credentials, certifications, and partnership information.",
    icon: FileCheck,
    size: "1.2 MB",
    format: "PDF",
    link: "/documents/brochure.pdf",
  },
  {
    title: "Photo Gallery",
    description: "Visual showcase of our operations, team, and successful relocations.",
    icon: Image,
    size: "5.0 MB",
    format: "PDF",
    link: "/documents/brochure.pdf",
  },
];

const certifications = [
  "ISO 9001:2015 - Quality Management System",
  "ISO 14001:2015 - Environmental Management System",
  "ISO 45001:2018 - Occupational Health & Safety",
];

const Brochure = () => {
  const [selectedBrochure, setSelectedBrochure] = useState<DownloadItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleDownloadClick = (item: DownloadItem) => {
    setSelectedBrochure(item);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedBrochure(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 bg-gradient-to-br from-primary via-primary/95 to-primary/90 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.panyaglobalmovers.com/extra-images/slider_bg1.webp')] bg-cover bg-center opacity-20" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
                Download Brochure
              </h1>
              <p className="text-lg text-primary-foreground/80">
                Access our company brochures, service catalogs, and corporate documentation.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Downloads Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
                  Available Downloads
                </h2>
                <p className="text-muted-foreground">
                  Fill in your details to download our brochures and documentation
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                {downloads.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-7 h-7 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="px-2 py-1 bg-muted rounded">{item.format}</span>
                            <span>{item.size}</span>
                          </div>
                          <Button 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handleDownloadClick(item)}
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Certifications Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
                  Our Certifications
                </h2>
                <p className="text-muted-foreground">
                  Panya Global Relocation is certified by international standards
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {certifications.map((cert, index) => (
                  <motion.div
                    key={cert}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card rounded-xl p-6 text-center shadow-sm border border-border"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center">
                      <FileCheck className="w-8 h-8 text-secondary" />
                    </div>
                    <p className="font-medium text-foreground">{cert}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Main Brochure CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-center bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 md:p-12 text-primary-foreground"
            >
              <BookOpen className="w-16 h-16 mx-auto mb-6 text-secondary" />
              <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
                Download Our Complete Brochure
              </h2>
              <p className="text-primary-foreground/80 mb-8">
                Get detailed information about all our services, capabilities, and company profile in one comprehensive document.
              </p>
              <Button 
                size="lg" 
                variant="secondary" 
                className="gap-2"
                onClick={() => handleDownloadClick(downloads[0])}
              >
                <Download className="w-5 h-5" />
                Download Brochure (PDF)
              </Button>
            </motion.div>
          </div>
        </section>

        <CTA />
      </main>

      <CityWiseLinks />
      <Footer />

      {/* Download Form Modal */}
      {selectedBrochure && (
        <BrochureDownloadForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          brochureTitle={selectedBrochure.title}
          brochureLink={selectedBrochure.link}
        />
      )}
    </div>
  );
};

export default Brochure;
