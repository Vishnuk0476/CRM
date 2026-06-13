import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Plus, Phone, Mail, MapPin, Calendar, IndianRupee, ArrowRight, GripVertical, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import LeadForm from "./LeadForm";
import { CaseDetail } from "./CaseDetail";

interface Lead {
  id: number;
  case_number: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  origin_city: string;
  destination_city: string;
  move_date_expected: string;
  bhk_type: string;
  milestone: string;
  total_quoted: number;
  consultant_name: string;
  created_at_formatted: string;
}

const PIPELINE_STAGES = [
  { key: "lead",               label: "New Lead",    accent: "from-blue-500 to-cyan-500",   bg: "bg-blue-50/50",    border: "border-blue-200/60" },
  { key: "survey_completed",   label: "Surveyed",    accent: "from-indigo-500 to-blue-500", bg: "bg-indigo-50/50",  border: "border-indigo-200/60" },
  { key: "quotation_sent",     label: "Quoted",      accent: "from-purple-500 to-pink-500", bg: "bg-purple-50/50",  border: "border-purple-200/60" },
  { key: "quotation_accepted", label: "Accepted",    accent: "from-emerald-500 to-teal-500",bg: "bg-emerald-50/50", border: "border-emerald-200/60" },
  { key: "packing_scheduled",  label: "Packing",     accent: "from-amber-500 to-orange-500",bg: "bg-amber-50/50",   border: "border-amber-200/60" },
  { key: "in_transit",         label: "In Transit",  accent: "from-orange-500 to-red-500",  bg: "bg-orange-50/50",  border: "border-orange-200/60" },
  { key: "delivered",          label: "Delivered",   accent: "from-slate-700 to-slate-900", bg: "bg-slate-50/50",   border: "border-slate-200/60" },
];

const LeadPipeline = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/cases.php?limit=200", { credentials: "include" });
      const json = await res.json();
      if (json.success) setLeads(json.data.cases || []);
    } catch (err: unknown) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(lead.id));
  };

  const handleDragOver = (e: React.DragEvent, stageKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(stageKey);
  };

  const handleDragLeave = () => { setDropTarget(null); };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDropTarget(null);
    if (!draggedLead || draggedLead.milestone === newStatus) { setDraggedLead(null); return; }

    // Optimistic update
    const oldStatus = draggedLead.milestone;
    setLeads(prev => prev.map(l => l.id === draggedLead.id ? { ...l, milestone: newStatus } : l));

    try {
      const res = await fetch("/api/crm/cases.php", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: draggedLead.id, milestone: newStatus }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
    } catch {
      // Revert on failure
      setLeads(prev => prev.map(l => l.id === draggedLead.id ? { ...l, milestone: oldStatus } : l));
    }
    setDraggedLead(null);
  };

  const formatCurrency = (val: number) => {
    if (!val) return "—";
    return `₹${val.toLocaleString("en-IN")}`;
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 tracking-tight">Sales Pipeline</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Drag and drop leads to update their journey</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchLeads} className="bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-white shadow-sm h-10 rounded-xl font-semibold">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin text-violet-500' : 'text-gray-500'}`} /> Sync
          </Button>
          <Button size="sm" onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 h-10 rounded-xl border-none">
            <Plus className="w-4 h-4 mr-1.5" /> New Lead
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = leads.filter(l => l.milestone === stage.key);
          const isDropping = dropTarget === stage.key;
          
          return (
            <div
              key={stage.key}
              className={`flex-shrink-0 w-[320px] snap-center flex flex-col rounded-[2rem] border-2 transition-all duration-300 relative overflow-hidden backdrop-blur-xl ${stage.bg}
                ${isDropping ? `${stage.border} scale-[1.02] shadow-2xl shadow-${stage.accent.split('-')[1]}/20` : 'border-white/60 shadow-xl shadow-gray-200/40'}`}
              onDragOver={(e) => handleDragOver(e, stage.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.key)}
            >
              {/* Column header */}
              <div className="px-6 py-5 flex items-center justify-between border-b border-white/40 bg-white/40 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${stage.accent} shadow-sm`} />
                  <span className="text-base font-black text-gray-800 tracking-tight">{stage.label}</span>
                </div>
                <span className={`text-xs font-bold text-gray-700 bg-white shadow-sm border border-gray-100 rounded-full px-3 py-1`}>
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards */}
              <div className={`flex-1 p-4 space-y-4 min-h-[400px] overflow-y-auto custom-scrollbar`}>
                <AnimatePresence>
                  {stageLeads.map((lead, i) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: i * 0.05 }}
                      draggable
                      onDragStart={(e: unknown) => handleDragStart(e, lead)}
                      onClick={() => setSelectedLead(lead)}
                      className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white shadow-sm p-5 cursor-pointer hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${stage.accent}"></div>
                      
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 pr-4">
                          <h4 className="text-base font-bold text-gray-900 leading-tight group-hover:text-violet-700 transition-colors">{lead.client_name}</h4>
                          <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{lead.case_number}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-violet-50 group-hover:text-violet-500 transition-colors cursor-grab shrink-0">
                          <GripVertical className="w-4 h-4" />
                        </div>
                      </div>

                      {(lead.origin_city || lead.destination_city) && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-4 bg-gray-50/80 px-3 py-2 rounded-lg border border-gray-100">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate">
                            {lead.origin_city || "Any"} <ArrowRight className="w-3 h-3 inline mx-1 text-gray-300" /> {lead.destination_city || "Any"}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100/80">
                        {lead.total_quoted ? (
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Value</span>
                            <span className="text-sm font-black text-emerald-600">
                              {formatCurrency(lead.total_quoted)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Value</span>
                            <span className="text-xs font-semibold text-gray-400">Not quoted</span>
                          </div>
                        )}
                        
                        {lead.consultant_name && (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Owner</span>
                            <div className="flex items-center gap-1.5 bg-violet-50 px-2 py-1 rounded-md border border-violet-100 text-violet-700">
                              <User2 className="w-3 h-3" />
                              <span className="text-[10px] font-bold truncate max-w-[80px]">
                                {lead.consultant_name.split(" ")[0]}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {stageLeads.length === 0 && !loading && (
                  <div className="flex flex-col items-center justify-center h-40 text-center border-2 border-dashed border-gray-200/60 rounded-2xl bg-white/20">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-gradient-to-r ${stage.accent} opacity-20`} />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Drop Leads Here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lead Modal */}
      {showAddForm && (
        <LeadForm
          onClose={() => setShowAddForm(false)}
          onSaved={() => { setShowAddForm(false); fetchLeads(); }}
        />
      )}

      {/* Case Detail Modal */}
      {selectedLead && (
        <CaseDetail
          caseId={selectedLead.id}
          onClose={() => setSelectedLead(null)}
          onUpdated={fetchLeads}
        />
      )}
    </div>
  );
};

export default LeadPipeline;
