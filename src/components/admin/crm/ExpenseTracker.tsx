import { useState, useEffect } from "react";
import { Wallet, Plus, RefreshCw, Loader2, X, Save, Truck, Trash2, PieChart as PieChartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

const CATEGORIES = [
  // Operations
  "Fuel", "Toll", "Vehicle Maintenance", "Driver Allowance", "Labor",
  // Packaging
  "Packaging Material", "Carton Boxes", "Bubble Wrap",
  // Office
  "Office Supplies", "Office Rent", "Office Utilities", "Internet & Phone",
  // Finance
  "GST Payment", "Bank Charges", "Loan EMI", "Professional Fees",
  // HR
  "Salary", "Incentive", "Staff Travel", "Training",
  // Business
  "Marketing", "Advertising", "Software Subscription",
  // Insurance
  "Vehicle Insurance", "Business Insurance", "Goods Insurance",
  // Other
  "Equipment Purchase", "Repairs", "Misc"
];

const PAYMENT_MODES = ["Cash", "UPI", "NEFT/RTGS", "Cheque", "Credit Card", "Debit Card"];
const COLORS = ["#f43f5e", "#ec4899", "#d946ef", "#a855f7", "#8b5cf6", "#6366f1", "#3b82f6", "#0ea5e9", "#06b6d4", "#14b8a6"];

const ExpenseTracker = () => {
  const { user } = useAuth();
  const isAdminOrAccountant = ['owner', 'super_admin', 'accountant'].includes(user?.role || '');

  const [expenses, setExpenses] = useState<any[]>([]);
  const [byCategory, setByCategory] = useState<any[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [form, setForm] = useState({ order_id: "", category: "Fuel", description: "", amount: "", expense_date: new Date().toISOString().slice(0, 10), receipt_url: "", payment_mode: "Cash" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeOrders, setActiveOrders] = useState<any[]>([]);

  // Fetch active orders for linking
  useEffect(() => {
    fetch("/api/crm/cases.php?limit=100", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const sorted = (d.data.cases || []).sort((a: any, b: any) => b.id - a.id);
          setActiveOrders(sorted);
        }
      })
      .catch(() => {});
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/crm/expenses.php?month=${month}&limit=50`, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setExpenses(json.data.expenses || []);
        
        // Map colors for the chart
        const mappedCategories = (json.data.by_category || []).map((cat: any, index: number) => ({
          ...cat,
          totalNum: parseFloat(cat.total),
          color: COLORS[index % COLORS.length]
        }));
        
        setByCategory(mappedCategories);
        setTotalExpenses(json.data.total_expenses || 0);
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchExpenses(); }, [month]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      const res = await fetch(`/api/crm/expenses.php?id=${id}`, { method: "DELETE", credentials: "include" });
      const json = await res.json();
      if (json.success) {
        fetchExpenses();
      } else {
        alert(json.error || "Failed to delete expense");
      }
    } catch (e) {
      alert("Error deleting expense");
    }
  };

  const handleAdd = async () => {
    if (!form.category || !form.amount) { setError("Category and amount required"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/crm/expenses.php", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: form.order_id ? parseInt(form.order_id) : null,
          category: form.category,
          description: form.description || null,
          amount: parseFloat(form.amount),
          expense_date: form.expense_date,
          receipt_url: form.receipt_url || null,
          payment_mode: form.payment_mode || null
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setShowAdd(false);
      setForm({ order_id: "", category: "Fuel", description: "", amount: "", expense_date: new Date().toISOString().slice(0, 10), receipt_url: "" });
      fetchExpenses();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "An error occurred"); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-orange-500 tracking-tight">Expense Tracker</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Monitor and manage all company expenditures</p>
        </div>
        <div className="flex items-center gap-3 bg-card/60 backdrop-blur-md border border-border/50 p-1.5 rounded-xl shadow-sm">
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-transparent border-none focus:ring-0 cursor-pointer text-foreground" />
          <div className="h-6 w-px bg-border"></div>
          <Button size="sm" onClick={() => setShowAdd(true)} className="bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/25 border-none hover:shadow-rose-500/40 rounded-lg">
            <Plus className="w-4 h-4 mr-1.5" /> Log Expense
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Summary & Chart */}
        <div className="xl:col-span-1 space-y-6">
          {/* Total Summary Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-orange-500/5 p-8 shadow-xl shadow-rose-500/5 group"
          >
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gradient-to-br from-rose-500/20 to-orange-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10 flex flex-col gap-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-600 flex items-center justify-center mb-2 transform group-hover:scale-110 transition-transform">
                <Wallet className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-rose-600/80 uppercase tracking-wider">Total Output</p>
              <h3 className="text-4xl font-black text-rose-600 tracking-tight">₹{totalExpenses.toLocaleString("en-IN")}</h3>
            </div>
          </motion.div>

          {/* Chart Card */}
          {byCategory.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-card/60 backdrop-blur-xl rounded-3xl border border-border/50 p-6 shadow-lg shadow-black/5"
            >
              <h3 className="font-bold text-foreground mb-6 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-rose-500" /> Category Breakdown
              </h3>
              
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byCategory} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                    <Tooltip 
                      cursor={{fill: 'rgba(244, 63, 94, 0.05)'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                      formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, 'Amount']}
                    />
                    <Bar dataKey="totalNum" radius={[0, 4, 4, 0]} barSize={16}>
                      {byCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Expense List */}
        <div className="xl:col-span-2">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card/60 backdrop-blur-xl rounded-3xl border border-border/50 shadow-lg shadow-black/5 overflow-hidden flex flex-col h-full min-h-[500px]"
          >
            <div className="p-6 border-b border-border/50 flex items-center justify-between bg-white/40">
              <h3 className="font-bold text-foreground">Recent Expenditures</h3>
              {loading && <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />}
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              {!loading && expenses.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 py-10">
                  <Wallet className="w-16 h-16 mb-4" />
                  <p className="font-semibold text-lg">No expenses recorded</p>
                  <p className="text-sm">Click "Log Expense" to add a new record.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {expenses.map((exp, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.05 }}
                        key={exp.id} 
                        className="group flex items-center justify-between p-4 rounded-2xl bg-white/50 border border-transparent hover:bg-white hover:border-rose-100 hover:shadow-md hover:shadow-rose-500/5 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-100 to-orange-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <Wallet className="w-5 h-5 text-rose-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{exp.category}</span>
                              {exp.order_number && (
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 flex items-center gap-1">
                                  <Truck className="w-3 h-3" /> {exp.order_number}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-bold text-foreground">{exp.description || `${exp.category} Expense`}</p>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">{exp.expense_date_formatted} &bull; Logged by {exp.added_by_name || "Admin"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-lg font-black text-rose-600 tracking-tight">-₹{parseFloat(exp.amount).toLocaleString("en-IN")}</p>
                          {isAdminOrAccountant && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/50 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" onClick={() => handleDelete(exp.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-lg font-black text-gray-800">Log New Expense</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowAdd(false)} className="rounded-full hover:bg-gray-200 text-gray-500"><X className="w-4 h-4" /></Button>
              </div>
              
              <div className="p-6 space-y-5">
                {error && <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center gap-2"><X className="w-4 h-4" /> {error}</div>}
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Link to Case (Optional)</label>
                    <select
                      value={form.order_id}
                      onChange={e => setForm(p => ({ ...p, order_id: e.target.value }))}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors font-medium outline-none"
                    >
                      <option value="">General Expense (Not linked)</option>
                      {activeOrders.map(o => (
                        <option key={o.id} value={o.id}>{o.case_number} - {o.client_name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Category</label>
                    <select 
                      value={form.category} 
                      onChange={e => setForm(p => ({ ...p, category: e.target.value }))} 
                      className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors font-medium outline-none"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Amount (₹)</label>
                      <Input 
                        type="number" 
                        value={form.amount} 
                        onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} 
                        className="px-4 py-6 text-base font-bold rounded-xl bg-gray-50 border-gray-200 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Date</label>
                      <Input 
                        type="date" 
                        value={form.expense_date} 
                        onChange={e => setForm(p => ({ ...p, expense_date: e.target.value }))} 
                        className="px-4 py-6 text-sm font-medium rounded-xl bg-gray-50 border-gray-200 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Description</label>
                    <Input 
                      value={form.description} 
                      onChange={e => setForm(p => ({ ...p, description: e.target.value }))} 
                      placeholder="What was this for?" 
                      className="px-4 py-6 text-sm font-medium rounded-xl bg-gray-50 border-gray-200 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Payment Mode</label>
                    <select
                      value={form.payment_mode}
                      onChange={e => setForm(p => ({ ...p, payment_mode: e.target.value }))}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors font-medium outline-none"
                    >
                      {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                
                <Button 
                  onClick={handleAdd} 
                  disabled={saving} 
                  className="w-full py-6 text-base rounded-xl font-bold bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-xl shadow-rose-500/20 hover:shadow-rose-500/40 hover:-translate-y-0.5 transition-all border-none"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />} 
                  Save Expense Record
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpenseTracker;

