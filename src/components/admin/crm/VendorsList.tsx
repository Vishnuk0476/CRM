import { useState, useEffect } from "react";
import { Users, Search, Plus, MapPin, Phone, Mail, FileText, CheckCircle2, Building2, Truck, PackageCheck, ShieldCheck, Warehouse, Box, Loader2, X, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

export function VendorsList() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ vendor_name: "", phone: "", service_type: "transport", city: "" });

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/vendors.php", { credentials: "include" });
      const json = await res.json();
      if (json.success) setVendors(json.data.vendors);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleCreate = async () => {
    if (!createForm.vendor_name || !createForm.phone) return alert("Name and phone are required");
    setCreating(true);
    try {
      const res = await fetch("/api/crm/vendors.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm)
      });
      const json = await res.json();
      if (json.success) {
        setShowCreate(false);
        fetchVendors();
      } else {
        alert(json.error || "Failed");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  // Helper: extract first service type from vendor_types JSON array
  const getServiceType = (v: any) => {
    if (v.service_type) return v.service_type;
    try {
      const arr = typeof v.vendor_types === 'string' ? JSON.parse(v.vendor_types) : v.vendor_types;
      if (Array.isArray(arr) && arr.length > 0) return arr[0];
    } catch {}
    return 'other';
  };

  const filtered = vendors.filter(v => 
    v.vendor_name?.toLowerCase().includes(search.toLowerCase()) || 
    v.city?.toLowerCase().includes(search.toLowerCase()) ||
    v.phone_primary?.toLowerCase().includes(search.toLowerCase())
  );

  const getServiceIcon = (v: any) => {
    const type = getServiceType(v);
    switch(type) {
      case 'transport': return <Truck className="w-5 h-5 text-blue-500" />;
      case 'packing': return <PackageCheck className="w-5 h-5 text-amber-500" />;
      case 'insurance': return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
      case 'storage': return <Warehouse className="w-5 h-5 text-indigo-500" />;
      default: return <Box className="w-5 h-5 text-gray-500" />;
    }
  };

  const getServiceColor = (v: any) => {
    const type = getServiceType(v);
    switch(type) {
      case 'transport': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'packing': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'insurance': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'storage': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 font-outfit tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <Users className="w-6 h-6" />
            </div>
            Vendor Network
          </h2>
          <p className="text-gray-500 font-medium mt-2">Manage transport, packing, storage, and external partners.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowCreate(true)} className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 font-bold px-6 transition-all active:scale-95">
            <Plus className="w-4 h-4 mr-2" /> Add Vendor
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-gray-100 p-2 shadow-sm flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input 
            placeholder="Search vendors by name, city, or service..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 border-none bg-transparent focus-visible:ring-0 text-base shadow-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="font-medium">Loading vendors...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((vendor, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={vendor.id} 
                className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 p-6 hover:shadow-xl hover:shadow-indigo-500/10 transition-all group relative overflow-hidden flex flex-col"
              >
                <div className="absolute top-0 right-0 p-4 flex gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm border ${
                    vendor.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {vendor.is_active ? 'active' : 'inactive'}
                  </span>
                </div>
                
                <div className="flex items-start gap-4 mb-5 pr-16">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${getServiceColor(vendor)}`}>
                    {getServiceIcon(vendor)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl font-outfit line-clamp-1 group-hover:text-indigo-600 transition-colors">{vendor.vendor_name}</h3>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      {getServiceType(vendor)}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600 font-medium mt-auto bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  {vendor.city && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 border border-gray-100">
                        <MapPin className="w-4 h-4 text-indigo-500" />
                      </div>
                      <span className="truncate">{vendor.city}</span>
                    </div>
                  )}
                  {(vendor.phone_primary || vendor.phone) && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 border border-gray-100">
                        <Phone className="w-4 h-4 text-green-500" />
                      </div>
                      <span className="truncate">{vendor.phone_primary || vendor.phone}</span>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 border border-gray-100">
                        <Mail className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-gray-400 bg-white/50 backdrop-blur-xl rounded-3xl border border-gray-100 border-dashed">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                <Users className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-lg font-medium text-gray-500">No vendors found</p>
              <p className="text-sm">Try adjusting your search criteria or add a new vendor.</p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100"
            >
              <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl font-outfit">Add Vendor</h3>
                    <p className="text-xs text-gray-500 font-medium">Register a new external partner</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)} className="rounded-full hover:bg-gray-200">
                  <X className="w-5 h-5 text-gray-500" />
                </Button>
              </div>
              
              <div className="p-8 space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Vendor Name *</label>
                  <Input 
                    value={createForm.vendor_name} 
                    onChange={e => setCreateForm({...createForm, vendor_name: e.target.value})} 
                    placeholder="e.g. Speed Logistics" 
                    className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-indigo-500 rounded-xl"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Phone *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        value={createForm.phone} 
                        onChange={e => setCreateForm({...createForm, phone: e.target.value})} 
                        placeholder="Phone number" 
                        className="h-12 pl-9 bg-gray-50 border-gray-200 focus-visible:ring-indigo-500 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">City</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        value={createForm.city} 
                        onChange={e => setCreateForm({...createForm, city: e.target.value})} 
                        placeholder="City" 
                        className="h-12 pl-9 bg-gray-50 border-gray-200 focus-visible:ring-indigo-500 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Service Type</label>
                  <div className="relative">
                    <select 
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                      value={createForm.service_type}
                      onChange={e => setCreateForm({...createForm, service_type: e.target.value})}
                    >
                      <option value="transport">Transport / Logistics</option>
                      <option value="packing">Packing Materials</option>
                      <option value="insurance">Insurance</option>
                      <option value="storage">Storage / Warehousing</option>
                      <option value="other">Other</option>
                    </select>
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-[2rem]">
                <Button variant="outline" onClick={() => setShowCreate(false)} className="h-11 px-6 rounded-xl font-bold border-gray-200 text-gray-600 hover:bg-gray-100">Cancel</Button>
                <Button onClick={handleCreate} disabled={creating} className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20">
                  {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save Vendor"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
