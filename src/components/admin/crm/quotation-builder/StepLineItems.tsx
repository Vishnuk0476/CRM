import { LineItem } from "./QuotationBuilderWizard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

const COMMON_SERVICES = [
  "Packing & Moving Charges",
  "Loading & Unloading Charges",
  "Transportation Charges",
  "Car Carrier / Transportation",
  "Unpacking & Rearranging Charges",
  "Insurance Charges",
  "Storage Charges",
  "Handling & Escort Charges",
  "Miscellaneous Charges"
];

export function StepLineItems({ lineItems, setLineItems, gstType }: { lineItems: LineItem[], setLineItems: any, gstType: string }) {
  
  const updateLine = (idx: number, field: keyof LineItem, val: any) => {
    setLineItems((prev: LineItem[]) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      copy[idx].line_total = copy[idx].quantity * copy[idx].unit_price;
      return copy;
    });
  };

  const addLine = () => {
    setLineItems((prev: LineItem[]) => [
      ...prev, 
      { service_name: "", description: "", quantity: 1, unit: "job", unit_price: 0, gst_rate: Number(gstType) || 18, line_total: 0 }
    ]);
  };

  const removeLine = (idx: number) => {
    setLineItems((prev: LineItem[]) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <datalist id="common-services">
        {COMMON_SERVICES.map(s => <option key={s} value={s} />)}
      </datalist>
      <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
        <h3 className="font-semibold text-lg text-foreground">3. Line Items</h3>
        <Button onClick={addLine} size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">
          <Plus className="w-4 h-4 mr-1.5" /> Add Service
        </Button>
      </div>

      <div className="p-0 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-4 py-3 font-medium">Service Name & Description</th>
              <th className="px-4 py-3 font-medium w-24">Qty</th>
              <th className="px-4 py-3 font-medium w-32">Price (₹)</th>
              <th className="px-4 py-3 font-medium w-24">GST %</th>
              <th className="px-4 py-3 font-medium w-32 text-right">Total (₹)</th>
              <th className="px-4 py-3 font-medium w-12 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lineItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-muted/10 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2 mb-2">
                    <select 
                      className="w-full h-10 px-3 rounded-md border border-input bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      value={COMMON_SERVICES.includes(item.service_name) ? item.service_name : (item.service_name === "" ? "" : "Custom")}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "Custom") {
                          updateLine(idx, "service_name", "Other Services");
                        } else {
                          updateLine(idx, "service_name", val);
                        }
                      }}
                    >
                      <option value="" disabled>Select a Service...</option>
                      {COMMON_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                      <option value="Custom">Other / Custom Service...</option>
                    </select>
                    
                    {(!COMMON_SERVICES.includes(item.service_name) && item.service_name !== "") && (
                      <Input 
                        value={item.service_name} 
                        onChange={e => updateLine(idx, "service_name", e.target.value)} 
                        placeholder="Type custom service name..." 
                        className="bg-white/50 border-violet-300"
                        autoFocus
                      />
                    )}
                  </div>
                  <Input 
                    value={item.description} 
                    onChange={e => updateLine(idx, "description", e.target.value)} 
                    placeholder="Details (Optional)" 
                    className="text-xs h-8 bg-white/50 text-muted-foreground"
                  />
                </td>
                <td className="px-4 py-3 align-top">
                  <Input 
                    type="number" min="1" 
                    value={item.quantity} 
                    onChange={e => updateLine(idx, "quantity", Number(e.target.value))} 
                    className="bg-white/50"
                  />
                </td>
                <td className="px-4 py-3 align-top">
                  <Input 
                    type="number" min="0" 
                    value={item.unit_price} 
                    onChange={e => updateLine(idx, "unit_price", Number(e.target.value))} 
                    className="bg-white/50"
                  />
                </td>
                <td className="px-4 py-3 align-top">
                  <select 
                    value={item.gst_rate} 
                    onChange={e => updateLine(idx, "gst_rate", Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-md border border-input bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 align-top text-right font-medium text-foreground">
                  <div className="h-10 flex items-center justify-end">
                    ₹{item.line_total.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-center">
                  <Button 
                    variant="ghost" size="icon" 
                    onClick={() => removeLine(idx)}
                    disabled={lineItems.length === 1}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
