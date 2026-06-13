import { useState, useEffect } from "react";
import { Truck, User, Plus, RefreshCw, Loader2, X, Save, Phone, Hash, Weight, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

const VEHICLE_TYPES = ["Mini Truck", "Tata 407", "Eicher 14ft", "Eicher 17ft", "Eicher 19ft", "20ft Container", "32ft Container", "Trailer"];

const FleetManagement = () => {
  const [tab, setTab] = useState<"vehicles" | "drivers">("vehicles");
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Vehicle form
  const [vForm, setVForm] = useState({ vehicle_number: "", vehicle_type: "Tata 407", capacity_tons: "" });
  // Driver form
  const [dForm, setDForm] = useState({ name: "", phone: "", license_number: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, dRes] = await Promise.all([
        fetch("/api/crm/fleet.php?type=vehicle", { credentials: "include" }),
        fetch("/api/crm/fleet.php?type=driver", { credentials: "include" }),
      ]);
      const vJson = await vRes.json();
      const dJson = await dRes.json();
      if (vJson.success) setVehicles(vJson.data.vehicles || []);
      if (dJson.success) setDrivers(dJson.data.drivers || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddVehicle = async () => {
    if (!vForm.vehicle_number || !vForm.vehicle_type) { setError("Vehicle number and type required"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/crm/fleet.php", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "vehicle", ...vForm, capacity_tons: vForm.capacity_tons ? parseFloat(vForm.capacity_tons) : 0 }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setShowAdd(false);
      setVForm({ vehicle_number: "", vehicle_type: "Tata 407", capacity_tons: "" });
      fetchData();
    } catch (e: unknown) { setError(e.message); } finally { setSaving(false); }
  };

  const handleAddDriver = async () => {
    if (!dForm.name || !dForm.phone) { setError("Name and phone required"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/crm/fleet.php", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "driver", ...dForm }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setShowAdd(false);
      setDForm({ name: "", phone: "", license_number: "" });
      fetchData();
    } catch (e: unknown) { setError(e.message); } finally { setSaving(false); }
  };

  const toggleStatus = async (type: string, id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? (type === "vehicle" ? "maintenance" : "inactive") : "active";
    try {
      await fetch("/api/crm/fleet.php", {
        method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, status: newStatus }),
      });
      fetchData();
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 font-outfit tracking-tight">Fleet & Drivers</h2>
          <p className="text-gray-500 font-medium mt-1">
            {vehicles.filter(v => v.status === "active").length} active vehicles &bull; {drivers.filter(d => d.status === "active").length} active drivers
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchData} className="rounded-xl border-gray-200 bg-white shadow-sm px-4">
            <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setShowAdd(true)} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
            <Plus className="w-4 h-4 mr-2" /> Add {tab === "vehicles" ? "Vehicle" : "Driver"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-gray-100 p-2 shadow-sm inline-flex gap-2">
        <button
          onClick={() => setTab("vehicles")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all relative ${
            tab === "vehicles" ? "text-indigo-700" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          {tab === "vehicles" && (
            <motion.div layoutId="fleetTab" className="absolute inset-0 bg-indigo-50 border border-indigo-100 rounded-xl" />
          )}
          <Truck className="w-4 h-4 relative z-10" /> <span className="relative z-10">Vehicles ({vehicles.length})</span>
        </button>
        <button
          onClick={() => setTab("drivers")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all relative ${
            tab === "drivers" ? "text-indigo-700" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          {tab === "drivers" && (
            <motion.div layoutId="fleetTab" className="absolute inset-0 bg-indigo-50 border border-indigo-100 rounded-xl" />
          )}
          <User className="w-4 h-4 relative z-10" /> <span className="relative z-10">Drivers ({drivers.length})</span>
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {tab === "vehicles" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {vehicles.map(v => (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={v.id} className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
                      <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                          <Truck className="w-6 h-6" />
                        </div>
                        <button
                          onClick={() => toggleStatus("vehicle", v.id, v.status)}
                          className={`text-[10px] px-2.5 py-1 uppercase tracking-wider rounded-full border font-bold cursor-pointer transition-all ${
                            v.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" :
                            v.status === "maintenance" ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" :
                            "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          }`}
                        >
                          {v.status}
                        </button>
                      </div>
                      <div className="relative z-10">
                        <p className="text-lg font-bold text-gray-900 font-outfit tracking-wide">{v.vehicle_number}</p>
                        <p className="text-sm text-gray-500 font-medium mt-1">{v.vehicle_type}</p>
                        {v.capacity_tons > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 uppercase tracking-wider">
                              <Weight className="w-3.5 h-3.5" /> Capacity
                            </p>
                            <p className="text-sm font-bold text-gray-700">{v.capacity_tons} tons</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {vehicles.length === 0 && <p className="text-sm text-gray-400 col-span-full text-center py-20 font-medium">No vehicles added yet</p>}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {drivers.map(d => (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={d.id} className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
                      <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 text-lg font-bold font-outfit">
                          {d.name?.charAt(0).toUpperCase()}
                        </div>
                        <button
                          onClick={() => toggleStatus("driver", d.id, d.status)}
                          className={`text-[10px] px-2.5 py-1 uppercase tracking-wider rounded-full border font-bold cursor-pointer transition-all ${
                            d.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" :
                            "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          }`}
                        >
                          {d.status}
                        </button>
                      </div>
                      <div className="relative z-10">
                        <p className="text-lg font-bold text-gray-900 font-outfit">{d.name}</p>
                        <div className="mt-4 space-y-2 pt-4 border-t border-gray-100">
                          <p className="text-sm text-gray-600 font-medium flex items-center gap-2"><Phone className="w-4 h-4 text-indigo-400" /> {d.phone}</p>
                          {d.license_number && <p className="text-sm text-gray-600 font-medium flex items-center gap-2"><Hash className="w-4 h-4 text-indigo-400" /> {d.license_number}</p>}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {drivers.length === 0 && <p className="text-sm text-gray-400 col-span-full text-center py-20 font-medium">No drivers added yet</p>}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white/95 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-2xl w-full max-w-md p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 font-outfit">Add {tab === "vehicles" ? "Vehicle" : "Driver"}</h3>
                <Button variant="ghost" size="icon" onClick={() => { setShowAdd(false); setError(""); }} className="rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></Button>
              </div>
              
              {error && (
                <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              {tab === "vehicles" ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Vehicle Number</label>
                    <Input value={vForm.vehicle_number} onChange={e => setVForm(p => ({ ...p, vehicle_number: e.target.value.toUpperCase() }))} placeholder="e.g. DL01AB1234" className="h-11 rounded-xl border-gray-200" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Vehicle Type</label>
                    <select value={vForm.vehicle_type} onChange={e => setVForm(p => ({ ...p, vehicle_type: e.target.value }))} className="w-full px-3 py-2 h-11 text-sm rounded-xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                      {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Capacity (Tons)</label>
                    <Input type="number" value={vForm.capacity_tons} onChange={e => setVForm(p => ({ ...p, capacity_tons: e.target.value }))} placeholder="Optional" className="h-11 rounded-xl border-gray-200" />
                  </div>
                  <Button onClick={handleAddVehicle} disabled={saving} className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md mt-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Add Vehicle
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Driver Name</label>
                    <Input value={dForm.name} onChange={e => setDForm(p => ({ ...p, name: e.target.value }))} placeholder="Full name" className="h-11 rounded-xl border-gray-200" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Phone Number</label>
                    <Input value={dForm.phone} onChange={e => setDForm(p => ({ ...p, phone: e.target.value }))} placeholder="10 digit number" className="h-11 rounded-xl border-gray-200" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">License Number</label>
                    <Input value={dForm.license_number} onChange={e => setDForm(p => ({ ...p, license_number: e.target.value }))} placeholder="Optional" className="h-11 rounded-xl border-gray-200" />
                  </div>
                  <Button onClick={handleAddDriver} disabled={saving} className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md mt-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Add Driver
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FleetManagement;
