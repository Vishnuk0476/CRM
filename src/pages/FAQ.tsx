import { motion } from "framer-motion";
import { HelpCircle, Shield } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import CTA from "@/components/home/CTA";

// Easy Cover Warranty FAQs
const easyCoverFaqs = [
  {
    question: "What is Easy Cover Warranty?",
    answer: "Easy Cover Warranty is our simplified protection plan that safeguards your household or office goods during packing, transportation, and delivery. Unlike traditional insurance with complex paperwork and hidden clauses, Easy Cover provides clear coverage and accountability. We take responsibility — end of story.",
  },
  {
    question: "What does Easy Cover Warranty cover?",
    answer: "Easy Cover Warranty covers: damage during packing, damage during transportation, damage during unloading, loss due to mishandling, and accidental breakage under covered conditions. Coverage applies to furniture, electronics, fragile household items, and office equipment.",
  },
  {
    question: "What is NOT covered under Easy Cover Warranty?",
    answer: "Easy Cover does NOT cover: damage due to incorrect value declaration, pre-existing damages not reported before the move, and prohibited or hazardous items. Being clear upfront prevents disputes later.",
  },
  {
    question: "How is Easy Cover different from traditional insurance?",
    answer: "Most traditional insurance is designed to reject claims, not settle them. Easy Cover offers: simple valuation process with clear declared value, no third-party confusion (one company, one responsibility), fast claim resolution without endless follow-ups, transparent terms communicated before the move, and a customer-first approach.",
  },
  {
    question: "How does the Easy Cover claim process work?",
    answer: "Our 5-step process is simple: 1) Declare value before the move, 2) Choose Easy Cover Warranty before packing begins, 3) Safe packing & transportation by trained professionals, 4) Delivery & inspection of items, 5) Quick claim documentation and resolution if required.",
  },
  {
    question: "Who should opt for Easy Cover Warranty?",
    answer: "You should choose Easy Cover if: you're moving fragile or high-value items, you don't want post-move stress, you value accountability over cheap quotes, or you expect professional handling. Protecting your belongings costs far less than replacing them.",
  },
  {
    question: "How much does Easy Cover Warranty cost?",
    answer: "Easy Cover Warranty cost depends on the declared value of your goods and the type of move. Our relocation experts will provide a clear quote during the consultation. Contact us at 8800446447 or info@panyaglobal.in for a personalized assessment.",
  },
];

// General FAQs
const generalFaqs = [
  {
    question: "What services does Panya Global Relocation offer?",
    answer: "We offer comprehensive relocation services including local and long-distance household moves, office relocations, international moving, packing and unpacking, storage solutions, vehicle transportation, pet moving, fine art moving, and handyman services. We also provide Easy Cover Warranty for complete peace of mind.",
  },
  {
    question: "How do I get a quote for my move?",
    answer: "You can get a free quote by filling out our online quote form, calling us at +91 8800446447, or emailing info@panyaglobal.in. Our team will assess your requirements and provide a detailed estimate. For accurate quotes, we may also arrange a physical survey of your items.",
  },
  {
    question: "How far in advance should I book my move?",
    answer: "We recommend booking at least 7-10 days in advance for local moves and 2-3 weeks for long-distance or international moves. However, we can accommodate urgent moves based on availability. Early booking ensures better scheduling and pricing.",
  },
  {
    question: "Do you provide packing materials?",
    answer: "Yes, we provide all packing materials including cartons, bubble wrap, thermocol, tape, and specialized packing for fragile items. Our packing materials are of high quality to ensure maximum protection for your belongings during transit.",
  },
  {
    question: "How is the pricing determined?",
    answer: "Pricing is based on several factors: volume/weight of goods, distance, type of items (fragile, heavy, etc.), packing requirements, accessibility of locations, and additional services like storage or vehicle transport. We provide transparent quotes with no hidden charges.",
  },
  {
    question: "What items cannot be transported?",
    answer: "We cannot transport hazardous materials, explosives, flammable substances, illegal items, perishable food, live plants (except with prior arrangement), and certain valuables like cash and jewelry (recommended to carry personally). Please inform us of any special items in advance.",
  },
  {
    question: "How do I track my consignment?",
    answer: "You can track your consignment using our Track Consignment feature on the website or by calling our customer service. You'll receive a unique consignment number at the time of booking that can be used for real-time tracking updates.",
  },
  {
    question: "What is your cancellation policy?",
    answer: "Cancellation 7+ days before move: Full refund. 3-7 days before: 50% refund. Within 3 days: No refund. Rescheduling is subject to availability. Please contact us as early as possible if you need to cancel or reschedule.",
  },
  {
    question: "Do you offer storage solutions during transition periods?",
    answer: "Yes, we have secure, climate-controlled warehouses for short-term and long-term storage. Our storage facilities are monitored 24/7 with CCTV and have fire safety measures. Storage is charged based on space used and duration.",
  },
  {
    question: "How do you handle fragile or valuable items?",
    answer: "Fragile items like glassware, electronics, and artwork receive special packing with multiple layers of protection. We use custom crating for highly valuable or delicate items. Our trained packers are experienced in handling all types of items with care.",
  },
  {
    question: "Can you help with vehicle transportation?",
    answer: "Yes, we offer car and two-wheeler transportation services. Vehicles are transported in enclosed carriers to protect them from weather and road damage. We handle all documentation and ensure safe delivery to your destination.",
  },
  {
    question: "What are your payment options?",
    answer: "We accept multiple payment methods including cash, cheque, bank transfer (NEFT/RTGS), and UPI. An advance payment is required to confirm booking, with the balance due before or upon delivery. We provide proper receipts for all payments.",
  },
  {
    question: "Are you ISO certified?",
    answer: "Yes, Panya Global Relocation is an ISO 9001:2015, ISO 14001:2015, and ISO 45001:2018 certified company. These certifications reflect our commitment to quality management, environmental responsibility, and occupational health & safety standards.",
  },
];

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 bg-gradient-to-br from-primary via-primary/95 to-primary/90 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.panyaglobalmovers.com/extra-images/slider_bg2.webp')] bg-cover bg-center opacity-20" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto"
            >
              <HelpCircle className="w-16 h-16 mx-auto mb-6 text-secondary" />
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
                Frequently Asked Questions
              </h1>
              <p className="text-lg text-primary-foreground/80">
                Find answers to common questions about our relocation services
              </p>
            </motion.div>
          </div>
        </section>

        {/* Easy Cover Warranty FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-secondary" />
                  <h2 className="font-heading text-2xl font-bold text-foreground">
                    Easy Cover Warranty
                  </h2>
                </div>
                <p className="text-muted-foreground">
                  Questions about our simplified protection plan for your move.
                </p>
              </motion.div>
              
              <Accordion type="single" collapsible className="space-y-4">
                {easyCoverFaqs.map((faq, index) => (
                  <motion.div
                    key={`easycover-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <AccordionItem
                      value={`easycover-${index}`}
                      className="bg-card rounded-xl border border-secondary/20 px-6 shadow-sm"
                    >
                      <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-6 text-center"
              >
                <a 
                  href="/easy-cover-warranty"
                  className="inline-flex items-center gap-2 text-secondary hover:underline font-medium"
                >
                  Learn more about Easy Cover Warranty →
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* General FAQ Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
                  General Questions
                </h2>
                <p className="text-muted-foreground">
                  Common questions about our relocation services.
                </p>
              </motion.div>
              
              <Accordion type="single" collapsible className="space-y-4">
                {generalFaqs.map((faq, index) => (
                  <motion.div
                    key={`general-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <AccordionItem
                      value={`general-${index}`}
                      className="bg-card rounded-xl border border-border px-6 shadow-sm"
                    >
                      <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Still Have Questions */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto"
            >
              <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
                Still Have Questions?
              </h2>
              <p className="text-muted-foreground mb-6">
                Can't find the answer you're looking for? Our team is here to help.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="tel:+918800446447">
                  <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    Call Us: +91 8800446447
                  </button>
                </a>
                <a href="mailto:info@panyaglobal.in">
                  <button className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">
                    Email: info@panyaglobal.in
                  </button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        <CTA />
      </main>

      <CityWiseLinks />
      <Footer />
    </div>
  );
};

export default FAQ;
