import { useState } from "react";
import { motion } from "framer-motion";
import { X, Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ExportDataProps {
  onClose: () => void;
}

type ExportType = "quotes" | "inquiries" | "both";
type ExportFormat = "csv" | "json";

interface QuoteSubmission {
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
  additional_info: string | null;
  status: string;
  status_message: string | null;
  created_at: string;
  updated_at: string;
}

interface ServiceInquiry {
  id: string;
  reference_number: string;
  service_name: string;
  service_type: string;
  name: string;
  email: string;
  phone: string | null;
  form_data: Record<string, any>;
  status: string;
  status_message: string | null;
  created_at: string;
  updated_at: string;
}

export const ExportData = ({ onClose }: ExportDataProps) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<ExportType>("both");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: Record<string, any>[], headers: string[]): string => {
    const escapeCsv = (value: any): string => {
      if (value === null || value === undefined) return "";
      const str = typeof value === "object" ? JSON.stringify(value) : String(value);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = [headers.join(",")];
    for (const row of data) {
      const values = headers.map(header => escapeCsv(row[header]));
      csvRows.push(values.join(","));
    }
    return csvRows.join("\n");
  };

  const handleExport = async () => {
    setIsExporting(true);
    const timestamp = new Date().toISOString().split("T")[0];

    try {
      // Fetch quotes if needed
      let quotes: QuoteSubmission[] = [];
      if (exportType === "quotes" || exportType === "both") {
        const res = await fetch("/api/quote-submissions/list.php", { credentials: "include" });
        const json = await res.json();
        if (json.success) quotes = json.data?.quotes || json.data || [];
      }

      // Fetch inquiries if needed
      let inquiries: ServiceInquiry[] = [];
      if (exportType === "inquiries" || exportType === "both") {
        const res = await fetch("/api/service-inquiries/list.php", { credentials: "include" });
        const json = await res.json();
        if (json.success) inquiries = json.data?.inquiries || json.data || [];
      }

      if (exportFormat === "json") {
        // JSON export
        const exportData: Record<string, any> = {
          exported_at: new Date().toISOString(),
        };
        
        if (quotes.length > 0) exportData.quotes = quotes;
        if (inquiries.length > 0) exportData.service_inquiries = inquiries;

        downloadFile(
          JSON.stringify(exportData, null, 2),
          `panya-export-${timestamp}.json`,
          "application/json"
        );
      } else {
        // CSV export
        if (quotes.length > 0 && (exportType === "quotes" || exportType === "both")) {
          const quoteHeaders = [
            "reference_number",
            "name",
            "email",
            "phone",
            "service_type",
            "property_type",
            "from_address",
            "to_address",
            "move_date",
            "rooms",
            "additional_info",
            "status",
            "status_message",
            "created_at",
            "updated_at",
          ];
          const quoteCsv = convertToCSV(quotes, quoteHeaders);
          downloadFile(quoteCsv, `quotes-${timestamp}.csv`, "text/csv");
        }

        if (inquiries.length > 0 && (exportType === "inquiries" || exportType === "both")) {
          // Flatten form_data for CSV
          const flattenedInquiries = inquiries.map(inq => ({
            ...inq,
            form_data: JSON.stringify(inq.form_data),
          }));
          const inquiryHeaders = [
            "reference_number",
            "service_name",
            "service_type",
            "name",
            "email",
            "phone",
            "form_data",
            "status",
            "status_message",
            "created_at",
            "updated_at",
          ];
          const inquiryCsv = convertToCSV(flattenedInquiries, inquiryHeaders);
          downloadFile(inquiryCsv, `service-inquiries-${timestamp}.csv`, "text/csv");
        }
      }

      toast({
        title: "Export Successful",
        description: `Data exported as ${exportFormat.toUpperCase()} successfully.`,
      });
      onClose();
    } catch (err: unknown) {
      console.error("Export error:", err);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md"
      >
        {/* Header */}
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Download className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">Export Data</h2>
              <p className="text-sm text-muted-foreground">Download quotes and inquiries</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Export Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              What to Export
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setExportType("quotes")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${
                  exportType === "quotes"
                    ? "border-secondary bg-secondary/10 text-secondary"
                    : "border-border hover:border-secondary/50"
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs font-medium">Quotes</span>
              </button>
              <button
                type="button"
                onClick={() => setExportType("inquiries")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${
                  exportType === "inquiries"
                    ? "border-secondary bg-secondary/10 text-secondary"
                    : "border-border hover:border-secondary/50"
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs font-medium">Inquiries</span>
              </button>
              <button
                type="button"
                onClick={() => setExportType("both")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${
                  exportType === "both"
                    ? "border-secondary bg-secondary/10 text-secondary"
                    : "border-border hover:border-secondary/50"
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs font-medium">Both</span>
              </button>
            </div>
          </div>

          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExportFormat("csv")}
                className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-colors ${
                  exportFormat === "csv"
                    ? "border-secondary bg-secondary/10 text-secondary"
                    : "border-border hover:border-secondary/50"
                }`}
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span className="font-medium">CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setExportFormat("json")}
                className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-colors ${
                  exportFormat === "json"
                    ? "border-secondary bg-secondary/10 text-secondary"
                    : "border-border hover:border-secondary/50"
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">JSON</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {exportFormat === "csv" && exportType === "both" 
              ? "Two separate CSV files will be downloaded." 
              : "All records will be included in the export."}
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="hero" onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
