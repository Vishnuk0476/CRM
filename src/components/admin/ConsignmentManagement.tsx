import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Truck, Plus, Search, RefreshCw, X, Save, Loader2,
  Package, MapPin, Mail, Phone, Calendar, ChevronRight,
  CheckCircle, Clock, AlertCircle, Trash2, Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LRReceipt } from "@/components/admin/LRReceipt";
import { FileUploader } from "@/components/ui/FileUploader";
import { whatsappService } from "@/lib/whatsapp";
import { ShieldAlert } from "lucide-react";
import { consignmentService, Consignment, TrackingStep } from "@/services/apiService";
import { usePermissions } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";

// Consignment Detail extends Consignment with some extra fields used purely in UI state
interface ConsignmentDetail extends Consignment {
  description?: string;
}

const STATUS_OPTIONS = [
  { value: "booked",            label: "Booking Confirmed", dot: "bg-blue-500",   badge: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "picked_up",         label: "Picked Up",         dot: "bg-purple-500", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "in_transit",        label: "In Transit",        dot: "bg-orange-500", badge: "bg-orange-50 text-orange-700 border-orange-200" },
  { value: "in_storage",        label: "In Storage",        dot: "bg-teal-500",   badge: "bg-teal-50 text-teal-700 border-teal-200" },
  { value: "out_for_delivery",  label: "Out for Delivery",  dot: "bg-yellow-500", badge: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { value: "delivered",         label: "Delivered",         dot: "bg-green-500",  badge: "bg-green-50 text-green-700 border-green-200" },
  { value: "cancelled",         label: "Cancelled",         dot: "bg-red-500",    badge: "bg-red-50 text-red-700 border-red-200" },
];

const getStatusStyle = (status: string) => {
  return STATUS_OPTIONS.find(s => s.value === status) ?? STATUS_OPTIONS[0];
};

// ─── Create Consignment Modal ────────────────────────────────────────────────
const CreateConsignmentModal = ({
  onClose,
  onCreated,
}: { onClose: () => void; onCreated: (num: string) => void }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    origin: "",
    destination: "",
    consignee_address: "",
    service_type: "Household Moving",
    description: "",
    estimated_delivery: "",
    notes: "",
    lr_number: "",
    awb_number: "",
    consignor_name: "",
    consignor_address: "",
    packages_count: "",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data: created, error } = await consignmentService.book({
        ...form,
        packages_count: form.packages_count ? parseInt(form.packages_count) : null,
        lr_number: form.lr_number || undefined,
        awb_number: form.awb_number || undefined,
      });
      if (error) throw error;

      toast({
        title: "Consignment Created!",
        description: `LR No: ${created?.lr_number ?? created?.consignment_number}`,
      });

      // Send WhatsApp status notification
      try {
        await whatsappService.notifyConsignmentStatus({
          customerPhone: created?.customer_phone ?? form.customer_phone,
          customerName: created?.customer_name ?? form.customer_name,
          lrNumber: created?.lr_number || created?.consignment_number || "",
          status: 'booked',
          fromCity: form.origin,
          toCity: form.destination,
          estimatedDelivery: form.estimated_delivery || undefined
        });
      } catch (waErr) {
        console.warn("WhatsApp notification skipped or failed:", waErr);
      }

      onCreated(created?.lr_number ?? created?.consignment_number ?? "");
    } catch (err: unknown) {
      toast({ title: "Failed", description: err.message || "Could not create consignment.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceTypes = [
    "Household Moving", "Office Relocation", "International Moving",
    "Vehicle Transport", "Storage Services", "Pet Relocation",
    "Fine Art & Antiques", "Industrial Relocation", "Other"
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-primary/5">
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              New Consignment
            </h2>
            <p className="text-xs text-muted-foreground">LR number auto-generated if left blank (e.g. 16001, 16002…)</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full"><X className="w-4 h-4" /></Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-4">

          {/* LR / AWB Numbers — prominent at top */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-primary uppercase tracking-wider">LR / AWB Numbers</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">LR Number <span className="text-muted-foreground font-normal">(leave blank to auto-generate)</span></label>
                <Input value={form.lr_number} onChange={e => set("lr_number", e.target.value)} placeholder="e.g. 16001" className="font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">AWB Number <span className="text-muted-foreground font-normal">(Air Waybill — optional)</span></label>
                <Input value={form.awb_number} onChange={e => set("awb_number", e.target.value)} placeholder="optional" className="font-mono" />
              </div>
            </div>
          </div>

          {/* Consignor */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-1">Consignor (Sender)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Consignor Name</label>
                <Input value={form.consignor_name} onChange={e => set("consignor_name", e.target.value)} placeholder="Sender full name" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">No. of Packages</label>
                <Input type="number" min="1" value={form.packages_count} onChange={e => set("packages_count", e.target.value)} placeholder="e.g. 10" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Consignor Address</label>
              <Textarea value={form.consignor_address} onChange={e => set("consignor_address", e.target.value)} placeholder="Full address of sender" rows={2} />
            </div>
          </div>

          {/* Consignee = Customer */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-1">Consignee (Receiver / Customer)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Customer Name *</label>
                <Input value={form.customer_name} onChange={e => set("customer_name", e.target.value)} placeholder="Full name" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Phone *</label>
                <Input value={form.customer_phone} onChange={e => set("customer_phone", e.target.value)} placeholder="+91 98765 43210" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Customer Email *</label>
              <Input type="email" value={form.customer_email} onChange={e => set("customer_email", e.target.value)} placeholder="customer@email.com" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Consignee Address <span className="text-muted-foreground font-normal">(optional — printed on LR)</span></label>
            <Textarea value={form.consignee_address} onChange={e => set("consignee_address", e.target.value)} placeholder="Full delivery address (for LR receipt)" rows={2} />
          </div>

          {/* Route & Service */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-1">Shipment Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Origin (From) *</label>
                <Input value={form.origin} onChange={e => set("origin", e.target.value)} placeholder="Delhi, NCR" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Destination (To) *</label>
                <Input value={form.destination} onChange={e => set("destination", e.target.value)} placeholder="Mumbai, Maharashtra" required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Service Type</label>
                <select value={form.service_type} onChange={e => set("service_type", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary h-10">
                  {serviceTypes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Estimated Delivery</label>
                <Input type="date" value={form.estimated_delivery} onChange={e => set("estimated_delivery", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Description / Contents</label>
              <Textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Household goods, office equipment, etc." rows={2} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Internal Notes</label>
              <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Fragile items, special handling required, etc." rows={2} />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit as any} disabled={isSubmitting} className="gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Create & Send Email
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Consignment Detail / Update Panel ─────────────────────────────────────
const ConsignmentDetailPanel = ({
  id,
  onClose,
  onUpdated,
}: { id: string; onClose: () => void; onUpdated: () => void }) => {
  const { toast } = useToast();
  const [detail, setDetail] = useState<ConsignmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const { canEdit, canDelete } = usePermissions();

  const [editStatus, setEditStatus] = useState("");
  const [stepLocation, setStepLocation] = useState("");
  const [stepNote, setStepNote] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [isSavingDate, setIsSavingDate] = useState(false);
  // Booking date (created_at) editing
  const [editCreatedAt, setEditCreatedAt] = useState("");
  const [isSavingCreatedAt, setIsSavingCreatedAt] = useState(false);
  const [editSteps, setEditSteps] = useState<TrackingStep[]>([]);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [isSavingSteps, setIsSavingSteps] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const { data: c, error } = await consignmentService.get(id);
        if (error) throw error;
        if (c) {
          let steps: TrackingStep[] = [];
          if (c.tracking_steps) {
            try { steps = JSON.parse(c.tracking_steps); } catch (e) { }
          }
          setDetail(c as ConsignmentDetail);
          setEditSteps(steps);
          setEditStatus(c.status || "");
          
          if (c.estimated_delivery) {
            const d = new Date(c.estimated_delivery);
            if (!isNaN(d.getTime())) setEditDate(d.toISOString().split('T')[0]);
          }
          if (c.created_at) {
            const d = new Date(c.created_at);
            if (!isNaN(d.getTime())) {
              const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16);
              setEditCreatedAt(local);
            }
          }
        }
      } catch (err: unknown) {
        toast({ title: "Error", description: err.message || "Could not load consignment details.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const handleUpdate = async () => {
    if (!detail) return;
    if (!canEdit) {
      toast({ title: "Permission Denied", description: "You don't have edit permissions.", variant: "destructive", action: <ShieldAlert className="w-5 h-5 text-white" /> });
      return;
    }
    setIsUpdating(true);
    try {
      const { error } = await consignmentService.update(detail.id!, {
        status: editStatus,
        step_location: stepLocation,
        step_note: stepNote,
        loaded_from_city: detail.loaded_from_city,
        out_for_delivery_city: detail.out_for_delivery_city,
        lr_pdf_path: detail.lr_pdf_path
      });
      if (error) throw error;

      toast({
        title: "Updated!",
        description: `Consignment updated.`,
      });

      // Send WhatsApp status notification
      try {
        await whatsappService.notifyConsignmentStatus({
          customerPhone: detail.customer_phone,
          customerName: detail.customer_name,
          lrNumber: detail.lr_number || detail.consignment_number || "",
          status: editStatus,
          fromCity: detail.origin,
          toCity: detail.destination,
          estimatedDelivery: detail.estimated_delivery || undefined
        });

        if (editStatus === 'delivered') {
          await whatsappService.confirmDelivery({
            phone: detail.customer_phone,
            name: detail.customer_name,
            lrNumber: detail.lr_number || detail.consignment_number || ""
          });
        }
      } catch (waErr) {
        console.warn("WhatsApp notification skipped or failed:", waErr);
      }

      setStepLocation("");
      setStepNote("");
      onUpdated();
      onClose();
    } catch (err: unknown) {
      toast({ title: "Failed", description: err.message || "Could not update.", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveDate = async () => {
    if (!detail || !editDate) return;
    if (!canEdit) return;
    setIsSavingDate(true);
    try {
      const { error } = await consignmentService.update(detail.id!, { estimated_delivery: editDate });
      if (error) throw error;
      
      setDetail(d => d ? { ...d, estimated_delivery: editDate } : d);
      toast({ title: "Date Updated!", description: "Expected delivery date has been saved." });
      onUpdated();
    } catch (err: unknown) {
      toast({ title: "Failed", description: err.message || "Could not save date.", variant: "destructive" });
    } finally {
      setIsSavingDate(false);
    }
  };

  const handleSaveCreatedAt = async () => {
    if (!detail || !editCreatedAt) return;
    if (!canEdit) return;
    setIsSavingCreatedAt(true);
    try {
      const { error } = await consignmentService.update(detail.id!, { created_at: editCreatedAt });
      if (error) throw error;
      
      setDetail(d => d ? { ...d, created_at: editCreatedAt } : d);
      toast({ title: "Booking Date Updated!", description: "Consignment creation date has been saved." });
      onUpdated();
    } catch (err: unknown) {
      toast({ title: "Failed", description: err.message || "Could not save booking date.", variant: "destructive" });
    } finally {
      setIsSavingCreatedAt(false);
    }
  };

  const handleSaveSteps = async () => {
    if (!detail) return;
    setIsSavingSteps(true);
    try {
      const { error } = await consignmentService.update(detail.id!, { tracking_steps: JSON.stringify(editSteps) });
      if (error) throw error;
      
      setEditingStepIndex(null);
      toast({ title: "Tracking Steps Saved!", description: "All step dates and details updated." });
      onUpdated();
    } catch (err: unknown) {
      toast({ title: "Failed", description: err.message || "Could not save steps.", variant: "destructive" });
    } finally {
      setIsSavingSteps(false);
    }
  };

  const updateStep = (index: number, field: keyof TrackingStep, value: string) => {
    setEditSteps(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleDelete = async () => {
    if (!detail) return;
    if (!canDelete) {
      toast({ 
        title: "STRICT PERMISSION ALERT", 
        description: "Access Denied: Managers do not have permission to delete records. This action is restricted to Super Admins only.", 
        variant: "destructive", 
        duration: 8000,
      });
      return;
    }
    if (!confirm(`Are you sure you want to completely delete consignment ${detail.consignment_number}? This action cannot be undone.`)) return;
    
    setIsDeleting(true);
    try {
      const { error } = await consignmentService.delete(detail.id!);
      if (error) throw error;
      
      toast({ title: "Deleted", description: "Consignment has been permanently removed." });
      onUpdated();
      onClose();
    } catch (err: unknown) {
      toast({ title: "Failed", description: err.message || "Could not delete.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card border border-border rounded-xl md:rounded-2xl shadow-2xl w-full max-w-full md:max-w-2xl h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] overflow-hidden flex flex-col m-0 md:m-4"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-primary/5">
          <div className="min-w-0">
            <h2 className="font-heading text-base sm:text-lg font-bold text-foreground truncate">Consignment Details</h2>
            {detail && <p className="text-xs font-mono text-primary truncate">{detail.lr_number ?? detail.consignment_number}</p>}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {detail && (
              <Button variant="outline" size="sm" onClick={() => setShowReceipt(true)} className="gap-1.5 h-8 text-xs">
                <Printer className="w-3.5 h-3.5" /><span className="hidden sm:inline">Print LR</span>
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8"><X className="w-4 h-4" /></Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : detail ? (
          <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5 sm:space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">Customer</p>
                  <p className="font-medium">{detail.customer_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">Phone</p>
                  <a href={`tel:${detail.customer_phone}`} className="font-medium text-primary hover:underline">{detail.customer_phone}</a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">From → To</p>
                  <p className="font-medium">{detail.origin} → {detail.destination}</p>
                </div>
              </div>
              {/* Booking Date (created_at) */}
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-muted-foreground mt-3" />
                <div className="flex-1">
                  <p className="text-muted-foreground text-xs mb-1">Booking Date (Created At)</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="datetime-local"
                      value={editCreatedAt}
                      onChange={e => setEditCreatedAt(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveCreatedAt}
                      disabled={isSavingCreatedAt || !editCreatedAt}
                      className="gap-1 h-8 px-3 text-xs"
                    >
                      {isSavingCreatedAt ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Save
                    </Button>
                  </div>
                </div>
              </div>

              {/* Est. Delivery Date */}
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground mt-3" />
                <div className="flex-1">
                  <p className="text-muted-foreground text-xs mb-1">Est. Delivery Date</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={editDate}
                      onChange={e => setEditDate(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveDate}
                      disabled={isSavingDate || !editDate}
                      className="gap-1 h-8 px-3 text-xs"
                    >
                      {isSavingDate ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Save
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="col-span-1 sm:col-span-2 mt-3 pt-3 border-t border-border/50">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${detail.last_email_status === 'sent' ? 'bg-green-100 text-green-600' : detail.last_email_status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    <Mail className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Latest Email Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${detail.last_email_status === 'sent' ? 'bg-green-50 text-green-700 border-green-200' : detail.last_email_status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        {detail.last_email_status === 'sent' ? 'Delivered' : detail.last_email_status === 'failed' ? 'Failed to Send' : 'Pending / Unknown'}
                      </span>
                      {detail.last_email_sent_at && <span className="text-[10px] text-muted-foreground font-medium">{new Date(detail.last_email_sent_at).toLocaleString('en-IN')}</span>}
                    </div>
                    {detail.last_email_error && (
                      <p className="text-xs text-red-600 mt-2 p-2.5 bg-red-50/50 rounded-lg border border-red-100 break-all font-mono">
                        Error: {detail.last_email_error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking Timeline — Editable */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <Package className="w-4 h-4 text-secondary" /> Tracking History
                </h3>
                {editSteps.length > 0 && (
                  <Button
                    size="sm"
                    onClick={handleSaveSteps}
                    disabled={isSavingSteps}
                    variant="outline"
                    className="gap-1 h-7 px-3 text-xs"
                  >
                    {isSavingSteps ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Save All Steps
                  </Button>
                )}
              </div>
              <div className="space-y-0">
                {editSteps.map((step, i) => (
                  <div key={i} className="relative flex gap-4 group">
                    {i < editSteps.length - 1 && (
                      <div className="absolute left-[15px] top-8 w-0.5 h-full bg-border" />
                    )}
                    <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-secondary text-secondary-foreground">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div className="pb-5 flex-1">
                      {editingStepIndex === i ? (
                        // ── Expanded edit mode ──
                        <div className="bg-muted/40 border border-border rounded-xl p-3 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Date</label>
                              <input
                                type="date"
                                value={step.date ? (() => { try { return new Date(step.date).toISOString().split('T')[0]; } catch { return ''; } })() : ''}
                                onChange={e => {
                                  const d = new Date(e.target.value);
                                  updateStep(i, 'date', d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }));
                                }}
                                className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Time</label>
                              <input
                                type="time"
                                value={step.time ? (() => { try { const [t, m] = step.time.split(' '); const [h, min] = t.split(':'); let H = parseInt(h); if (m === 'PM' && H !== 12) H += 12; if (m === 'AM' && H === 12) H = 0; return `${String(H).padStart(2,'0')}:${min}`; } catch { return ''; } })() : ''}
                                onChange={e => {
                                  const [H, M] = e.target.value.split(':');
                                  const h = parseInt(H);
                                  const ampm = h >= 12 ? 'PM' : 'AM';
                                  const h12 = h % 12 || 12;
                                  updateStep(i, 'time', `${String(h12).padStart(2,'0')}:${M} ${ampm}`);
                                }}
                                className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Location</label>
                            <input
                              value={step.location}
                              onChange={e => updateStep(i, 'location', e.target.value)}
                              className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Note (optional)</label>
                            <input
                              value={step.note ?? ''}
                              onChange={e => updateStep(i, 'note', e.target.value)}
                              placeholder="e.g. Loaded onto truck"
                              className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => setEditingStepIndex(null)}
                            className="text-xs h-6 px-2 text-muted-foreground">
                            Done editing
                          </Button>
                        </div>
                      ) : (
                        // ── Read mode ──
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm text-foreground">{step.status}</p>
                            <p className="text-xs text-muted-foreground">{step.location} · {step.date} {step.time}</p>
                            {step.note && <p className="text-xs text-muted-foreground/70 italic">{step.note}</p>}
                          </div>
                          <button
                            onClick={() => setEditingStepIndex(i)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                            title="Edit this step"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {editSteps.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No tracking steps yet.</p>
                )}
              </div>
            </div>

            {/* Status Update */}
            <div className="border-t border-border pt-6 space-y-4">
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Update Status
              </h3>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">New Status</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Location</label>
                  <Input value={stepLocation} onChange={e => setStepLocation(e.target.value)} placeholder="e.g. Jaipur Hub" className="text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Update Note</label>
                  <Input value={stepNote} onChange={e => setStepNote(e.target.value)} placeholder="e.g. Loaded onto truck" className="text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Loaded From City <span className="text-muted-foreground font-normal">(for LR)</span></label>
                  <Input value={detail?.loaded_from_city ?? ""} onChange={e => setDetail(d => d ? { ...d, loaded_from_city: e.target.value } : d)} placeholder="e.g. Delhi" className="text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Out for Delivery City <span className="text-muted-foreground font-normal">(for LR)</span></label>
                  <Input value={detail?.out_for_delivery_city ?? ""} onChange={e => setDetail(d => d ? { ...d, out_for_delivery_city: e.target.value } : d)} placeholder="e.g. Mumbai" className="text-sm" />
                </div>
              </div>
              
              {/* LR Receipt Upload */}
              <div className="pt-2">
                <label className="text-xs font-medium text-foreground mb-2 block">Upload Original LR (PDF or Image)</label>
                {detail.lr_pdf_path && (
                  <div className="mb-3 p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-primary">LR File Attached</span>
                    </div>
                    <a href={detail.lr_pdf_path} target="_blank" rel="noreferrer noopener noreferrer" className="text-xs text-primary hover:underline">
                      View File
                    </a>
                  </div>
                )}
                <FileUploader 
                  accept="image/jpeg,image/png,application/pdf"
                  label={detail.lr_pdf_path ? "Replace LR File" : "Upload LR File (PDF/JPG)"}
                  onUploadSuccess={(url) => setDetail(d => d ? { ...d, lr_pdf_path: url } : d)}
                />
              </div>

              <p className="text-xs text-muted-foreground mt-4">💌 Customer will be automatically notified by email on save.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center py-16 text-muted-foreground">
            <AlertCircle className="w-6 h-6 mr-2" /> Failed to load details.
          </div>
        )}

        {detail && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => { if(confirm("Are you SURE? This will permanently delete this consignment and all associated data.")) handleDelete(); }} 
                disabled={isUpdating || isDeleting} 
                className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-2 h-9 px-3"
              >
                <Trash2 className="w-4 h-4" /> 
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Button variant="outline" onClick={onClose} disabled={isUpdating || isDeleting} className="flex-1 sm:flex-initial">Cancel</Button>
              {canEdit && (
                <Button onClick={handleUpdate} disabled={isUpdating || isDeleting} className="gap-2 flex-1 sm:flex-initial text-xs sm:text-sm">
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save & Notify Customer
                </Button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>

    {showReceipt && detail && (
      <LRReceipt
        consignment={{ ...detail }}
        onClose={() => setShowReceipt(false)}
        onSaved={(path) => setDetail(d => d ? { ...d, lr_pdf_path: path } : d)}
      />
    )}
  </>
  );
};


// ─── Main Component ──────────────────────────────────────────────────────────
const ConsignmentManagement = ({ onClose }: { onClose: () => void }) => {
  const { toast } = useToast();
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchConsignments = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error, count } = await consignmentService.list({ search: debouncedSearch, status: statusFilter, limit: 50 });
      if (error) throw error;
      
      setConsignments(data || []);
      setTotal(count ?? (data?.length || 0));
    } catch (err: unknown) {
      console.error("Network/Parse Error in fetchConsignments:", err);
      toast({ title: "Network Error", description: err.message || "Network error.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => { fetchConsignments(); }, [fetchConsignments]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Consignment Tracking
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">{total} total consignments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchConsignments} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={onClose} className="gap-2">
            <X className="w-4 h-4" /> Close
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Consignment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl p-4 border border-border flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by LR number, name, email, AWB, city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-9"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : consignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Package className="w-10 h-10 opacity-30" />
            <p className="text-sm">No consignments found.</p>
            <Button size="sm" onClick={() => setShowCreate(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Create First Consignment
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">LR No.</th>
                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Customer</th>
                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Route</th>
                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Est. Delivery</th>
                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Booked</th>
                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {consignments.map(c => {
                    const s = getStatusStyle(c.status);
                    return (
                      <tr key={c.id} className="hover:bg-muted/30 transition-colors cursor-pointer group" onClick={() => setSelectedId(c.id)}>
                        <td className="px-5 py-3.5">
                          <p className="font-mono text-xs font-bold text-primary">{c.lr_number ?? "—"}</p>
                          {c.awb_number && <p className="font-mono text-[10px] text-muted-foreground">AWB: {c.awb_number}</p>}
                          <p className="text-xs text-muted-foreground">{c.service_type}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-sm text-foreground">{c.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{c.customer_email}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-xs text-foreground">{c.origin}</p>
                          <p className="text-xs text-muted-foreground">→ {c.destination}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-semibold ${s.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            {s.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground">
                          {c.estimated_delivery ? new Date(c.estimated_delivery).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground">
                          {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Button variant="ghost" size="sm" className="h-7 opacity-0 group-hover:opacity-100 transition-opacity text-primary text-xs gap-1">
                            Update <ChevronRight className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border">
              {consignments.map(c => {
                const s = getStatusStyle(c.status);
                return (
                  <div key={c.id} onClick={() => setSelectedId(c.id)} className="px-4 py-3.5 cursor-pointer hover:bg-muted/30 transition-colors group flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-mono text-xs font-bold text-primary">{c.lr_number ?? "—"}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${s.badge}`}>{s.label}</span>
                      </div>
                      <p className="font-semibold text-sm text-foreground">{c.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{c.origin} → {c.destination}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateConsignmentModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchConsignments(); }}
        />
      )}
      {selectedId && (
        <ConsignmentDetailPanel
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onUpdated={fetchConsignments}
        />
      )}
    </div>
  );
};

export default ConsignmentManagement;
