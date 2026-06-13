import { useState, useEffect } from "react";
import { CreditCard, Plus, RefreshCw, IndianRupee, Loader2, X, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const METHOD_LABELS: Record<string, string> = { upi: "UPI", neft: "NEFT", rtgs: "RTGS", cash: "Cash", cheque: "Cheque", card: "Card", other: "Other" };

const PaymentTracker = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ invoice_id: "", amount: "", payment_method: "upi", transaction_id: "", payment_date: new Date().toISOString().slice(0, 10), notes: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [pendingInvoices, setPendingInvoices] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/crm/invoices.php?payment_status=pending,partial&limit=100", { credentials: "include" })
      .then(r => r.json())
      .then(d => { 
        if (d.success) {
          const sorted = (d.data.invoices || []).sort((a: any, b: any) => b.id - a.id);
          setPendingInvoices(sorted);
        }
      })
      .catch(() => {});
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/payments.php?limit=50", { credentials: "include" });
      const json = await res.json();
      if (json.success) { setPayments(json.data.payments || []); setTotalCollected(json.data.total_collected || 0); }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleAdd = async () => {
    if (!form.invoice_id || !form.amount) { setError("Invoice ID and amount required"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/crm/payments.php", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice_id: parseInt(form.invoice_id), amount: parseFloat(form.amount), payment_method: form.payment_method, transaction_id: form.transaction_id || null, payment_date: form.payment_date, notes: form.notes || null }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setShowAdd(false);
      setForm({ invoice_id: "", amount: "", payment_method: "upi", transaction_id: "", payment_date: new Date().toISOString().slice(0, 10), notes: "" });
      fetchPayments();
    } catch (e: unknown) { setError(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/crm/payments.php", {
        method: "DELETE", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const json = await res.json();
      if (json.success) { fetchPayments(); } else { alert(json.error); }
    } catch (e: unknown) { alert(e.message); } finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">Payment Tracker</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage and track your incoming revenue efficiently.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchPayments} className="border-slate-200 hover:bg-slate-50 text-slate-600"><RefreshCw className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-emerald-100 text-sm font-medium mb-1">Total Revenue Collected</p>
            <h3 className="text-4xl font-extrabold tracking-tight">₹{totalCollected.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h3>
          </div>
          <IndianRupee className="absolute -right-4 -bottom-4 w-32 h-32 text-emerald-400/20 pointer-events-none" />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
          <p className="text-slate-500 text-sm font-medium mb-1">Recent Payments</p>
          <h3 className="text-3xl font-bold text-slate-800">{payments.length}</h3>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
          <Button size="lg" onClick={() => setShowAdd(true)} className="w-full h-14 text-base font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-md rounded-xl transition-all hover:scale-[1.02]">
            <Plus className="w-5 h-5 mr-2" /> Record New Payment
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
      ) : (
        <div className="space-y-3">
          {payments.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4 md:p-5 flex items-center gap-4 hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-xl font-extrabold text-slate-900">₹{parseFloat(p.amount).toLocaleString("en-IN")}</p>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">{METHOD_LABELS[p.payment_method] || p.payment_method}</span>
                </div>
                <p className="text-sm text-slate-500 font-medium truncate">{p.customer_name} <span className="mx-2 text-slate-300">•</span> <span className="text-violet-600 font-semibold">{p.invoice_number || 'DRAFT'}</span></p>
              </div>
              <div className="flex items-center gap-6 ml-auto">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-slate-700">{p.transaction_id || "No Ref"}</p>
                  <p className="text-xs text-slate-400 font-medium">{p.payment_date_formatted}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full" onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}>
                  {deletingId === p.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          ))}{payments.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                <IndianRupee className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">No Payments Yet</h3>
              <p className="text-sm text-slate-500">Record your first payment to start tracking revenue.</p>
            </div>
          )}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 p-5 flex items-center justify-between border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Record Payment</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowAdd(false)} className="rounded-full hover:bg-slate-200 text-slate-500"><X className="w-5 h-5" /></Button>
            </div>
            
            <div className="p-6 space-y-5">
              {error && <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">{error}</div>}
              
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Select Invoice</label>
                <select 
                  value={form.invoice_id} 
                  onChange={e => {
                    const inv = pendingInvoices.find(i => i.id == e.target.value);
                    setForm(p => ({ ...p, invoice_id: e.target.value, amount: inv ? inv.total_pending : p.amount }));
                  }} 
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium"
                >
                  <option value="">Select an invoice...</option>
                  {pendingInvoices.map(inv => (
                    <option key={inv.id} value={inv.id}>{inv.invoice_number || 'DRAFT'} - {inv.customer_name} (Due: ₹{inv.total_pending})</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Amount (₹)</label>
                  <Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white text-base font-bold" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Method</label>
                  <select value={form.payment_method} onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))} className="w-full h-12 px-4 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium">
                    {Object.entries(METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Transaction ID</label>
                  <Input value={form.transaction_id} onChange={e => setForm(p => ({ ...p, transaction_id: e.target.value }))} placeholder="Optional Ref No" className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Payment Date</label>
                  <Input type="date" value={form.payment_date} onChange={e => setForm(p => ({ ...p, payment_date: e.target.value }))} className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Notes</label>
                <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any specific notes for this payment..." className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white" />
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <Button onClick={handleAdd} disabled={saving} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-xl shadow-lg shadow-emerald-600/20">
                {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />} Save Payment Record
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTracker;
