import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Phone,
  MessageCircle,
  Mail,
  Shield,
  Clock,
  Award,
  Star,
  CheckCircle2,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LANDLINE_PHONE,
  LANDLINE_TEL,
  WHATSAPP_TEL,
  EMAIL_MAILTO,
} from "@/data/constants";

const trustBadges = [
  { icon: Shield, label: "Easy Cover Warranty Available" },
  { icon: Clock, label: "24/7 Support" },
  { icon: Award, label: "ISO Certified" },
  { icon: Star, label: "4.9/5 Rating" },
];

const quickFacts = [
  "Free, no-obligation quotes",
  "Transparent pricing - no hidden fees",
  "Dedicated move coordinator",
  "Protection against transit damage & loss",
];

const CTA = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative overflow-hidden bg-primary">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90" />

      <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {trustBadges.map((badge, i) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-full border border-primary-foreground/20"
              >
                <badge.icon className="w-4 h-4 text-secondary" />
                <span className="text-sm text-primary-foreground">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>

          {/* Heading */}
          <span className="inline-block px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-semibold mb-5">
            Ready to Move?
          </span>

          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-5">
            Let&apos;s Start Your{" "}
            <span className="text-secondary">Stress-Free</span> Move Today
          </h2>

          <p className="text-primary-foreground/85 max-w-2xl mx-auto mb-8">
            Join thousands of satisfied customers who trusted us with their
            precious belongings across India.
          </p>

          {/* Quick Facts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mb-10">
            {quickFacts.map((fact, i) => (
              <div
                key={i}
                className="flex items-center justify-center gap-2 text-sm text-primary-foreground/90"
              >
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                {fact}
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Link to="/quote">
              <Button variant="hero" size="lg">
                Get Free Quote <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>

            <a href={LANDLINE_TEL}>
              <Button variant="heroOutline" size="lg">
                <Phone className="mr-1 w-4 h-4" />
                Call {LANDLINE_PHONE}
              </Button>
            </a>

            <Link to="/easy-cover">
              <Button variant="heroOutline" size="lg">
                <Shield className="mr-1 w-4 h-4" />
                Easy Cover Warranty
              </Button>
            </Link>
          </div>

          {/* Secondary Contacts */}
          <div className="flex justify-center gap-6 text-sm text-primary-foreground/70">
            <a href={WHATSAPP_TEL} className="hover:text-secondary">
              WhatsApp
            </a>
            <a href={EMAIL_MAILTO} className="hover:text-secondary">
              Email Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
export default CTA;
