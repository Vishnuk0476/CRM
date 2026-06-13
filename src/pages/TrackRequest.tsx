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
  FileText,
  Briefcase
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
  type: "quote";
  id: string;
  reference_number: string;
  name: string;
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

interface InquiryData {
  type: "inquiry";
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

type TrackingResult = QuoteData | InquiryData;

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

const quoteStatusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-yellow-500", label: "Pending Review" },
  reviewed: { icon: FileText, color: "text-blue-500", label: "Under Review" },
  quoted: { icon: Package, color: "text-purple-500", label: "Quote Sent" },
  confirmed: { icon: CheckCircle2, color: "text-green-500", label: "Confirmed" },
  in_progress: { icon: Truck, color: "text-orange-500", label: "In Progress" },
  completed: { icon: CheckCircle2, color: "text-green-600", label: "Completed" },
  cancelled: { icon: AlertCircle, color: "text-red-500", label: "Cancelled" },
};

const inquiryStatusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-yellow-500", label: "Pending Review" },
  reviewed: { icon: FileText, color: "text-blue-500", label: "Under Review" },
  in_progress: { icon: Package, color: "text-orange-500", label: "In Progress" },
  completed: { icon: CheckCircle2, color: "text-green-600", label: "Completed" },
  cancelled: { icon: AlertCircle, color: "text-red-500", label: "Cancelled" },
};

const TrackRequest = () => {
  const { toast } = useToast();
  const [referenceNumber, setReferenceNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    try {
      trackingSchema.parse({ referenceNumber });
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    setIsLoading(true);
    const refNum = referenceNumber.toUpperCase().trim();

    try {
      // Determine type based on prefix
      const isQuote = refNum.startsWith("PG");
      const isInquiry = refNum.startsWith("SI");

      if (!isQuote && !isInquiry) {
        setError("Invalid reference number format. Quote references start with 'PG' and inquiry references start with 'SI'.");
        setIsLoading(false);
        return;
      }

      const apiPath = isQuote 
        ? `/api/quote-submissions/track.php?ref=${encodeURIComponent(refNum)}` 
        : `/api/service-inquiries/track.php?ref=${encodeURIComponent(refNum)}`;
        
      const response = await fetch(apiPath);
      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 404) {
          setError("No record found with this reference number. Please check and try again.");
        } else {
          throw new Error(data.error || "Failed to fetch details");
        }
        return;
      }

      const resultData = data.data;

      if (isQuote && resultData.quote) {
        setResult({ ...resultData.quote, type: "quote" });
      } else if (isInquiry && resultData.inquiry) {
        setResult({ ...resultData.inquiry, type: "inquiry" });
      }
    } catch (err: unknown) {
      console.error("Error fetching data:", err);
      toast({
        title: "Error",
        description: "Failed to fetch details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: string, type: "quote" | "inquiry") => {
    const config = type === "quote" ? quoteStatusConfig : inquiryStatusConfig;
    return config[status] || config.pending;
  };

  const formatFormDataLabel = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
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
                Unified Tracking
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-4 sm:mb-6">
                Track Your <span className="text-secondary">Request</span>
              </h1>
              <p className="text-base sm:text-lg text-primary-foreground/80 px-4">
                Enter your reference number to check the status of your quote or service inquiry.
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
                      placeholder="e.g., PG20260112-abc12345 or SI20260112-abc12345"
                      className={`text-sm sm:text-base ${error ? "border-destructive" : ""}`}
                    />
                    {error && (
                      <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {error}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong>PG</strong> = Quote Request | <strong>SI</strong> = Service Inquiry
                    </p>
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
                          Track
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.form>

              {/* Quote Details */}
              {result && result.type === "quote" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-8 bg-card rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border border-border"
                >
                  {/* Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-border">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-secondary" />
                        <span className="text-xs font-medium text-secondary uppercase">Quote Request</span>
                      </div>
                      <p className="text-lg font-bold text-foreground">{result.reference_number}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-muted ${getStatusInfo(result.status, "quote").color}`}>
                      {(() => {
                        const StatusIcon = getStatusInfo(result.status, "quote").icon;
                        return <StatusIcon className="w-5 h-5" />;
                      })()}
                      <span className="font-semibold">{getStatusInfo(result.status, "quote").label}</span>
                    </div>
                  </div>

                  {/* Status Message */}
                  {result.status_message && (
                    <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-foreground">{result.status_message}</p>
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
                            {serviceLabels[result.service_type] || result.service_type}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Property Type</p>
                          <p className="font-medium text-foreground capitalize">{result.property_type}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Number of Rooms</p>
                          <p className="font-medium text-foreground">{result.rooms}</p>
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
                          <p className="font-medium text-foreground">{result.from_address}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Moving To</p>
                          <p className="font-medium text-foreground">{result.to_address}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <p className="font-medium text-foreground">
                            {new Date(result.move_date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-2 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Submitted on {new Date(result.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        {result.updated_at !== result.created_at && (
                          <> • Last updated on {new Date(result.updated_at).toLocaleDateString('en-IN', {
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

              {/* Inquiry Details */}
              {result && result.type === "inquiry" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-8 bg-card rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border border-border"
                >
                  {/* Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-border">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Briefcase className="w-4 h-4 text-secondary" />
                        <span className="text-xs font-medium text-secondary uppercase">Service Inquiry</span>
                      </div>
                      <p className="text-lg font-bold text-foreground">{result.reference_number}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-muted ${getStatusInfo(result.status, "inquiry").color}`}>
                      {(() => {
                        const StatusIcon = getStatusInfo(result.status, "inquiry").icon;
                        return <StatusIcon className="w-5 h-5" />;
                      })()}
                      <span className="font-semibold">{getStatusInfo(result.status, "inquiry").label}</span>
                    </div>
                  </div>

                  {/* Status Message */}
                  {result.status_message && (
                    <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-foreground">{result.status_message}</p>
                    </div>
                  )}

                  {/* Service Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-secondary" />
                        Service Details
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Service</p>
                          <p className="font-medium text-foreground">{result.service_name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Service Type</p>
                          <p className="font-medium text-foreground capitalize">{result.service_type}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Submitted By</p>
                          <p className="font-medium text-foreground">{result.name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Form Data */}
                    {Object.keys(result.form_data).length > 0 && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-secondary" />
                          Inquiry Details
                        </h3>
                        <div className="space-y-3 text-sm">
                          {Object.entries(result.form_data).slice(0, 5).map(([key, value]) => (
                            <div key={key}>
                              <p className="text-muted-foreground">{formatFormDataLabel(key)}</p>
                              <p className="font-medium text-foreground">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="sm:col-span-2 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Submitted on {new Date(result.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        {result.updated_at !== result.created_at && (
                          <> • Last updated on {new Date(result.updated_at).toLocaleDateString('en-IN', {
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
                  <a href="tel:+911142321118" className="flex items-center gap-2 text-secondary hover:underline text-sm">
                    <Phone className="w-4 h-4" />
                    +91 11 42321118
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

export default TrackRequest;
