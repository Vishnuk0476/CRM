import { useState } from "react";
import { X, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  leadId: number;
  customerName: string;
  onClose: () => void;
  onConverted: (caseData: any) => void;
}

export function LeadConvertModal({ leadId, customerName, onClose, onConverted }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConvert = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/crm/leads/convert-to-case.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId })
      });
      const json = await res.json();
      if (json.success) {
        onConverted(json.data);
      } else {
        setError(json.message || "Failed to convert lead.");
      }
    } catch (e) {
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card w-full max-w-sm rounded-xl border border-border shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Convert to Case</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to convert <strong className="text-foreground">{customerName}</strong> into a full Case? 
          This will move the lead into the Cases module for surveying, quotation, and packing.
        </p>

        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">{error}</p>}
        
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white" 
            onClick={handleConvert}
            disabled={loading}
          >
            {loading ? "Converting..." : <><Briefcase className="w-4 h-4 mr-2" /> Convert</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
