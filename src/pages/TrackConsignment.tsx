import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Package, Truck, MapPin, CheckCircle, Clock,
  ArrowRight, Info, RefreshCw
} from "lucide-react";
import { parse, parseISO, format as formatDF, isValid } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";

// ─── Types ────────────────────────────────────────────────────
interface TrackingStep {
  status: string;
  location: string;
  date: string;
  time: string;
  note?: string;
  completed: boolean;
}

interface TrackingResult {
  multiple: boolean;
  consignmentNo: string;
  lrNumber?: string;
  awbNumber?: string;
  status: string;
  statusRaw: string;
  origin: string;
  destination: string;
  serviceType: string;
  customerName: string;
  estimatedDelivery: string;
  steps: TrackingStep[];
  bookedOn: string;
}

// ─── Config ───────────────────────────────────────────────────
type SearchTypeId = "lr" | "awb";

const SEARCH_TYPES: { id: SearchTypeId; label: string; icon: React.ElementType; placeholder: string; hint: string }[] = [
  {
    id: "lr",
    label: "LR Number",
    icon: Package,
    placeholder: "Enter your LR Number…",
    hint: "Lorry Receipt number assigned by Panya on dispatch",
  },
  {
    id: "awb",
    label: "AWB Number",
    icon: Truck,
    placeholder: "Enter your AWB Number…",
    hint: "Air Waybill for international or air freight shipments",
  },
];

const STATUS_PROGRESSION = ["booked", "picked_up", "in_transit", "out_for_delivery", "delivered"];

const STATUS_CONFIG: Record<string, { color: string; bg: string; ring: string; label: string }> = {
  booked:           { color: "text-blue-400",   bg: "bg-blue-500",   ring: "ring-blue-400/30",   label: "Booking Confirmed" },
  picked_up:        { color: "text-purple-400", bg: "bg-purple-500", ring: "ring-purple-400/30", label: "Picked Up" },
  in_transit:       { color: "text-orange-400", bg: "bg-orange-500", ring: "ring-orange-400/30", label: "In Transit" },
  out_for_delivery: { color: "text-yellow-400", bg: "bg-yellow-500", ring: "ring-yellow-400/30", label: "Out for Delivery" },
  delivered:        { color: "text-green-400",  bg: "bg-green-500",  ring: "ring-green-400/30",  label: "Delivered" },
  cancelled:        { color: "text-red-400",    bg: "bg-red-500",    ring: "ring-red-400/30",    label: "Cancelled" },
};

// ─── Component ────────────────────────────────────────────────
const TrackConsignment = () => {
  const [activeType, setActiveType] = useState<SearchTypeId>("lr");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading]     = useState(false);
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const currentType = SEARCH_TYPES.find(t => t.id === activeType)!;

  useEffect(() => {
    // AOS removed
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) setSearchQuery(q);
    const type = params.get("type") as SearchTypeId;
    if (type === "lr" || type === "awb") setActiveType(type);
  }, []);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.warning("Empty Search", {
        description: `Please enter a ${currentType.label} to track your shipment.`,
      });
      return;
    }

    setIsLoading(true);
    setTrackingResult(null);
    setNotFound(false);

    try {
      const url = `/api/consignments/track.php?type=${activeType}&q=${encodeURIComponent(searchQuery.trim())}`;
      const res  = await fetch(url, { headers: { Accept: "application/json" } });
      const data = await res.json();

      if (data.success && data.data) {
        setTrackingResult(data.data);
        setLastFetched(new Date());
      } else {
        setNotFound(true);
        toast.error("Not Found", {
          description: data.error || "No shipment found. Please verify the number and try again.",
        });
      }
    } catch {
      setNotFound(true);
      toast.error("Connection Error", {
        description: "Failed to connect to the tracking server. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string): string => {
    try {
      let date = parseISO(dateStr);
      if (!isValid(date)) {
        date = parse(dateStr, "MMM dd, yyyy", new Date());
      }
      if (isValid(date)) {
        return formatDF(date, "dd MMM yyyy");
      }
      return dateStr;
    } catch { return dateStr; }
  };

  const progressIndex = (statusRaw: string) => STATUS_PROGRESSION.indexOf(statusRaw);

  // Re-fetch tracking data without clearing the form
  const handleRefresh = async () => {
    if (!searchQuery.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const url = `/api/consignments/track.php?type=${activeType}&q=${encodeURIComponent(searchQuery.trim())}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      const data = await res.json();
      if (data.success && data.data) {
        setTrackingResult(data.data);
        setLastFetched(new Date());
      }
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section className="pt-24 sm:pt-32 pb-16 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-40" />
          {/* decorative blobs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10 max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-primary-foreground text-xs font-semibold mb-5 tracking-widest uppercase backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                Live Shipment Tracking
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-4 leading-tight">
                Track Your <span className="text-secondary">Consignment</span>
              </h1>
              <p className="text-primary-foreground/75 text-base sm:text-lg max-w-xl mx-auto">
                Enter your <strong className="text-primary-foreground">LR Number</strong> or <strong className="text-primary-foreground">AWB Number</strong> to get real-time shipment updates.
              </p>
            </motion.div>

            {/* ── Inline Search Card ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-10"
            >
              <form onSubmit={handleTrack}>
                <div className="bg-card/95 backdrop-blur-md border border-border/60 rounded-2xl p-5 sm:p-7 shadow-2xl text-left">

                  {/* Toggle Tabs */}
                  <div className="flex gap-2 mb-5 p-1 bg-muted rounded-xl">
                    {SEARCH_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => { setActiveType(type.id); setSearchQuery(""); setTrackingResult(null); setNotFound(false); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          activeType === type.id
                            ? "bg-card text-secondary shadow-sm border border-border/60"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <type.icon className="w-4 h-4 shrink-0" />
                        {type.label}
                      </button>
                    ))}
                  </div>

                  {/* Input Row */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeType}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <currentType.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                          <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={currentType.placeholder}
                            className="pl-10 text-sm sm:text-base h-11"
                            autoComplete="off"
                            autoFocus
                          />
                        </div>
                        <Button
                          type="submit"
                          variant="hero"
                          disabled={isLoading}
                          className="h-11 px-6 shrink-0 gap-2"
                        >
                          {isLoading ? (
                            <>
                              <Clock className="w-4 h-4 animate-spin" /> Tracking…
                            </>
                          ) : (
                            <>
                              <Search className="w-4 h-4" /> Track
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Hint */}
                      <p className="mt-3 text-xs text-muted-foreground flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-secondary" />
                        {currentType.hint}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </form>
            </motion.div>
          </div>
        </section>

        {/* ── Tracking Result ── */}
        <AnimatePresence>
          {trackingResult && (
            <motion.section
              key={trackingResult.consignmentNo}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="py-14 bg-background"
            >
              <div className="container mx-auto px-4 max-w-3xl space-y-5">

                {/* ── Status Header Card ── */}
                <div data-aos="fade-up" className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div>
                      {trackingResult.lrNumber && (
                        <div className="mb-1">
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-0.5">LR Number</p>
                          <p className="font-bold text-xl sm:text-2xl text-foreground tracking-wide font-mono">{trackingResult.lrNumber}</p>
                        </div>
                      )}
                      {trackingResult.awbNumber && (
                        <div className="mt-2">
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-0.5">AWB Number</p>
                          <p className="font-bold text-xl sm:text-2xl text-foreground tracking-wide font-mono">{trackingResult.awbNumber}</p>
                        </div>
                      )}
                      {trackingResult.serviceType && (
                        <p className="text-xs text-muted-foreground mt-2">{trackingResult.serviceType}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 self-start">
                      {/* Refresh button */}
                      <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
                        title="Refresh tracking data"
                      >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                      </button>
                      {(() => {
                        const cfg = STATUS_CONFIG[trackingResult.statusRaw] ?? STATUS_CONFIG["booked"];
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white ${cfg.bg} ring-4 ${cfg.ring}`}>
                            <CheckCircle className="w-4 h-4" />
                            {trackingResult.status}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Last updated indicator */}
                  {lastFetched && (
                    <div className="flex items-center gap-1.5 mb-4 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>Last updated: {lastFetched.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })} IST</span>
                    </div>
                  )}

                  {/* Route + delivery */}
                  <div className="flex items-center gap-3 mb-6 p-3 bg-muted/60 rounded-xl">
                    <div className="text-center min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">From</p>
                      <p className="font-bold text-foreground text-sm truncate">{trackingResult.origin}</p>
                    </div>
                    <div className="flex-1 flex items-center gap-1">
                      <div className="flex-1 h-px bg-border" />
                      <ArrowRight className="w-4 h-4 text-secondary shrink-0" />
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <div className="text-center min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">To</p>
                      <p className="font-bold text-foreground text-sm truncate">{trackingResult.destination}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { label: "Estimated Delivery", value: formatDate(trackingResult.estimatedDelivery) },
                      { label: "Booked On",          value: formatDate(trackingResult.bookedOn) },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-muted rounded-xl p-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
                        <p className="font-semibold text-foreground text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Progress Stepper ── */}
                {trackingResult.statusRaw !== "cancelled" && (
                  <div data-aos="fade-up" data-aos-delay="100" className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
                    <h3 className="font-bold text-foreground mb-6 text-base">Shipment Progress</h3>
                    <div className="relative flex items-start justify-between">
                      {/* connector line */}
                      <div className="absolute top-4 left-4 right-4 h-0.5 bg-border z-0" />
                      {STATUS_PROGRESSION.map((s, idx) => {
                        const current = progressIndex(trackingResult.statusRaw);
                        const done    = idx <= current;
                        const active  = idx === current;
                        const cfg     = STATUS_CONFIG[s];
                        return (
                          <div key={s} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all shadow-sm ${
                              done ? `${cfg.bg} border-transparent` : "bg-card border-border"
                            } ${active ? `ring-4 ${cfg.ring} scale-110` : ""}`}>
                              {done
                                ? <CheckCircle className="w-4 h-4 text-white" />
                                : <span className="text-[10px] text-muted-foreground font-bold">{idx + 1}</span>
                              }
                            </div>
                            <p className={`text-center text-[9px] sm:text-[11px] font-medium leading-tight max-w-[60px] ${done ? "text-foreground" : "text-muted-foreground"}`}>
                              {cfg.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Timeline ── */}
                {trackingResult.steps?.length > 0 && (
                  <div data-aos="fade-up" data-aos-delay="200" className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
                    <h3 className="font-bold text-foreground mb-6 text-base">Tracking Timeline</h3>
                    <div className="space-y-0">
                      {[...trackingResult.steps].reverse().map((step, idx) => (
                        <div key={idx} className="flex gap-4 relative">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 z-10 ${
                              step.completed
                                ? "bg-secondary border-secondary text-white"
                                : "bg-muted border-border text-muted-foreground"
                            }`}>
                              {step.completed ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            </div>
                            {idx < trackingResult.steps.length - 1 && (
                              <div className="w-0.5 flex-1 min-h-[2rem] bg-border mt-1 shrink-0" />
                            )}
                          </div>
                          <div className="pb-6 pt-0.5 min-w-0">
                            <p className="font-semibold text-foreground text-sm leading-snug">{step.status}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                              <p className="text-sm text-muted-foreground truncate">{step.location}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(step.date)}{step.time ? " · " + step.time + " IST" : ""}
                            </p>
                            {step.note && <p className="text-xs text-secondary mt-1 italic">{step.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── Info Cards (empty state) ── */}
        {!trackingResult && !isLoading && (
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  {
                    icon: Package,
                    title: "LR Number",
                    subtitle: "Lorry Receipt",
                    desc: "Your LR number is printed on the physical receipt given by the Panya team at the time of pickup or dispatch.",
                    color: "from-blue-500 to-cyan-500",
                    bg: "bg-blue-500/10",
                    border: "border-blue-500/20",
                  },
                  {
                    icon: Truck,
                    title: "AWB Number",
                    subtitle: "Air Waybill",
                    desc: "The AWB number is assigned for international or air freight shipments. You'll find it in your booking confirmation email.",
                    color: "from-violet-500 to-purple-500",
                    bg: "bg-violet-500/10",
                    border: "border-violet-500/20",
                  },
                ].map(({ icon: Icon, title, subtitle, desc, color, bg, border }) => (
                  <div
                    key={title}
                    data-aos="fade-up"
                    className={`bg-card border ${border} rounded-2xl p-6 hover:shadow-lg transition-shadow`}
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${color} mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-foreground text-base mb-0.5">{title}</h3>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-2 bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{subtitle}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>

              <p data-aos="fade-up" className="mt-8 text-center text-sm text-muted-foreground">
                Can't find your number?{" "}
                <a href="/contact" className="text-secondary font-semibold hover:underline">
                  Contact us →
                </a>
              </p>
            </div>
          </section>
        )}
      </main>

      <CityWiseLinks />
      <Footer />
    </div>
  );
};

export default TrackConsignment;
