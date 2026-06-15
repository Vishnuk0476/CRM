import { useState, useEffect, useCallback } from "react";
import {
  Plus, Trash2, FileText, ArrowLeft, RefreshCw,
  CheckCircle2, Send, Edit2, XCircle, ThumbsUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { QuotationBuilderWizard } from "./quotation-builder/QuotationBuilderWizard";

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    draft:     "bg-gray-100 text-gray-600 border-gray-200",
    sent:      "bg-blue-100 text-blue-700 border-blue-200",
    accepted:  "bg-green-100 text-green-700 border-green-200",
    rejected:  "bg-red-100 text-red-700 border-red-200",
    cancelled: "bg-gray-100 text-gray-500 border-gray-200",
    converted: "bg-violet-100 text-violet-700 border-violet-200",
    revised:   "bg-orange-100 text-orange-700 border-orange-200"
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status] || map.draft}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export function QuotationBuilder({ onBack, initialView = "list", leadId = null }: { onBack?: () => void; initialView?: "list" | "form", leadId?: number | null }) {
  const { toast } = useToast();
  const [view, setView] = useState<"list" | "form">(initialView);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);

  const fetchList = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/crm/quotations/list.php", { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        const arr = json.data?.data || json.data;
        setQuotations(Array.isArray(arr) ? arr : []);
      }
    } catch (e) { console.error(e); }
    finally { setLoadingList(false); }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const markSent = async (id: number) => {
    const res = await fetch("/api/crm/quotations/send.php", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const json = await res.json();
    if (json.success) {
      toast({ title: "Marked as Sent" });
      if (json.whatsapp_url) {
        window.open(json.whatsapp_url, "_blank");
      }
      fetchList();
    } else {
      toast({ title: "Failed to send", description: json.error, variant: "destructive" });
    }
  };

  const convertToInvoice = async (id: number, qn: string) => {
    if (!confirm(`Convert quotation ${qn} to an invoice?`)) return;
    const res = await fetch("/api/crm/quotations/convert-to-invoice.php", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const json = await res.json();
    if (json.success) {
      toast({ title: "Converted to Invoice!" });
      fetchList();
    } else {
      toast({ title: "Failed", description: json.error, variant: "destructive" });
    }
  };

  const reviseQuotation = async (id: number, qn: string) => {
    if (!confirm(`Revise quotation ${qn}? This will create a new draft.`)) return;
    const res = await fetch("/api/crm/quotations/revise.php", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const json = await res.json();
    if (json.success) {
      toast({ title: "Revised Successfully!" });
      setEditId(json.id);
      setView("form");
    } else {
      toast({ title: "Failed", description: json.error, variant: "destructive" });
    }
  };

  const acceptQuotation = async (id: number) => {
    if (!confirm("Mark this quotation as Accepted?")) return;
    const res = await fetch("/api/crm/quotations/accept.php", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if ((await res.json()).success) { toast({ title: "Accepted!" }); fetchList(); }
  };

  const rejectQuotation = async (id: number) => {
    if (!confirm("Mark this quotation as Rejected?")) return;
    const res = await fetch("/api/crm/quotations/reject.php", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if ((await res.json()).success) { toast({ title: "Rejected!" }); fetchList(); }
  };

  const deleteQuotation = async (id: number) => {
    if (!confirm("Delete this quotation? This action cannot be undone.")) return;
    const res = await fetch("/api/crm/quotations/delete.php", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const json = await res.json();
    if (json.success) {
      toast({ title: "Deleted Successfully!" });
      fetchList();
    } else {
      toast({ title: "Failed to delete", description: json.error, variant: "destructive" });
    }
  };

  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (view === "form") {
    return <QuotationBuilderWizard editId={editId} leadId={leadId} onBack={() => { setView("list"); fetchList(); }} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-600" /> Quotations
            </h2>
            <p className="text-sm text-muted-foreground">{quotations.length} quotations</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchList} disabled={loadingList}>
            <RefreshCw className={`w-4 h-4 ${loadingList ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => { setEditId(null); setView("form"); }}
            className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/25">
            <Plus className="w-4 h-4 mr-1.5" /> New Quotation
          </Button>
        </div>
      </div>

      {loadingList ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-20 bg-muted/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : quotations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
          <FileText className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-medium">No quotations yet</p>
          <p className="text-sm mt-1">Create your first quotation for a client</p>
          <Button size="sm" className="mt-4" onClick={() => { setEditId(null); setView("form"); }}>
            <Plus className="w-4 h-4 mr-1" /> Create Quotation
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {quotations.map((q, i) => (
              <motion.div key={q.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-violet-200 transition-all cursor-pointer"
                onClick={(e) => {
                  // Only edit if they click the card itself, not a button
                  if ((e.target as HTMLElement).closest('button')) return;
                  setEditId(q.id);
                  setView("form");
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-sm font-bold text-foreground">{q.quotation_number}</span>
                      <StatusBadge status={q.status} />
                      {q.case_id && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Case #{q.case_id}</span>}
                    </div>
                    <p className="font-semibold text-foreground text-sm">{q.client_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {q.origin_city && q.destination_city
                        ? `${q.origin_city} → ${q.destination_city}`
                        : q.client_phone || "No route info"}
                      {q.move_date && ` · Move: ${new Date(q.move_date).toLocaleDateString("en-IN", {day:"numeric",month:"short",year:"numeric"})}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-lg font-bold text-violet-700">{fmt(parseFloat(q.grand_total) || 0)}</div>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-gray-200 text-gray-700 hover:bg-gray-50"
                        onClick={(e) => { e.stopPropagation(); setEditId(q.id); setView("form"); }}>
                        <Edit2 className="w-3 h-3" /> Edit
                      </Button>
                      
                      {["draft", "sent", "revised", "rejected"].includes(q.status) && (
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                          onClick={(e) => { e.stopPropagation(); markSent(q.id); }}>
                          <Send className="w-3 h-3" /> Send
                        </Button>
                      )}

                      {q.status === "sent" && (
                        <>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            onClick={(e) => { e.stopPropagation(); acceptQuotation(q.id); }}>
                            <ThumbsUp className="w-3 h-3" /> Accept
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-rose-200 text-rose-700 hover:bg-rose-50"
                            onClick={(e) => { e.stopPropagation(); rejectQuotation(q.id); }}>
                            <XCircle className="w-3 h-3" /> Reject
                          </Button>
                        </>
                      )}

                      {["sent", "accepted", "rejected"].includes(q.status) && (
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-orange-200 text-orange-700 hover:bg-orange-50"
                          onClick={(e) => { e.stopPropagation(); reviseQuotation(q.id, q.quotation_number); }}>
                          <RefreshCw className="w-3 h-3" /> Revise
                        </Button>
                      )}

                      {q.status === "accepted" && (
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-green-200 text-green-700 hover:bg-green-50"
                          onClick={(e) => { e.stopPropagation(); convertToInvoice(q.id, q.quotation_number); }}>
                          <CheckCircle2 className="w-3 h-3" /> To Invoice
                        </Button>
                      )}
                      
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-red-200 text-red-700 hover:bg-red-50"
                        onClick={(e) => { e.stopPropagation(); deleteQuotation(q.id); }}>
                        <Trash2 className="w-3 h-3" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
