import { QuotationForm, LineItem } from "./QuotationBuilderWizard";
import { Input } from "@/components/ui/input";

export function LiveCalculatorPanel({ form, setForm, lineItems }: { form: QuotationForm, setForm: any, lineItems: LineItem[] }) {
  // Client-side replica of the PHP Financial Engine for instant UI feedback
  const subtotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
  
  let discountAmount = 0;
  if (form.discount_type === "percent") {
    discountAmount = subtotal * (form.discount_value / 100);
  } else {
    discountAmount = form.discount_value;
  }
  
  discountAmount = Math.min(discountAmount, subtotal);
  
  const totalInsurancePremium = (form.insurances || []).reduce((acc, ins) => {
    return acc + (ins.declared_value * (ins.percentage / 100));
  }, 0);

  const taxableAmount = subtotal - discountAmount + totalInsurancePremium;
  
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  
  const baseGstRate = isNaN(Number(form.gst_type)) ? 18.0 : Number(form.gst_type);
  
  if (subtotal > 0) {
    lineItems.forEach(item => {
      const lineTotal = item.quantity * item.unit_price;
      const lineDiscount = (lineTotal / subtotal) * discountAmount;
      const lineTaxable = lineTotal - lineDiscount;
      
      const itemGstRate = item.gst_rate !== undefined ? item.gst_rate : baseGstRate;
      const lineTax = lineTaxable * (itemGstRate / 100);
      
      if (form.is_inter_state) {
        igstAmount += lineTax;
      } else {
        cgstAmount += (lineTax / 2);
        sgstAmount += (lineTax / 2);
      }
    });
  }

  if (totalInsurancePremium > 0) {
    const insuranceTax = totalInsurancePremium * (baseGstRate / 100);
    if (form.is_inter_state) {
      igstAmount += insuranceTax;
    } else {
      cgstAmount += (insuranceTax / 2);
      sgstAmount += (insuranceTax / 2);
    }
  }
  
  const totalTax = cgstAmount + sgstAmount + igstAmount;
  const grandTotal = taxableAmount + totalTax;
  
  const fmt = (n: number) => "₹" + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden sticky top-6">
      <div className="bg-slate-900 text-white p-4">
        <h3 className="font-semibold text-lg flex justify-between items-center">
          <span>Live Total</span>
          <span className="text-xl text-green-400">{fmt(grandTotal)}</span>
        </h3>
      </div>
      
      <div className="p-5 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground">{fmt(subtotal)}</span>
        </div>
        
        <div className="space-y-2 border-t pt-3">
          <div className="flex justify-between text-sm items-center">
            <span className="text-muted-foreground">Discount</span>
            <div className="flex items-center gap-2 w-32">
              <select 
                value={form.discount_type} 
                onChange={e => setForm((f: any) => ({...f, discount_type: e.target.value}))}
                className="w-12 h-8 px-1 text-xs rounded border border-input bg-background"
              >
                <option value="amount">₹</option>
                <option value="percent">%</option>
              </select>
              <Input 
                type="number" 
                min="0"
                value={form.discount_value}
                onChange={e => setForm((f: any) => ({...f, discount_value: Number(e.target.value)}))}
                className="h-8 text-right px-2"
              />
            </div>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount Amt</span>
              <span className="font-medium text-red-500">-{fmt(discountAmount)}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between text-sm border-t pt-3">
          <span className="font-medium text-foreground">Taxable Value</span>
          <span className="font-medium text-foreground">{fmt(taxableAmount)}</span>
        </div>
        
        {totalInsurancePremium > 0 && (
          <div className="flex justify-between text-sm text-violet-700 bg-violet-50 p-2 rounded">
            <span className="font-medium">Total Easy Cover Warranty</span>
            <span className="font-medium">{fmt(totalInsurancePremium)}</span>
          </div>
        )}
        
        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">GST</span>
            <span className="font-medium text-foreground">{fmt(totalTax)}</span>
          </div>
        </div>
        
        <div className="bg-muted/30 p-3 rounded-lg border border-border flex justify-between items-center mt-4">
          <span className="font-semibold text-foreground">Grand Total</span>
          <span className="text-xl font-bold text-violet-700">{fmt(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}
