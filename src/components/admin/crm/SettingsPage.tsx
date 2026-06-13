import { useState, useEffect } from "react";
import { Settings, Save, Building, FileText, IndianRupee, Loader2, CreditCard, Paintbrush } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TemplatesManagement } from "./TemplatesManagement";
import { motion, AnimatePresence } from "framer-motion";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "templates">("general");
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/settings.php", { credentials: "include" });
      const json = await res.json();
      if (json.success) setSettings(json.data.settings);
    } catch (e) {
      console.error("Failed to fetch settings", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/crm/settings.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings })
      });
      const json = await res.json();
      if (json.success) {
        alert("Settings saved successfully");
      } else {
        alert(json.error || "Failed to save settings");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 text-indigo-600">
      <Loader2 className="w-10 h-10 animate-spin mb-4" />
      <p className="font-medium text-lg">Loading Settings...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 font-outfit tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <Settings className="w-6 h-6" />
            </div>
            Platform Settings
          </h2>
          <p className="text-gray-500 font-medium mt-2 max-w-xl">Configure your company profile, financial defaults, and quotation templates.</p>
        </div>
        
        {activeTab === "general" && (
          <Button 
            className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 font-bold px-6 transition-all active:scale-95"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            Save Changes
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-gray-100 p-2 shadow-sm inline-flex gap-2 overflow-x-auto w-full sm:w-auto">
        <button 
          onClick={() => setActiveTab("general")}
          className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap relative flex items-center gap-2 ${
            activeTab === "general"
              ? "text-indigo-700"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
          }`}
        >
          {activeTab === "general" && (
            <motion.div layoutId="settingsTab" className="absolute inset-0 bg-indigo-50 border border-indigo-100 rounded-xl" />
          )}
          <span className="relative z-10 flex items-center gap-2"><Settings className="w-4 h-4" /> General Config</span>
        </button>
        <button 
          onClick={() => setActiveTab("templates")}
          className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap relative flex items-center gap-2 ${
            activeTab === "templates"
              ? "text-indigo-700"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
          }`}
        >
          {activeTab === "templates" && (
            <motion.div layoutId="settingsTab" className="absolute inset-0 bg-indigo-50 border border-indigo-100 rounded-xl" />
          )}
          <span className="relative z-10 flex items-center gap-2"><Paintbrush className="w-4 h-4" /> Quotation Templates</span>
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === "templates" && (
          <motion.div 
            key="templates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6"
          >
            <TemplatesManagement />
          </motion.div>
        )}

        {activeTab === "general" && (
          <motion.div 
            key="general"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-6"
          >
            {/* Left Column - Company Info */}
            <div className="lg:col-span-3 space-y-8">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 font-outfit text-lg">Company Identity</h3>
                    <p className="text-sm text-gray-500 font-medium">Used on invoices, quotes, and communications.</p>
                  </div>
                </div>
                
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Company Name</label>
                      <Input 
                        value={settings.company_name || ""} 
                        onChange={(e) => handleChange("company_name", e.target.value)} 
                        className="h-12 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all bg-gray-50/50 focus:bg-white"
                        placeholder="e.g. Acme Corporation"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Support Email</label>
                      <Input 
                        type="email" 
                        value={settings.company_email || ""} 
                        onChange={(e) => handleChange("company_email", e.target.value)} 
                        className="h-12 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all bg-gray-50/50 focus:bg-white"
                        placeholder="e.g. support@acme.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Contact Phone</label>
                    <Input 
                      value={settings.company_phone || ""} 
                      onChange={(e) => handleChange("company_phone", e.target.value)} 
                      className="h-12 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all bg-gray-50/50 focus:bg-white sm:max-w-md"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Registered Address</label>
                    <textarea 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white h-28 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                      value={settings.company_address || ""}
                      onChange={(e) => handleChange("company_address", e.target.value)}
                      placeholder="Full company address including zip/postal code..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Financial & Terms */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="p-6 border-b border-gray-100 bg-emerald-50/30 flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 font-outfit text-lg">Financial Defaults</h3>
                  </div>
                </div>
                
                <div className="p-6 space-y-5">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Default GST Rate (%)</label>
                    <select 
                      className="w-full px-4 py-3 h-12 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
                      value={settings.gst_default || "18"}
                      onChange={(e) => handleChange("gst_default", e.target.value)}
                    >
                      <option value="0">0% - Exempt</option>
                      <option value="5">5% - Reduced</option>
                      <option value="12">12% - Standard Lower</option>
                      <option value="18">18% - Standard</option>
                      <option value="28">28% - Luxury</option>
                    </select>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Prefixes</label>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">E.g. INV-2023-001</span>
                    </div>
                    <Input 
                      value={settings.invoice_prefix || "INV"} 
                      onChange={(e) => handleChange("invoice_prefix", e.target.value)} 
                      className="h-12 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-all bg-gray-50/50 focus:bg-white font-mono uppercase"
                      placeholder="INV"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="p-6 border-b border-gray-100 bg-amber-50/30 flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 font-outfit text-lg">Standard Terms</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Global Terms & Conditions</label>
                  <textarea 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white h-32 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none mb-3"
                    value={settings.terms_and_conditions || ""}
                    onChange={(e) => handleChange("terms_and_conditions", e.target.value)}
                    placeholder="These terms will automatically attach to new invoices."
                  />
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                    <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
                      <strong>Pro Tip:</strong> For rich-text modular terms used specifically in quotations, configure them in the <span className="font-bold underline cursor-pointer" onClick={() => setActiveTab('templates')}>Templates tab</span> above.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

