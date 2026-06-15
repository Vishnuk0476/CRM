import { useState, useEffect, useRef } from "react";
import { Home, MapPin, BedDouble, Bath, Square, Plus, Search, IndianRupee, Loader2,
  Building2, Tag, X, Camera, Trash2, Image, CheckCircle, AlertCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_COLORS: Record<string, string> = {
  available:  "bg-emerald-500 text-white",
  rented:     "bg-blue-500 text-white",
  sold:       "bg-purple-500 text-white",
  unavailable:"bg-red-400 text-white",
};

export function PropertyList() {
  const [properties, setProperties]   = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [showCreate, setShowCreate]   = useState(false);
  const [creating, setCreating]       = useState(false);
  const [selectedProp, setSelectedProp] = useState<any | null>(null);

  // Create form state
  const [createForm, setCreateForm] = useState({
    title: "", property_type: "residential", location: "", city: "",
    price: "", bedrooms: "", bathrooms: "", size_sqft: "", description: "",
    owner_name: "", owner_phone: "",
  });

  // Photo upload state
  const [uploadingPhoto, setUploadingPhoto]   = useState(false);
  const [photoUploadMsg, setPhotoUploadMsg]   = useState("");
  const [newPropId, setNewPropId]             = useState<number | null>(null);
  const [pendingPhotos, setPendingPhotos]     = useState<string[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/crm/properties.php", { credentials: "include" });
      const json = await res.json();
      if (json.success) setProperties(json.data.properties);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchProperties(); }, []);

  const handleCreate = async () => {
    if (!createForm.title) return alert("Property title is required");
    setCreating(true);
    try {
      const res  = await fetch("/api/crm/properties.php", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createForm,
          price:     parseFloat(createForm.price)     || 0,
          bedrooms:  parseInt(createForm.bedrooms)    || 0,
          bathrooms: parseInt(createForm.bathrooms)   || 0,
          size_sqft: parseInt(createForm.size_sqft)   || 0,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNewPropId(json.data.id);
        // Stay on modal for photo uploads
      } else {
        alert(json.error || "Failed to create property");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally { setCreating(false); }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!newPropId) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setPhotoUploadMsg("");
    const formData = new FormData();
    formData.append("action", "upload_photo");
    formData.append("property_id", String(newPropId));
    formData.append("photo", file);

    try {
      const res  = await fetch("/api/crm/properties.php", {
        method: "POST", credentials: "include", body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setPendingPhotos(json.data.images || []);
        setPhotoUploadMsg("Photo uploaded ✓");
      } else {
        setPhotoUploadMsg("Upload failed: " + (json.error || "Unknown error"));
      }
    } catch { setPhotoUploadMsg("Upload failed"); } 
    finally { setUploadingPhoto(false); if (photoInputRef.current) photoInputRef.current.value = ""; }
  };

  const handleDeletePendingPhoto = async (path: string) => {
    if (!newPropId) return;
    try {
      const res  = await fetch("/api/crm/properties.php?action=delete_photo", {
        method: "DELETE", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property_id: newPropId, photo_path: path }),
      });
      const json = await res.json();
      if (json.success) setPendingPhotos(json.data.images || []);
    } catch {}
  };

  const handleFinish = () => {
    setShowCreate(false);
    setNewPropId(null);
    setPendingPhotos([]);
    setPhotoUploadMsg("");
    setCreateForm({ title:"", property_type:"residential", location:"", city:"",
      price:"", bedrooms:"", bathrooms:"", size_sqft:"", description:"", owner_name:"", owner_phone:"" });
    fetchProperties();
  };

  const handleDeletePhoto = async (propId: number, path: string) => {
    try {
      const res  = await fetch("/api/crm/properties.php?action=delete_photo", {
        method: "DELETE", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property_id: propId, photo_path: path }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedProp((p: any) => ({ ...p, images: json.data.images }));
        fetchProperties();
      }
    } catch {}
  };

  const handleDeleteProperty = async (id: number) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    try {
      const res = await fetch("/api/crm/properties.php", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.success) {
        if (selectedProp?.id === id) setSelectedProp(null);
        fetchProperties();
      } else {
        alert(json.error || "Delete failed");
      }
    } catch (e: any) {
      alert("Delete failed: " + e.message);
    }
  };

  const filtered = properties.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.location?.toLowerCase().includes(search.toLowerCase()) ||
    p.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 font-outfit tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <Building2 className="w-6 h-6" />
            </div>
            Property Portfolio
          </h2>
          <p className="text-gray-500 font-medium mt-2">Manage real estate listings and rental properties.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 font-bold px-6 active:scale-95">
          <Plus className="w-4 h-4 mr-2" /> Add Property
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-gray-100 p-2 shadow-sm flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input placeholder="Search properties by title, location, or city..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 border-none bg-transparent focus-visible:ring-0 text-base shadow-none" />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
          <Loader2 className="w-10 h-10 animate-spin mb-4" /><p className="font-medium">Loading properties...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((prop, i) => (
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.04 }}
                key={prop.id}
                className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 transition-all group flex flex-col cursor-pointer"
                onClick={() => setSelectedProp(prop)}
              >
                {/* Image / Placeholder */}
                <div className="h-52 bg-gradient-to-br from-indigo-50 to-blue-50 relative border-b border-gray-100/50 overflow-hidden">
                  {prop.images?.length > 0 ? (
                    <img src={prop.images[0]} alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-200 group-hover:scale-110 transition-transform duration-500">
                      <Building2 className="w-20 h-20 opacity-40" />
                      <span className="text-xs font-medium text-indigo-300 mt-2">No photos</span>
                    </div>
                  )}
                  {prop.images?.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
                      <Image className="w-3 h-3" /> {prop.images.length}
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${prop.property_type === 'commercial' ? 'bg-blue-600 text-white' : 'bg-indigo-600 text-white'} flex items-center gap-1`}>
                      <Tag className="w-3 h-3" /> {prop.property_type}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[prop.status] || 'bg-gray-500 text-white'}`}>
                      {prop.status}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteProperty(prop.id); }}
                      className="bg-red-500/80 hover:bg-red-600 text-white w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur-sm transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="truncate">{prop.location || prop.city}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 font-outfit leading-tight group-hover:text-indigo-600 transition-colors">{prop.title}</h3>
                  <div className="text-xl font-black text-indigo-600 mb-4 font-outfit">
                    ₹{Number(prop.price || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="mt-auto pt-4 border-t border-gray-100 grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1 items-center bg-gray-50 rounded-xl p-2 border border-gray-100">
                      <BedDouble className="w-4 h-4 text-indigo-400" />
                      <span className="text-[11px] font-bold text-gray-600">{prop.bedrooms || 0} Beds</span>
                    </div>
                    <div className="flex flex-col gap-1 items-center bg-gray-50 rounded-xl p-2 border border-gray-100">
                      <Bath className="w-4 h-4 text-cyan-400" />
                      <span className="text-[11px] font-bold text-gray-600">{prop.bathrooms || 0} Baths</span>
                    </div>
                    <div className="flex flex-col gap-1 items-center bg-gray-50 rounded-xl p-2 border border-gray-100">
                      <Square className="w-4 h-4 text-amber-400" />
                      <span className="text-[11px] font-bold text-gray-600">{prop.size_sqft || 0} sqft</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-gray-400 bg-white/50 rounded-3xl border border-dashed border-gray-200">
              <Building2 className="w-16 h-16 text-gray-200 mb-4" />
              <p className="text-lg font-medium text-gray-500">No properties found</p>
              <p className="text-sm">Add your first property listing.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Property Detail Modal ─── */}
      <AnimatePresence>
        {selectedProp && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto"
            onClick={e => { if (e.target === e.currentTarget) setSelectedProp(null); }}>
            <motion.div initial={{ scale:0.95, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.95, y:20 }}
              className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden my-8 border border-gray-100">
              {/* Photo strip */}
              <div className="h-56 bg-gradient-to-br from-indigo-50 to-blue-50 relative overflow-hidden">
                {selectedProp.images?.length > 0 ? (
                  <div className="flex gap-2 h-full overflow-x-auto p-2">
                    {selectedProp.images.map((img: string, idx: number) => (
                      <div key={idx} className="relative h-full min-w-[180px] rounded-xl overflow-hidden group/img flex-shrink-0">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => handleDeletePhoto(selectedProp.id, img)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity flex">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-200">
                    <Camera className="w-16 h-16 opacity-40" />
                    <p className="text-sm font-medium text-indigo-300 mt-2">No photos uploaded</p>
                  </div>
                )}
              </div>
              <div className="px-8 py-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 font-outfit leading-tight">{selectedProp.title}</h3>
                    <p className="text-gray-500 font-medium flex items-center gap-1.5 mt-1">
                      <MapPin className="w-4 h-4" /> {selectedProp.location || selectedProp.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 gap-1.5 h-9" onClick={() => handleDeleteProperty(selectedProp.id)}>
                      <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedProp(null)} className="rounded-full hover:bg-gray-100 h-9 w-9">
                      <X className="w-5 h-5 text-gray-500" />
                    </Button>
                  </div>
                </div>
                <div className="text-3xl font-black text-indigo-600 mb-6">₹{Number(selectedProp.price || 0).toLocaleString('en-IN')}</div>
                {selectedProp.description && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">{selectedProp.description}</p>
                )}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[{ icon: <BedDouble className="w-5 h-5 text-indigo-400" />, val: selectedProp.bedrooms || 0, label: "Beds" },
                    { icon: <Bath className="w-5 h-5 text-cyan-400" />, val: selectedProp.bathrooms || 0, label: "Baths" },
                    { icon: <Square className="w-5 h-5 text-amber-400" />, val: selectedProp.size_sqft || 0, label: "Sqft" }
                  ].map(({ icon, val, label }) => (
                    <div key={label} className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                      {icon}<span className="text-lg font-black text-gray-800">{val}</span>
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Add Property Modal ─── */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto">
            <motion.div initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.95, y:20 }}
              className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden my-8 border border-gray-100">

              {/* Header */}
              <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl font-outfit">
                      {newPropId ? "Upload Photos" : "Add New Property"}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {newPropId ? "Add photos for the listing (optional — click Done when finished)" : "Enter details for the new listing"}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleFinish} className="rounded-full hover:bg-gray-200">
                  <X className="w-5 h-5 text-gray-500" />
                </Button>
              </div>

              {!newPropId ? (
                /* ── Step 1: Property details ── */
                <>
                  <div className="p-8 space-y-5">
                    {/* Title */}
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Property Title *</label>
                      <Input value={createForm.title}
                        onChange={e => setCreateForm({...createForm, title: e.target.value})}
                        placeholder="e.g. Luxury 3BHK in DLF Phase 5"
                        className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-indigo-500 rounded-xl" />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      {/* Property Type */}
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Property Type</label>
                        <div className="relative">
                          <select className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none font-medium"
                            value={createForm.property_type}
                            onChange={e => setCreateForm({...createForm, property_type: e.target.value})}>
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="industrial">Industrial</option>
                            <option value="plot">Plot / Land</option>
                          </select>
                          <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      {/* Price */}
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Price *</label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input type="number" value={createForm.price}
                            onChange={e => setCreateForm({...createForm, price: e.target.value})}
                            placeholder="0.00" className="h-12 pl-10 bg-gray-50 border-gray-200 rounded-xl" />
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Location / Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input value={createForm.location}
                          onChange={e => setCreateForm({...createForm, location: e.target.value})}
                          placeholder="Full address e.g. Sector 50, Golf Course Extension Road, Gurgaon"
                          className="h-12 pl-10 bg-gray-50 border-gray-200 rounded-xl" />
                      </div>
                    </div>

                    {/* Bedrooms / Bathrooms / Size */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label:"Bedrooms", icon:<BedDouble className="w-4 h-4 text-gray-400"/>, field:"bedrooms", ph:"3" },
                        { label:"Bathrooms", icon:<Bath className="w-4 h-4 text-gray-400"/>, field:"bathrooms", ph:"2" },
                        { label:"Size (Sq.Ft.)", icon:<Square className="w-4 h-4 text-gray-400"/>, field:"size_sqft", ph:"1200" },
                      ].map(({ label, icon, field, ph }) => (
                        <div key={field}>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{label}</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>
                            <Input type="number" value={(createForm as any)[field]}
                              onChange={e => setCreateForm({...createForm, [field]: e.target.value})}
                              placeholder={ph} className="h-12 pl-9 bg-gray-50 border-gray-200 rounded-xl" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Owner */}
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Owner Name</label>
                        <Input value={createForm.owner_name}
                          onChange={e => setCreateForm({...createForm, owner_name: e.target.value})}
                          placeholder="Owner / contact person" className="h-12 bg-gray-50 border-gray-200 rounded-xl" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Owner Phone</label>
                        <Input value={createForm.owner_phone}
                          onChange={e => setCreateForm({...createForm, owner_phone: e.target.value})}
                          placeholder="e.g. 9876543210" className="h-12 bg-gray-50 border-gray-200 rounded-xl" />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Description</label>
                      <textarea className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-none"
                        placeholder="Describe property features, amenities, nearby landmarks..."
                        value={createForm.description}
                        onChange={e => setCreateForm({...createForm, description: e.target.value})} />
                    </div>
                  </div>

                  <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <Button variant="outline" onClick={handleFinish} className="h-11 px-6 rounded-xl font-bold border-gray-200 text-gray-600">Cancel</Button>
                    <Button onClick={handleCreate} disabled={creating} className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20">
                      {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      {creating ? "Saving..." : "Save & Add Photos →"}
                    </Button>
                  </div>
                </>
              ) : (
                /* ── Step 2: Photo upload ── */
                <div className="p-8 space-y-6">
                  {/* Success banner */}
                  <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-semibold">Property saved! Now you can upload photos (optional).</p>
                  </div>

                  {/* Upload zone */}
                  <div
                    className="border-2 border-dashed border-indigo-200 rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    {uploadingPhoto ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                        <p className="text-sm font-medium text-indigo-600">Uploading...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                          <Upload className="w-7 h-7 text-indigo-400" />
                        </div>
                        <p className="font-semibold text-gray-700">Click to upload photo</p>
                        <p className="text-xs text-gray-400">JPG, PNG, WebP — max 5MB each</p>
                      </div>
                    )}
                  </div>

                  {/* Upload feedback */}
                  {photoUploadMsg && (
                    <div className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl ${photoUploadMsg.includes('✓') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                      {photoUploadMsg.includes('✓') ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {photoUploadMsg}
                    </div>
                  )}

                  {/* Uploaded photos preview */}
                  {pendingPhotos.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{pendingPhotos.length} Photo{pendingPhotos.length > 1 ? 's' : ''} Uploaded</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {pendingPhotos.map((src, idx) => (
                          <div key={idx} className="relative group/photo aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                            <img src={src} alt="" className="w-full h-full object-cover" />
                            <button onClick={() => handleDeletePendingPhoto(src)}
                              className="absolute inset-0 bg-red-500/70 text-white items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity flex">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <Button onClick={handleFinish} className="h-11 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20">
                      <CheckCircle className="w-4 h-4 mr-2" /> Done — View Property
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
