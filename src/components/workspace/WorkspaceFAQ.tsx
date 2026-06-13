import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "How far in advance should we plan our workspace relocation?",
    answer:
      "We recommend starting the planning process at least 2-3 months before your intended move date for small offices (under 50 employees) and 4-6 months for larger organizations. This allows time for proper inventory assessment, IT infrastructure planning, employee communication, and coordination with your new building management. For complex relocations involving multiple locations or specialized equipment, 6-12 months is ideal.",
  },
  {
    question: "How do you minimize downtime during office moves?",
    answer:
      "We specialize in minimal-disruption relocations through several strategies: weekend and after-hours moves, phased relocation plans where departments move in stages, pre-staging at the new location, parallel IT setup so systems are ready when you arrive, and dedicated project managers who coordinate every aspect. Many of our clients experience less than 4 hours of actual downtime.",
  },
  {
    question: "What is included in a typical workspace relocation cost?",
    answer:
      "Our comprehensive quotes typically include: pre-move planning and consultation, packing materials and professional packing, disassembly and reassembly of furniture, specialized IT equipment handling, transportation with GPS tracking, unpacking and debris removal, and post-move support. Additional services like storage, deep cleaning, or IT setup are quoted separately based on your needs.",
  },
  {
    question: "How do you handle sensitive IT equipment and servers?",
    answer:
      "Our IT relocation team includes certified technicians who use anti-static packaging, climate-controlled vehicles, and proper handling procedures. We document all connections before disconnecting, use specialized server crates, maintain chain of custody logs, and can coordinate with your IT team for proper shutdown/startup procedures. For data centers, we offer full project management including rack-to-rack mapping.",
  },
  {
    question: "Do you provide packing services or just transportation?",
    answer:
      "We offer both options. Our full-service package includes professional packing with labeled boxes, protective materials for electronics and fragile items, and organized unpacking at your new location. Alternatively, you can opt for a partial service where you handle some packing and we handle specialized items and transportation. We'll work with you to find the most cost-effective solution.",
  },
  {
    question: "What happens if something gets damaged during the move?",
    answer:
      "All our moves are fully insured with comprehensive coverage. We document the condition of all items before the move with photos and inventory lists. In the rare event of damage, our claims process is straightforward and typically resolved within 7-14 business days. We also offer additional transit insurance for high-value items like artwork or specialized equipment.",
  },
  {
    question: "Can you help with furniture installation and space planning?",
    answer:
      "Yes! Beyond moving, we offer furniture installation services including modular workstation assembly, cable management, and ergonomic setup. We can work with your interior designer or space planner, or our team can suggest efficient layouts based on your employee count and work style. Many clients save money by having us handle both the move and installation.",
  },
  {
    question: "How do you ensure security during the relocation?",
    answer:
      "Security is paramount. Our team members are background-checked and security-cleared. We use sealed containers for confidential documents, GPS-tracked vehicles, and can provide armed escorts for sensitive materials. For financial and legal firms, we maintain strict chain-of-custody documentation and can sign NDAs. Access to packed items is controlled and logged throughout the process.",
  },
  {
    question: "What is the typical timeline for an office relocation?",
    answer:
      "Timeline varies by size: Small offices (10-30 employees) typically take 1-2 days of actual moving. Medium offices (30-100 employees) take 2-4 days. Large offices (100+ employees) may take 1-2 weeks with phased approaches. The planning phase adds 2-4 weeks. We provide a detailed timeline during consultation and keep you updated throughout.",
  },
  {
    question: "Do you offer storage solutions during transition periods?",
    answer:
      "Absolutely. We provide short-term and long-term storage in secure, climate-controlled facilities. This is helpful when there's a gap between leases, during renovation at the new location, or when downsizing. Our storage is fully inventoried, insured, and you can access your items with scheduled notice. We also offer document archiving for long-term records storage.",
  },
];

const WorkspaceFAQ = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
            FAQs
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
            Frequently Asked <span className="text-secondary">Questions</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about workspace relocation, costs, timelines, and our process.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-secondary/30 transition-colors"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <span className="font-semibold text-foreground pr-4">{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 pl-8">
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Still Have Questions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 bg-muted/30 rounded-2xl">
            <div className="text-left">
              <p className="font-semibold text-foreground">Still have questions?</p>
              <p className="text-sm text-muted-foreground">Our team is here to help 24/7</p>
            </div>
            <div className="flex gap-3">
              <a 
                href="tel:+911141556447"
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors"
              >
                Call Us
              </a>
              <a 
                href="mailto:info@panyaglobal.in"
                className="px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/70 transition-colors"
              >
                Email Us
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WorkspaceFAQ;
