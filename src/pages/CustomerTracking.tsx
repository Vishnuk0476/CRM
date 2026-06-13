import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, MapPin, Truck, CheckCircle, Clock, Search,
  Phone, Mail, ArrowRight, Navigation, ChevronLeft,
  MessageCircle, RotateCcw, AlertCircle, Sparkles,
  Globe, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { consignmentService } from '@/services/apiService';

// --- Types --------------------------------------------------------------------
interface Consignment {
  id: string;
  lr_number: string;
  customer_name: string;
  sender_name?: string;
  receiver_name?: string;
  from_city: string;
  to_city: string;
  status: string;
  current_location?: string;
  estimated_delivery?: string;
  created_at: string;
  pickup_date?: string;
  delivery_date?: string;
  weight?: number;
  service_type?: string;
  description?: string;
  contact_phone?: string;
}

// --- Config -------------------------------------------------------------------
const STEPS = [
  { key: 'booked',            label: 'Booked',            icon: Package,     desc: 'Your shipment has been registered',         color: 'from-blue-500 to-blue-600',    ring: 'ring-blue-400/40',    dot: 'bg-blue-500',    text: 'text-blue-400'   },
  { key: 'picked_up',         label: 'Picked Up',         icon: Truck,       desc: 'Items collected from your location',        color: 'from-orange-500 to-orange-600', ring: 'ring-orange-400/40',  dot: 'bg-orange-500',  text: 'text-orange-400' },
  { key: 'in_transit',        label: 'In Transit',        icon: Navigation,  desc: 'Shipment is on the way',                    color: 'from-yellow-500 to-amber-500', ring: 'ring-yellow-400/40',  dot: 'bg-yellow-500',  text: 'text-yellow-400' },
  { key: 'out_for_delivery',  label: 'Out for Delivery',  icon: MapPin,      desc: 'Your shipment is nearby',                   color: 'from-purple-500 to-violet-600', ring: 'ring-purple-400/40',  dot: 'bg-purple-500',  text: 'text-purple-400' },
  { key: 'delivered',         label: 'Delivered',         icon: CheckCircle, desc: 'Successfully delivered!',                   color: 'from-green-500 to-emerald-600', ring: 'ring-green-400/40',   dot: 'bg-green-500',   text: 'text-green-400'  },
];

const STATUS_ORDER = STEPS.map(s => s.key);

const STATUS_LABELS: Record<string, string> = {
  booked:           'Booking Confirmed',
  picked_up:        'Picked Up',
  in_transit:       'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
};

const SAMPLE_LRs = ['LR-20240521-1234', 'LR-20240615-5678', 'LR-20240710-9012'];

// --- Helpers ------------------------------------------------------------------
const fmtDate = (d?: string | null): string => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return d; }
};

const getStepIndex = (status: string): number => {
  const idx = STATUS_ORDER.indexOf(status?.toLowerCase());
  return idx >= 0 ? idx : 0;
};

// --- Floating orb background --------------------------------------------------
const HeroBg = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Gradient base */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#0d1b2a] via-[#1a2d45] to-[#0f2a3d]" />
    {/* Mesh grid */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }}
    />
    {/* Glowing orbs */}
    <motion.div
      className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20"
      style={{ background: 'radial-gradient(circle, hsl(199 89% 48%) 0%, transparent 70%)' }}
      animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-15"
      style={{ background: 'radial-gradient(circle, hsl(213 55% 35%) 0%, transparent 70%)' }}
      animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.22, 0.15] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
    />
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-10"
      style={{ background: 'radial-gradient(ellipse, hsl(199 89% 60%) 0%, transparent 70%)' }}
      animate={{ scale: [1, 1.08, 1] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
    />
  </div>
);

// --- Particle dots ------------------------------------------------------------
const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 6,
  dur: Math.random() * 8 + 6,
}));

const Particles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {particles.map(p => (
      <motion.div
        key={p.id}
        className="absolute rounded-full bg-sky-400/30"
        style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
        animate={{ y: [-20, 20, -20], opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

// --- Status Badge -------------------------------------------------------------
const StatusBadge = ({ status }: { status: string }) => {
  const step = STEPS.find(s => s.key === status?.toLowerCase());
  if (!step) return (
    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-slate-700 text-slate-200 ring-2 ring-slate-600/40">
      <AlertCircle className="w-4 h-4" /> {STATUS_LABELS[status] ?? status}
    </span>
  );
  const Icon = step.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${step.color} ring-4 ${step.ring} shadow-lg`}>
      <Icon className="w-4 h-4" />
      {STATUS_LABELS[step.key] ?? step.label}
    </span>
  );
};

// --- Main Component -----------------------------------------------------------
const CustomerTracking = () => {
  const [lrNumber, setLrNumber]           = useState('');
  const [isLoading, setIsLoading]         = useState(false);
  const [isLive, setIsLive]              = useState(false);  // Realtime connected
  const [consignment, setConsignment]     = useState<Consignment | null>(null);
  const [notFound, setNotFound]           = useState(false);
  const [errorMsg, setErrorMsg]           = useState('');
  const [searched, setSearched]           = useState(false);
  const inputRef                          = useRef<HTMLInputElement>(null);
  const resultsRef                        = useRef<HTMLDivElement>(null);

  // Realtime updates removed as backend is now PHP without websockets.

  // Auto-focus input
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Pre-fill from URL ?lr=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lr = params.get('lr') ?? params.get('q');
    if (lr) { setLrNumber(lr); }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = lrNumber.trim().toUpperCase();
    if (!val) { inputRef.current?.focus(); return; }

    setIsLoading(true);
    setNotFound(false);
    setConsignment(null);
    setErrorMsg('');
    setSearched(false);

    try {
      const res = await consignmentService.getByTracking(val);
      
      if (res.error) throw new Error(res.error);
      
      if (!res.data) {
        setErrorMsg('No shipment found with this Tracking / LR Number. Please check and try again.');
        setNotFound(true);
      } else {
        setConsignment(res.data as Consignment);
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    } catch {
      setNotFound(true);
      setErrorMsg('Unable to connect to tracking server. Please try again in a moment.');
    } finally {
      setIsLoading(false);
      setSearched(true);
    }
  };

  const handleReset = () => {
    setLrNumber('');
    setConsignment(null);
    setNotFound(false);
    setErrorMsg('');
    setSearched(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const stepIndex = consignment ? getStepIndex(consignment.status) : -1;

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* -- Minimal Header -- */}
      <header className="relative z-50 bg-[#0d1b2a]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <motion.a
            href="/"
            className="flex items-center gap-3 group"
            whileHover={{ x: -2 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-bold text-sm tracking-wide">Panya Global</span>
              <p className="text-white/40 text-[10px] -mt-0.5 tracking-wider uppercase">Packers & Movers</p>
            </div>
          </motion.a>

          <div className="flex items-center gap-2">
            <motion.a
              href="/"
              className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
              whileHover={{ scale: 1.02 }}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </motion.a>
            <a 
              href={`https://wa.me/918800446447?text=${encodeURIComponent('Hi Panya Global, I need help tracking my shipment.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-400 text-sm font-medium transition-all border border-green-600/20 hover:border-green-500/40"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      {/* -- Hero Section -- */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center py-16 px-4 overflow-hidden">
        <HeroBg />
        <Particles />

        <div className="relative z-10 w-full max-w-2xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold tracking-widest uppercase mb-6 backdrop-blur-sm"
          >
            <motion.span
              className="w-2 h-2 rounded-full bg-sky-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <Sparkles className="w-3 h-3" />
            Live Shipment Tracking
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-4"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Track Your{' '}
            <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
              Shipment
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-white/55 text-base sm:text-lg mb-10 max-w-md mx-auto leading-relaxed"
          >
            Enter your LR number to get real-time updates on your Panya Global shipment.
          </motion.p>

          {/* -- Search Card -- */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <form
              onSubmit={handleSearch}
              className="relative bg-white/[0.05] backdrop-blur-2xl border border-white/[0.12] rounded-2xl p-6 sm:p-8 shadow-2xl"
            >
              {/* Glow border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-500/10 via-transparent to-blue-600/10 pointer-events-none" />

              <label className="block text-white/60 text-xs font-semibold tracking-widest uppercase mb-3 text-left">
                LR Number
              </label>

              <div className="flex gap-3">
                <div className="relative flex-1 group">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-500/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-sky-400 transition-colors z-10" />
                  <Input
                    ref={inputRef}
                    id="lr-number-input"
                    value={lrNumber}
                    onChange={e => setLrNumber(e.target.value)}
                    placeholder="e.g. LR-20240521-1234"
                    className="pl-11 h-12 bg-white/[0.07] border-white/[0.12] text-white placeholder:text-white/25 rounded-xl text-sm focus:border-sky-400/60 focus:bg-white/[0.1] transition-all"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>

                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-12 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-sky-500/30 border-0 gap-2 transition-all duration-200 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        />
                        Searching…
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Track
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>

              {/* Format hint */}
              <p className="mt-4 text-xs text-white/30 text-left">
                Format: <span className="text-white/50 font-mono">LR-YYYYMMDD-XXXX</span> — printed on your booking receipt
              </p>
            </form>
          </motion.div>

          {/* Sample LR numbers */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="text-white/30 text-xs">Sample formats:</span>
            {SAMPLE_LRs.map(lr => (
              <button
                key={lr}
                type="button"
                onClick={() => setLrNumber(lr)}
                className="text-xs font-mono px-3 py-1 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white/50 hover:text-sky-400 hover:border-sky-400/30 hover:bg-sky-500/10 transition-all"
              >
                {lr}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
      </section>

      {/* -- Results Area -- */}
      <div ref={resultsRef} className="flex-1 bg-slate-950">
        <AnimatePresence mode="wait">

          {/* Loading skeleton */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto px-4 py-12 space-y-4"
            >
              {[1, 2, 3].map(i => (
                <div key={i} className="h-28 rounded-2xl bg-white/[0.04] border border-white/[0.06] overflow-hidden relative">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'linear', delay: i * 0.15 }}
                  />
                </div>
              ))}
            </motion.div>
          )}

          {/* Not found */}
          {searched && notFound && !isLoading && (
            <motion.div
              key="not-found"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl mx-auto px-4 py-16 text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
                <AlertCircle className="w-9 h-9 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Shipment Not Found
              </h2>
              <p className="text-white/50 mb-8 leading-relaxed max-w-sm mx-auto">
                {errorMsg}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 font-semibold text-sm hover:bg-sky-500/20 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Another LR
                </motion.button>
                <a 
                  href={`https://wa.me/918800446447?text=${encodeURIComponent(`Hi, I can't find my shipment with LR: ${lrNumber}. Can you help?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600/10 border border-green-500/20 text-green-400 font-semibold text-sm hover:bg-green-600/20 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact on WhatsApp
                </a>
              </div>
            </motion.div>
          )}

          {/* -- Result Cards -- */}
          {consignment && !isLoading && (
            <motion.div
              key={consignment.lr_number}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto px-4 py-10 space-y-5"
            >

              {/* -- Card 1: Summary -- */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl"
              >
                {/* Card gradient bg */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f35] to-[#111b2a]" />
                <div className="absolute inset-0 bg-gradient-to-r from-sky-600/5 via-transparent to-blue-600/5" />

                <div className="relative p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div>
                      <p className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">LR Number</p>
                      <p className="font-mono font-bold text-2xl sm:text-3xl text-white tracking-wide">
                        {consignment.lr_number}
                      </p>
                      {consignment.service_type && (
                        <p className="text-white/40 text-sm mt-1">{consignment.service_type}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <StatusBadge status={consignment.status} />
                    </div>
                  </div>

                  {/* Customer Info Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                    {consignment.customer_name && (
                      <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                        <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1">Customer</p>
                        <p className="text-white font-semibold text-sm">{consignment.customer_name}</p>
                      </div>
                    )}
                    {consignment.current_location && (
                      <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                        <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1">Current Location</p>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                          <p className="text-white font-semibold text-sm">{consignment.current_location}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Route Banner */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-sky-600/10 via-blue-600/5 to-sky-600/10 border border-sky-500/15 mb-5">
                    <div className="text-center min-w-0 flex-1">
                      <p className="text-white/30 text-[9px] font-bold uppercase tracking-wider mb-1">From</p>
                      <p className="text-white font-bold text-sm sm:text-base truncate">{consignment.from_city}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 px-2">
                      <div className="w-8 h-px bg-gradient-to-r from-white/10 to-sky-400/60" />
                      <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-sky-400" />
                      </div>
                      <div className="w-8 h-px bg-gradient-to-l from-white/10 to-sky-400/60" />
                    </div>
                    <div className="text-center min-w-0 flex-1">
                      <p className="text-white/30 text-[9px] font-bold uppercase tracking-wider mb-1">To</p>
                      <p className="text-white font-bold text-sm sm:text-base truncate">{consignment.to_city}</p>
                    </div>
                  </div>

                  {/* Dates Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                      <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1">Booked On</p>
                      <p className="text-white font-semibold text-sm">{fmtDate(consignment.created_at)}</p>
                    </div>
                    {consignment.pickup_date && (
                      <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                        <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1">Picked Up</p>
                        <p className="text-white font-semibold text-sm">{fmtDate(consignment.pickup_date)}</p>
                      </div>
                    )}
                    <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="w-3 h-3 text-sky-400" />
                        <p className="text-sky-400/80 text-[10px] font-bold uppercase tracking-widest">Est. Delivery</p>
                      </div>
                      <p className="text-sky-300 font-bold text-sm">{fmtDate(consignment.estimated_delivery)}</p>
                    </div>
                  </div>

                  {/* Description */}
                  {consignment.description && (
                    <p className="mt-4 text-white/40 text-xs leading-relaxed p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] italic">
                      {consignment.description}
                    </p>
                  )}
                </div>
              </motion.div>

              {/* -- Card 2: Vertical Timeline -- */}
              {consignment.status !== 'cancelled' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="relative rounded-2xl border border-white/[0.08] overflow-hidden shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f35] to-[#111b2a]" />

                  <div className="relative p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
                        <Truck className="w-4 h-4 text-white" />
                      </div>
                      <h2 className="text-white font-bold text-base" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        Shipment Progress
                      </h2>
                    </div>

                    {/* Vertical Steps */}
                    <div className="space-y-0">
                      {STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isDone    = idx <= stepIndex;
                        const isActive  = idx === stepIndex;
                        const isLast    = idx === STEPS.length - 1;

                        return (
                          <div key={step.key} className="flex gap-5">
                            {/* Left: Icon + connector line */}
                            <div className="flex flex-col items-center flex-shrink-0">
                              <motion.div
                                initial={false}
                                animate={isDone ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                                transition={isDone ? { duration: 0.4, delay: idx * 0.1 } : {}}
                                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                  isDone
                                    ? `bg-gradient-to-br ${step.color} border-transparent shadow-lg`
                                    : 'bg-white/[0.04] border-white/[0.1]'
                                } ${isActive ? `ring-4 ${step.ring} scale-110` : ''}`}
                              >
                                <Icon className={`w-4 h-4 ${isDone ? 'text-white' : 'text-white/20'}`} />
                                {isActive && (
                                  <motion.div
                                    className={`absolute inset-0 rounded-full ${step.dot} opacity-30`}
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  />
                                )}
                              </motion.div>

                              {/* Connector line */}
                              {!isLast && (
                                <div className="relative w-0.5 flex-1 min-h-[2.5rem] my-1 overflow-hidden rounded-full bg-white/[0.06]">
                                  {isDone && (
                                    <motion.div
                                      className={`absolute top-0 left-0 right-0 ${step.dot} opacity-60`}
                                      initial={{ height: 0 }}
                                      animate={{ height: '100%' }}
                                      transition={{ duration: 0.6, delay: idx * 0.12 }}
                                    />
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Right: Content */}
                            <div className={`pb-6 pt-1 min-w-0 ${isLast ? 'pb-0' : ''}`}>
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className={`font-bold text-sm ${isDone ? 'text-white' : 'text-white/25'} transition-colors duration-300`}>
                                  {step.label}
                                </p>
                                {isActive && (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${step.dot} text-white`}>
                                    CURRENT
                                  </span>
                                )}
                                {isDone && !isActive && (
                                  <CheckCircle className={`w-3.5 h-3.5 ${step.text}`} />
                                )}
                              </div>
                              <p className={`text-xs leading-relaxed ${isDone ? 'text-white/45' : 'text-white/15'} transition-colors duration-300`}>
                                {step.desc}
                              </p>
                              {/* Show delivery date on delivered step */}
                              {step.key === 'delivered' && consignment.delivery_date && isDone && (
                                <p className="text-xs text-green-400 font-semibold mt-1">
                                  ? {fmtDate(consignment.delivery_date)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* -- Card 3: Help & Contact -- */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="relative rounded-2xl border border-white/[0.08] overflow-hidden shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f35] to-[#111b2a]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />

                <div className="relative p-6 sm:p-8">
                  <h3 className="text-white font-bold text-sm mb-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Need Help?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a 
                      href="tel:+918800446447"
                      className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-sky-400/20 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-sky-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-sky-500/25 transition-colors">
                        <Phone className="w-4 h-4 text-sky-400" />
                      </div>
                      <div>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-0.5">Call Us</p>
                        <p className="text-white font-semibold text-sm">+91 8800 446 447</p>
                      </div>
                    </a>
                    <a 
                      href="mailto:info@panyaglobal.com"
                      className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-sky-400/20 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-sky-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-sky-500/25 transition-colors">
                        <Mail className="w-4 h-4 text-sky-400" />
                      </div>
                      <div>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-0.5">Email Us</p>
                        <p className="text-white font-semibold text-sm">info@panyaglobal.com</p>
                      </div>
                    </a>
                  </div>
                </div>
              </motion.div>

              {/* -- Track Another CTA -- */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="flex flex-col sm:flex-row gap-3 justify-center pt-2 pb-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-400 font-semibold text-sm hover:bg-sky-500/20 hover:border-sky-400/40 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Track Another Shipment
                </motion.button>
                <a 
                  href={`https://wa.me/918800446447?text=${encodeURIComponent(`Hi! I need an update on my shipment LR: ${consignment.lr_number}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-green-600/10 border border-green-500/20 text-green-400 font-semibold text-sm hover:bg-green-600/20 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Support
                </a>
              </motion.div>
            </motion.div>
          )}

          {/* -- Empty state (before first search) -- */}
          {!searched && !isLoading && !consignment && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto px-4 py-12"
            >
              {/* Info cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                  { icon: Package,  title: 'Find Your LR',    desc: 'Your LR number is on the physical receipt given at pickup or dispatch.',    color: 'from-blue-500 to-sky-500'    },
                  { icon: Clock,    title: 'Real-time Updates', desc: 'Get live status updates from booking to final delivery at your doorstep.',  color: 'from-orange-500 to-amber-500' },
                  { icon: Star,     title: 'Support 24/7',    desc: 'Our team is always ready to help. Reach us via WhatsApp or phone anytime.',  color: 'from-purple-500 to-violet-500' },
                ].map(({ icon: Icon, title, desc, color }) => (
                  <motion.div
                    key={title}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="relative rounded-2xl border border-white/[0.07] overflow-hidden group cursor-default"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f35] to-[#111b2a]" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    <div className="relative p-5">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${color} mb-4 shadow-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-white font-bold text-sm mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>{title}</h3>
                      <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Contact strip */}
              <div className="text-center">
                <p className="text-white/30 text-sm mb-4">
                  Can't find your LR number?{' '}
                  <a href="/contact" className="text-sky-400 hover:text-sky-300 font-semibold transition-colors">
                    Contact us ?
                  </a>
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* -- Footer Strip -- */}
      <footer className="bg-[#080f18] border-t border-white/[0.05] py-6 px-4">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs text-center sm:text-left">
            © {new Date().getFullYear()} Panya Global Packers & Movers. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="text-white/25 hover:text-white/50 text-xs transition-colors">Privacy</a>
            <a href="/terms"   className="text-white/25 hover:text-white/50 text-xs transition-colors">Terms</a>
            <a href="/contact" className="text-white/25 hover:text-white/50 text-xs transition-colors">Contact</a>
            <a 
              href="https://wa.me/918800446447"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600/15 border border-green-500/20 text-green-400/80 text-xs font-semibold hover:bg-green-600/25 transition-all"
            >
              <MessageCircle className="w-3 h-3" />
              WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerTracking;

