import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Search, RefreshCw, X, Loader2, Trash2, Mail,
  Phone, MapPin, Calendar, Clock, AlertCircle, Save, Package,
  CheckSquare, Square
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

import { usePermissions } from "@/hooks/useAuth";
import { quoteService, QuoteSubmission } from "@/services/apiService";
import { ShieldAlert } from "lucide-react";

// Alias Quote to QuoteSubmission for easier typing inside the component
type Quote = QuoteSubmission;

const QUOTE_STATUSES = [
  { value: "pending",    label: "Pending",    badge: "bg-amber-100 text-amber-700 border-amber-200",    dot: "bg-amber-500"  },
  { value: "reviewing", label: "Reviewing",  badge: "bg-blue-100  text-blue-700  border-blue-200",     dot: "bg-blue-500"   },
  { value: "quoted",    label: "Quoted",     badge: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  { value: "confirmed", label: "Confirmed",  badge: "bg-green-100 text-green-700 border-green-200",    dot: "bg-green-500"  },
  { value: "closed",    label: "Closed",     badge: "bg-slate-100 text-slate-600 border-slate-200",    dot: "bg-slate-400"  },
];

const getStatusStyle = (status: string) =>
  QUOTE_STATUSES.find(s => s.value === status) ?? QUOTE_STATUSES[0];

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const QuoteDetailModal = ({
  quote,
  onClose,
  onUpdated,
}: {
  quote: Quote;
  onClose: () => void;
  onUpdated: () => void;
}) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [newStatus, setNewStatus] = useState<Quote['status']>(quote.status);
  const [statusMessage, setStatusMessage] = useState(quote.admin_notes || "");
  const { canDelete, canEdit } = usePermissions();

  const handleUpdate = async () => {
    if (!canEdit) {
      toast({ 
        title: "Permission Denied", 
        description: "You do not have permission to update quotes.", 
        variant: "destructive",
        action: <ShieldAlert className="w-5 h-5 text-white" />
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await quoteService.update(quote.id!, { 
        status: newStatus as Quote['status'], 
        admin_notes: statusMessage 
      });
      if (error) throw error;
      toast({ title: "Quote Updated!", description: "Status updated successfully." });
      onUpdated();
      onClose();
    } catch (err: unknown) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete) {
      toast({ 
        title: "Permission Denied", 
        description: "Only Administrators can delete quotes.", 
        variant: "destructive",
        action: <ShieldAlert className="w-5 h-5 text-white" />
      });
      return;
    }

    if (!confirm(`Delete quote ${quote.reference_number} from ${quote.name}? This cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      const { error } = await quoteService.delete(quote.id!);
      if (error) throw error;
      toast({ title: "Deleted", description: `Quote ${quote.reference_number} removed.` });
      onUpdated();
      onClose();
    } catch (err: unknown) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const statusStyle = getStatusStyle(quote.status);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/5">
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground">Quote Details</h2>
            <p className="text-xs font-mono text-secondary">{quote.reference_number}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full"><X className="w-4 h-4" /></Button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs">Customer</p>
                <p className="font-semibold">{quote.name}</p>
                <a href={`mailto:${quote.email}`} className="text-primary text-xs hover:underline">{quote.email}</a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs">Phone</p>
                <a href={`tel:${quote.phone}`} className="font-semibold text-primary hover:underline">{quote.phone}</a>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs">Route</p>
                <p className="font-medium text-sm">{quote.origin_city}</p>
                <p className="text-muted-foreground text-xs">→ {quote.destination_city}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs">Move Date</p>
                <p className="font-semibold">{formatDate(quote.move_date || "")}</p>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-muted/40 rounded-xl p-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service</span>
              <span className="font-medium">{quote.service_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Property</span>
              <span className="font-medium">{quote.property_size || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Submitted</span>
              <span className="font-medium">{formatDate(quote.created_at || "")}</span>
            </div>
            {quote.special_requirements && (
              <div className="pt-2 border-t border-border/50">
                <p className="text-muted-foreground text-xs mb-1">Additional Info</p>
                <p className="text-foreground">{quote.special_requirements}</p>
              </div>
            )}
          </div>

          {/* Current Status */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Current Status:</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
              {statusStyle.label}
            </span>
          </div>

          {/* Update Section */}
          <div className="border-t border-border pt-5 space-y-3">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Update Status
            </h3>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">New Status</label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {QUOTE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Message/Notes</label>
              <textarea
                value={statusMessage}
                onChange={e => setStatusMessage(e.target.value)}
                rows={3}
                placeholder="e.g. We will call you within 2 hours with a custom quote."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
            <p className="text-xs text-muted-foreground">💌 Customer is auto-emailed on status change.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3">
          {canDelete ? (
            <Button variant="ghost" onClick={handleDelete} disabled={isSaving || isDeleting}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-2 h-9 px-3">
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              <span className="hidden sm:inline">Delete</span>
            </Button>
          ) : <div />}
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} disabled={isSaving || isDeleting}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={!canEdit || isSaving || isDeleting} className="gap-2">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main QuoteManagement Component ────────────────────────────────────────────
export const QuoteManagement = ({ onClose }: { onClose: () => void }) => {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  // Bulk select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const { canDelete } = usePermissions();

  const fetchQuotes = useCallback(async () => {
    setIsLoading(true);
    setSelectedIds(new Set());
    try {
      const { data, error } = await quoteService.list({ status: statusFilter });
      if (error) throw error;
      
      let qs = data || [];
      if (search) {
        const s = search.toLowerCase();
        qs = qs.filter(q => 
          q.name.toLowerCase().includes(s) || 
          q.email.toLowerCase().includes(s) || 
          (q.reference_number || "").toLowerCase().includes(s)
        );
      }
      
      setQuotes(qs);
      setTotal(qs.length);
      setPendingCount(qs.filter(q => q.status === "new").length);
    } catch {
      toast({ title: "Error", description: "Could not load quotes.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === quotes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(quotes.map(q => q.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (!canDelete) {
      toast({ 
        title: "Permission Denied", 
        description: "Only Administrators can bulk delete quotes.", 
        variant: "destructive",
        action: <ShieldAlert className="w-5 h-5 text-white" />
      });
      return;
    }

    if (selectedIds.size === 0) return;
    if (!confirm(`Permanently delete ${selectedIds.size} quote(s)? This cannot be undone.`)) return;
    setIsBulkDeleting(true);
    let failed = 0;
    for (const id of selectedIds) {
      try {
        const { error } = await quoteService.delete(id);
        if (error) failed++;
      } catch { failed++; }
    }
    setIsBulkDeleting(false);
    toast({
      title: failed === 0 ? "Deleted!" : `${selectedIds.size - failed} deleted, ${failed} failed`,
      description: `${selectedIds.size - failed} quote(s) removed.`,
      variant: failed > 0 ? "destructive" : "default",
    });
    fetchQuotes();
  };

  const allSelected = quotes.length > 0 && selectedIds.size === quotes.length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-secondary/10">
            <FileText className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground">Quote Submissions</h2>
            <p className="text-sm text-muted-foreground">
              {total} total
              {pendingCount > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                  {pendingCount} pending
                </span>
              )}
            </p>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={fetchQuotes} className="h-9 w-9">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or reference…" className="pl-9" />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[160px]"
        >
          <option value="">All Statuses</option>
          {QUOTE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-2.5 bg-destructive/10 border border-destructive/20 rounded-xl"
        >
          <span className="text-sm font-semibold text-foreground">{selectedIds.size} selected</span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={isBulkDeleting}
            className="gap-2 h-8"
          >
            {isBulkDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            Delete Selected
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())} className="h-8 text-muted-foreground">
            Deselect All
          </Button>
        </motion.div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : quotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Package className="w-10 h-10 opacity-40" />
          <p className="text-sm">No quotes found{search || statusFilter ? " matching your filters" : ""}.</p>
        </div>
      ) : (
        <>
          {/* Select All Row */}
          <div className="flex items-center gap-2 px-1">
            <button onClick={toggleSelectAll} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
              {allSelected
                ? <CheckSquare className="w-4 h-4 text-primary" />
                : <Square className="w-4 h-4" />}
              {allSelected ? "Deselect all" : `Select all (${quotes.length})`}
            </button>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {quotes.map((q, i) => {
                const style = getStatusStyle(q.status);
                const isChecked = selectedIds.has(q.id);
                return (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.025 }}
                    className={`group flex items-center gap-3 bg-card border rounded-xl px-4 py-3.5 transition-all ${isChecked ? "border-primary/50 bg-primary/5" : "border-border hover:border-secondary/50 hover:shadow-sm"}`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSelect(q.id); }}
                      className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {isChecked
                        ? <CheckSquare className="w-4 h-4 text-primary" />
                        : <Square className="w-4 h-4" />}
                    </button>

                    {/* Content — click to open modal */}
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedQuote(q)}>
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-mono text-xs text-muted-foreground">{q.reference_number}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${style.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          {style.label}
                        </span>
                      </div>
                      <p className="font-semibold text-foreground text-sm truncate">{q.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{q.service_type} · {q.origin_city} → {q.destination_city}</p>
                    </div>

                    {/* Date */}
                    <div className="text-right shrink-0 cursor-pointer" onClick={() => setSelectedQuote(q)}>
                      <p className="text-xs text-muted-foreground">{formatDate(q.created_at || "")}</p>
                      <p className="text-xs text-primary font-medium mt-0.5">Move: {formatDate(q.move_date || "")}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedQuote && (
          <QuoteDetailModal
            quote={selectedQuote}
            onClose={() => setSelectedQuote(null)}
            onUpdated={fetchQuotes}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuoteManagement;
