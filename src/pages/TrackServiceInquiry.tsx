import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  FileText,
  Phone,
  Mail,
  Briefcase,
  Calendar,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import { z } from "zod";

const trackingSchema = z.object({
  referenceNumber: z.string().min(5, "Please enter a valid reference number"),
});

interface InquiryData {
  id: string;
  reference_number: string;
  service_name: string;
  service_type: string;
  name: string;
  status: string;
  status_message: string | null;
  form_data: Record<string, string>;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  pending:     { icon: Clock,        color: "text-yellow-600",  bg: "bg-yellow-50 border-yellow-200",  label: "Pending Review" },
  reviewed:    { icon: FileText,     color: "text-blue-600",    bg: "bg-blue-50 border-blue-200",      label: "Under Review" },
  in_progress: { icon: Package,      color: "text-orange-600",  bg: "bg-orange-50 border-orange-200",  label: "In Progress" },
  completed:   { icon: CheckCircle2, color: "text-green-600",   bg: "bg-green-50 border-green-200",    label: "Completed" },
  cancelled:   { icon: AlertCircle,  color: "text-red-600",     bg: "bg-red-50 border-red-200",        label: "Cancelled" },
};

const TrackServiceInquiry = () => {
  const { toast } = useToast();
  const [referenceNumber, setReferenceNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inquiryData, setInquiryData] = useState<InquiryData | null>(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInquiryData(null);
    setShowModal(false);

    try {
      trackingSchema.parse({ referenceNumber });
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/service-inquiries/track.php?ref=${encodeURIComponent(referenceNumber.toUpperCase().trim())}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        if (response.status === 404) {
          setError("No inquiry found with this reference number. Please check and try again.");
        } else {
          throw new Error(result.error || "Failed to fetch inquiry");
        }
        return;
      }

      setInquiryData(result.data.inquiry);
      setShowModal(true);
    } catch (err: unknown) {
      console.error("Error fetching inquiry:", err);
      toast({
        title: "Error",
        description: "Failed to fetch inquiry details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: string) => statusConfig[status] || statusConfig.pending;
  const formatLabel = (key: string) =>
    key.replace(/_/g, " ").replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();

  return (
    <div className="min-h-screen">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="pt-24 sm:pt-32 pb-8 sm:pb-12 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-50" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <span className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary-foreground/10 text-primary-foreground text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
                Track Your Inquiry
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-4 sm:mb-6">
                Service Inquiry <span className="text-secondary">Tracking</span>
              </h1>
              <p className="text-base sm:text-lg text-primary-foreground/80 px-4">
                Enter your reference number to check the status of your service inquiry.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search */}
        <section className="py-8 sm:py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                onSubmit={handleSearch}
                className="bg-card rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border border-border"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label htmlFor="reference" className="block text-sm font-medium text-foreground mb-2">
                      Reference Number
                    </label>
                    <Input
                      id="reference"
                      value={referenceNumber}
                      onChange={(e) => { setReferenceNumber(e.target.value); setError(""); }}
                      placeholder="e.g., SI20260112-abc12345"
                      className={`text-sm sm:text-base ${error ? "border-destructive" : ""}`}
                    />
                    {error && (
                      <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {error}
                      </p>
                    )}
                  </div>
                  <div className="sm:self-end">
                    <Button type="submit" variant="hero" disabled={isLoading} className="w-full sm:w-auto">
                      {isLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Searching...</>
                      ) : (
                        <><Search className="w-4 h-4" /> Track Inquiry</>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.form>

              {/* Help */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-8 text-center"
              >
                <p className="text-muted-foreground text-sm mb-4">
                  Need help finding your reference number? Check your email for the confirmation we sent.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a href="tel:+911142321118" className="flex items-center gap-2 text-secondary hover:underline text-sm">
                    <Phone className="w-4 h-4" />+91 11 42321118
                  </a>
                  <a href="mailto:info@panyaglobal.in" className="flex items-center gap-2 text-secondary hover:underline text-sm">
                    <Mail className="w-4 h-4" />info@panyaglobal.in
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <CityWiseLinks />
      <Footer />

      {/* ── RESULT MODAL POPUP ── */}
      <AnimatePresence>
        {showModal && inquiryData && (() => {
          const statusInfo = getStatusInfo(inquiryData.status);
          const StatusIcon = statusInfo.icon;
          return (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={() => setShowModal(false)}
              />

              {/* Modal card */}
              <motion.div
                key="modal"
                initial={{ opacity: 0, scale: 0.88, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: 40 }}
                transition={{ type: "spring", stiffness: 340, damping: 28 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
              >
                <div
                  className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-lg pointer-events-auto overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header strip */}
                  <div className="bg-primary px-6 py-5 relative">
                    <button
                      onClick={() => setShowModal(false)}
                      className="absolute right-4 top-4 text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <p className="text-primary-foreground/70 text-xs font-semibold uppercase tracking-widest mb-1">Inquiry Found</p>
                    <p className="text-primary-foreground text-xl font-bold font-mono">{inquiryData.reference_number}</p>
                  </div>

                  {/* Status badge */}
                  <div className={`flex items-center gap-3 px-6 py-3 border-b border-border ${statusInfo.bg}`}>
                    <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                    <span className={`font-semibold text-sm ${statusInfo.color}`}>{statusInfo.label}</span>
                    {inquiryData.status_message && (
                      <span className="ml-auto text-xs text-muted-foreground truncate max-w-[180px]">{inquiryData.status_message}</span>
                    )}
                  </div>

                  <div className="p-6">
                    {/* Status message (full) */}
                    {inquiryData.status_message && (
                      <div className="mb-5 p-3 bg-muted/60 rounded-lg text-sm text-foreground">
                        <strong>Update:</strong> {inquiryData.status_message}
                      </div>
                    )}

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[
                        { label: "Service", value: inquiryData.service_name },
                        { label: "Type", value: inquiryData.service_type },
                        { label: "Submitted By", value: inquiryData.name },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-muted/40 rounded-lg px-3 py-2.5">
                          <p className="text-xs text-muted-foreground font-medium mb-0.5">{label}</p>
                          <p className="text-sm font-semibold text-foreground capitalize">{value}</p>
                        </div>
                      ))}

                      {/* Extra form fields */}
                      {Object.entries(inquiryData.form_data ?? {}).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="bg-muted/40 rounded-lg px-3 py-2.5">
                          <p className="text-xs text-muted-foreground font-medium mb-0.5">{formatLabel(key)}</p>
                          <p className="text-sm font-semibold text-foreground">{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Timestamps */}
                    <div className="flex flex-col sm:flex-row gap-2 text-xs text-muted-foreground border-t border-border pt-4">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Submitted: {new Date(inquiryData.created_at).toLocaleString("en-IN", {
                          day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                      {inquiryData.updated_at !== inquiryData.created_at && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Updated: {new Date(inquiryData.updated_at).toLocaleString("en-IN", {
                            day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-5"
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};

export default TrackServiceInquiry;
