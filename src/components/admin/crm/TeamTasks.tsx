import { useState, useEffect } from "react";
import { ClipboardList, Plus, RefreshCw, Loader2, X, Save, Check, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_COLORS: Record<string, { bg: string, text: string, border: string }> = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  in_progress: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
};

const TeamTasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({ order_id: "", assigned_to: "", task_description: "", task_date: new Date().toISOString().slice(0, 10) });
  const [saving, setSaving] = useState(false);

  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/crm/users.php`, { credentials: "include" });
      const json = await res.json();
      if (json.success) setUsers(json.data.users || []);
    } catch {}
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.set("status", filter);
      const res = await fetch(`/api/crm/team-tasks.php?${params}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) setTasks(json.data.tasks || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); fetchUsers(); }, [filter]);

  const handleAdd = async () => {
    if (!form.assigned_to || !form.task_description) return;
    setSaving(true);
    try {
      await fetch("/api/crm/team-tasks.php", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: form.order_id ? parseInt(form.order_id) : null, assigned_to: form.assigned_to, task_description: form.task_description, task_date: form.task_date }),
      });
      setShowAdd(false);
      setForm({ order_id: "", assigned_to: "", task_description: "", task_date: new Date().toISOString().slice(0, 10) });
      fetchTasks();
    } catch {} finally { setSaving(false); }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await fetch("/api/crm/team-tasks.php", {
        method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      fetchTasks();
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 font-outfit tracking-tight flex items-center gap-2">
            <ClipboardList className="w-8 h-8 text-indigo-600" /> Team Tasks
          </h2>
          <p className="text-gray-500 font-medium mt-1">Assign and track operational tasks across the team.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 font-bold px-5">
          <Plus className="w-5 h-5 mr-2" /> Assign Task
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-gray-100 p-2 shadow-sm inline-flex gap-2 overflow-x-auto w-full sm:w-auto">
        {["", "pending", "in_progress", "completed"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap relative ${
              filter === f
                ? "text-indigo-700"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            {filter === f && (
              <motion.div layoutId="taskTab" className="absolute inset-0 bg-indigo-50 border border-indigo-100 rounded-xl" />
            )}
            <span className="relative z-10">{f === "" ? "All Tasks" : f === "in_progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}</span>
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 font-outfit text-lg flex items-center gap-2">
            Tasks Overview
          </h3>
          <Button variant="ghost" size="sm" onClick={fetchTasks} disabled={loading} className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 font-bold">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-indigo-600">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-medium">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <ClipboardList className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-lg font-medium text-gray-500">No tasks found</p>
            <p className="text-sm">Try changing your filters or assign a new task.</p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {tasks.map(task => {
                const statusColors = STATUS_COLORS[task.status] || STATUS_COLORS.pending;
                
                return (
                  <motion.div 
                    layout 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={task.id} 
                    className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-xl transition-all group ${statusColors.border}`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${statusColors.bg} ${statusColors.text}`}>
                        {task.status === "completed" ? <Check className="w-6 h-6" /> : task.status === "in_progress" ? <Clock className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                      </div>
                      <div className="flex-1">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 ${statusColors.bg} ${statusColors.text}`}>
                          {task.status.replace("_", " ")}
                        </span>
                        <h4 className="font-bold text-gray-900 text-base leading-tight mb-1">{task.task_description}</h4>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium">Assigned to</span>
                        <span className="font-bold text-gray-900">{task.assigned_to}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium">Due Date</span>
                        <span className="font-bold text-gray-900">{task.task_date_formatted}</span>
                      </div>
                      {task.order_number && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 font-medium">Order</span>
                          <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{task.order_number}</span>
                        </div>
                      )}
                      {task.customer_name && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 font-medium">Client</span>
                          <span className="font-bold text-gray-900 truncate max-w-[120px]" title={task.customer_name}>{task.customer_name}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-5 pt-5 border-t border-gray-100">
                      {task.status === "pending" && (
                        <Button className="w-full h-11 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold transition-colors shadow-none" onClick={() => handleStatusUpdate(task.id, "in_progress")}>
                          Start Task
                        </Button>
                      )}
                      {task.status === "in_progress" && (
                        <Button className="w-full h-11 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold transition-colors shadow-none" onClick={() => handleStatusUpdate(task.id, "completed")}>
                          <Check className="w-4 h-4 mr-2" /> Mark Completed
                        </Button>
                      )}
                      {task.status === "completed" && (
                        <div className="w-full h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-emerald-700">
                          <Check className="w-5 h-5 mr-2" /> Completed
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-900 font-outfit text-xl">Assign Task</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-200" onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-gray-500" /></Button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Assigned To</label>
                  <select
                    value={form.assigned_to}
                    onChange={e => setForm(p => ({ ...p, assigned_to: e.target.value }))}
                    className="w-full px-4 py-3 h-12 text-sm rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  >
                    <option value="">Select team member...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Task Description</label>
                  <Textarea className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-white resize-none h-24 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Describe the task..." value={form.task_description} onChange={e => setForm(p => ({ ...p, task_description: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Due Date</label>
                    <Input type="date" value={form.task_date} onChange={e => setForm(p => ({ ...p, task_date: e.target.value }))} className="h-12 rounded-xl border-gray-200" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Order ID <span className="font-medium normal-case text-gray-400">(optional)</span></label>
                    <Input type="number" placeholder="e.g. 1042" value={form.order_id} onChange={e => setForm(p => ({ ...p, order_id: e.target.value }))} className="h-12 rounded-xl border-gray-200" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                  <Button type="button" variant="outline" className="h-11 rounded-xl px-6 font-bold text-gray-600" onClick={() => setShowAdd(false)}>Cancel</Button>
                  <Button onClick={handleAdd} disabled={saving} className="h-11 rounded-xl px-8 bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-md shadow-indigo-600/20">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />} Assign
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamTasks;

