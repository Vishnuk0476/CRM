import { IndianRupee, Calendar, Loader2, Save, Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Props {
  caseId: number;
  invoices?: any[];
  quoted: number;
  invoiced: number;
  collected: number;
  pending: number;
  paymentFollowupDate?: string;
  onUpdated?: () => void;
}

export function CaseFinancialSummary({ caseId, invoices = [], quoted, invoiced, collected, pending, paymentFollowupDate, onUpdated }: Props) {
  const { toast } = useToast();
  const format = (n: number) => `₹${parseFloat((n||0).toString()).toLocaleString('en-IN')}`;
  
  const pctCollected = invoiced > 0 ? Math.round((collected / invoiced) * 100) : 0;

  const [followupDate, setFollowupDate] = useState(paymentFollowupDate || "");
  const [saving, setSaving] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    invoice_id: "",
    amount: pending.toString(),
    payment_method: "upi",
    transaction_id: "",
    payment_date: new Date().toISOString().slice(0, 10),
    notes: ""
  });
  const [savingPayment, setSavingPayment] = useState(false);

  const saveFollowup = async () => {
    if (!followupDate) return;
    setSaving(true);
    try {
      const res = await fetch("/api/crm/cases.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: caseId, payment_followup_date: followupDate })
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Follow-up date saved" });
        if (onUpdated) onUpdated();
      }
    } catch (e) {
      toast({ title: "Error saving follow-up date", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddPayment = async () => {
    if (!paymentForm.invoice_id || !paymentForm.amount) {
      toast({ title: "Please select an invoice and enter an amount", variant: "destructive" });
      return;
    }
    setSavingPayment(true);
    try {
      const res = await fetch("/api/crm/payments.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          invoice_id: parseInt(paymentForm.invoice_id),
          amount: parseFloat(paymentForm.amount),
          payment_method: paymentForm.payment_method,
          transaction_id: paymentForm.transaction_id || null,
          payment_date: paymentForm.payment_date,
          notes: paymentForm.notes || null
        })
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Payment recorded successfully" });
        setShowPaymentModal(false);
        setPaymentForm({ ...paymentForm, amount: "", transaction_id: "", notes: "" });
        if (onUpdated) onUpdated();
      } else {
        toast({ title: json.error || "Failed to record payment", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setSavingPayment(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-card to-emerald-50/20 rounded-2xl border border-emerald-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
          <IndianRupee className="w-4 h-4" /> Smart Financial Tracker
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-border shadow-sm text-xs">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">Follow-up:</span>
            <input 
              type="date" 
              value={followupDate} 
              onChange={(e) => setFollowupDate(e.target.value)}
              className="border-none outline-none bg-transparent font-medium cursor-pointer"
            />
            {followupDate !== (paymentFollowupDate || "") && (
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 rounded-full hover:bg-emerald-100 text-emerald-600" onClick={saveFollowup}>
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              </Button>
            )}
          </div>
          {pending > 0 && invoices.length > 0 && (
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20" onClick={() => {
              const pendingInv = invoices.find((i: any) => i.status !== 'paid');
              setPaymentForm(p => ({
                ...p,
                invoice_id: pendingInv ? pendingInv.id.toString() : (invoices[0]?.id.toString() || ""),
                amount: pendingInv ? pendingInv.total_pending?.toString() : pending.toString()
              }));
              setShowPaymentModal(true);
            }}>
              <Plus className="w-4 h-4 mr-1" /> Add Payment
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div className="bg-white rounded-xl p-3 border border-border shadow-sm">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Quoted</p>
          <p className="font-bold text-sm text-foreground mt-1">{format(quoted)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-border shadow-sm">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Invoiced</p>
          <p className="font-bold text-sm text-violet-600 mt-1">{format(invoiced)}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 shadow-inner">
          <p className="text-[10px] text-emerald-700 uppercase font-bold">Advance Amount (Paid)</p>
          <p className="font-bold text-lg text-emerald-600 mt-0.5">{format(collected)}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 border border-red-100 shadow-inner">
          <p className="text-[10px] text-red-700 uppercase font-bold">Balance Amount (Due)</p>
          <p className="font-bold text-lg text-red-600 mt-0.5">{format(pending)}</p>
        </div>
      </div>
      
      {invoiced > 0 && (
        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(pctCollected, 100)}%` }} />
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 p-5 flex items-center justify-between border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Record Payment</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowPaymentModal(false)} className="rounded-full hover:bg-slate-200 text-slate-500"><X className="w-5 h-5" /></Button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Select Invoice</label>
                <select 
                  value={paymentForm.invoice_id} 
                  onChange={e => {
                    const inv = invoices.find((i: any) => i.id == e.target.value);
                    setPaymentForm(p => ({ ...p, invoice_id: e.target.value, amount: inv ? (inv.total_pending || inv.grand_total) : p.amount }));
                  }} 
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                >
                  <option value="">Select an invoice...</option>
                  {invoices.map((inv: any) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number || 'DRAFT'} - {inv.status === 'paid' ? 'Paid' : `Due: ₹${inv.total_pending || inv.grand_total}`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Amount (₹)</label>
                  <Input type="number" value={paymentForm.amount} onChange={e => setPaymentForm(p => ({ ...p, amount: e.target.value }))} className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white text-base font-bold" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Method</label>
                  <select value={paymentForm.payment_method} onChange={e => setPaymentForm(p => ({ ...p, payment_method: e.target.value }))} className="w-full h-12 px-4 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium">
                    <option value="upi">UPI</option>
                    <option value="neft">NEFT</option>
                    <option value="rtgs">RTGS</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="card">Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Transaction ID</label>
                  <Input value={paymentForm.transaction_id} onChange={e => setPaymentForm(p => ({ ...p, transaction_id: e.target.value }))} placeholder="Optional Ref No" className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Payment Date</label>
                  <Input type="date" value={paymentForm.payment_date} onChange={e => setPaymentForm(p => ({ ...p, payment_date: e.target.value }))} className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Notes</label>
                <Input value={paymentForm.notes} onChange={e => setPaymentForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any specific notes for this payment..." className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white" />
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
              <Button onClick={handleAddPayment} disabled={savingPayment} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20">
                {savingPayment ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Save Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
