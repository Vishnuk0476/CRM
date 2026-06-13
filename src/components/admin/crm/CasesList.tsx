import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Filter, RefreshCw, Briefcase, X, Loader2, PlayCircle, CheckCircle2, PauseCircle, Ban, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CaseCard } from "./CaseCard";
import { CaseDetail } from "./CaseDetail";

export function CasesList() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [detailId, setDetailId] = useState<number | null>(null);
  const [total, setTotal] = useState(0);

  // New Case Modal State
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCaseForm, setNewCaseForm] = useState({ client_name: "", client_phone: "" });

  const fetchCases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      
      const res = await fetch(`/api/crm/cases.php?${params}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setCases(json.data.cases || []);
        setTotal(json.data.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this case? This action cannot be undone.")) return;
    try {
      const res = await fetch("/api/crm/cases.php", {
        method: "DELETE", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const json = await res.json();
      if (json.success) fetchCases();
      else alert(json.error || "Failed to delete");
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Failed to delete'); }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/crm/cases.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newCaseForm)
      });
      const json = await res.json();
      if (json.success) {
        setShowNewCaseModal(false);
        setNewCaseForm({ client_name: "", client_phone: "" });
        fetchCases();
        setDetailId(json.data.id); // Open the new case details
      } else {
        alert(json.error || "Failed to create case");
      }
    } catch (err: unknown) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => { fetchCases(); }, [statusFilter]);
  useEffect(() => { const t = setTimeout(fetchCases, 300); return () => clearTimeout(t); }, [search]);

  // Metrics
  const activeCases    = cases.filter(c => c.case_status === 'active').length;
  const completedCases = cases.filter(c => c.case_status === 'completed').length;
  const holdCases      = cases.filter(c => c.case_status === 'on_hold').length;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">Active Cases & Jobs</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Manage operational workflows, milestones, and client updates</p>
        </div>
        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 border-none rounded-xl h-10 px-5" onClick={() => setShowNewCaseModal(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> New Case
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Cases", value: total, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", shadow: "shadow-blue-500/5" },
          { label: "Active Jobs", value: activeCases, icon: PlayCircle, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100", shadow: "shadow-violet-500/5" },
          { label: "Completed", value: completedCases, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", shadow: "shadow-emerald-500/5" },
          { label: "On Hold", value: holdCases, icon: PauseCircle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", shadow: "shadow-amber-500/5" },
        ].map((m, i) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={m.label} 
            className={`bg-white/60 backdrop-blur-xl rounded-3xl border ${m.border} p-6 shadow-xl ${m.shadow} flex items-center justify-between group overflow-hidden relative`}>
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-50 ${m.bg} group-hover:scale-150 transition-transform duration-700`}></div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{m.label}</p>
              <h3 className={`text-3xl font-black ${m.color} tracking-tight`}>{m.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${m.bg} ${m.color} flex items-center justify-center relative z-10`}>
              <m.icon className="w-6 h-6" />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/60 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden flex flex-col p-2">
        <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search case numbers, clients, cities..." value={search} onChange={e => setSearch(e.target.value)} className="pl-11 h-11 bg-gray-50/50 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" />
          </div>
          <div className="flex items-center gap-3">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 h-11 text-sm font-semibold rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-gray-700 outline-none transition-colors shadow-sm">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button variant="outline" size="icon" onClick={fetchCases} className="h-11 w-11 rounded-xl border-gray-200 bg-gray-50 hover:bg-gray-100 hover:text-blue-600 shadow-sm transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {loading && cases.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col-span-full py-20 flex justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500/50" />
            </motion.div>
          ) : cases.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col-span-full py-24 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl bg-white/40 backdrop-blur-sm">
              <Briefcase className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-bold text-lg text-gray-600">No cases found</p>
              <p className="text-sm mt-1">Try adjusting your search filters or add a new case.</p>
            </motion.div>
          ) : (
            cases.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}>
                <CaseCard data={c} onClick={() => setDetailId(c.id)} onDelete={(e) => handleDelete(c.id, e)} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {detailId && <CaseDetail caseId={detailId} onClose={() => setDetailId(null)} onUpdated={fetchCases} />}

      {/* New Case Modal */}
      <AnimatePresence>
        {showNewCaseModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><Briefcase className="w-5 h-5" /></div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">Create New Case</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-200" onClick={() => setShowNewCaseModal(false)}><X className="w-4 h-4" /></Button>
              </div>
              <form onSubmit={handleCreateCase} className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Client Name *</label>
                  <Input value={newCaseForm.client_name} onChange={(e) => setNewCaseForm({ ...newCaseForm, client_name: e.target.value })} placeholder="Full Name" required className="px-4 py-5 text-sm font-medium rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Client Phone</label>
                  <Input value={newCaseForm.client_phone} onChange={(e) => setNewCaseForm({ ...newCaseForm, client_phone: e.target.value })} placeholder="Phone number" className="px-4 py-5 text-sm font-medium rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div className="pt-2">
                  <Button type="submit" disabled={creating} className="w-full py-6 rounded-xl text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all border-none">
                    {creating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                    Initialize Case
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
