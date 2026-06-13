import { useEffect, useRef, useState } from "react";

interface CTAProps {
  variant?: "default" | "compact" | "floating" | "banner";
  heading?: string;
  subtext?: string;
  page?: string; // e.g. "delhi" | "gurgaon" | "noida" | "international" | "blog" | "home" | "corporate"
}

export default function CTASection({
  variant = "default",
  heading,
  subtext,
  page = "home",
}: CTAProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const pageHeadings: Record<string, string> = {
    home: "Move anywhere in India or worldwide with Panya Global",
    delhi: "Planning a move in Delhi? Get your free quote today",
    gurgaon: "Shifting in Gurgaon? Talk to our relocation experts",
    noida: "Moving in Noida? We cover every sector",
    international: "Relocating abroad from India? We handle it all",
    blog: "Ready to plan your move?",
    corporate: "Planning an office relocation in Delhi NCR?",
  };

  const pageSubtexts: Record<string, string> = {
    home: "16+ years | 9,600+ clients | 280+ cities | 24/7 support",
    delhi: "Panya Global has relocated 9,600+ families across Delhi NCR",
    gurgaon: "All DLF phases, Golf Course Road, Sohna Road and beyond",
    noida: "Sectors 1 to 168, Greater Noida, Noida Extension",
    international: "Door-to-door service across 280+ global destinations",
    blog: "Free, no-obligation quote from our relocation experts",
    corporate: "Dedicated coordinator - no business downtime guaranteed",
  };

  const h = heading ?? pageHeadings[page] ?? pageHeadings.home;
  const s = subtext ?? pageSubtexts[page] ?? pageSubtexts.home;

  function handleCopy() {
    navigator.clipboard.writeText("+91-11-41556447");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (variant === "compact")
    return (
      <CTACompact
        h={h}
        s={s}
        visible={visible}
        ref_={ref}
        copied={copied}
        onCopy={handleCopy}
      />
    );
  if (variant === "floating") return <CTAFloating />;
  if (variant === "banner") return <CTABanner h={h} />;
  return (
    <CTADefault
      h={h}
      s={s}
      visible={visible}
      ref_={ref}
      copied={copied}
      onCopy={handleCopy}
    />
  );
}

// ─── DEFAULT CTA ─────────────────────────────────────────────────────────────

function CTADefault({ h, s, visible, ref_, copied, onCopy }: any) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .pg-cta-root {
          position: relative;
          padding: 96px 24px;
          overflow: hidden;
          background: #fff;
          font-family: 'DM Sans', sans-serif;
        }

        /* Layered azure mesh background */
        .pg-cta-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 10% 50%, rgba(0,149,255,0.10) 0%, transparent 70%),
            radial-gradient(ellipse 60% 80% at 90% 20%, rgba(0,200,255,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 50% 100%, rgba(0,120,220,0.06) 0%, transparent 60%),
            #f8fbff;
          z-index: 0;
        }

        /* Geometric accent lines */
        .pg-cta-lines {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .pg-cta-lines::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 500px; height: 500px;
          border: 1px solid rgba(0,149,255,0.08);
          border-radius: 50%;
        }
        .pg-cta-lines::after {
          content: '';
          position: absolute;
          top: -40px; right: -40px;
          width: 340px; height: 340px;
          border: 1px solid rgba(0,149,255,0.12);
          border-radius: 50%;
        }

        .pg-cta-inner {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 48px;
        }
        @media (max-width: 768px) {
          .pg-cta-inner { grid-template-columns: 1fr; gap: 32px; }
          .pg-cta-root { padding: 72px 24px; }
        }

        /* Left content */
        .pg-cta-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #0095ff;
          margin-bottom: 18px;
        }
        .pg-cta-eyebrow-dot {
          width: 6px; height: 6px;
          background: #0095ff;
          border-radius: 50%;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
        }

        .pg-cta-heading {
          font-family: 'Syne', sans-serif;
          font-size: clamp(26px, 3.5vw, 40px);
          font-weight: 700;
          color: #0a1628;
          line-height: 1.2;
          margin: 0 0 14px;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .pg-cta-heading.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .pg-cta-sub {
          font-size: 15px;
          color: #4a6080;
          font-weight: 300;
          margin: 0;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s;
        }
        .pg-cta-sub.visible { opacity: 1; transform: translateY(0); }

        /* Stats strip */
        .pg-cta-stats {
          display: flex;
          gap: 28px;
          margin-top: 28px;
          flex-wrap: wrap;
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s;
        }
        .pg-cta-stats.visible { opacity: 1; transform: translateY(0); }
        .pg-stat {
          display: flex;
          flex-direction: column;
        }
        .pg-stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #0095ff;
          line-height: 1;
        }
        .pg-stat-label {
          font-size: 11px;
          color: #7a94b0;
          margin-top: 3px;
        }

        /* Right action panel */
        .pg-cta-panel {
          background: #0095ff;
          border-radius: 20px;
          padding: 36px 32px;
          min-width: 280px;
          box-shadow:
            0 0 0 1px rgba(0,149,255,0.3),
            0 24px 64px rgba(0,149,255,0.25),
            0 8px 24px rgba(0,0,0,0.08);
          opacity: 0;
          transform: translateX(24px) scale(0.97);
          transition: opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s;
          position: relative;
          overflow: hidden;
        }
        .pg-cta-panel::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 180px; height: 180px;
          background: rgba(255,255,255,0.06);
          border-radius: 50%;
        }
        .pg-cta-panel.visible { opacity: 1; transform: translateX(0) scale(1); }

        .pg-panel-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.65);
          margin-bottom: 8px;
        }
        .pg-panel-number {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: #fff;
          margin-bottom: 20px;
          letter-spacing: -0.02em;
        }
        .pg-panel-cta {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .pg-btn-call {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #fff;
          color: #0075cc;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 15px;
          padding: 14px 20px;
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
          width: 100%;
        }
        .pg-btn-call:hover {
          background: #f0f8ff;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }
        .pg-btn-call svg { flex-shrink: 0; }

        .pg-btn-copy {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.3);
          color: rgba(255,255,255,0.85);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
        }
        .pg-btn-copy:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.5);
        }

        .pg-panel-email {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.15);
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          text-align: center;
        }
        .pg-panel-email a {
          color: rgba(255,255,255,0.85);
          text-decoration: none;
          font-weight: 500;
        }
        .pg-panel-email a:hover { color: #fff; }

        /* Divider line above CTA */
        .pg-cta-divider {
          width: 64px;
          height: 2px;
          background: linear-gradient(to right, #0095ff, transparent);
          margin-bottom: 24px;
        }
      `}</style>

      <section ref={ref_} className="pg-cta-root" aria-label="Contact Panya Global">
        <div className="pg-cta-bg" />
        <div className="pg-cta-lines" />

        <div className="pg-cta-inner">
          <div>
            <div className="pg-cta-divider" />
            <div className="pg-cta-eyebrow">
              <span className="pg-cta-eyebrow-dot" />
              Free consultation
            </div>
            <h2 className={`pg-cta-heading${visible ? " visible" : ""}`}>{h}</h2>
            <p className={`pg-cta-sub${visible ? " visible" : ""}`}>{s}</p>

            <div className={`pg-cta-stats${visible ? " visible" : ""}`}>
              {[
                { num: "16+", label: "Years experience" },
                { num: "9,600+", label: "Happy clients" },
                { num: "280+", label: "Cities covered" },
                { num: "24/7", label: "Support" },
              ].map(stat => (
                <div key={stat.num} className="pg-stat">
                  <span className="pg-stat-num">{stat.num}</span>
                  <span className="pg-stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`pg-cta-panel${visible ? " visible" : ""}`}>
            <div className="pg-panel-label">Call us directly</div>
            <div className="pg-panel-number">+91-11-41556447</div>
            <div className="pg-panel-cta">
              <a href="tel:+911141556447" className="pg-btn-call">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.12 1.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                Call for free quote
              </a>
              <button className="pg-btn-copy" onClick={onCopy}>
                {copied ? (
                  <>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Number copied
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    Copy number
                  </>
                )}
              </button>
            </div>
            <div className="pg-panel-email">
              Or email us at{" "}
              <a href="mailto:info@panyaglobal.in">info@panyaglobal.in</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ─── COMPACT CTA (for blog posts, city pages sidebar) ────────────────────────

function CTACompact({ h, s, visible, ref_, copied, onCopy }: any) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .pg-compact {
          background: linear-gradient(135deg, #0075cc 0%, #00b4ff 100%);
          border-radius: 16px;
          padding: 32px 28px;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .pg-compact.visible { opacity: 1; transform: translateY(0); }
        .pg-compact::before {
          content: '';
          position: absolute;
          top: -40px; right: -40px;
          width: 160px; height: 160px;
          background: rgba(255,255,255,0.07);
          border-radius: 50%;
          pointer-events: none;
        }
        .pg-compact-badge {
          display: inline-block;
          background: rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.9);
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 100px;
          margin-bottom: 14px;
        }
        .pg-compact h3 {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 8px;
          line-height: 1.3;
        }
        .pg-compact p {
          font-size: 13px;
          color: rgba(255,255,255,0.75);
          margin: 0 0 20px;
          font-weight: 300;
        }
        .pg-compact-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          background: #fff;
          color: #0075cc;
          font-weight: 600;
          font-size: 14px;
          padding: 12px 18px;
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
          border: none;
          width: 100%;
        }
        .pg-compact-btn:hover {
          background: #f0f8ff;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .pg-compact-copy {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.25);
          color: rgba(255,255,255,0.9);
          font-size: 12px;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          margin-top: 10px;
        }
        .pg-compact-copy:hover {
          background: rgba(255,255,255,0.1);
        }
      `}</style>
      <div ref={ref_} className={`pg-compact${visible ? " visible" : ""}`}>
        <div className="pg-compact-badge">Consultation</div>
        <h3>{h}</h3>
        <p>{s}</p>
        <a href="tel:+911141556447" className="pg-compact-btn">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.12 1.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
          </svg>
          Call +91-11-41556447
        </a>
        <button className="pg-compact-copy" onClick={onCopy}>
          {copied ? "Number copied!" : "Copy phone number"}
        </button>
      </div>
    </>
  );
}

// ─── FLOATING CTA ────────────────────────────────────────────────────────────

function CTAFloating() {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <a
        href="tel:+911141556447"
        className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-2xl hover:bg-blue-400 transition-all hover:scale-105"
        aria-label="Call Panya Global"
      >
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.12 1.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
        </svg>
      </a>
    </div>
  );
}

// ─── BANNER CTA ──────────────────────────────────────────────────────────────

function CTABanner({ h }: any) {
  return (
    <div className="w-full bg-[#0075cc] text-white py-6 px-4 text-center">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="font-bold text-lg">{h}</h3>
        <a
          href="tel:+911141556447"
          className="px-6 py-3 rounded-xl bg-white text-blue-600 font-bold text-sm hover:bg-blue-50 transition"
        >
          Call +91-11-41556447
        </a>
      </div>
    </div>
  );
}
