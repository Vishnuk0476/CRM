import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";

// ─── Icons (inline SVG to avoid extra deps) ─────────────────────────────────
const icons: Record<string, JSX.Element> = {
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  database: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  share: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  cookie: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" /><path d="M8.5 8.5v.01" /><path d="M16 15.5v.01" /><path d="M12 12v.01" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.37 19.79 19.79 0 0 1 1.61 2.74 2 2 0 0 1 3.59.73h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 6.29 6.29l1.62-1.62a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  mapPin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

// ─── Section data ─────────────────────────────────────────────────────────────
const sections = [
  { id: "introduction",     label: "Introduction",           icon: "shield" },
  { id: "information",      label: "Information We Collect", icon: "database" },
  { id: "usage",            label: "How We Use Your Data",   icon: "eye" },
  { id: "sharing",          label: "Information Sharing",    icon: "share" },
  { id: "security",         label: "Data Security",          icon: "lock" },
  { id: "rights",           label: "Your Rights",            icon: "user" },
  { id: "cookies",          label: "Cookies",                icon: "cookie" },
  { id: "third-party",      label: "Third-Party Links",      icon: "link" },
  { id: "changes",          label: "Policy Changes",         icon: "refresh" },
  { id: "contact",          label: "Contact Us",             icon: "mail" },
];

// ─── Small reusable components ────────────────────────────────────────────────
const SectionHeader = ({
  id,
  icon,
  title,
  color,
}: {
  id: string;
  icon: string;
  title: string;
  color: string;
}) => (
  <div id={id} className="flex items-center gap-3 mb-5 scroll-mt-28">
    <div
      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
      style={{ background: color + "20", color }}
    >
      {icons[icon]}
    </div>
    <h2 className="text-xl md:text-2xl font-bold text-foreground font-heading m-0">
      {title}
    </h2>
  </div>
);

const BulletList = ({ items }: { items: string[] }) => (
  <ul className="space-y-2 mt-3">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-2.5 text-muted-foreground text-sm leading-relaxed">
        <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-secondary/15 text-secondary flex items-center justify-center">
          {icons.check}
        </span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card border border-border rounded-2xl p-6 shadow-sm ${className}`}>
    {children}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState("introduction");

  // Highlight active section in TOC on scroll
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
          {/* Decorative blobs */}
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-10"
            style={{ background: "hsl(199 89% 48%)", filter: "blur(80px)" }} />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full opacity-10"
            style={{ background: "hsl(199 89% 48%)", filter: "blur(100px)" }} />

          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              {/* Badge */}
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
                style={{ background: "hsl(199 89% 48% / 0.2)", color: "hsl(199 89% 75%)", border: "1px solid hsl(199 89% 48% / 0.3)" }}>
                {icons.shield}
                Your Privacy Matters
              </span>

              <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
                Privacy{" "}
                <span style={{ color: "hsl(199 89% 60%)" }}>Policy</span>
              </h1>
              <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto mb-8">
                Panya Global Relocation Pvt. Ltd. is committed to protecting your personal information. Read how we collect, use, and safeguard your data.
              </p>

              {/* Meta strip */}
              <div className="inline-flex flex-wrap justify-center gap-6 px-6 py-3 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <div className="text-center">
                  <p className="text-white/40 text-xs uppercase tracking-wider">Effective Date</p>
                  <p className="text-white font-semibold text-sm">January 1, 2024</p>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <p className="text-white/40 text-xs uppercase tracking-wider">Last Updated</p>
                  <p className="text-white font-semibold text-sm">February 27, 2025</p>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <p className="text-white/40 text-xs uppercase tracking-wider">Jurisdiction</p>
                  <p className="text-white font-semibold text-sm">India (IT Act, 2000)</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Body: TOC Sidebar + Content ── */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-10 max-w-7xl mx-auto">

              {/* ── Left: Sticky Table of Contents ── */}
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0"
              >
                <div className="sticky top-28">
                  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                      Table of Contents
                    </p>
                    <nav className="space-y-1">
                      {sections.map(({ id, label, icon }) => (
                        <button
                          key={id}
                          onClick={() => scrollTo(id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                            activeSection === id
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <span className="w-4 h-4 flex-shrink-0 opacity-70">
                            {icons[icon]}
                          </span>
                          {label}
                        </button>
                      ))}
                    </nav>

                    {/* Quick contact */}
                    <div className="mt-6 p-4 rounded-xl" style={{ background: "hsl(199 89% 48% / 0.08)", border: "1px solid hsl(199 89% 48% / 0.2)" }}>
                      <p className="text-xs font-semibold text-foreground mb-1">Questions?</p>
                      <p className="text-xs text-muted-foreground mb-3">Reach our Privacy Officer</p>
                      <a href="mailto:info@panyaglobal.in"
                        className="block text-xs font-medium text-secondary hover:underline break-all">
                        info@panyaglobal.in
                      </a>
                    </div>
                  </div>
                </div>
              </motion.aside>

              {/* ── Right: Main content ── */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex-1 min-w-0 space-y-8"
              >

                {/* 1. Introduction */}
                <Card>
                  <SectionHeader id="introduction" icon="shield" title="1. Introduction" color="hsl(213 55% 35%)" />
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    <strong className="text-foreground">Panya Global Relocation Pvt. Ltd.</strong> ("we," "our," or "us") is committed to protecting your privacy in accordance with the <em>Information Technology Act, 2000</em> and the <em>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</em>.
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed mt-3">
                    This Privacy Policy describes how we collect, use, store, share, and protect personal information you provide when you visit <strong className="text-foreground">www.panyaglobalmovers.com</strong> or engage our relocation services. By accessing our website or availing our services, you expressly consent to the terms of this Policy.
                  </p>
                  <div className="mt-4 p-4 rounded-xl flex gap-3 items-start"
                    style={{ background: "hsl(199 89% 48% / 0.07)", border: "1px solid hsl(199 89% 48% / 0.2)" }}>
                    <span className="text-secondary flex-shrink-0 mt-0.5">{icons.shield}</span>
                    <p className="text-sm text-muted-foreground">
                      If you do not agree with this Policy, please do not use our website or services. Your continued use constitutes acceptance of the most recent version of this Policy.
                    </p>
                  </div>
                </Card>

                {/* 2. Information We Collect */}
                <Card>
                  <SectionHeader id="information" icon="database" title="2. Information We Collect" color="hsl(199 89% 48%)" />
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    We collect information in the following categories:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                      <h3 className="font-semibold text-foreground text-sm mb-2 font-heading">Personal / Identity Data</h3>
                      <BulletList items={[
                        "Full name and title",
                        "Email address and phone number",
                        "Home / office address",
                        "Origin and destination of relocation",
                        "Inventory details of goods to be moved",
                        "Government-issued ID (where required by law)",
                      ]} />
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                      <h3 className="font-semibold text-foreground text-sm mb-2 font-heading">Technical / Usage Data</h3>
                      <BulletList items={[
                        "IP address and browser type",
                        "Device type, OS, and screen resolution",
                        "Pages visited and session duration",
                        "Referring website / search engine",
                        "Click-stream and interaction data",
                        "Cookie and tracking identifiers",
                      ]} />
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                      <h3 className="font-semibold text-foreground text-sm mb-2 font-heading">Financial Data</h3>
                      <BulletList items={[
                        "Payment method details (processed securely)",
                        "Transaction references and amounts",
                        "Billing address",
                      ]} />
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                      <h3 className="font-semibold text-foreground text-sm mb-2 font-heading">Communication Data</h3>
                      <BulletList items={[
                        "Inquiry and quote request details",
                        "Feedback and reviews submitted",
                        "Support and complaint correspondence",
                        "Survey responses",
                      ]} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 italic">
                    * We do not collect Sensitive Personal Data such as biometrics, medical records, or financial account passwords unless explicitly required and separately consented to.
                  </p>
                </Card>

                {/* 3. How We Use Your Information */}
                <Card>
                  <SectionHeader id="usage" icon="eye" title="3. How We Use Your Information" color="hsl(213 55% 45%)" />
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    We process your personal data only for lawful purposes and only as much as is necessary:
                  </p>
                  <div className="space-y-3">
                    {[
                      { purpose: "Service Delivery", desc: "Providing relocation quotations, processing bookings, coordinating packing and moving operations." },
                      { purpose: "Customer Communication", desc: "Sending booking confirmations, service updates, invoices, and responding to inquiries." },
                      { purpose: "Legal Compliance", desc: "Meeting obligations under the IT Act, GST regulations, and any applicable court or regulatory orders." },
                      { purpose: "Service Improvement", desc: "Analysing usage data to improve our website, service quality, and customer experience." },
                      { purpose: "Marketing (with consent)", desc: "Sending promotional offers or newsletters only where you have explicitly opted in. You may opt out at any time." },
                      { purpose: "Fraud Prevention", desc: "Detecting, investigating, and preventing fraudulent transactions or misuse of our services." },
                    ].map(({ purpose, desc }) => (
                      <div key={purpose} className="flex gap-3 items-start p-3 rounded-xl hover:bg-muted/40 transition-colors">
                        <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-secondary/15 text-secondary flex items-center justify-center">
                          {icons.check}
                        </span>
                        <div>
                          <span className="text-sm font-semibold text-foreground">{purpose}: </span>
                          <span className="text-sm text-muted-foreground">{desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* 4. Information Sharing */}
                <Card>
                  <SectionHeader id="sharing" icon="share" title="4. Information Sharing & Disclosure" color="hsl(38 92% 50%)" />
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    We do <strong className="text-foreground">not sell</strong> your personal information. We may share it only in the following limited circumstances:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr style={{ background: "hsl(213 55% 23% / 0.06)" }}>
                          <th className="text-left p-3 font-semibold text-foreground border-b border-border">Recipient</th>
                          <th className="text-left p-3 font-semibold text-foreground border-b border-border">Purpose</th>
                          <th className="text-left p-3 font-semibold text-foreground border-b border-border">Safeguard</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        {[
                          ["Logistics & Packing Partners", "Coordinate your move", "Bound by confidentiality agreements"],
                          ["Transit Insurance Providers", "Process insurance claims", "Regulated by IRDAI"],
                          ["Payment Gateways", "Process payments", "PCI-DSS compliant processors"],
                          ["Government / Law Enforcement", "Legal compliance", "Only upon valid legal order"],
                          ["IT & Cloud Service Providers", "Website hosting & analytics", "Data processing agreements in place"],
                        ].map(([recipient, purpose, safeguard]) => (
                          <tr key={recipient} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="p-3 font-medium text-foreground">{recipient}</td>
                            <td className="p-3">{purpose}</td>
                            <td className="p-3 text-xs">{safeguard}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* 5. Data Security */}
                <Card>
                  <SectionHeader id="security" icon="lock" title="5. Data Security" color="hsl(142 72% 42%)" />
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    We implement industry-standard technical and organisational security measures to protect your personal data:
                  </p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { title: "SSL / TLS Encryption", desc: "All data in transit is encrypted using 256-bit SSL." },
                      { title: "Access Controls", desc: "Role-based access; only authorised staff can access personal data." },
                      { title: "Secure Servers", desc: "Data stored on secure, firewalled servers with regular patching." },
                      { title: "Data Minimisation", desc: "We collect only what is strictly necessary for the stated purpose." },
                      { title: "Retention Limits", desc: "Data deleted or anonymised after the retention period expires." },
                      { title: "Vendor Vetting", desc: "Third-party processors are assessed for security compliance." },
                    ].map(({ title, desc }) => (
                      <div key={title} className="p-4 rounded-xl border border-border bg-muted/30">
                        <p className="font-semibold text-foreground text-sm mb-1">{title}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 rounded-xl flex gap-3 items-start"
                    style={{ background: "hsl(38 92% 50% / 0.07)", border: "1px solid hsl(38 92% 50% / 0.25)" }}>
                    <span className="text-yellow-500 flex-shrink-0 mt-0.5">{icons.lock}</span>
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Disclaimer:</strong> While we take every reasonable precaution, no method of electronic transmission or storage is 100% secure. In the event of a data breach involving your personal data, we will notify you as required by applicable law.
                    </p>
                  </div>
                </Card>

                {/* 6. Your Rights */}
                <Card>
                  <SectionHeader id="rights" icon="user" title="6. Your Rights" color="hsl(258 90% 66%)" />
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    Under applicable Indian law and global best practices, you have the following rights with respect to your personal data:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { right: "Right to Access", desc: "Request a copy of the personal data we hold about you." },
                      { right: "Right to Rectification", desc: "Request correction of inaccurate or incomplete personal data." },
                      { right: "Right to Erasure", desc: "Request deletion of your data where no longer necessary or lawfully required." },
                      { right: "Right to Portability", desc: "Obtain your data in a structured, machine-readable format." },
                      { right: "Right to Withdraw Consent", desc: "Withdraw marketing consent at any time without affecting prior processing." },
                      { right: "Right to Grievance", desc: "Lodge a complaint with our Grievance Officer or the relevant authority." },
                    ].map(({ right, desc }) => (
                      <div key={right} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                        <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                          {icons.check}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{right}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    To exercise any of the above rights, please write to us at <a href="mailto:info@panyaglobal.in" className="text-secondary hover:underline">info@panyaglobal.in</a>. We endeavour to respond within <strong className="text-foreground">30 days</strong>. Some requests may require identity verification.
                  </p>
                </Card>

                {/* 7. Cookies */}
                <Card>
                  <SectionHeader id="cookies" icon="cookie" title="7. Cookies & Tracking Technologies" color="hsl(25 95% 53%)" />
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    We use cookies and similar technologies to enhance your browsing experience and gather analytics data:
                  </p>
                  <div className="space-y-3">
                    {[
                      { type: "Strictly Necessary", desc: "Required for core functionality such as session management. Cannot be disabled.", badge: "Required" },
                      { type: "Analytics / Performance", desc: "Help us understand how visitors interact with our website (e.g., Google Analytics).", badge: "Optional" },
                      { type: "Functional", desc: "Remember your preferences (e.g., form fields, language settings).", badge: "Optional" },
                      { type: "Marketing / Targeting", desc: "Used to display relevant ads and track campaign effectiveness.", badge: "Optional" },
                    ].map(({ type, desc, badge }) => (
                      <div key={type} className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-foreground">{type}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge === "Required" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                              {badge}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    You can control cookie settings through your browser's preferences. Disabling optional cookies will not affect your ability to use our core services.
                  </p>
                </Card>

                {/* 8. Third-Party Links */}
                <Card>
                  <SectionHeader id="third-party" icon="link" title="8. Third-Party Links" color="hsl(199 89% 48%)" />
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Our website may contain links to external websites, social media platforms, or partner portals. Once you leave our website, we have no control over the privacy practices of those third parties. We are <strong className="text-foreground">not responsible</strong> for the content or privacy policies of external sites.
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed mt-3">
                    We recommend reviewing the privacy policy of any third-party website you visit. Links to external sites do not imply our endorsement of their products, services, or privacy practices.
                  </p>
                </Card>

                {/* 9. Policy Changes */}
                <Card>
                  <SectionHeader id="changes" icon="refresh" title="9. Changes to This Policy" color="hsl(213 55% 23%)" />
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    We reserve the right to update or modify this Privacy Policy at any time to reflect changes in our practices, legal requirements, or other operational reasons. When we make material changes, we will:
                  </p>
                  <BulletList items={[
                    "Update the \"Last Updated\" date at the top of this page",
                    "Post a prominent notice on our website homepage",
                    "Where feasible, notify registered users by email",
                    "Obtain fresh consent where required by law",
                  ]} />
                  <p className="text-muted-foreground text-sm leading-relaxed mt-4">
                    Your continued use of our website or services after the effective date of any changes constitutes your acceptance of the revised Policy. If you disagree with the changes, you should discontinue use of our services.
                  </p>
                </Card>

                {/* 10. Contact */}
                <Card>
                  <SectionHeader id="contact" icon="mail" title="10. Contact & Grievance Officer" color="hsl(199 89% 48%)" />
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    For any questions, concerns, or requests regarding this Privacy Policy or the handling of your personal data, please contact our Privacy / Grievance Officer:
                  </p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <a href="mailto:info@panyaglobal.in"
                      className="group flex flex-col items-center text-center p-5 rounded-2xl border border-border hover:border-secondary/40 hover:shadow-md transition-all duration-200 bg-muted/30">
                      <span className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        {icons.mail}
                      </span>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Email</p>
                      <p className="text-sm font-semibold text-foreground break-all">info@panyaglobal.in</p>
                    </a>
                    <a href="tel:+911142321118"
                      className="group flex flex-col items-center text-center p-5 rounded-2xl border border-border hover:border-secondary/40 hover:shadow-md transition-all duration-200 bg-muted/30">
                      <span className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        {icons.phone}
                      </span>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Phone</p>
                      <p className="text-sm font-semibold text-foreground">+91 11 42321118</p>
                      <p className="text-xs text-muted-foreground">+91 8800446447</p>
                    </a>
                    <div className="flex flex-col items-center text-center p-5 rounded-2xl border border-border bg-muted/30">
                      <span className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-3">
                        {icons.mapPin}
                      </span>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Address</p>
                      <p className="text-sm font-semibold text-foreground leading-snug">
                        18/1, Basement, Village Samalkha,<br />
                        Old Delhi-Gurgaon Road,<br />
                        New Delhi – 110037
                      </p>
                    </div>
                  </div>

                  {/* Grievance notice */}
                  <div className="mt-6 p-4 rounded-xl flex gap-3 items-start"
                    style={{ background: "hsl(213 55% 23% / 0.05)", border: "1px solid hsl(213 55% 23% / 0.12)" }}>
                    <span className="text-primary flex-shrink-0 mt-0.5">{icons.shield}</span>
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Grievance Redressal:</strong> As per the IT Rules, 2011, our Grievance Officer will acknowledge your complaint within <strong className="text-foreground">48 hours</strong> and resolve it within <strong className="text-foreground">30 days</strong> of receipt.
                    </p>
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

export default PrivacyPolicy;
