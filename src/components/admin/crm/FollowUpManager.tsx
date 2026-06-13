import { useState, useEffect, useCallback } from "react";
import {
  CalendarClock, AlertTriangle, Clock, Check, Phone, Mail,
  MessageSquare, RefreshCw, Plus, X, Loader2, Bell, MoreHorizontal, Calendar, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const TYPE_ICONS: Record<string, any> = {
  call: Phone, email: Mail, whatsapp: MessageSquare, visit: CalendarClock, other: Clock
};

const TYPE_COLORS: Record<string, string> = {
  call: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  email: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  whatsapp: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  visit: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  other: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

interface ScheduleForm {
  lead_id: string;
  case_id: string;
  followup_type: string;
  custom_message: string;
  scheduled_at: string;
}

const FollowUpManager = () => {
  const { toast } = useToast();
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [summary, setSummary] = useState({ overdue: 0, today: 0, upcoming: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("pending");
  const [dateFilter, setDateFilter] = useState<"all" | "overdue" | "today" | "upcoming">("all");

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [schedForm, setSchedForm] = useState<ScheduleForm>({
    lead_id: "", case_id: "", followup_type: "call",
    custom_message: "", scheduled_at: ""
  });

  // Complete modal
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [outcome, setOutcome] = useState("");

  const fetchFollowUps = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: filter === "all" ? "all" : filter });
      if (dateFilter !== "all") params.set("filter", dateFilter);
      params.set("limit", "100");

      const res = await fetch(`/api/crm/followups.php?${params}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setFollowUps(Array.isArray(json.data?.followups) ? json.data.followups : []);
        setSummary(json.data?.summary || { overdue: 0, today: 0, upcoming: 0 });
      }
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, [filter, dateFilter]);

  useEffect(() => { fetchFollowUps(); }, [fetchFollowUps]);

  const handleComplete = async () => {
    if (!completingId) return;
    try {
      const res = await fetch("/api/crm/followups.php", {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: completingId, status: "completed", outcome }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Follow-up marked complete!" });
        setCompletingId(null);
        setOutcome("");
        fetchFollowUps();
      }
    } catch {}
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedForm.scheduled_at) return toast({ title: "Please set a date & time", variant: "destructive" });
    setCreating(true);
    try {
      const res = await fetch("/api/crm/followups.php", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedForm),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Follow-up scheduled!" });
        setShowCreate(false);
        setSchedForm({ lead_id: "", case_id: "", followup_type: "call", custom_message: "", scheduled_at: "" });
        fetchFollowUps();
      } else {
        toast({ title: "Failed", description: json.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" });
    } finally { setCreating(false); }
  };

  const today = new Date().toISOString().slice(0, 10);

  // Compute default scheduled_at (tomorrow 10 AM)
  const defaultScheduledAt = () => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 tracking-tight">Follow-ups Manager</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Track and manage reminders, calls, and meetings</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="icon" onClick={fetchFollowUps} disabled={loading} className="h-10 w-10 rounded-xl border-gray-200 bg-white hover:bg-gray-50 shadow-sm transition-colors">
            <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button size="sm" onClick={() => { setSchedForm(f => ({...f, scheduled_at: defaultScheduledAt()})); setShowCreate(true); }}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 border-none rounded-xl h-10 px-4">
            <Plus className="w-4 h-4 mr-1.5" /> Schedule Follow-up
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Overdue", value: summary.overdue, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", shadow: "shadow-rose-500/5", icon: AlertTriangle, filter: "overdue" },
          { label: "Today", value: summary.today, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", shadow: "shadow-amber-500/5", icon: Clock, filter: "today" },
          { label: "Upcoming", value: summary.upcoming, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", shadow: "shadow-blue-500/5", icon: CalendarClock, filter: "upcoming" },
        ].map((c, i) => (
          <motion.button key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            onClick={() => setDateFilter(dateFilter === c.filter as any ? "all" : c.filter as any)}
            className={`relative overflow-hidden bg-white/60 backdrop-blur-xl rounded-3xl border p-6 text-left transition-all duration-300
              ${dateFilter === c.filter ? `ring-2 ring-offset-2 ring-${c.color.split('-')[1]}-500 shadow-xl scale-[1.02]` : `hover:shadow-lg hover:-translate-y-1 ${c.shadow}`} 
              ${c.border}`}
          >
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-40 ${c.bg} transition-transform duration-700`}></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{c.label}</p>
                <h3 className={`text-4xl font-black ${c.color} tracking-tight`}>{c.value}</h3>
              </div>
              <div className={`w-14 h-14 rounded-2xl ${c.bg} ${c.color} flex items-center justify-center`}>
                <c.icon className="w-7 h-7" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/60 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 p-6 flex flex-col min-h-[400px]">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
          <div className="flex gap-2 bg-gray-100/50 p-1 rounded-xl border border-gray-200/50">
            {(["pending", "completed", "all"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all
                  ${filter === f ? "bg-white text-violet-700 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"}`}>
                {f === "pending" ? "Pending" : f === "completed" ? "Completed" : "All"}
              </button>
            ))}
          </div>
          {dateFilter !== "all" && (
            <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={() => setDateFilter("all")}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-violet-50 text-violet-700 border border-violet-100 flex items-center gap-2 hover:bg-violet-100 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear Date Filter
            </motion.button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100/50 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {followUps.map((fu, i) => {
                const Icon = TYPE_ICONS[fu.followup_type] || Clock;
                const isOverdue = fu.status === "pending" && fu.scheduled_at?.slice(0,10) < today;
                const isToday = fu.scheduled_at?.slice(0,10) === today;
                const displayName = fu.lead_name || fu.case_client_name || "Client";

                return (
                  <motion.div key={fu.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}
                    className={`flex flex-col p-5 rounded-2xl border transition-all duration-300 hover:shadow-md group relative overflow-hidden
                      ${isOverdue ? "bg-rose-50/30 border-rose-100" : isToday ? "bg-amber-50/30 border-amber-100" : "bg-white border-gray-100"}`}
                  >
                    {isOverdue && <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>}
                    {isToday && <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>}
                    {!isOverdue && !isToday && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>}

                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${TYPE_COLORS[fu.followup_type] || TYPE_COLORS.other}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="text-base font-bold text-gray-900 truncate">{displayName}</h4>
                          {isOverdue && <span className="text-[9px] font-black tracking-wider text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded uppercase">Overdue</span>}
                          {isToday && <span className="text-[9px] font-black tracking-wider text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded uppercase">Today</span>}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gray-400" /> {fu.scheduled_date_human || fu.scheduled_at?.slice(0,16)}</span>
                          <span>•</span>
                          <span className="uppercase tracking-wider">{fu.followup_type}</span>
                          {fu.case_number && (
                            <>
                              <span>•</span>
                              <span className="bg-gray-100 border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded text-[10px] uppercase">{fu.case_number}</span>
                            </>
                          )}
                        </div>
                        {fu.custom_message && (
                          <div className="mt-3 text-sm text-gray-600 bg-gray-50/80 p-3 rounded-xl border border-gray-100 line-clamp-2 leading-relaxed">
                            {fu.custom_message}
                          </div>
                        )}
                        {fu.outcome && fu.status === "completed" && (
                          <div className="mt-3 text-sm text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100 font-medium flex items-start gap-2">
                            <Check className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{fu.outcome}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {fu.status === "pending" && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                        <Button size="sm" className="h-9 px-4 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 hover:border-transparent transition-all shadow-sm font-bold gap-2"
                          onClick={() => { setCompletingId(fu.id); setOutcome(""); }}>
                          <Check className="w-4 h-4" /> Mark Complete
                        </Button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
              {followUps.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-24 text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl bg-white/40">
                  <Bell className="w-16 h-16 mb-4 opacity-20" />
                  <p className="font-bold text-lg text-gray-600">No follow-ups found</p>
                  <p className="text-sm mt-1">Schedule a new follow-up to keep track of clients.</p>
                  <Button size="sm" className="mt-6 h-10 px-5 rounded-xl bg-violet-600 text-white font-bold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40" onClick={() => { setSchedForm(f => ({...f, scheduled_at: defaultScheduledAt()})); setShowCreate(true); }}>
                    <Plus className="w-4 h-4 mr-1.5" /> Schedule Follow-up
                  </Button>
                </div>
              )}
            </div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* ── Create Modal ── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden"
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center"><CalendarClock className="w-5 h-5" /></div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">Schedule Follow-up</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-200" onClick={() => setShowCreate(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Follow-up Type</label>
                  <div className="flex gap-2 flex-wrap">
                    {["call","email","whatsapp","visit","other"].map(t => {
                      const Icon = TYPE_ICONS[t];
                      return (
                        <button key={t} type="button"
                          onClick={() => setSchedForm(f => ({...f, followup_type: t}))}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border
                            ${schedForm.followup_type === t ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"}`}>
                          <Icon className="w-4 h-4" /> {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Date & Time *</label>
                  <Input
                    type="datetime-local"
                    value={schedForm.scheduled_at}
                    onChange={e => setSchedForm(f => ({...f, scheduled_at: e.target.value}))}
                    required
                    className="px-4 py-5 text-sm font-medium rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Lead ID (opt.)</label>
                    <Input type="number" value={schedForm.lead_id} onChange={e => setSchedForm(f => ({...f, lead_id: e.target.value}))} placeholder="e.g. 12" className="px-4 py-5 text-sm font-medium rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Case ID (opt.)</label>
                    <Input type="number" value={schedForm.case_id} onChange={e => setSchedForm(f => ({...f, case_id: e.target.value}))} placeholder="e.g. 104" className="px-4 py-5 text-sm font-medium rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Message / Note</label>
                  <textarea
                    value={schedForm.custom_message}
                    onChange={e => setSchedForm(f => ({...f, custom_message: e.target.value}))}
                    placeholder="What do you need to discuss?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none resize-none transition-all shadow-sm"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={creating}
                    className="w-full py-6 rounded-xl text-base font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all border-none gap-2">
                    {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CalendarClock className="w-5 h-5" />}
                    Confirm Schedule
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Complete Modal ── */}
      <AnimatePresence>
        {completingId !== null && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-gray-100 overflow-hidden"
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-emerald-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><Check className="w-5 h-5" /></div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">Complete Follow-up</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-200" onClick={() => setCompletingId(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Outcome / Notes</label>
                  <textarea
                    value={outcome}
                    onChange={e => setOutcome(e.target.value)}
                    placeholder="What was the result?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none transition-all shadow-sm"
                  />
                </div>
                <div className="pt-2">
                  <Button onClick={handleComplete}
                    className="w-full py-6 rounded-xl text-base font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all border-none gap-2">
                    <Check className="w-5 h-5" /> Mark Done
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FollowUpManager;

