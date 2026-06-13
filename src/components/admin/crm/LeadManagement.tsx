import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, RefreshCw, Filter, Download, MapPin, IndianRupee, ChevronDown, Edit2, Trash2, Users, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LeadForm from "./LeadForm";
import LeadDetail from "./LeadDetail";
import { LeadTemperatureBadge } from "./LeadTemperatureBadge";
import { GulfNRIBadge } from "./GulfNRIBadge";
import { LeadAssignModal } from "./LeadAssignModal";
import { LeadConvertModal } from "./LeadConvertModal";

const STATUS_OPTS = [
  { value: "", label: "All Status" },
  { value: "enquiry", label: "Enquiry" },
  { value: "quoted", label: "Quoted" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_transit", label: "In Transit" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_COLORS: Record<string, string> = {
  enquiry: "bg-blue-100 text-blue-700 border-blue-200",
  quoted: "bg-purple-100 text-purple-700 border-purple-200",
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  in_transit: "bg-orange-100 text-orange-700 border-orange-200",
  completed: "bg-teal-100 text-teal-700 border-teal-200",
  cancelled: "bg-rose-100 text-rose-700 border-rose-200",
};

const LeadManagement = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editLead, setEditLead] = useState<any>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState<{id: number, name: string} | null>(null);

  const toggleSelection = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this lead? This action cannot be undone.")) return;
    try {
      const res = await fetch("/api/crm/leads.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const json = await res.json();
      if (json.success) fetchLeads();
      else alert(json.error || "Failed to delete lead");
    } catch {
      alert("Network error occurred while deleting.");
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/crm/leads.php?${params}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) { setLeads(json.data.leads || []); setTotal(json.data.pagination?.total || 0); }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchLeads(); }, [statusFilter]);
  useEffect(() => { const t = setTimeout(fetchLeads, 300); return () => clearTimeout(t); }, [search]);

  // Derived metrics
  const newLeads = leads.filter(l => l.status === 'enquiry').length;
  const activeLeads = leads.filter(l => ['enquiry', 'quoted', 'confirmed'].includes(l.status)).length;
  const convertedLeads = leads.filter(l => l.converted_to_case).length;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 tracking-tight">Lead Management</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Manage inquiries, track statuses, and convert to cases</p>
        </div>
        <div className="flex gap-3">
          {selectedIds.length > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Button size="sm" onClick={() => setShowAssignModal(true)} className="bg-violet-100 text-violet-700 hover:bg-violet-200 border-none shadow-sm rounded-xl h-10 px-4 font-bold">
                Assign Selected ({selectedIds.length})
              </Button>
            </motion.div>
          )}
          <Button size="sm" onClick={() => { setEditLead(null); setShowForm(true); }}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 border-none rounded-xl h-10 px-4">
            <Plus className="w-4 h-4 mr-1.5" /> New Lead
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Leads", value: total, icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", shadow: "shadow-blue-500/5" },
          { label: "New Inquiries", value: newLeads, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", shadow: "shadow-amber-500/5" },
          { label: "Active Pipeline", value: activeLeads, icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100", shadow: "shadow-violet-500/5" },
          { label: "Converted to Cases", value: convertedLeads, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", shadow: "shadow-emerald-500/5" },
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/60 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden flex flex-col">
        {/* Filters */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-white/40">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search by name, phone, email, quotation ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-11 h-11 bg-gray-50/50 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm" />
          </div>
          <div className="flex items-center gap-3">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 h-11 text-sm font-semibold rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-violet-500/20 text-gray-700 outline-none transition-colors shadow-sm">
              {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <Button variant="outline" size="icon" onClick={fetchLeads} className="h-11 w-11 rounded-xl border-gray-200 bg-gray-50 hover:bg-gray-100 hover:text-violet-600 shadow-sm transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-violet-500' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading && leads.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 animate-spin text-violet-500/50" />
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <Users className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-bold text-lg text-gray-600">No leads found</p>
              <p className="text-sm mt-1">Try adjusting your search filters or add a new lead.</p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-12 text-center">
                        <input type="checkbox" className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4 border-gray-300" 
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds(leads.map(l => l.id));
                            else setSelectedIds([]);
                          }} 
                          checked={selectedIds.length === leads.length && leads.length > 0} />
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Lead ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Move Details</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <AnimatePresence>
                      {leads.map((lead, i) => (
                        <motion.tr key={lead.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.02 }}
                          onClick={() => setDetailId(lead.id)} className="group hover:bg-violet-50/30 cursor-pointer transition-colors">
                          <td className="px-6 py-5 text-center" onClick={e => e.stopPropagation()}>
                            <input type="checkbox" className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4 border-gray-300" 
                              checked={selectedIds.includes(lead.id)} onChange={(e) => { e.stopPropagation(); toggleSelection(lead.id, e as any); }} />
                          </td>
                          <td className="px-6 py-5">
                            <span className="bg-violet-50 border border-violet-100 text-violet-700 px-2.5 py-1 rounded-md font-mono text-xs font-bold tracking-wide">
                              L-PG-{String(lead.id).padStart(2, '0')}
                            </span>
                            <div className="text-[10px] text-gray-400 font-semibold mt-2">{lead.created_at_formatted}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 flex items-center justify-center font-bold text-sm shrink-0 border border-violet-200">
                                {lead.customer_name ? lead.customer_name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 group-hover:text-violet-700 transition-colors">{lead.customer_name}</p>
                                <p className="text-xs font-medium text-gray-500 mt-0.5">{lead.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{lead.relocation_type || "Type TBD"}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span className="truncate max-w-[150px]">
                                  {lead.origin_city || "Origin"} → {lead.destination_city || "Dest"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className={`text-[11px] px-2.5 py-1 rounded-full border font-bold uppercase tracking-wider ${STATUS_COLORS[lead.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                              {lead.status?.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm font-semibold text-gray-700">{lead.salesperson_name || "Unassigned"}</span>
                          </td>
                          <td className="px-6 py-5 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              {!lead.converted_to_case ? (
                                <Button size="sm" className="h-8 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 hover:border-transparent transition-all shadow-sm font-bold rounded-lg"
                                  onClick={() => setShowConvertModal({ id: lead.id, name: lead.customer_name })}>
                                  Convert
                                </Button>
                              ) : (
                                <span className="text-[10px] px-2.5 py-1 bg-gray-50 text-gray-500 rounded-md font-bold border border-gray-200 tracking-wider">
                                  CASE #{lead.case_id}
                                </span>
                              )}
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                                onClick={(e) => { e.stopPropagation(); setEditLead(lead); setShowForm(true); }}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                onClick={(e) => handleDelete(lead.id, e)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="md:hidden divide-y divide-gray-100">
                {leads.map(lead => (
                  <div key={lead.id} onClick={() => setDetailId(lead.id)} className="p-5 hover:bg-violet-50/30 cursor-pointer transition-colors relative">
                    <div className="flex items-start justify-between mb-2 pr-12">
                      <div>
                        <span className="font-bold text-gray-900">{lead.customer_name}</span>
                        <span className="block text-xs font-medium text-gray-500 mt-1">{lead.phone}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${STATUS_COLORS[lead.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {lead.status?.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                       <span className="bg-violet-50 text-violet-700 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                         L-PG-{String(lead.id).padStart(2, '0')}
                       </span>
                       <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                         <MapPin className="w-3 h-3 text-gray-400"/> {lead.origin_city} → {lead.destination_city}
                       </span>
                    </div>
                    
                    <div className="absolute top-5 right-4 flex flex-col gap-2">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg"
                        onClick={(e) => { e.stopPropagation(); setEditLead(lead); setShowForm(true); }}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        onClick={(e) => handleDelete(lead.id, e)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {showForm && <LeadForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); fetchLeads(); }} editData={editLead} />}
      {detailId && <LeadDetail leadId={detailId} onClose={() => setDetailId(null)} onUpdated={fetchLeads} onEdit={(lead) => { setEditLead(lead); setShowForm(true); setDetailId(null); }} />}
      {showAssignModal && <LeadAssignModal leadIds={selectedIds} onClose={() => setShowAssignModal(false)} onAssigned={() => { setShowAssignModal(false); setSelectedIds([]); fetchLeads(); }} />}
      {showConvertModal && <LeadConvertModal leadId={showConvertModal.id} customerName={showConvertModal.name} onClose={() => setShowConvertModal(null)} onConverted={(data) => { setShowConvertModal(null); fetchLeads(); alert("Converted to case: " + data.case_number); }} />}
    </div>
  );
};

export default LeadManagement;
