import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface LeadFormProps {
  onClose: () => void;
  onSaved: () => void;
  editData?: any;
}

const PROPERTY_TYPES = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "Villa", "Penthouse", "Office", "Warehouse", "Other"];
const LOAD_TYPES = ["Household", "Commercial", "Vehicle", "Fine Art", "Lab Equipment", "Industrial", "Pet", "Other"];
const LEAD_SOURCES = ["Website", "IndiaMART", "JustDial", "Referral", "Google Ads", "Social Media", "Walk-in", "Cold Call", "Corporate", "Other"];

const LeadForm = ({ onClose, onSaved, editData }: LeadFormProps) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [salespersons, setSalespersons] = useState<any[]>([]);
  const [form, setForm] = useState({
    customer_name: editData?.customer_name || "",
    phone: editData?.phone || "",
    alternate_phone: editData?.alternate_phone || "",
    email: editData?.email || "",
    company_name: editData?.company_name || "",
    origin_city: editData?.origin_city || editData?.pickup_city || "",
    origin_country: editData?.origin_country || "India",
    destination_city: editData?.destination_city || editData?.drop_city || "",
    shipping_date: editData?.shipping_date || "",
    move_timeline: editData?.move_timeline || "",
    property_type: editData?.property_type || "",
    load_type: editData?.load_type || "",
    relocation_type: editData?.relocation_type || "",
    salesperson_id: editData?.salesperson_id || "",
    assigned_to: editData?.assigned_to || "",
    status: editData?.status || "enquiry",
    temperature: editData?.temperature || "cold",
    lead_source: editData?.lead_source || "",
    move_type: editData?.move_type || "domestic",
    estimated_amount: editData?.estimated_amount || "",
    budget_min: editData?.budget_min || "",
    budget_max: editData?.budget_max || "",
    family_adults: editData?.family_adults || 1,
    family_children: editData?.family_children || 0,
    special_requirements: editData?.special_requirements || "",
    notes: editData?.notes || "",
  });

  useEffect(() => {
    fetch("/api/admins/list.php", { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.success) setSalespersons(d.data?.admins || d.data || []); })
      .catch(() => {});
  }, []);

  // Auto-calculate move_timeline based on shipping_date strictly
  useEffect(() => {
    if (!form.shipping_date) {
      setForm(f => ({ ...f, move_timeline: "undecided" }));
      return;
    }
    const today = new Date();
    today.setHours(0,0,0,0);
    const shipDate = new Date(form.shipping_date);
    const diffTime = shipDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let newTimeline = "undecided";
    if (diffDays <= 2) newTimeline = "immediately";
    else if (diffDays <= 7) newTimeline = "within_1_week";
    else if (diffDays <= 30) newTimeline = "within_1_month";
    else newTimeline = "within_1_month";

    setForm(f => ({ ...f, move_timeline: newTimeline }));
  }, [form.shipping_date]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSave = async () => {
    if (!form.customer_name.trim()) {
      setError("Customer Name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const isEdit = !!editData?.id;
      const res = await fetch("/api/crm/leads.php", {
        method: isEdit ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { ...form, id: editData.id } : form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to save");
      onSaved();
    } catch (err: unknown) {
      setError(err.message || "Failed to save lead");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-violet-500/5 to-transparent">
          <div>
            <h2 className="text-lg font-bold text-foreground">{editData ? "Edit Lead" : "New Lead"}</h2>
            <p className="text-xs text-muted-foreground">Enter the lead details below</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-destructive/10 hover:text-destructive">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm">{error}</div>
          )}

          {/* Row 1: Customer Name */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Customer Name <span className="text-red-500">*</span></label>
              <Input placeholder="Full name" value={form.customer_name} onChange={e => handleChange("customer_name", e.target.value)} />
            </div>
          </div>

          {/* Row 2: Phone + Alternate + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Phone</label>
              <Input placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => handleChange("phone", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Alt Phone</label>
              <Input placeholder="+91 XXXXX XXXXX" value={form.alternate_phone} onChange={e => handleChange("alternate_phone", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Email</label>
              <Input type="email" placeholder="customer@email.com" value={form.email} onChange={e => handleChange("email", e.target.value)} />
            </div>
          </div>

          {/* Row: Company Name */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Company Name</label>
            <Input placeholder="Corporate client name (optional)" value={form.company_name} onChange={e => handleChange("company_name", e.target.value)} />
          </div>

          {/* Row 3: Origin + Destination + Country */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Origin City</label>
              <Input placeholder="e.g. Greater Noida" value={form.origin_city} onChange={e => handleChange("origin_city", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Destination City</label>
              <Input placeholder="e.g. Mumbai" value={form.destination_city} onChange={e => handleChange("destination_city", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Origin Country</label>
              <Input placeholder="e.g. India" value={form.origin_country} onChange={e => handleChange("origin_country", e.target.value)} />
            </div>
          </div>

          {/* Row 4: Ship Date + Move Timeline + Property Type + Load Type + Relocation Type */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Shipping Date</label>
              <Input type="date" value={form.shipping_date} onChange={e => handleChange("shipping_date", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Move Timeline</label>
              <select value={form.move_timeline} disabled
                className="w-full px-3 py-2 text-sm rounded-md border border-border bg-muted text-muted-foreground focus:outline-none">
                <option value="undecided">Undecided</option>
                <option value="immediately">Immediately</option>
                <option value="within_1_week">Within 1 Week</option>
                <option value="within_1_month">Within 1 Month</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Property Type</label>
              <select value={form.property_type} onChange={e => handleChange("property_type", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                <option value="">Select...</option>
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Load Type</label>
              <select value={form.load_type} onChange={e => handleChange("load_type", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                <option value="">Select...</option>
                {LOAD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Relocation Type</label>
              <Input placeholder="e.g. Office, Residential" value={form.relocation_type} onChange={e => handleChange("relocation_type", e.target.value)} />
            </div>
          </div>

          {/* Row 5: Temperature + Family */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Lead Priority (Status)</label>
              <select value={form.temperature} onChange={e => handleChange("temperature", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                <option value="cold">Cold</option>
                <option value="warm">Warm</option>
                <option value="hot">Hot</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Adults</label>
              <Input type="number" min="1" value={form.family_adults} onChange={e => handleChange("family_adults", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Children</label>
              <Input type="number" min="0" value={form.family_children} onChange={e => handleChange("family_children", e.target.value)} />
            </div>
          </div>

          {/* Row 6: Salesperson + Source */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Assigned Consultant</label>
              <select value={form.assigned_to} onChange={e => handleChange("assigned_to", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                <option value="">Auto / None</option>
                {salespersons.map((sp: any) => (
                  <option key={sp.id} value={sp.id}>{sp.name || sp.email} ({sp.role})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Lead Source</label>
              <select value={form.lead_source} onChange={e => handleChange("lead_source", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                <option value="">Select...</option>
                {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Move Type</label>
              <select value={form.move_type} onChange={e => handleChange("move_type", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                <option value="local_move">Local Move</option>
                <option value="domestic">Domestic</option>
                <option value="interstate">Interstate</option>
                <option value="international">International</option>
              </select>
            </div>
          </div>

          {/* Notes & Special Requirements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Special Requirements</label>
              <Textarea placeholder="e.g. Pet relocation, antique packing..." value={form.special_requirements} onChange={e => handleChange("special_requirements", e.target.value)} rows={3} />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Internal Notes</label>
              <Textarea placeholder="Any internal notes..." value={form.notes} onChange={e => handleChange("notes", e.target.value)} rows={3} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2 bg-muted/30">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}
            className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/25">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
            {editData ? "Update" : "Create"} Lead
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeadForm;
