import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Package, 
  CheckCircle2, 
  Clock, 
  Truck, 
  MapPin,
  Calendar,
  Phone,
  Mail,
  AlertCircle,
  Loader2,
  FileText
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

interface QuoteData {
  id: string;
  reference_number: string;
  name: string;
  email: string;
  phone: string;
  service_type: string;
  property_type: string;
  from_address: string;
  to_address: string;
  move_date: string;
  rooms: string;
  status: string;
  status_message: string | null;
  created_at: string;
  updated_at: string;
}

const serviceLabels: Record<string, string> = {
  "local": "Local Relocations",
  "domestic": "Domestic Relocations",
  "international": "International Relocations",
  "office": "Office Relocations",
  "vehicle": "Vehicle Transportation",
  "storage": "Storage Services",
  "packing": "Packing & Unpacking",
  "insurance": "Moving Insurance",
};

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-yellow-500", label: "Pending Review" },
  reviewed: { icon: FileText, color: "text-blue-500", label: "Under Review" },
  quoted: { icon: Package, color: "text-purple-500", label: "Quote Sent" },
  confirmed: { icon: CheckCircle2, color: "text-green-500", label: "Confirmed" },
  in_progress: { icon: Truck, color: "text-orange-500", label: "In Progress" },
  completed: { icon: CheckCircle2, color: "text-green-600", label: "Completed" },
  cancelled: { icon: AlertCircle, color: "text-red-500", label: "Cancelled" },
};

const TrackQuote = () => {
  const { toast } = useToast();
  const [referenceNumber, setReferenceNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setQuoteData(null);

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
      const response = await fetch(`/api/quote-submissions/track.php?ref=${encodeURIComponent(referenceNumber.toUpperCase().trim())}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        if (response.status === 404) {
          setError("No quote found with this reference number. Please check and try again.");
        } else {
          throw new Error(result.error || "Failed to fetch quote");
        }
        return;
      }

      setQuoteData(result.data.quote);
    } catch (err: unknown) {
      console.error("Error fetching quote:", err);
      toast({
        title: "Error",
        description: "Failed to fetch quote details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    return statusConfig[status] || statusConfig.pending;
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        {/* Hero Section */}
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
                Track Your Quote
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-4 sm:mb-6">
                Quote <span className="text-secondary">Tracking</span>
              </h1>
              <p className="text-base sm:text-lg text-primary-foreground/80 px-4">
                Enter your reference number to check the status of your quote request.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search Section */}
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
                      onChange={(e) => {
                        setReferenceNumber(e.target.value);
                        setError("");
                      }}
                      placeholder="e.g., PG20241230-abc12345"
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
                    <Button 
                      type="submit" 
                      variant="hero" 
                      disabled={isLoading}
                      className="w-full sm:w-auto"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          Track Quote
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.form>

              {/* Quote Details */}
              {quoteData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-8 bg-card rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border border-border"
                >
                  {/* Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-border">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Reference Number</p>
                      <p className="text-lg font-bold text-foreground">{quoteData.reference_number}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-muted ${getStatusInfo(quoteData.status).color}`}>
                      {(() => {
                        const StatusIcon = getStatusInfo(quoteData.status).icon;
                        return <StatusIcon className="w-5 h-5" />;
                      })()}
                      <span className="font-semibold">{getStatusInfo(quoteData.status).label}</span>
                    </div>
                  </div>

                  {/* Status Message */}
                  {quoteData.status_message && (
                    <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-foreground">{quoteData.status_message}</p>
                    </div>
                  )}

                  {/* Quote Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Package className="w-4 h-4 text-secondary" />
                        Service Details
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Service Type</p>
                          <p className="font-medium text-foreground">
                            {serviceLabels[quoteData.service_type] || quoteData.service_type}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Property Type</p>
                          <p className="font-medium text-foreground capitalize">{quoteData.property_type}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Number of Rooms</p>
                          <p className="font-medium text-foreground">{quoteData.rooms}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-secondary" />
                        Move Details
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Moving From</p>
                          <p className="font-medium text-foreground">{quoteData.from_address}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Moving To</p>
                          <p className="font-medium text-foreground">{quoteData.to_address}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <p className="font-medium text-foreground">
                            {new Date(quoteData.move_date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-2 pt-4 border-t border-border">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-secondary" />
                        Contact Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Name</p>
                          <p className="font-medium text-foreground">{quoteData.name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <p className="font-medium text-foreground">{quoteData.email}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Phone</p>
                          <p className="font-medium text-foreground">{quoteData.phone}</p>
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-2 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Submitted on {new Date(quoteData.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        {quoteData.updated_at !== quoteData.created_at && (
                          <> • Last updated on {new Date(quoteData.updated_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</>
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Help Section */}
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
                  <a href="tel:+911141556447" className="flex items-center gap-2 text-secondary hover:underline text-sm">
                    <Phone className="w-4 h-4" />
                    +91 11 4155 6447
                  </a>
                  <a href="mailto:info@panyaglobal.in" className="flex items-center gap-2 text-secondary hover:underline text-sm">
                    <Mail className="w-4 h-4" />
                    info@panyaglobal.in
                  </a>
                </div>
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

export default TrackQuote;
