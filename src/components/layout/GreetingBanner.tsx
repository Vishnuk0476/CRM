import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Users, Calendar } from 'lucide-react';
import { useVisitorTracking, getGreetingMessage } from '@/hooks/useVisitorTracking';
import { Button } from '@/components/ui/button';

const GreetingBanner = () => {
  const visitorData = useVisitorTracking();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Delay mount to prevent blocking initial paint
  useEffect(() => {
    // Only mount after initial page load
    const mountTimer = setTimeout(() => {
      setIsMounted(true);
    }, 2000); // Delay by 2 seconds to not block LCP
    
    return () => clearTimeout(mountTimer);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    // Show greeting after user has scrolled a bit (better UX + performance)
    const handleScroll = () => {
      if (window.scrollY > 300 && !isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Fallback: show after 30 seconds if user hasn't scrolled
    const timer = setTimeout(() => {
      if (!isDismissed && window.scrollY <= 300) {
        setIsVisible(true);
      }
    }, 30000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [isDismissed, isMounted]);

  // Reset dismissed state when component mounts to ensure greeting shows
  useEffect(() => {
    setIsDismissed(false);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    // Store dismissal in localStorage so it doesn't show again for this session
    localStorage.setItem('panya_greeting_dismissed', 'true');
  };

  const handleGetQuote = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('panya_greeting_dismissed', 'true');
    window.location.href = '/quote';
  };

  // Don't render if not mounted or already dismissed
  if (!isMounted || isDismissed || localStorage.getItem('panya_greeting_dismissed') === 'true') {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed bottom-28 left-4 right-4 md:left-6 md:right-auto md:w-[420px] z-40"
        >
          {/* Mobile-optimized: reduced backdrop blur for performance */}
          <div className="bg-gradient-to-r from-primary/95 to-secondary/95 md:backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl overflow-hidden">
            {/* Decorative Header */}
            <div className="bg-gradient-to-r from-primary to-secondary px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
                <span className="text-white font-semibold text-sm">Welcome Message</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-xs">
                <Users className="w-3 h-3" />
                <span>Visit #{visitorData.visitCount}</span>
                {visitorData.lastVisit && (
                  <>
                    <Calendar className="w-3 h-3" />
                    <span>Last: {new Date(visitorData.lastVisit).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-white text-lg font-medium mb-2">
                    {getGreetingMessage(visitorData)}
                  </p>
                  
                  {/* Personalized stats for returning visitors */}
                  {!visitorData.isFirstVisit && (
                    <div className="flex items-center gap-4 text-white/80 text-sm mb-4">
                      <span>✅ Trusted by {visitorData.visitCount} visits</span>
                      <span>📅 Member since {new Date(visitorData.lastVisit || '').getFullYear()}</span>
                    </div>
                  )}

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handleGetQuote}
                      className="bg-white text-primary hover:scale-105 transition-transform shadow-lg"
                    >
                      Get Your Free Quote →
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsVisible(false);
                        setIsDismissed(true);
                        localStorage.setItem('panya_greeting_dismissed', 'true');
                      }}
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      Maybe Later
                    </Button>
                  </div>
                </div>

                {/* Decorative Element - Hidden on mobile for performance */}
                <div className="hidden md:block">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center"
                    >
                      <span className="text-primary font-bold text-lg">🚀</span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GreetingBanner;
