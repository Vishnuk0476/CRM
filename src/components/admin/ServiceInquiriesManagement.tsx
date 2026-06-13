import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Search, Filter, RefreshCw, Loader2, Mail, Phone, Briefcase,
  Save, Clock, CheckCircle2, AlertCircle, Package, FileText,
  Trash2, ChevronRight, Eye, Calendar, ArrowUpRight, TrendingUp, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/useAuth";
import { inquiryService, ServiceInquiry } from "@/services/apiService";
import { ShieldAlert } from "lucide-react";

// ServiceInquiry interface moved to apiService

interface Props { onClose: () => void; }

const STATUS = [
  { value: "pending",     label: "Pending",     color: "text-amber-600",   bg: "bg-amber-50  border-amber-200",   dot: "bg-amber-500",   badge: "bg-amber-100 text-amber-700"  },
  { value: "reviewed",    label: "Reviewed",    color: "text-blue-600",    bg: "bg-blue-50   border-blue-200",    dot: "bg-blue-500",    badge: "bg-blue-100  text-blue-700"   },
  { value: "in_progress", label: "In Progress", color: "text-orange-600",  bg: "bg-orange-50 border-orange-200",  dot: "bg-orange-500",  badge: "bg-orange-100 text-orange-700"},
  { value: "completed",   label: "Completed",   color: "text-green-600",   bg: "bg-green-50  border-green-200",   dot: "bg-green-500",   badge: "bg-green-100  text-green-700" },
  { value: "cancelled",   label: "Cancelled",   color: "text-red-600",     bg: "bg-red-50    border-red-200",     dot: "bg-red-500",     badge: "bg-red-100    text-red-700"   },
];

const getStatus = (v: string) => STATUS.find(s => s.value === v) ?? STATUS[0];
const fmt = (key: string) => key.replace(/_/g," ").replace(/([A-Z])/g," $1").replace(/^./,s=>s.toUpperCase()).trim();

export const ServiceInquiriesManagement = ({ onClose }: Props) => {
  const { toast } = useToast();
  const { canEdit, canDelete } = usePermissions();

  const [inquiries, setInquiries]     = useState<ServiceInquiry[]>([]);
  const [loading,   setLoading]       = useState(true);
  const [search,    setSearch]        = useState("");
  const [filter,    setFilter]        = useState("all");
  const [selected,  setSelected]      = useState<ServiceInquiry | null>(null);
  const [saving,    setSaving]        = useState(false);
  const [editSt,    setEditSt]        = useState("");
  const [editMsg,   setEditMsg]       = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ServiceInquiry | null>(null);
  const [deleting,  setDeleting]      = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data, error } = await inquiryService.list();
      if (error) throw error;
      setInquiries(data || []);
    } catch {
      toast({ title: "Error", description: "Failed to load inquiries.", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const openDetail = (inq: ServiceInquiry) => {
    setSelected(inq);
    setEditSt(inq.status);
    setEditMsg(inq.status_message ?? "");
  };

  const handleUpdate = async () => {
    if (!selected) return;
    if (!canEdit) {
      toast({ title: "Permission Denied", description: "You don't have edit permissions.", variant: "destructive", action: <ShieldAlert className="w-5 h-5 text-white" /> });
      return;
    }
    setSaving(true);
    try {
      const { error } = await inquiryService.update(selected.id!, {
        status: editSt,
        status_message: editMsg || null
      });
      if (error) throw error;
      toast({ title: "Updated", description: "Inquiry status saved and customer notified." });
      setSelected(null);
      fetchAll();
    } catch {
      toast({ title: "Failed", description: "Could not update inquiry.", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (!canDelete) {
      toast({ title: "Permission Denied", description: "Only Administrators can delete.", variant: "destructive", action: <ShieldAlert className="w-5 h-5 text-white" /> });
      return;
    }
    setDeleting(true);
    try {
      const { error } = await inquiryService.delete(deleteTarget.id!);
      if (error) throw error;
      toast({ title: "Deleted", description: `Inquiry ${deleteTarget.reference_number} removed.` });
      setDeleteTarget(null);
      if (selected?.id === deleteTarget.id) setSelected(null);
      fetchAll();
    } catch {
      toast({ title: "Failed", description: "Could not delete inquiry.", variant: "destructive" });
    } finally { setDeleting(false); }
  };

  const filtered = inquiries.filter(i => {
    const q = search.toLowerCase();
    const matchSearch = !q || i.reference_number.toLowerCase().includes(q) || i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q) || i.service_name.toLowerCase().includes(q);
    const matchFilter = filter === "all" || i.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    total: inquiries.length,
    pending: inquiries.filter(i => i.status === "pending").length,
    in_progress: inquiries.filter(i => i.status === "in_progress").length,
    completed: inquiries.filter(i => i.status === "completed").length,
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* ── TOP HEADER ── */}
        <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Service Inquiries</h2>
              <p className="text-xs text-white/60">{inquiries.length} total leads</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchAll} className="text-white/70 hover:text-white hover:bg-white/10">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/10">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-4 gap-0 border-b border-border flex-shrink-0">
          {[
            { label: "Total", value: counts.total,       icon: Users,        color: "text-foreground", bg: "bg-muted/30" },
            { label: "Pending", value: counts.pending,   icon: Clock,        color: "text-amber-500",  bg: "bg-amber-500/5" },
            { label: "Active", value: counts.in_progress,icon: TrendingUp,   color: "text-orange-500", bg: "bg-orange-500/5" },
            { label: "Done",   value: counts.completed,  icon: CheckCircle2, color: "text-green-500",  bg: "bg-green-500/5"  },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`${bg} px-5 py-4 flex items-center gap-3 border-r border-border last:border-r-0`}>
              <Icon className={`w-5 h-5 ${color} opacity-70`} />
              <div>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── FILTERS ── */}
        <div className="px-4 py-3 border-b border-border flex flex-col sm:flex-row gap-2 flex-shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name, email, reference or service…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
          <div className="flex gap-2">
            <select value={filter} onChange={e => setFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary h-9">
              <option value="all">All Status</option>
              {STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* ── MAIN CONTENT — split layout when detail open ── */}
        <div className="flex-1 overflow-hidden flex">

          {/* ── TABLE ── */}
          <div className={`flex-1 overflow-y-auto ${selected ? "hidden md:block md:w-1/2 lg:w-3/5 border-r border-border" : "w-full"}`}>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                <Package className="w-10 h-10 opacity-30" />
                <p className="text-sm">No inquiries match your search.</p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {filtered.map((inq, idx) => {
                  const s = getStatus(inq.status);
                  const isActive = selected?.id === inq.id;
                  return (
                    <motion.div
                      key={inq.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => openDetail(inq)}
                      className={`group relative rounded-xl border p-4 cursor-pointer transition-all duration-150 ${
                        isActive
                          ? "border-primary/50 bg-primary/5 shadow-sm"
                          : "border-border bg-card hover:border-primary/30 hover:bg-muted/30 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Status dot */}
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${s.dot}`} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-semibold text-foreground">{inq.reference_number}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${s.badge} ${s.bg}`}>{s.label}</span>
                          </div>
                          <p className="font-semibold text-sm text-foreground mt-0.5 truncate">{inq.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{inq.service_name} · {inq.email}</p>
                        </div>

                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground">
                            {new Date(inq.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                          <button
                            onClick={e => { e.stopPropagation(); setDeleteTarget(inq); }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-50 hover:text-red-500 text-muted-foreground transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── DETAIL PANEL ── */}
          <AnimatePresence>
            {selected && (
              <motion.div
                key="panel"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full md:w-1/2 lg:w-2/5 flex flex-col overflow-hidden"
              >
                {/* Panel header */}
                <div className="px-5 py-4 border-b border-border flex items-start justify-between bg-muted/30 flex-shrink-0">
                  <div>
                    <p className="text-xs text-muted-foreground font-mono">{selected.reference_number}</p>
                    <h3 className="font-bold text-foreground">{selected.name}</h3>
                    <p className="text-xs text-muted-foreground">{selected.service_name} · {selected.service_type}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDeleteTarget(selected)}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  {/* Contact */}
                  <div className="rounded-xl border border-border p-4 space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Contact</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <a href={`mailto:${selected.email}`} className="text-primary hover:underline truncate">{selected.email}</a>
                        <a href={`mailto:${selected.email}`} className="ml-auto text-muted-foreground hover:text-primary shrink-0"><ArrowUpRight className="w-3.5 h-3.5" /></a>
                      </div>
                      {selected.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <a href={`tel:${selected.phone}`} className="text-primary hover:underline">{selected.phone}</a>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{new Date(selected.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Inquiry Details */}
                  {Object.keys(selected.form_data ?? {}).length > 0 && (
                    <div className="rounded-xl border border-border p-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3"><FileText className="w-3.5 h-3.5" /> Inquiry Details</p>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(selected.form_data).map(([k, v]) => (
                          <div key={k} className="bg-muted/50 rounded-lg px-3 py-2">
                            <p className="text-xs text-muted-foreground">{fmt(k)}</p>
                            <p className="text-sm font-medium text-foreground">{String(v)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Update Status */}
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider">Update Status</p>
                    <div className="grid grid-cols-1 gap-2">
                      {STATUS.map(s => (
                        <button
                          key={s.value}
                          onClick={() => setEditSt(s.value)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                            editSt === s.value ? `${s.bg} border-current ${s.color}` : "border-border bg-card hover:bg-muted/50 text-foreground"
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                          <span className="text-sm font-medium">{s.label}</span>
                          {editSt === s.value && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="text-xs font-medium text-foreground block mb-1.5">Customer-visible message</label>
                      <Textarea
                        value={editMsg}
                        onChange={e => setEditMsg(e.target.value)}
                        placeholder="e.g., We are reviewing your requirements and will contact you shortly."
                        rows={3}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Save footer */}
                <div className="border-t border-border px-5 py-4 flex gap-3 flex-shrink-0 bg-card">
                  <Button variant="outline" onClick={() => setSelected(null)} className="flex-1">Cancel</Button>
                  <Button onClick={handleUpdate} disabled={saving} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save Changes</>}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── DELETE CONFIRM MODAL ── */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div key="del-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
            <motion.div
              key="del-modal"
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto p-6">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-center font-bold text-lg text-foreground mb-1">Delete Inquiry?</h3>
                <p className="text-center text-sm text-muted-foreground mb-2">
                  <span className="font-mono font-semibold text-foreground">{deleteTarget.reference_number}</span>
                </p>
                <p className="text-center text-sm text-muted-foreground mb-6">
                  {deleteTarget.name} — {deleteTarget.service_name}. This action <strong>cannot be undone</strong>.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setDeleteTarget(null)} className="flex-1">Cancel</Button>
                  <Button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600"
                  >
                    {deleting ? <><Loader2 className="w-4 h-4 animate-spin" />Deleting…</> : <><Trash2 className="w-4 h-4" />Delete</>}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
