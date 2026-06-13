import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Download,
  FileText,
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  RefreshCw,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";


interface BrochureDownload {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  created_at: string;
}

interface BrochureDownloadsManagementProps {
  onClose: () => void;
}

export const BrochureDownloadsManagement = ({ onClose }: BrochureDownloadsManagementProps) => {
  const { toast } = useToast();
  const [downloads, setDownloads] = useState<BrochureDownload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/brochure-downloads/submit.php", { credentials: "include" });
      const json = await res.json();
      if (json.success) setDownloads(json.data?.downloads || json.data || []);
      else throw new Error(json.message);
    } catch (err: unknown) {
      console.error("Error fetching brochure downloads:", err);
      toast({
        title: "Error",
        description: "Failed to fetch brochure downloads.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDownloads = downloads.filter((download) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      download.name.toLowerCase().includes(searchLower) ||
      download.email.toLowerCase().includes(searchLower) ||
      download.phone.includes(searchTerm) ||
      (download.company && download.company.toLowerCase().includes(searchLower))
    );
  });

  const handleExport = async (format: "csv" | "json") => {
    setIsExporting(true);
    try {
      const exportData = downloads.map((d) => ({
        Name: d.name,
        Email: d.email,
        Phone: d.phone,
        Company: d.company || "",
        "Downloaded At": new Date(d.created_at).toLocaleString("en-IN"),
      }));

      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === "csv") {
        const headers = Object.keys(exportData[0] || {}).join(",");
        const rows = exportData.map((row) =>
          Object.values(row)
            .map((val) => `"${String(val).replace(/"/g, '""')}"`)
            .join(",")
        );
        content = [headers, ...rows].join("\n");
        filename = `brochure-leads-${new Date().toISOString().split("T")[0]}.csv`;
        mimeType = "text/csv";
      } else {
        content = JSON.stringify(exportData, null, 2);
        filename = `brochure-leads-${new Date().toISOString().split("T")[0]}.json`;
        mimeType = "application/json";
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Downloaded ${downloads.length} leads as ${format.toUpperCase()}.`,
      });
    } catch (err: unknown) {
      console.error("Export error:", err);
      toast({
        title: "Export Failed",
        description: "Failed to export data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card rounded-xl border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Brochure Downloads</h2>
                <p className="text-xs text-muted-foreground">
                  {downloads.length} leads captured
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("csv")}
                disabled={isExporting || downloads.length === 0}
              >
                <Download className="w-4 h-4 mr-1" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("json")}
                disabled={isExporting || downloads.length === 0}
              >
                <Download className="w-4 h-4 mr-1" />
                JSON
              </Button>
              <Button variant="ghost" size="sm" onClick={fetchDownloads}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredDownloads.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchTerm ? "No leads found matching your search." : "No brochure downloads yet."}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredDownloads.map((download) => (
                  <motion.div
                    key={download.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-muted/50 rounded-lg p-4 border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{download.name}</p>
                          {download.company && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {download.company}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(download.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <a 
                        href={`mailto:${download.email}`}
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        {download.email}
                      </a>
                      <a 
                        href={`tel:${download.phone}`}
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        {download.phone}
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Stats */}
          <div className="p-4 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {filteredDownloads.length} of {downloads.length} leads
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Real-time updates enabled
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
