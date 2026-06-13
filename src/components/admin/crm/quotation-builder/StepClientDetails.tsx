import { QuotationForm } from "./QuotationBuilderWizard";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { adminService, Admin } from "@/services/apiService";

export function StepClientDetails({ form, setForm }: { form: QuotationForm, setForm: any }) {
  const [salesReps, setSalesReps] = useState<Admin[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);

  useEffect(() => {
    adminService.list().then(res => {
      if (res.data) setSalesReps(res.data);
    });
    fetch("/api/crm/quotations/companies.php")
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setCompanies(json.data);
        }
      })
      .catch(console.error);
  }, []);
  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-5 shadow-sm">
      <datalist id="company-list">
        {companies.map(company => (
          <option key={company} value={company} />
        ))}
      </datalist>
      <h3 className="font-semibold text-lg text-foreground border-b pb-3">1. Client Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Client Name *</label>
          <Input 
            value={form.client_name} 
            onChange={e => setForm((f: any) => ({...f, client_name: e.target.value}))} 
            placeholder="e.g. Ramesh Sharma" 
            className="bg-white/50"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Phone</label>
          <Input 
            value={form.client_phone} 
            onChange={e => setForm((f: any) => ({...f, client_phone: e.target.value}))} 
            placeholder="+91 98765 43210" 
            className="bg-white/50"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Email</label>
          <Input 
            value={form.client_email} 
            onChange={e => setForm((f: any) => ({...f, client_email: e.target.value}))} 
            placeholder="client@example.com" 
            className="bg-white/50"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Company Name (Optional)</label>
          <Input 
            value={form.client_company} 
            onChange={e => setForm((f: any) => ({...f, client_company: e.target.value}))} 
            placeholder="e.g. TCS Ltd." 
            className="bg-white/50"
            list="company-list"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Client GST No (Optional)</label>
          <Input 
            value={form.client_gst} 
            onChange={e => setForm((f: any) => ({...f, client_gst: e.target.value}))} 
            placeholder="GSTIN" 
            className="bg-white/50"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Billing Address</label>
          <Input 
            value={form.client_address} 
            onChange={e => setForm((f: any) => ({...f, client_address: e.target.value}))} 
            placeholder="Full billing address" 
            className="bg-white/50"
          />
        </div>
      </div>

      <h3 className="font-semibold text-lg text-foreground border-b pb-3 mt-8">CRM Information (Internal)</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Internal Notes / Comments</label>
          <textarea 
            value={form.internal_notes || ""} 
            onChange={e => setForm((f: any) => ({...f, internal_notes: e.target.value}))} 
            placeholder="Add notes about this customer or quote (not visible to client)" 
            className="w-full px-3 py-2 rounded-lg border border-border bg-white/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px] resize-y"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Assign Sales Representative</label>
          <select 
            value={form.assigned_sales_id || ""} 
            onChange={e => setForm((f: any) => ({...f, assigned_sales_id: e.target.value}))}
            className="w-full px-3 py-2 rounded-lg border border-border bg-white/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">-- Unassigned --</option>
            {salesReps.map(rep => (
              <option key={rep.id} value={rep.id}>{rep.name} ({rep.email})</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
