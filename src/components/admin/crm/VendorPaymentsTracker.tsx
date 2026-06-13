import { useState, useEffect } from "react";
import { Wallet, Search, Plus, Loader2, X, Save, Trash2, CreditCard, ArrowRight, ShieldCheck, TrendingDown, Clock, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  partial: "bg-blue-100 text-blue-700 border-blue-200",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export const VendorPaymentsTracker = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ vendor_id: "", case_id: "", service_type: "", scope_of_work: "", agreed_amount: "", amount_paid: "0", payment_mode: "bank_transfer" });
  const [saving, setSaving] = useState(false);
  
  const [showAddPayment, setShowAddPayment] = useState<number | null>(null);
  const [addPaymentAmount, setAddPaymentAmount] = useState("");

  const [activeCases, setActiveCases] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/crm/cases.php?limit=100", { credentials: "include" }).then(r => r.json()).then(d => { if (d.success) setActiveCases(d.data.cases); }).catch(() => {});
    fetch("/api/crm/vendors.php?limit=100", { credentials: "include" }).then(r => r.json()).then(d => { if (d.success) setVendors(d.data.vendors || []); }).catch(() => {});
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/crm/case_vendors.php?search=${encodeURIComponent(search)}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) { setPayments(json.data.case_vendors || []); setSummary(json.data.summary); }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { const t = setTimeout(fetchPayments, 300); return () => clearTimeout(t); }, [search]);

  const handleCreate = async () => {
    if (!createForm.vendor_id || !createForm.agreed_amount) return alert("Vendor and Agreed Amount required");
    setSaving(true);
    try {
      const res = await fetch("/api/crm/case_vendors.php", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          vendor_id: parseInt(createForm.vendor_id),
          case_id: createForm.case_id ? parseInt(createForm.case_id) : null,
          service_type: createForm.service_type,
          scope_of_work: createForm.scope_of_work,
          agreed_amount: parseFloat(createForm.agreed_amount),
          amount_paid: parseFloat(createForm.amount_paid) || 0,
          payment_mode: createForm.payment_mode
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowCreate(false);
        setCreateForm({ vendor_id: "", case_id: "", service_type: "", scope_of_work: "", agreed_amount: "", amount_paid: "0", payment_mode: "bank_transfer" });
        fetchPayments();
      } else alert(json.error);
    } catch (e: unknown) { alert(e.message); } finally { setSaving(false); }
  };

  const handleAddPayment = async () => {
    if (!showAddPayment || !addPaymentAmount) return;
    try {
      const res = await fetch("/api/crm/case_vendors.php", {
        method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: showAddPayment, add_payment: parseFloat(addPaymentAmount) })
      });
      if ((await res.json()).success) { setShowAddPayment(null); setAddPaymentAmount(""); fetchPayments(); }
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this vendor payment record?")) return;
    try {
      const res = await fetch("/api/crm/case_vendors.php", {
        method: "DELETE", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if ((await res.json()).success) fetchPayments();
    } catch {}
  };

  const formatCurrency = (v: number) => `₹${(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">Vendor Payments</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Track vendor payouts, pending balances, and service details</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 border-none rounded-lg">
          <Plus className="w-4 h-4 mr-1.5" /> New Record
        </Button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden bg-white/60 backdrop-blur-xl rounded-3xl border border-blue-100 p-6 shadow-xl shadow-blue-900/5 group">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-blue-100 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-600/80 uppercase tracking-wider mb-1">Total Agreed</p>
                <h3 className="text-3xl font-black text-blue-700 tracking-tight">{formatCurrency(summary.total_agreed)}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building className="w-6 h-6" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative overflow-hidden bg-white/60 backdrop-blur-xl rounded-3xl border border-emerald-100 p-6 shadow-xl shadow-emerald-900/5 group">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-emerald-100 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-600/80 uppercase tracking-wider mb-1">Total Paid Out</p>
                <h3 className="text-3xl font-black text-emerald-700 tracking-tight">{formatCurrency(summary.total_paid)}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative overflow-hidden bg-gradient-to-br from-rose-500 to-orange-500 rounded-3xl p-6 shadow-xl shadow-rose-500/20 group text-white">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white/80 uppercase tracking-wider mb-1">Total Pending</p>
                <h3 className="text-3xl font-black text-white tracking-tight">{formatCurrency(summary.total_pending)}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center backdrop-blur-md">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/60 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-white/40">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search vendor, case, or service..." value={search} onChange={e => setSearch(e.target.value)} className="pl-11 h-11 bg-gray-50/50 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" />
          </div>
          {loading && <div className="flex items-center text-sm font-medium text-blue-600"><Loader2 className="w-4 h-4 animate-spin mr-2" /> Syncing...</div>}
        </div>
        
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vendor & Service</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Linked Case</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Financials</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {payments.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Wallet className="w-12 h-12 mb-3 opacity-20" />
                        <p className="font-semibold text-lg text-gray-600">No records found</p>
                        <p className="text-sm">Try adjusting your search or add a new record.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {payments.map(p => (
                  <motion.tr 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    key={p.id} 
                    className="group hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {p.vendor_name ? p.vendor_name.charAt(0).toUpperCase() : 'V'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{p.vendor_name || "Unknown Vendor"}</p>
                          <p className="text-xs font-medium text-gray-500 mt-0.5 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" /> {p.service_type || "N/A"} {p.scope_of_work ? `• ${p.scope_of_work}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {p.case_number ? (
                        <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 inline-block">
                          <p className="text-xs font-bold text-blue-600 tracking-wide">{p.case_number}</p>
                          <p className="text-xs font-medium text-gray-500 truncate max-w-[150px]">{p.client_name}</p>
                        </div>
                      ) : <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">Unlinked (General)</span>}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex justify-between w-32"><span className="text-gray-500 text-xs">Agreed:</span> <span className="font-bold text-gray-900">{formatCurrency(p.agreed_amount)}</span></div>
                        <div className="flex justify-between w-32"><span className="text-gray-500 text-xs">Paid:</span> <span className="font-bold text-emerald-600">{formatCurrency(p.amount_paid)}</span></div>
                        <div className="flex justify-between w-32"><span className="text-gray-500 text-xs">Due:</span> <span className="font-bold text-rose-600">{formatCurrency(p.amount_pending)}</span></div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full border font-bold uppercase tracking-wider ${STATUS_COLORS[p.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.status !== 'paid' && (
                          <Button size="sm" className="h-8 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-transparent transition-all shadow-sm font-semibold rounded-lg" onClick={() => setShowAddPayment(p.id)}>
                            <CreditCard className="w-3.5 h-3.5 mr-1.5" /> Pay Now
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" onClick={() => handleDelete(p.id)}>
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
      </motion.div>

      {/* Pay Modal */}
      <AnimatePresence>
        {showAddPayment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><CreditCard className="w-5 h-5" /></div>
                  <h3 className="text-lg font-black text-gray-900">Record Payment</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowAddPayment(null)} className="rounded-full text-gray-400 hover:bg-gray-200"><X className="w-4 h-4" /></Button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Amount to Pay (₹)</label>
                  <Input type="number" placeholder="0.00" value={addPaymentAmount} onChange={e => setAddPaymentAmount(e.target.value)} className="px-4 py-6 text-2xl font-black rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" />
                </div>
                <Button onClick={handleAddPayment} className="w-full py-6 rounded-xl text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all border-none">
                  Confirm Payment
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 py-10 overflow-y-auto">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden my-auto">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 sticky top-0 z-10">
                <h3 className="text-lg font-black text-gray-900">New Vendor Record</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)} className="rounded-full text-gray-400 hover:bg-gray-200"><X className="w-4 h-4" /></Button>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Vendor *</label>
                    <select value={createForm.vendor_id} onChange={e => setCreateForm(p => ({ ...p, vendor_id: e.target.value }))} className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium outline-none transition-colors">
                      <option value="">Select Vendor...</option>
                      {vendors.map(v => <option key={v.id} value={v.id}>{v.vendor_name} {v.city ? `(${v.city})` : ''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Linked Case (Optional)</label>
                    <select value={createForm.case_id} onChange={e => setCreateForm(p => ({ ...p, case_id: e.target.value }))} className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium outline-none transition-colors">
                      <option value="">No Case (General)</option>
                      {activeCases.map(c => <option key={c.id} value={c.id}>{c.case_number} - {c.client_name}</option>)}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Service Type</label>
                      <Input placeholder="e.g. Packing" value={createForm.service_type} onChange={e => setCreateForm(p => ({ ...p, service_type: e.target.value }))} className="px-4 py-5 rounded-xl border-gray-200 bg-gray-50 focus:bg-white font-medium" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Scope of Work</label>
                      <Input placeholder="Brief details" value={createForm.scope_of_work} onChange={e => setCreateForm(p => ({ ...p, scope_of_work: e.target.value }))} className="px-4 py-5 rounded-xl border-gray-200 bg-gray-50 focus:bg-white font-medium" />
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-2 block">Agreed Amount *</label>
                        <Input type="number" placeholder="Total" value={createForm.agreed_amount} onChange={e => setCreateForm(p => ({ ...p, agreed_amount: e.target.value }))} className="px-4 py-5 font-bold rounded-xl border-blue-200 bg-white" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-2 block">Amount Paid Now</label>
                        <Input type="number" placeholder="0" value={createForm.amount_paid} onChange={e => setCreateForm(p => ({ ...p, amount_paid: e.target.value }))} className="px-4 py-5 font-bold rounded-xl border-blue-200 bg-white" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-2 block">Payment Mode</label>
                      <select value={createForm.payment_mode} onChange={e => setCreateForm(p => ({ ...p, payment_mode: e.target.value }))} className="w-full px-4 py-3 text-sm font-semibold rounded-xl border border-blue-200 bg-white outline-none">
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="upi">UPI</option>
                        <option value="cash">Cash</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <Button onClick={handleCreate} disabled={saving} className="w-full py-6 rounded-xl text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all border-none">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />} 
                  Save Vendor Record
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
