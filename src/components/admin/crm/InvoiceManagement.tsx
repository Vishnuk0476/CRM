import { useState, useEffect } from "react";
import { Search, Plus, RefreshCw, Loader2, X, Save, Trash2, Eye, PlusCircle, MinusCircle, Pencil, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import InvoicePrint from "./InvoicePrint";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  partial: "bg-blue-100 text-blue-700 border-blue-200",
  paid: "bg-green-100 text-green-700 border-green-200",
  overdue: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-700 border-gray-200",
};

interface InvoiceManagementProps {
  initialOrderId?: number;
}

const InvoiceManagement = ({ initialOrderId }: InvoiceManagementProps = {}) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(!!initialOrderId);
  const [viewInvoiceId, setViewInvoiceId] = useState<number | null>(null);
  const [editInvoiceId, setEditInvoiceId] = useState<number | null>(null);
  const [previewInvoiceData, setPreviewInvoiceData] = useState<any>(null);
  const [warranty, setWarranty] = useState({ enabled: false, declared_value: 0, percentage: 3, gst_rate: 18 });
  
  const [createForm, setCreateForm] = useState({ 
    is_manual: false, order_id: initialOrderId ? String(initialOrderId) : "", invoice_number: "",
    due_date: "", notes: "", client_name: "", client_phone: "", client_address: "",
    customer_gstin: "", place_of_supply: "", challan_no: "", transport_details: "", eway_bill_no: ""
  });
  
  const [items, setItems] = useState([{ service_name: "", hsn_sac: "", quantity: 1, rate: 0, gst_rate: 0, is_igst: false }]);
  
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [activeOrders, setActiveOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/crm/cases.php?limit=100", { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.success) setActiveOrders(d.data.cases); })
      .catch(() => {});
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (search) params.set("search", search);
      if (statusFilter) params.set("payment_status", statusFilter);
      const res = await fetch(`/api/crm/invoices.php?${params}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) { setInvoices(json.data.invoices || []); setSummary(json.data.summary); }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchInvoices(); }, [statusFilter]);
  useEffect(() => { const t = setTimeout(fetchInvoices, 300); return () => clearTimeout(t); }, [search]);

  const handleCreate = async () => {
    if (!createForm.is_manual && !createForm.order_id) { setError("Order ID is required"); return; }
    if (createForm.is_manual && !createForm.client_name) { setError("Client Name is required for manual invoice"); return; }
    if (items.length === 0 || !items[0].service_name) { setError("At least one valid item is required"); return; }
    
    setSaving(true); setError("");
    try {
      const isEdit = !!editInvoiceId;
      const res = await fetch("/api/crm/invoices.php", {
        method: isEdit ? "PUT" : "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...createForm,
          id: editInvoiceId,
          order_id: createForm.order_id ? parseInt(createForm.order_id) : null,
          items
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setShowCreate(false);
      setEditInvoiceId(null);
      setCreateForm({ is_manual: false, order_id: "", invoice_number: "", due_date: "", notes: "", client_name: "", client_phone: "", client_address: "", customer_gstin: "", place_of_supply: "", challan_no: "", transport_details: "", eway_bill_no: "" });
      setItems([{ service_name: "", hsn_sac: "", quantity: 1, rate: 0, gst_rate: 0, is_igst: false }]);
      toast.success(isEdit ? "Invoice updated successfully!" : "Invoice generated successfully!");
      fetchInvoices();
    } catch (e: unknown) { 
      setError(e.message); 
      toast.error(e.message);
      // Scroll to the top of the modal to ensure the error is visible
      const modal = document.getElementById("invoice-modal-content");
      if (modal) modal.scrollTo({ top: 0, behavior: 'smooth' });
    } finally { setSaving(false); }
  };

  const handleEdit = async (id: number) => {
    try {
      const res = await fetch(`/api/crm/invoice_details.php?id=${id}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        const d = json.data.invoice;
        const formItems = json.data.items;
        setCreateForm({
          is_manual: !d.case_id,
          order_id: d.case_id ? String(d.case_id) : "",
          invoice_number: d.invoice_number || "",
          due_date: d.due_date || "",
          notes: d.notes || "",
          client_name: d.client_name || "",
          client_phone: d.client_phone || "",
          client_address: d.client_address || "",
          customer_gstin: d.customer_gstin || "",
          place_of_supply: d.place_of_supply || "",
          challan_no: d.challan_no || "",
          transport_details: d.transport_details || "",
          eway_bill_no: d.eway_bill_no || ""
        });
        setItems(formItems && formItems.length > 0 ? formItems.map((i: any) => ({
          service_name: i.service_name,
          hsn_sac: i.hsn_sac || "",
          quantity: i.quantity,
          rate: i.unit_price,
          gst_rate: i.gst_rate,
          is_igst: i.gst_rate > 0 && d.igst_amount > 0 
        })) : [{ service_name: "", hsn_sac: "", quantity: 1, rate: 0, gst_rate: 0, is_igst: false }]);
        setEditInvoiceId(id);
        setShowCreate(true);
      }
    } catch (e: unknown) {
      console.error(e);
      alert("Failed to load invoice for editing. Error: " + (e.message || String(e)));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/crm/invoices.php", {
        method: "DELETE", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const json = await res.json();
      if (json.success) { 
        toast.success("Invoice deleted successfully");
        fetchInvoices(); 
      } else { 
        toast.error(json.error); 
      }
    } catch (e: unknown) { toast.error(e.message); } finally { setDeletingId(null); }
  };

  const handleSendInvoice = async (id: number) => {
    if (!confirm("Are you sure you want to send this invoice to the client via email?")) return;
    setSendingId(id);
    try {
      const res = await fetch("/api/crm/invoices/send.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Invoice sent successfully to the client.");
        if (data.data?.waUrl) {
          window.open(data.data.waUrl, "_blank");
        }
      } else {
        toast.error(data.error || "Failed to send invoice");
      }
    } catch (e: any) {
      toast.error(e.message || "Network error while sending invoice");
    } finally {
      setSendingId(null);
    }
  };

  const formatCurrency = (v: number) => `₹${(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

  const addItem = () => setItems([...items, { service_name: "", hsn_sac: "", quantity: 1, rate: 0, gst_rate: 0, is_igst: false }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, val: any) => {
    const newItems = [...items];
    (newItems[i] as any)[field] = val;
    setItems(newItems);
  };

  const handleWarrantyChange = (field: string, val: number) => {
    setWarranty(p => ({ ...p, [field]: val }));
  };

  const addWarrantyRow = () => {
    if (!warranty.declared_value) return;
    const amount = warranty.declared_value * (warranty.percentage / 100);
    setItems([...items, {
        service_name: `Easy Cover Warranty (Declared Value ₹${warranty.declared_value.toLocaleString("en-IN")} @ ${warranty.percentage}%)`,
        hsn_sac: "996511",
        quantity: 1,
        rate: amount,
        gst_rate: warranty.gst_rate,
        is_igst: items.length > 0 ? items[0].is_igst : false
    }]);
    setWarranty({...warranty, enabled: false});
  };

  const handlePreview = () => {
    if (!createForm.is_manual && !createForm.order_id) { setError("Order ID is required"); return; }
    if (createForm.is_manual && !createForm.client_name) { setError("Client Name is required for manual invoice"); return; }
    if (items.length === 0 || !items[0].service_name) { setError("At least one valid item is required"); return; }
    setError("");
    
    let subtotal = 0;
    let total_tax = 0;
    let igst_amount = 0;
    let cgst_amount = 0;
    let sgst_amount = 0;

    const previewItems = items.map(item => {
      const qty = parseFloat(item.quantity as any) || 0;
      const rate = parseFloat(item.rate as any) || 0;
      const gstPct = parseFloat(item.gst_rate as any) || 0;
      const lineTaxable = qty * rate;
      const lineGst = lineTaxable * (gstPct / 100);
      
      subtotal += lineTaxable;
      total_tax += lineGst;
      if (item.is_igst) igst_amount += lineGst;
      else { cgst_amount += lineGst / 2; sgst_amount += lineGst / 2; }
      
      return { ...item, unit_price: rate, line_total: lineTaxable };
    });

    const pData = {
      invoice: {
        ...createForm,
        subtotal, total_tax, grand_total: subtotal + total_tax,
        igst_amount, cgst_amount, sgst_amount,
        created_at: new Date().toISOString(),
        invoice_number: createForm.invoice_number || "DRAFT",
        order_number: createForm.order_id ? (activeOrders.find(o => String(o.id) === String(createForm.order_id))?.case_number || "CASE-PREVIEW") : "DRAFT",
        client_name: createForm.client_name || (activeOrders.find(o => String(o.id) === String(createForm.order_id))?.client_name || "Client Name"),
        c_client_name: createForm.client_name || (activeOrders.find(o => String(o.id) === String(createForm.order_id))?.client_name || "Client Name"),
      },
      items: previewItems
    };
    setPreviewInvoiceData(pData);
  };

  if (viewInvoiceId) {
    return <InvoicePrint invoiceId={viewInvoiceId} onBack={() => setViewInvoiceId(null)} />;
  }
  if (previewInvoiceData) {
    return <InvoicePrint previewData={previewInvoiceData} onBack={() => setPreviewInvoiceData(null)} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{editInvoiceId ? "Edit Invoice" : "Create Invoice"}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchInvoices}><RefreshCw className="w-3.5 h-3.5" /></Button>
            <Button size="sm" onClick={() => { 
                setEditInvoiceId(null);
                setCreateForm({ is_manual: false, order_id: "", invoice_number: "", due_date: "", notes: "", client_name: "", client_phone: "", client_address: "", customer_gstin: "", place_of_supply: "", challan_no: "", transport_details: "", eway_bill_no: "" });
                setItems([{ service_name: "", hsn_sac: "", quantity: 1, rate: 0, gst_rate: 0, is_igst: false }]);
                setShowCreate(true); 
            }} className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/25">
              <Plus className="w-3.5 h-3.5 mr-1" /> Create Invoice
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {summary && (
          <>
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Total Invoiced</p>
              <h3 className="text-2xl font-bold text-foreground">{formatCurrency(summary.total_invoiced)}</h3>
            </div>
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Total Collected</p>
              <h3 className="text-2xl font-bold text-green-600">{formatCurrency(summary.total_collected)}</h3>
            </div>
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Pending Amount</p>
              <h3 className="text-2xl font-bold text-red-600">{formatCurrency(summary.total_pending)}</h3>
            </div>
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Total GST</p>
              <h3 className="text-2xl font-bold text-blue-600">{formatCurrency(summary.total_gst)}</h3>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><RefreshCw className="w-6 h-6 animate-spin text-violet-500" /></div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground">No invoices found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-muted/40 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Invoice #</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">GST</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Total</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Paid</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Pending</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {invoices.map(inv => (
                  <tr key={inv.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground text-sm whitespace-nowrap">{inv.invoice_number}</p>
                      <p className="text-xs text-muted-foreground">{inv.order_number}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground text-sm">{inv.customer_name}</td>
                    <td className="px-4 py-3 font-bold text-foreground">{formatCurrency(inv.amount)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatCurrency(inv.gst_amount)}</td>
                    <td className="px-4 py-3 font-bold text-foreground">{formatCurrency(inv.total_amount)}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">{formatCurrency(inv.total_paid)}</td>
                    <td className="px-4 py-3 text-red-600 font-medium">{formatCurrency(inv.total_pending)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold capitalize ${STATUS_COLORS[inv.payment_status] || ""}`}>{inv.payment_status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{inv.created_at_formatted}</td>
                    <td className="px-4 py-3 flex gap-1">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => setViewInvoiceId(inv.id)} title="View Invoice">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600" onClick={() => handleSendInvoice(inv.id)} disabled={sendingId === inv.id} title="Send via Email/WA">
                          {sendingId === inv.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600" onClick={() => handleEdit(inv.id)} title="Edit Invoice">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(inv.id)} disabled={deletingId === inv.id}>
                          {deletingId === inv.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div id="invoice-modal-content" className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-4 relative scroll-smooth">
            <div className="flex items-center justify-between sticky top-0 bg-card z-10 pb-2 border-b">
              <h3 className="text-lg font-bold text-foreground">
                {editInvoiceId ? `Update GST Tax Invoice (${createForm.invoice_number})` : "Create GST Tax Invoice"}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)} className="rounded-full"><X className="w-4 h-4" /></Button>
            </div>
            
            {error && <div className="px-3 py-2 rounded-lg bg-red-500/10 text-red-600 text-sm font-semibold sticky top-12 z-10 shadow-sm border border-red-500/20">{error}</div>}
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <input type="checkbox" id="is_manual" className="rounded text-violet-600 focus:ring-violet-500" 
                      checked={createForm.is_manual} onChange={e => setCreateForm(p => ({ ...p, is_manual: e.target.checked, order_id: "" }))} />
                    <label htmlFor="is_manual" className="text-sm font-medium text-foreground">Manual Invoice (Unlinked)</label>
                  </div>
                  {!createForm.is_manual ? (
                    <div>
                      <select value={createForm.order_id} onChange={e => setCreateForm(p => ({ ...p, order_id: e.target.value }))}
                        className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                        <option value="">Select a Case...</option>
                        {activeOrders.map(o => (
                          <option key={o.id} value={o.id}>{o.case_number} - {o.client_name}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-slate-500 mb-1 block">Client Name *</label>
                          <Input value={createForm.client_name} onChange={e => setCreateForm({...createForm, client_name: e.target.value})} placeholder="Required for manual invoice" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500 mb-1 block">Client Phone</label>
                          <Input value={createForm.client_phone} onChange={e => setCreateForm({...createForm, client_phone: e.target.value})} placeholder="Optional" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Client Address</label>
                        <Input value={createForm.client_address} onChange={e => setCreateForm({...createForm, client_address: e.target.value})} placeholder="Optional" />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <div><label className="text-xs font-semibold mb-1 block">Due Date</label><Input type="date" value={createForm.due_date} onChange={e => setCreateForm(p => ({ ...p, due_date: e.target.value }))} /></div>
                </div>
              </div>

              {/* GST & Transport Info */}
              <div className="bg-muted/20 p-4 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-3">
                <div><label className="text-xs font-semibold mb-1 block">Customer GSTIN</label><Input placeholder="GSTIN" value={createForm.customer_gstin} onChange={e => setCreateForm(p => ({ ...p, customer_gstin: e.target.value }))} /></div>
                <div><label className="text-xs font-semibold mb-1 block">Place of Supply</label><Input placeholder="State (e.g. Kerala (32))" value={createForm.place_of_supply} onChange={e => setCreateForm(p => ({ ...p, place_of_supply: e.target.value }))} /></div>
                <div><label className="text-xs font-semibold mb-1 block">Transport / Courier</label><Input placeholder="e.g. Silver Roadlines" value={createForm.transport_details} onChange={e => setCreateForm(p => ({ ...p, transport_details: e.target.value }))} /></div>
                <div><label className="text-xs font-semibold mb-1 block">E-Way Bill No.</label><Input placeholder="E-Way Bill" value={createForm.eway_bill_no} onChange={e => setCreateForm(p => ({ ...p, eway_bill_no: e.target.value }))} /></div>
              </div>

              {/* Easy Cover Warranty Calculator */}
              <div className="p-4 rounded-lg border bg-blue-50/50">
                <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <input type="checkbox" checked={warranty.enabled} onChange={e => setWarranty({...warranty, enabled: e.target.checked})} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  Calculate & Add Easy Cover Warranty
                </label>
                {warranty.enabled && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3 items-end">
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Declared Value (₹)</label>
                      <Input type="number" value={warranty.declared_value || ""} onChange={e => handleWarrantyChange("declared_value", parseFloat(e.target.value) || 0)} className="h-8 text-sm" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Insurance (%)</label>
                      <Input type="number" value={warranty.percentage || ""} onChange={e => handleWarrantyChange("percentage", parseFloat(e.target.value) || 0)} className="h-8 text-sm" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs font-medium text-slate-500 mb-1 block">GST %</label>
                      <select value={warranty.gst_rate} onChange={e => handleWarrantyChange("gst_rate", parseFloat(e.target.value))} className="w-full h-8 px-3 rounded-md border border-input bg-background text-sm">
                        <option value="0">0%</option>
                        <option value="18">18%</option>
                      </select>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Charge Amount</label>
                      <div className="h-8 flex items-center font-bold text-slate-700">₹{(warranty.declared_value * (warranty.percentage / 100)).toLocaleString("en-IN", {maximumFractionDigits:2})}</div>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <Button onClick={addWarrantyRow} size="sm" className="w-full h-8 bg-blue-600 hover:bg-blue-700 text-white">Add Row</Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold">Line Items</h4>
                  <Button variant="outline" size="sm" onClick={addItem} className="h-7 text-xs"><PlusCircle className="w-3.5 h-3.5 mr-1" /> Add Row</Button>
                </div>
                <div className="space-y-2 border border-border rounded-lg p-3">
                  <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground pb-2 border-b">
                    <div className="col-span-4">Service/Product</div>
                    <div className="col-span-2">HSN/SAC</div>
                    <div className="col-span-1">Qty</div>
                    <div className="col-span-2">Rate</div>
                    <div className="col-span-2">GST %</div>
                    <div className="col-span-1"></div>
                  </div>
                  {items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4"><Input placeholder="Item Description" value={item.service_name} onChange={e => updateItem(i, "service_name", e.target.value)} /></div>
                      <div className="col-span-2"><Input placeholder="8302" value={item.hsn_sac} onChange={e => updateItem(i, "hsn_sac", e.target.value)} /></div>
                      <div className="col-span-1"><Input type="number" value={item.quantity} onChange={e => updateItem(i, "quantity", e.target.value)} /></div>
                      <div className="col-span-2"><Input type="number" value={item.rate} onChange={e => updateItem(i, "rate", e.target.value)} /></div>
                      <div className="col-span-2 flex items-center gap-1">
                        <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={item.gst_rate} onChange={e => updateItem(i, "gst_rate", parseFloat(e.target.value))}>
                          <option value="0">0%</option><option value="5">5%</option><option value="12">12%</option><option value="18">18%</option><option value="28">28%</option>
                        </select>
                        <div className="flex items-center" title="Is IGST?"><input type="checkbox" checked={item.is_igst} onChange={e => updateItem(i, "is_igst", e.target.checked)} className="rounded ml-1" /></div>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeItem(i)} disabled={items.length === 1}><MinusCircle className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end pt-2 text-sm font-semibold">
                    Subtotal: {formatCurrency(items.reduce((acc, it) => acc + (it.quantity * it.rate), 0))}
                  </div>
                </div>
              </div>
              
              <div><label className="text-xs font-semibold mb-1 block">Notes / Terms</label><Input placeholder="Additional notes for invoice" value={createForm.notes} onChange={e => setCreateForm(p => ({ ...p, notes: e.target.value }))} />
                <Button onClick={addItem} variant="outline" size="sm" className="w-full border-dashed"><Plus className="w-4 h-4 mr-1" /> Add Row</Button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button onClick={handlePreview} variant="outline" className="flex-1 border-violet-200 text-violet-700 hover:bg-violet-50">
                  <Eye className="w-4 h-4 mr-2" /> Preview Invoice
                </Button>
                <Button onClick={handleCreate} disabled={saving} className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {editInvoiceId ? "Update GST Tax Invoice" : "Generate GST Tax Invoice"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceManagement;
