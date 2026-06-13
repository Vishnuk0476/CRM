import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

interface LocationFAQProps {
  city: string;
  state: string;
  phoneNumber: string;
}

const LocationFAQ = ({ city, state, phoneNumber }: LocationFAQProps) => {
  const faqs = [
    {
      question: `What is the cost of packers and movers in ${city}?`,
      answer: `The cost of packers and movers in ${city} depends on factors like distance, volume of goods, type of services required, and floor levels. For a 1BHK local move, costs typically range from ₹4,000-8,000. For 2BHK, it's around ₹8,000-15,000, and for 3BHK, ₹15,000-25,000. For accurate pricing, contact us at ${phoneNumber} for a free survey and quote.`,
    },
    {
      question: `How do I choose the best packers and movers in ${city}?`,
      answer: `To choose the best packers and movers in ${city}: 1) Check company registration and IBA approval, 2) Read customer reviews and ratings, 3) Ask for transparent pricing with no hidden charges, 4) Verify insurance coverage, 5) Request a pre-move survey, 6) Compare quotes from multiple companies. Panya Global Movers is IBA approved with 15+ years of experience in ${city}.`,
    },
    {
      question: `Do you provide packing materials in ${city}?`,
      answer: `Yes, Panya Global Movers provides high-quality packing materials in ${city} including corrugated boxes, bubble wrap, thermocol sheets, stretch film, packing tape, and custom crates for fragile items. Our packing materials are included in our comprehensive moving packages, ensuring your belongings are protected during transit.`,
    },
    {
      question: `How many days before should I book packers and movers in ${city}?`,
      answer: `We recommend booking packers and movers in ${city} at least 7-10 days before your moving date for local moves and 15-20 days for long-distance or international moves. During peak seasons (April-June, December), booking 2-3 weeks in advance is advisable to ensure availability and get the best rates.`,
    },
    {
      question: `Do you offer insurance for goods during transit in ${city}?`,
      answer: `Yes, Panya Global Movers offers comprehensive transit insurance for all moves in ${city}. We provide coverage options ranging from basic liability to full value protection. Our insurance covers damages during packing, loading, transit, and unloading. We recommend opting for full value insurance for valuable items and electronics.`,
    },
    {
      question: `What areas do you cover in ${city}, ${state}?`,
      answer: `We provide complete packers and movers services across all areas of ${city} including residential localities, commercial zones, industrial areas, and IT hubs. Our extensive network covers the entire ${city} metropolitan area and connects to all major cities in ${state} and across India.`,
    },
    {
      question: `Can you help with vehicle transport from ${city}?`,
      answer: `Yes, we offer car and bike transport services from ${city} to any location in India. We use enclosed carriers for safe transportation and provide door-to-door delivery. Our vehicle transport includes insurance coverage, GPS tracking, and guaranteed timely delivery. Contact us at ${phoneNumber} for vehicle shipping quotes.`,
    },
    {
      question: `Do you provide storage services in ${city}?`,
      answer: `Yes, Panya Global Movers offers secure storage solutions in ${city}. Our warehouses are climate-controlled, 24/7 monitored with CCTV, and pest-free. We offer short-term and long-term storage options for household goods, office furniture, vehicles, and commercial inventory. Storage charges start from ₹15 per sq ft per month.`,
    },
    {
      question: `How do you ensure safety of fragile items in ${city}?`,
      answer: `For fragile items in ${city}, we use specialized packing techniques: multi-layer bubble wrap, thermocol protection, custom wooden crates for antiques and artwork, and separate compartments in our vehicles. Our trained packers handle glassware, electronics, and delicate items with extra care. We also offer additional insurance for high-value fragile goods.`,
    },
    {
      question: `What is your cancellation policy for bookings in ${city}?`,
      answer: `Our cancellation policy for ${city} bookings: Free cancellation up to 48 hours before the scheduled move. Cancellation within 24-48 hours incurs a 25% charge. Same-day cancellations may be charged up to 50% of the quoted amount. We recommend rescheduling instead of cancellation when possible, which we accommodate free of charge with 24-hour notice.`,
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
            <HelpCircle className="w-4 h-4 inline mr-2" />
            Frequently Asked Questions
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            FAQs About Packers and Movers in {city}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about our moving services in {city}, {state}.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow"
                >
                  <AccordionTrigger className="text-left font-heading font-semibold text-foreground hover:text-secondary py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>

        {/* FAQ Schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer,
                },
              })),
            }),
          }}
        />
      </div>
    </section>
  );
};

export default LocationFAQ;
