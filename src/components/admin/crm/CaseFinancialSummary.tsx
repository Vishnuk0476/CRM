import { IndianRupee, Calendar, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Props {
  caseId: number;
  quoted: number;
  invoiced: number;
  collected: number;
  pending: number;
  paymentFollowupDate?: string;
  onUpdated?: () => void;
}

export function CaseFinancialSummary({ caseId, quoted, invoiced, collected, pending, paymentFollowupDate, onUpdated }: Props) {
  const { toast } = useToast();
  const format = (n: number) => `₹${parseFloat((n||0).toString()).toLocaleString('en-IN')}`;
  
  const pctCollected = invoiced > 0 ? Math.round((collected / invoiced) * 100) : 0;

  const [followupDate, setFollowupDate] = useState(paymentFollowupDate || "");
  const [saving, setSaving] = useState(false);

  const saveFollowup = async () => {
    if (!followupDate) return;
    setSaving(true);
    try {
      const res = await fetch("/api/crm/cases.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: caseId, payment_followup_date: followupDate })
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Follow-up date saved" });
        if (onUpdated) onUpdated();
      }
    } catch (e) {
      toast({ title: "Error saving follow-up date", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-card to-emerald-50/20 rounded-2xl border border-emerald-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
          <IndianRupee className="w-4 h-4" /> Smart Financial Tracker
        </h3>
        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-border shadow-sm text-xs">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-medium text-muted-foreground">Follow-up:</span>
          <input 
            type="date" 
            value={followupDate} 
            onChange={(e) => setFollowupDate(e.target.value)}
            className="border-none outline-none bg-transparent font-medium cursor-pointer"
          />
          {followupDate !== (paymentFollowupDate || "") && (
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 rounded-full hover:bg-emerald-100 text-emerald-600" onClick={saveFollowup}>
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div className="bg-white rounded-xl p-3 border border-border shadow-sm">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Quoted</p>
          <p className="font-bold text-sm text-foreground mt-1">{format(quoted)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-border shadow-sm">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Invoiced</p>
          <p className="font-bold text-sm text-violet-600 mt-1">{format(invoiced)}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 shadow-inner">
          <p className="text-[10px] text-emerald-700 uppercase font-bold">Advance Amount (Paid)</p>
          <p className="font-bold text-lg text-emerald-600 mt-0.5">{format(collected)}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 border border-red-100 shadow-inner">
          <p className="text-[10px] text-red-700 uppercase font-bold">Balance Amount (Due)</p>
          <p className="font-bold text-lg text-red-600 mt-0.5">{format(pending)}</p>
        </div>
      </div>
      
      {invoiced > 0 && (
        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(pctCollected, 100)}%` }} />
        </div>
      )}
    </div>
  );
}
