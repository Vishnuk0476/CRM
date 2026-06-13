import { useState, useEffect } from "react";
import { Search, Plus, RefreshCw, FileText, Truck, MapPin, Loader2, Edit, CheckCircle, Package, X, IndianRupee, PenTool, ClipboardList, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LRReceipt } from "../LRReceipt";
import { useToast } from "@/hooks/use-toast";
import DigitalPackingList from "./DigitalPackingList";
import SignaturePad from "./SignaturePad";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "packing", label: "Packing", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "in_transit", label: "In Transit", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { value: "delivered", label: "Delivered", color: "bg-teal-50 text-teal-700 border-teal-200" },
  { value: "completed", label: "Completed", color: "bg-green-50 text-green-700 border-green-200" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-50 text-red-700 border-red-200" },
];

export default function OrderManagement() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [detailId, setDetailId] = useState<number | null>(null);
  const [showLR, setShowLR] = useState<any>(null);
  const [total, setTotal] = useState(0);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/crm/orders.php?${params}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setOrders(json.data.orders || []);
        setTotal(json.data.pagination?.total || 0);
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);
  useEffect(() => { const t = setTimeout(fetchOrders, 300); return () => clearTimeout(t); }, [search]);

  // Order Detail Overlay component
  const OrderDetail = ({ orderId, onClose }: { orderId: number, onClose: () => void }) => {
    const [order, setOrder] = useState<any>(null);
    const [loadingDetail, setLoadingDetail] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"details" | "packing" | "signature">("details");
    
    // Inline Invoice state
    const [showInvoiceForm, setShowInvoiceForm] = useState(false);
    const [invAmount, setInvAmount] = useState("");
    const [invGst, setInvGst] = useState("18");
    const [savingInv, setSavingInv] = useState(false);
    
    // Editable fields
    const [status, setStatus] = useState("");
    const [lrNumber, setLrNumber] = useState("");
    const [packagesCount, setPackagesCount] = useState("");
    const [consignorName, setConsignorName] = useState("");
    const [consignorAddress, setConsignorAddress] = useState("");
    const [loadedFrom, setLoadedFrom] = useState("");
    const [outForDel, setOutForDel] = useState("");

    // Fleet fields
    const [vehicleId, setVehicleId] = useState("");
    const [driverId, setDriverId] = useState("");
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    
    // P&L
    const [orderExpenses, setOrderExpenses] = useState(0);
    const [orderRevenue, setOrderRevenue] = useState(0);

    // Signature
    const [savingSignature, setSavingSignature] = useState(false);
    
    const fetchOrder = async () => {
      setLoadingDetail(true);
      try {
        const res = await fetch(`/api/crm/orders.php?id=${orderId}`, { credentials: "include" });
        const json = await res.json();
        if (json.success) {
          const o = json.data.order;
          setOrder(o);
          setStatus(o.status);
          setLrNumber(o.lr_number || "");
          setPackagesCount(o.packages_count || "");
          setConsignorName(o.consignor_name || "");
          setConsignorAddress(o.consignor_address || "");
          setLoadedFrom(o.loaded_from_city || "");
          setOutForDel(o.out_for_delivery_city || "");
          setVehicleId(o.vehicle_id ? String(o.vehicle_id) : "");
          setDriverId(o.driver_id ? String(o.driver_id) : "");
          
          // Calculate revenue from invoices
          const rev = (o.invoices || []).reduce((sum: number, inv: any) => sum + parseFloat(inv.total_amount || 0), 0);
          setOrderRevenue(rev);
        }
      } catch {} finally { setLoadingDetail(false); }
    };

    // Fetch fleet data
    useEffect(() => {
      Promise.all([
        fetch("/api/crm/fleet.php?type=vehicle", { credentials: "include" }).then(r => r.json()),
        fetch("/api/crm/fleet.php?type=driver", { credentials: "include" }).then(r => r.json()),
      ]).then(([vRes, dRes]) => {
        if (vRes.success) setVehicles((vRes.data.vehicles || []).filter((v: any) => v.status === "active"));
        if (dRes.success) setDrivers((dRes.data.drivers || []).filter((d: any) => d.status === "active"));
      }).catch(() => {});
    }, []);

    // Fetch order expenses for P&L
    useEffect(() => {
      if (!orderId) return;
      fetch(`/api/crm/expenses.php?order_id=${orderId}&limit=200`, { credentials: "include" })
        .then(r => r.json())
        .then(d => {
          if (d.success) setOrderExpenses(d.data.total_expenses || 0);
        }).catch(() => {});
    }, [orderId]);
    
    useEffect(() => { fetchOrder(); }, [orderId]);

    const handleUpdate = async () => {
      setSaving(true);
      try {
        const res = await fetch("/api/crm/orders.php", {
          method: "PUT", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: orderId, status,
            lr_number: lrNumber, packages_count: packagesCount ? parseInt(packagesCount) : null,
            consignor_name: consignorName, consignor_address: consignorAddress,
            loaded_from_city: loadedFrom, out_for_delivery_city: outForDel,
            vehicle_id: vehicleId ? parseInt(vehicleId) : null,
            driver_id: driverId ? parseInt(driverId) : null,
          }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast({ title: "Updated!", description: "Order details updated successfully." });
        fetchOrders();
        fetchOrder();
      } catch (e: unknown) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      } finally { setSaving(false); }
    };

    const handleCreateInvoice = async () => {
      if (!invAmount) return;
      setSavingInv(true);
      try {
        const res = await fetch("/api/crm/invoices.php", {
          method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: orderId, amount: parseFloat(invAmount), gst_rate: parseFloat(invGst) }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast({ title: "Invoice Created", description: `Invoice ${json.data.invoice_number} generated.` });
        setShowInvoiceForm(false);
        fetchOrder();
      } catch (e: unknown) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      } finally { setSavingInv(false); }
    };

    const handleSaveSignature = async (type: "customer" | "driver", dataUrl: string) => {
      setSavingSignature(true);
      try {
        const body: any = { id: orderId };
        body[type === "customer" ? "customer_signature" : "driver_signature"] = dataUrl;
        const res = await fetch("/api/crm/orders.php", {
          method: "PUT", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast({ title: "Signature Saved!", description: `${type === "customer" ? "Customer" : "Driver"} signature saved.` });
        fetchOrder();
      } catch (e: unknown) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      } finally { setSavingSignature(false); }
    };

    const netProfit = orderRevenue - orderExpenses;

    if (loadingDetail || !order) return (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );

    return (
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white/95 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900 font-outfit">Order: {order.order_number}</h2>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold capitalize ${STATUS_OPTIONS.find(s=>s.value===order.status)?.color || ""}`}>{order.status}</span>
                </div>
                <p className="text-sm text-gray-500 font-medium mt-1">{order.customer_name} &bull; {order.pickup_city} &rarr; {order.drop_city}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowLR({
                  ...order,
                  origin: order.pickup_city,
                  destination: order.drop_city,
                  customer_email: order.email,
                  service_type: order.property_type
                })} className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl">
                  <FileText className="w-4 h-4" /> LR Receipt
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 border-b border-gray-100 flex gap-4 bg-gray-50/50">
              {(["details", "packing", "signature"] as const).map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`py-3.5 px-2 text-sm font-semibold transition-all relative capitalize ${
                    activeTab === t ? "text-indigo-600" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {t === "details" ? "Details & Fleet" : t === "packing" ? "Packing List" : "Signatures"}
                  {activeTab === t && (
                    <motion.div layoutId="orderActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === "details" && (
                    <div className="space-y-6">
                      {/* Trip-Level P&L Card */}
                      <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 border border-indigo-100/50 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <IndianRupee className="w-4 h-4" /> Trip Profit & Loss
                        </h3>
                        <div className="grid grid-cols-3 gap-6 text-center">
                          <div className="bg-white/60 p-3 rounded-xl border border-white">
                            <p className="text-2xl font-bold text-gray-900 font-outfit">₹{orderRevenue.toLocaleString("en-IN")}</p>
                            <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wider">Revenue</p>
                          </div>
                          <div className="bg-white/60 p-3 rounded-xl border border-white">
                            <p className="text-2xl font-bold text-gray-900 font-outfit">₹{orderExpenses.toLocaleString("en-IN")}</p>
                            <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wider">Expenses</p>
                          </div>
                          <div className="bg-white/80 p-3 rounded-xl border border-white shadow-sm ring-1 ring-black/5">
                            <p className={`text-2xl font-bold font-outfit ${netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                              {netProfit >= 0 ? "+" : ""}₹{netProfit.toLocaleString("en-IN")}
                            </p>
                            <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wider">Net Profit</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Status Update */}
                        <div className="bg-gray-50/50 border border-gray-100 p-5 rounded-2xl">
                          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4"><Truck className="w-4 h-4 text-indigo-500" /> Operational Status</h3>
                          <div className="flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map(opt => (
                              <button key={opt.value} onClick={() => setStatus(opt.value)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${status === opt.value ? opt.color + " shadow-sm ring-2 ring-offset-1 ring-blue-500/20" : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Fleet Assignment */}
                        <div className="bg-gray-50/50 border border-gray-100 p-5 rounded-2xl space-y-4">
                          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><MapPin className="w-4 h-4 text-indigo-500" /> Fleet Assignment</h3>
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs font-semibold text-gray-600 mb-1 block">Assign Vehicle</label>
                              <select value={vehicleId} onChange={e => setVehicleId(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                                <option value="">No vehicle assigned</option>
                                {vehicles.map(v => (
                                  <option key={v.id} value={v.id}>{v.vehicle_number} ({v.vehicle_type})</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-600 mb-1 block">Assign Driver</label>
                              <select value={driverId} onChange={e => setDriverId(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                                <option value="">No driver assigned</option>
                                {drivers.map(d => (
                                  <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          {order.vehicle_number && (
                            <p className="text-xs text-indigo-600 font-medium bg-indigo-50 p-2 rounded-lg">
                              Currently: <strong>{order.vehicle_number}</strong> &bull; Driver: <strong>{order.driver_name || "None"}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* LR Details & Invoices Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* LR Details */}
                        <div className="bg-gray-50/50 border border-gray-100 p-5 rounded-2xl space-y-4">
                          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Package className="w-4 h-4 text-indigo-500" /> LR Details</h3>
                          <div className="space-y-3">
                            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">LR Number</label><Input value={lrNumber} onChange={e => setLrNumber(e.target.value)} placeholder="Auto-gen if empty" className="rounded-xl border-gray-200" /></div>
                            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Packages Count</label><Input type="number" value={packagesCount} onChange={e => setPackagesCount(e.target.value)} className="rounded-xl border-gray-200" /></div>
                            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Loaded From City</label><Input value={loadedFrom} onChange={e => setLoadedFrom(e.target.value)} className="rounded-xl border-gray-200" /></div>
                            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Consignor Address</label><Textarea value={consignorAddress} onChange={e => setConsignorAddress(e.target.value)} rows={2} className="rounded-xl border-gray-200 resize-none" /></div>
                          </div>
                        </div>
                        
                        {/* Related: Invoices */}
                        <div className="bg-gray-50/50 border border-gray-100 p-5 rounded-2xl flex flex-col">
                           <div className="flex items-center justify-between mb-4">
                             <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-500" /> Invoices</h3>
                             {!showInvoiceForm && (
                               <Button size="sm" variant="ghost" onClick={() => setShowInvoiceForm(true)} className="h-7 text-xs px-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                 <Plus className="w-3 h-3 mr-1" /> New
                               </Button>
                             )}
                           </div>
                           
                           {showInvoiceForm && (
                             <div className="mb-4 p-4 bg-white border border-gray-200 rounded-xl space-y-3 shadow-sm">
                               <div className="flex gap-3">
                                 <div className="flex-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Amount (₹)</label>
                                    <Input type="number" placeholder="0.00" value={invAmount} onChange={e => setInvAmount(e.target.value)} className="h-9 text-sm rounded-lg" />
                                 </div>
                                 <div className="w-24">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">GST %</label>
                                    <Input type="number" placeholder="18" value={invGst} onChange={e => setInvGst(e.target.value)} className="h-9 text-sm rounded-lg" />
                                 </div>
                               </div>
                               <div className="flex justify-end gap-2">
                                 <Button size="sm" variant="ghost" onClick={() => setShowInvoiceForm(false)} className="h-8 text-xs rounded-lg text-gray-500">Cancel</Button>
                                 <Button size="sm" onClick={handleCreateInvoice} disabled={savingInv} className="h-8 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                                   {savingInv ? <Loader2 className="w-3 h-3 animate-spin" /> : "Generate"}
                                 </Button>
                               </div>
                             </div>
                           )}

                           <div className="flex-1 space-y-2">
                             {order.invoices?.length > 0 ? order.invoices.map((inv: any) => (
                               <div key={inv.id} className="p-3 bg-white border border-gray-100 rounded-xl flex items-center justify-between shadow-sm">
                                 <span className="text-sm font-bold text-gray-800">{inv.invoice_number}</span>
                                 <span className="text-sm font-semibold text-indigo-600">₹{parseFloat(inv.total_amount).toLocaleString('en-IN')}</span>
                               </div>
                             )) : <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-white/50 text-xs text-gray-400 font-medium p-6">No invoices generated yet</div>}
                           </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "packing" && (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-3xl text-center shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
                        <ClipboardList className="w-12 h-12 mx-auto text-white mb-4 relative z-10" />
                        <h3 className="text-xl font-bold text-white relative z-10 font-outfit">Digital Packing List</h3>
                        <p className="text-indigo-100 mt-2 mb-6 max-w-sm mx-auto relative z-10 font-medium">Create and manage your digital packing inventory. Mobile-friendly interface designed for on-site packing teams.</p>
                        <Button
                          onClick={() => { setPackingOrderId(orderId); setPackingOrderNum(order.order_number); }}
                          className="bg-white text-indigo-600 hover:bg-gray-50 hover:text-indigo-700 font-bold px-6 py-6 h-auto rounded-xl shadow-xl relative z-10 transition-transform active:scale-95"
                          id="open-packing-list-btn"
                        >
                          <Package className="w-5 h-5 mr-2" /> Open Packing Console
                        </Button>
                      </div>
                    </div>
                  )}

                  {activeTab === "signature" && (
                    <div className="space-y-6">
                      <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><PenTool className="w-4 h-4 text-indigo-500" /> Customer Signature</h3>
                        <SignaturePad
                          label="Sign below to confirm pickup/delivery"
                          existingSignature={order.customer_signature}
                          onSave={(dataUrl) => handleSaveSignature("customer", dataUrl)}
                          saving={savingSignature}
                        />
                      </div>
                      <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><User className="w-4 h-4 text-indigo-500" /> Driver Signature</h3>
                        <SignaturePad
                          label="Driver signature"
                          existingSignature={order.driver_signature}
                          onSave={(dataUrl) => handleSaveSignature("driver", dataUrl)}
                          saving={savingSignature}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {activeTab === "details" && (
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                <Button variant="outline" onClick={onClose} disabled={saving} className="rounded-xl border-gray-200">Cancel</Button>
                <Button onClick={handleUpdate} disabled={saving} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />} Save Changes
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // Packing list fullscreen overlay
  const [packingOrderId, setPackingOrderId] = useState<number | null>(null);
  const [packingOrderNum, setPackingOrderNum] = useState("");

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 font-outfit tracking-tight">Order Management</h2>
          <p className="text-gray-500 font-medium mt-1">Manage ongoing operations & LR generation</p>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl border-gray-200 bg-white/80 focus:bg-white transition-colors" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white/80 font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all">
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <Button variant="outline" onClick={fetchOrders} className="rounded-xl border-gray-200 bg-white shadow-sm px-4">
          <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-xl overflow-hidden shadow-gray-200/40">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
             <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Truck className="w-8 h-8 text-indigo-300" />
             </div>
             <p className="text-gray-500 font-medium">No orders found.</p>
             <p className="text-sm text-gray-400 mt-1">Convert leads to orders first.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50/80 text-left border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order #</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Route</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100/80">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600 cursor-pointer" onClick={() => setDetailId(o.id)}>{o.order_number}</td>
                    <td className="px-6 py-4 cursor-pointer" onClick={() => setDetailId(o.id)}>
                      <p className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{o.customer_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <span>{o.pickup_city || "—"}</span>
                        <MapPin className="w-3 h-3 text-indigo-300" />
                        <span>{o.drop_city || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-bold capitalize ${STATUS_OPTIONS.find(s=>s.value===o.status)?.color || "bg-gray-100 text-gray-700 border-gray-200"}`}>{o.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{o.created_at_formatted}</td>
                    <td className="px-6 py-4">
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-indigo-600 border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200 rounded-lg shadow-sm" onClick={() => { setPackingOrderId(o.id); setPackingOrderNum(o.order_number); }}>
                        <ClipboardList className="w-3.5 h-3.5" /> Packing
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detailId && <OrderDetail orderId={detailId} onClose={() => setDetailId(null)} />}
      {showLR && <LRReceipt consignment={showLR} onClose={() => setShowLR(null)} />}
      {packingOrderId && (
        <DigitalPackingList
          orderId={packingOrderId}
          orderNumber={packingOrderNum}
          onClose={() => setPackingOrderId(null)}
        />
      )}
    </div>
  );
}

