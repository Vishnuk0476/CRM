import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, ChevronRight } from "lucide-react";
import ifcciLogo from "@/assets/clients/Ifcci.webp";

// ─── Typing animation phrases ─────────────────────────────────────────────────
const PHRASES = [
  "Proud Member of IFCCI",
  "Indo-French Chamber of Commerce & Industry",
  "Strengthening Indo-French Business Relations",
];

const TYPING_SPEED = 55; // ms per character
const ERASING_SPEED = 30;
const PAUSE_AFTER_TYPE = 3000;
const PAUSE_AFTER_ERASE = 600;

// ─── Component ────────────────────────────────────────────────────────────────
const IFCCIMembershipBanner = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [displayText, setDisplayText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check screen size - only show on desktop (md: 768px+)
  useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Delay initial render
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-collapse after 15 seconds
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => setIsExpanded(false), 15000);
    return () => clearTimeout(timer);
  }, [isVisible]);

  // Typing effect
  useEffect(() => {
    if (!isVisible) return;

    const currentPhrase = PHRASES[phraseIndex];
    let charIndex = 0;
    let isErasing = false;

    const tick = () => {
      if (!isErasing) {
        // Typing
        charIndex++;
        setDisplayText(currentPhrase.slice(0, charIndex));
        if (charIndex === currentPhrase.length) {
          // Done typing — pause, then erase
          timeoutRef.current = setTimeout(() => {
            isErasing = true;
            if (isExpanded) tick();
          }, PAUSE_AFTER_TYPE);
          return;
        }
        if (isExpanded) timeoutRef.current = setTimeout(tick, TYPING_SPEED);
      } else {
        // Erasing
        charIndex--;
        setDisplayText(currentPhrase.slice(0, charIndex));
        if (charIndex === 0) {
          // Done erasing — move to next phrase
          timeoutRef.current = setTimeout(() => {
            setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
          }, PAUSE_AFTER_ERASE);
          return;
        }
        if (isExpanded) timeoutRef.current = setTimeout(tick, ERASING_SPEED);
      }
    };

    if (isExpanded) tick();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [phraseIndex, isVisible]);

  // Only render on desktop screens
  if (!isVisible || !isDesktop) return null;

  return (
    <AnimatePresence>
      {isExpanded ? (
        /* ── Expanded Card ── */
        <motion.div
          key="expanded"
          initial={{ opacity: 0, x: -60, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -40, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-6 z-60 max-w-[340px] cursor-pointer select-none sm:left-6"
          onClick={() => setIsExpanded(false)}
          role="banner"
          aria-label="IFCCI Membership Announcement"
        >
          {/* Glassmorphism container with gradient border */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1B3A6B] via-[#E63946] to-[#1B3A6B] p-[1.5px]">
              <div className="w-full h-full rounded-2xl bg-slate-900/95 backdrop-blur-xl" />
            </div>

            <div className="relative p-4 sm:p-5">
              {/* Top badge */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30">
                  <Award className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                    Member
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-1 text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors">
                  <span>close</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>

              {/* Logo + Content */}
              <div className="flex items-center gap-3.5">
                {/* IFCCI Logo */}
                <motion.div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white p-1.5 shadow-lg flex-shrink-0 border border-slate-200/20"
                  animate={{ 
                    boxShadow: [
                      "0 0 0px rgba(230, 57, 70, 0)",
                      "0 0 20px rgba(230, 57, 70, 0.2)",
                      "0 0 0px rgba(230, 57, 70, 0)",
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img 
                    src={ifcciLogo}
                    alt="IFCCI - Indo-French Chamber of Commerce"
                    className="w-full h-full object-contain rounded-lg"
                    loading="lazy"
                  decoding="async" />
                </motion.div>

                {/* Text content */}
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-400 font-medium mb-1 tracking-wide">
                    We are honoured to announce
                  </p>
                  {/* Typing text area */}
                  <div className="min-h-[2.5rem] flex items-start">
                    <p className="text-sm sm:text-[15px] font-bold leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                      {displayText}
                      <motion.span
                        className="inline-block w-[2px] h-4 bg-amber-400 ml-0.5 align-middle"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                      />
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom shimmer bar */}
              <div className="mt-3 h-[2px] rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  className="h-full w-1/3 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"
                  animate={{ x: ["-100%", "400%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        /* ── Collapsed Badge - Mobile Optimized ── */
        <motion.button
          key="collapsed"
          initial={{ opacity: 0, scale: 0.5, x: -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-6 left-4 z-60 group sm:left-6"
          aria-label="Show IFCCI Membership"
          title="Proud Member of IFCCI"
        >
          <div className="relative">
            {/* Pulse ring - more visible on mobile */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1B3A6B] to-[#E63946]"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Badge body - larger on mobile */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1.5 shadow-xl border border-slate-200/30 group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
              <img 
                src={ifcciLogo}
                alt="IFCCI Member"
                className="w-full h-full object-contain rounded-lg"
                loading="lazy"
              decoding="async" />
            </div>
            {/* Label visible on mobile without hover */}
            <motion.div
              className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none hidden sm:block"
              initial={{ opacity: 0, x: -8 }}
              whileHover={{ opacity: 1, x: 0 }}
            >
              <div className="bg-slate-900/95 backdrop-blur-sm text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg shadow-lg border border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                IFCCI Member ✦
              </div>
            </motion.div>
            {/* Mobile-only always-visible label */}
            <div className="sm:hidden absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/95 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded shadow-lg border border-slate-700/50">
              IFCCI Member
            </div>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default IFCCIMembershipBanner;
