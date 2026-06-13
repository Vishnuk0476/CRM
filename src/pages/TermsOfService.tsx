import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";

// ─── Inline SVG Icons ────────────────────────────────────────────────────────
const Icon = ({ d, extra = "" }: { d: string; extra?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className={`w-6 h-6 ${extra}`}>
    <path d={d} />
  </svg>
);

const icons: Record<string, JSX.Element> = {
  scroll: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  truck: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  alert: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  creditCard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  xCircle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  messageCircle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  cloud: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>,
  lock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  edit: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  mail: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  phone: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.37 19.79 19.79 0 0 1 1.61 2.74 2 2 0 0 1 3.59.73h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 6.29 6.29l1.62-1.62a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  mapPin: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>,
};

const sections = [
  { id: "agreement",      label: "Agreement to Terms",     icon: "scroll" },
  { id: "services",       label: "Our Services",           icon: "truck" },
  { id: "booking",        label: "Booking & Quotations",   icon: "calendar" },
  { id: "responsibilities", label: "Customer Responsibilities", icon: "user" },
  { id: "prohibited",    label: "Prohibited Items",        icon: "alert" },
  { id: "insurance",     label: "Insurance & Liability",   icon: "shield" },
  { id: "payment",       label: "Payment Terms",           icon: "creditCard" },
  { id: "cancellation",  label: "Cancellation Policy",     icon: "xCircle" },
  { id: "claims",        label: "Claims & Disputes",       icon: "messageCircle" },
  { id: "force-majeure", label: "Force Majeure",           icon: "cloud" },
  { id: "ip",            label: "Intellectual Property",   icon: "lock" },
  { id: "modifications", label: "Modifications",           icon: "edit" },
  { id: "contact",       label: "Contact Us",              icon: "mail" },
];

// Small reusable components
const SectionHeader = ({ id, icon, title, color }: { id: string; icon: string; title: string; color: string }) => (
  <div id={id} className="flex items-center gap-3 mb-5 scroll-mt-28">
    <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + "20", color }}>
      {icons[icon]}
    </div>
    <h2 className="text-xl md:text-2xl font-bold text-foreground font-heading m-0">{title}</h2>
  </div>
);

const BulletList = ({ items }: { items: string[] }) => (
  <ul className="space-y-2 mt-3">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-2.5 text-muted-foreground text-sm leading-relaxed">
        <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-secondary/15 text-secondary flex items-center justify-center">{icons.check}</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card border border-border rounded-2xl p-6 shadow-sm ${className}`}>{children}</div>
);

const TermsOfService = () => {
  const [activeSection, setActiveSection] = useState("agreement");

  useEffect(() => {
    const handleScroll = () => {
      const offsets = sections.map(({ id }) => {
        const el = document.getElementById(id);
        if (!el) return { id, top: Infinity };
        return { id, top: el.getBoundingClientRect().top };
      });
      const current = offsets.filter((o) => o.top <= 140).pop();
      if (current) setActiveSection(current.id);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10" style={{ background: "hsl(199 89% 48%)", filter: "blur(80px)" }} />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full opacity-10" style={{ background: "hsl(199 89% 48%)", filter: "blur(100px)" }} />

          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
                style={{ background: "hsl(199 89% 48% / 0.2)", color: "hsl(199 89% 75%)", border: "1px solid hsl(199 89% 48% / 0.3)" }}>
                {icons.scroll}
                Legal Agreement
              </span>
              <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
                Terms of{" "}<span style={{ color: "hsl(199 89% 60%)" }}>Service</span>
              </h1>
              <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto mb-8">
                Please read these terms carefully before using our relocation services. By engaging Panya Global, you agree to be bound by the following conditions.
              </p>
              <div className="inline-flex flex-wrap justify-center gap-6 px-6 py-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <div className="text-center">
                  <p className="text-white/40 text-xs uppercase tracking-wider">Effective Date</p>
                  <p className="text-white font-semibold text-sm">January 1, 2024</p>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <p className="text-white/40 text-xs uppercase tracking-wider">Last Updated</p>
                  <p className="text-white font-semibold text-sm">February 27, 2026</p>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <p className="text-white/40 text-xs uppercase tracking-wider">Governing Law</p>
                  <p className="text-white font-semibold text-sm">India - New Delhi Courts</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Body: Sidebar + Content ── */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-10 max-w-7xl mx-auto">

              {/* Sticky TOC Sidebar */}
              <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0">
                <div className="sticky top-28">
                  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Table of Contents</p>
                    <nav className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
                      {sections.map(({ id, label, icon }) => (
                        <button key={id} onClick={() => scrollTo(id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                            activeSection === id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}>
                          <span className="w-4 h-4 flex-shrink-0 opacity-70">{icons[icon]}</span>
                          {label}
                        </button>
                      ))}
                    </nav>
                    <div className="mt-5 p-4 rounded-xl" style={{ background: "hsl(199 89% 48% / 0.08)", border: "1px solid hsl(199 89% 48% / 0.2)" }}>
                      <p className="text-xs font-semibold text-foreground mb-1">Need Clarification?</p>
                      <a href="mailto:info@panyaglobal.in" className="text-xs font-medium text-secondary hover:underline">info@panyaglobal.in</a>
                    </div>
                  </div>
                </div>
              </motion.aside>

              {/* Main content */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex-1 min-w-0 space-y-8">

                {/* 1. Agreement */}
                <Card>
                  <SectionHeader id="agreement" icon="scroll" title="1. Agreement to Terms" color="hsl(213 55% 35%)" />
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    By accessing our website or availing any service of <strong className="text-foreground">Panya Global Relocation Pvt. Ltd.</strong> ("Company," "we," "our," or "us"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy, which is incorporated herein by reference.
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed mt-3">
                    If you are agreeing to these terms on behalf of an organisation, you represent that you have the authority to bind that organisation. These terms are subject to change; continued use of our services after any modification constitutes acceptance of the revised terms.
                  </p>
                  <div className="mt-4 p-4 rounded-xl flex gap-3 items-start" style={{ background: "hsl(199 89% 48% / 0.07)", border: "1px solid hsl(199 89% 48% / 0.2)" }}>
                    <span className="text-secondary flex-shrink-0 mt-0.5">{icons.scroll}</span>
                    <p className="text-sm text-muted-foreground"><strong className="text-foreground">Important:</strong> If you do not agree to these terms, please do not use our website or services. You may contact us for any clarification before engaging our services.</p>
                  </div>
                </Card>

                {/* 2. Services */}
                <Card>
                  <SectionHeader id="services" icon="truck" title="2. Our Services" color="hsl(199 89% 48%)" />
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">Panya Global Relocation provides professional packing, moving, and relocation services including but not limited to:</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { s: "Household Relocations", d: "Local, long-distance, and inter-city residential moves" },
                      { s: "Office Relocations", d: "Corporate and commercial space transitions" },
                      { s: "International Moving", d: "Global relocation with customs assistance" },
                      { s: "Packing & Unpacking", d: "Professional, material-grade packing services" },
                      { s: "Storage Solutions", d: "Secure short-term and long-term warehousing" },
                      { s: "Vehicle Transportation", d: "Car and two-wheeler transportation across India" },
                      { s: "Transit Insurance", d: "Comprehensive protection for goods in transit" },
                      { s: "Specialised Services", d: "Fine art, lab equipment, industrial relocation" },
                    ].map(({ s, d }) => (
                      <div key={s} className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40 border border-border">
                        <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-secondary/15 text-secondary flex items-center justify-center">{icons.check}</span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{s}</p>
                          <p className="text-xs text-muted-foreground">{d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* 3. Booking */}
                <Card>
                  <SectionHeader id="booking" icon="calendar" title="3. Booking & Quotations" color="hsl(38 92% 50%)" />
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">All quotations provided are <strong className="text-foreground">estimates</strong> based on the information you supply. Final charges may vary based on:</p>
                  <BulletList items={[
                    "Actual volume, weight, or number of items to be moved",
                    "Type and quantity of packing materials consumed",
                    "Distance, accessibility, and floor level at both locations",
                    "Additional services requested on the day of moving",
                    "Waiting time caused by delays at origin or destination",
                    "Toll, parking, or permit charges applicable to the route",
                  ]} />
                  <div className="mt-4 p-4 rounded-xl" style={{ background: "hsl(38 92% 50% / 0.07)", border: "1px solid hsl(38 92% 50% / 0.25)" }}>
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Booking Confirmation:</strong> A booking is confirmed <em>only</em> upon receipt of the agreed advance payment and signed / digital acceptance of the quotation. Verbal commitments do not constitute a confirmed booking.
                    </p>
                  </div>
                </Card>

                {/* 4. Customer Responsibilities */}
                <Card>
                  <SectionHeader id="responsibilities" icon="user" title="4. Customer Responsibilities" color="hsl(258 90% 66%)" />
                  <p className="text-muted-foreground text-sm leading-relaxed mb-3">By booking our services you confirm that you will:</p>
                  <BulletList items={[
                    "Provide complete and accurate information about the goods to be moved",
                    "Declare any hazardous, perishable, or high-value items before the move",
                    "Ensure adequate vehicle access and unobstructed entry at both locations",
                    "Be personally present or appoint an authorised representative on moving day",
                    "Obtain necessary permissions from housing societies, RWAs, or building management",
                    "Remove or transfer personal data from electronic devices before relocation",
                    "Settle all outstanding payments as per agreed schedule",
                  ]} />
                </Card>

                {/* 5. Prohibited Items */}
                <Card>
                  <SectionHeader id="prohibited" icon="alert" title="5. Prohibited Items" color="hsl(0 84% 60%)" />
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">For safety, legal, and operational reasons, we <strong className="text-foreground">do not transport</strong> the following items under any circumstances:</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {["Explosives, firearms & ammunition", "Illegal drugs & controlled substances", "Hazardous chemicals & flammables", "Perishable food & beverages", "Live plants & animals (unless pre-arranged)", "Cash, jewellery & negotiable instruments", "Confidential documents (carry personally)", "Items of illegal or disputed ownership"].map((item) => (
                      <div key={item} className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: "hsl(0 84% 60% / 0.06)", border: "1px solid hsl(0 84% 60% / 0.2)" }}>
                        <span className="flex-shrink-0 w-4 h-4 text-red-500">{icons.alert}</span>
                        <p className="text-sm text-muted-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 italic">Concealment of prohibited items may lead to immediate service termination without refund and may result in legal action.</p>
                </Card>

                {/* 6. Insurance & Liability */}
                <Card>
                  <SectionHeader id="insurance" icon="shield" title="6. Insurance & Liability" color="hsl(142 72% 42%)" />
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">We strongly recommend opting for transit insurance. Our liability framework is as follows:</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr style={{ background: "hsl(213 55% 23% / 0.06)" }}>
                          <th className="text-left p-3 font-semibold text-foreground border-b border-border">Scenario</th>
                          <th className="text-left p-3 font-semibold text-foreground border-b border-border">Coverage / Liability</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        {[
                          ["With Transit Insurance", "As per the selected insurance policy (IRDAI regulated)"],
                          ["Without Insurance", "Limited liability under the Carriers Act, 1865"],
                          ["Self-packed Items", "No liability for damage to customer-packed goods"],
                          ["Pre-existing Damage", "Not covered; inventory signed at time of packing is final record"],
                          ["Acts of God / Force Majeure", "No liability for damage beyond reasonable control"],
                        ].map(([scenario, coverage]) => (
                          <tr key={scenario} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="p-3 font-medium text-foreground">{scenario}</td>
                            <td className="p-3">{coverage}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">All claims must be reported in writing within <strong className="text-foreground">24 hours</strong> of delivery.</p>
                </Card>

                {/* 7. Payment Terms */}
                <Card>
                  <SectionHeader id="payment" icon="creditCard" title="7. Payment Terms" color="hsl(213 55% 35%)" />
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    {[
                      { title: "Advance Payment", desc: "Required to confirm your booking. Amount varies by service scope." },
                      { title: "Balance Payment", desc: "Due before or at the time of delivery. Goods released only after clearance." },
                      { title: "Accepted Modes", desc: "Cash, cheque, NEFT/RTGS, UPI, bank transfers, and select credit cards." },
                      { title: "GST", desc: "All prices are exclusive of GST. Applicable GST will be added to invoices." },
                    ].map(({ title, desc }) => (
                      <div key={title} className="p-4 rounded-xl bg-muted/40 border border-border">
                        <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground italic">Cheques are accepted subject to clearance. Any bank charges for dishonoured cheques are borne by the customer.</p>
                </Card>

                {/* 8. Cancellation Policy */}
                <Card>
                  <SectionHeader id="cancellation" icon="xCircle" title="8. Cancellation & Rescheduling Policy" color="hsl(0 84% 60%)" />
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">Our cancellation refund policy is based on notice given before the confirmed move date:</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr style={{ background: "hsl(213 55% 23% / 0.06)" }}>
                          <th className="text-left p-3 font-semibold text-foreground border-b border-border">Notice Period</th>
                          <th className="text-left p-3 font-semibold text-foreground border-b border-border">Refund on Advance</th>
                          <th className="text-left p-3 font-semibold text-foreground border-b border-border">Processing Time</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        {[
                          ["7+ days before move", "100% refund", "5–7 working days", "bg-green-50 text-green-700"],
                          ["3–7 days before move", "50% refund", "5–7 working days", "bg-yellow-50 text-yellow-700"],
                          ["Within 3 days", "No refund", "N/A", "bg-red-50 text-red-700"],
                          ["Day of move (no-show)", "No refund + mobilisation fee applicable", "N/A", "bg-red-50 text-red-700"],
                        ].map(([period, refund, time, cls]) => (
                          <tr key={period} className="border-b border-border">
                            <td className="p-3 font-medium text-foreground">{period}</td>
                            <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{refund}</span></td>
                            <td className="p-3 text-xs">{time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Rescheduling is subject to availability and may attract an administrative charge. Contact us at least 72 hours in advance to reschedule.</p>
                </Card>

                {/* 9. Claims */}
                <Card>
                  <SectionHeader id="claims" icon="messageCircle" title="9. Claims & Dispute Resolution" color="hsl(199 89% 48%)" />
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">Any claims for damage or loss during transit must follow this process:</p>
                  <ol className="space-y-3">
                    {[
                      { step: "Immediate Notation", desc: "Note any visible damage on the delivery receipt before signing." },
                      { step: "Written Report", desc: "Report damage in writing (email/WhatsApp) within 24 hours of delivery." },
                      { step: "Formal Submission", desc: "Submit formal claim with photographs and original packing list within 7 days." },
                      { step: "Inspection", desc: "Our team or insurance surveyor will inspect the damage within 7–10 working days." },
                      { step: "Resolution", desc: "Claim settled via replacement, repair, or compensation per policy terms." },
                    ].map(({ step, desc }, i) => (
                      <li key={step} className="flex gap-4 items-start">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">{i + 1}</div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{step}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <p className="text-sm text-muted-foreground mt-4">Disputes that cannot be resolved amicably will be subject to the exclusive jurisdiction of courts in <strong className="text-foreground">New Delhi, India</strong>.</p>
                </Card>

                {/* 10. Force Majeure */}
                <Card>
                  <SectionHeader id="force-majeure" icon="cloud" title="10. Force Majeure" color="hsl(213 55% 40%)" />
                  <p className="text-muted-foreground text-sm leading-relaxed">We shall not be liable for any delay or failure in performance resulting from circumstances beyond our reasonable control, including but not limited to:</p>
                  <BulletList items={[
                    "Natural disasters: earthquakes, floods, cyclones, landslides",
                    "Acts of war, terrorism, civil unrest, or strikes",
                    "Government-imposed restrictions, curfews, or lockdowns",
                    "Pandemics or epidemic declarations by government authorities",
                    "Disruptions to transportation infrastructure or fuel supply",
                  ]} />
                  <p className="text-muted-foreground text-sm leading-relaxed mt-3">In such events, we will notify you promptly and endeavour to reschedule at no additional cost.</p>
                </Card>

                {/* 11. Intellectual Property */}
                <Card>
                  <SectionHeader id="ip" icon="lock" title="11. Intellectual Property" color="hsl(258 90% 66%)" />
                  <p className="text-muted-foreground text-sm leading-relaxed">All content published on our website - including but not limited to logos, trademarks, service marks, text, graphics, images, video, software, and data compilations is the exclusive intellectual property of <strong className="text-foreground">Panya Global Relocation Pvt. Ltd.</strong></p>
                  <p className="text-muted-foreground text-sm leading-relaxed mt-3">You may not reproduce, distribute, modify, create derivative works, publicly display, or commercially exploit any content from our website without our prior written consent. The Panya Global name and logo are registered trademarks and may not be used without authorisation.</p>
                </Card>

                {/* 12. Modifications */}
                <Card>
                  <SectionHeader id="modifications" icon="edit" title="12. Modifications to These Terms" color="hsl(38 92% 50%)" />
                  <p className="text-muted-foreground text-sm leading-relaxed">We reserve the right to modify, amend, or replace any part of these Terms of Service at our sole discretion. When we make material changes, we will update the "Last Updated" date at the top and, where practicable, notify you via email or a prominent notice on our website.</p>
                  <p className="text-muted-foreground text-sm leading-relaxed mt-3">Your continued use of our services following the posting of revised terms constitutes your acceptance of those changes. We encourage you to review this page periodically.</p>
                </Card>

                {/* 13. Contact */}
                <Card>
                  <SectionHeader id="contact" icon="mail" title="13. Contact Information" color="hsl(199 89% 48%)" />
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">For questions about these Terms of Service, booking inquiries, or complaints, reach us through any of the following channels:</p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { icon: "mail", label: "Email", val: "info@panyaglobal.in", href: "mailto:info@panyaglobal.in" },
                      { icon: "phone", label: "Phone", val: "+91 11 42321118\n+91 8800446447", href: "tel:+911142321118" },
                      { icon: "mapPin", label: "Address", val: "18/1, Basement, Village Samalkha,\nOld Delhi-Gurgaon Road,\nNew Delhi – 110037", href: null },
                    ].map(({ icon, label, val, href }) => (
                      <div key={label} className={`group flex flex-col items-center text-center p-5 rounded-2xl border border-border bg-muted/30 ${href ? "hover:border-secondary/40 hover:shadow-md transition-all duration-200" : ""}`}>
                        <span className={`w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-3 ${href ? "group-hover:scale-110 transition-transform" : ""}`}>
                          {icons[icon]}
                        </span>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{label}</p>
                        {href ? (
                          <a href={href} className="text-sm font-semibold text-foreground whitespace-pre-line hover:text-secondary transition-colors">{val}</a>
                        ) : (
                          <p className="text-sm font-semibold text-foreground whitespace-pre-line leading-snug">{val}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <CityWiseLinks />
      <Footer />
    </div>
  );
};

export default TermsOfService;
