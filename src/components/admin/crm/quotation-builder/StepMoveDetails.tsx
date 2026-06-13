import { QuotationForm } from "./QuotationBuilderWizard";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const RELOCATION_TYPES = [
  "Household Relocation", "Office Relocation", "International Relocation", "Domestic Relocation",
  "Employee Relocation", "IT Asset Relocation", "Server & Data Center Relocation",
  "Document & Record Movement", "Industrial Equipment Relocation", "Warehouse Relocation",
  "Retail Store Relocation", "Laboratory Equipment Relocation", "Fine Art & Antique Moving",
  "Vehicle Transportation", "Pet Relocation", "Furniture Relocation",
  "Exhibition & Event Material Movement", "Project Cargo Movement"
];

const VEHICLE_TYPES = [
  "Tata Ace (300-400 CFT)", "Tata 407 (600-700 CFT)", "14 Feet Truck (800-1000 CFT)",
  "17 Feet Truck (1200-1400 CFT)", "19 Feet Truck (1600-1800 CFT)", 
  "22 Feet Container (2200-2500 CFT)", "32 Feet Container (3500+ CFT)"
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Chandigarh", "Puducherry"
];

export function StepMoveDetails({ form, setForm }: { form: QuotationForm, setForm: any }) {
  const handlePincodeSearch = async (pincode: string, type: 'origin' | 'destination') => {
    if (pincode.length !== 6) return;
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const po = data[0].PostOffice[0];
        setForm((f: any) => ({
          ...f,
          [`${type}_city`]: po.District,
          [`${type}_state`]: po.State
        }));
      }
    } catch (e) {
      console.error('Error fetching pincode details', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="font-semibold text-lg text-foreground border-b pb-3 mb-5">2. Relocation & Route Details</h3>
        
        <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Relocation Type (Primary Service)</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {RELOCATION_TYPES.map(type => {
              const currentTypes = form.relocation_type ? form.relocation_type.split(', ') : [];
              const isSelected = currentTypes.includes(type);
              return (
                <div 
                  key={type}
                  onClick={() => {
                    let types = [...currentTypes];
                    let newInsurances = [...(form.insurances || [])];
                    
                    if (isSelected) {
                      types = types.filter(t => t !== type);
                    } else {
                      types.push(type);
                      // Smart Automation: Auto-add Easy Cover Warranty row
                      const shortName = type.replace(' Relocation', '').replace(' Transportation', ' (Car/Bike)');
                      if (!newInsurances.find(i => i.type === shortName)) {
                        newInsurances.push({ type: shortName, declared_value: 0, percentage: 1.5 });
                      }
                    }
                    setForm((f: any) => ({...f, relocation_type: types.join(', '), insurances: newInsurances}));
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm cursor-pointer border transition-colors select-none ${isSelected ? 'bg-violet-600 text-white border-violet-600 shadow-md' : 'bg-white text-slate-700 border-slate-300 hover:border-violet-400 hover:bg-violet-50'}`}
                >
                  {type}
                </div>
              );
            })}
          </div>
        </div>

        {/* Origin Details */}
        <div className="mb-6 border border-slate-200 rounded-lg p-4">
          <h4 className="font-medium text-sm text-slate-800 mb-3">Origin Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Origin PIN Code</label>
              <Input 
                value={form.origin_pincode || ""} 
                onChange={e => {
                  const val = e.target.value;
                  setForm((f: any) => ({...f, origin_pincode: val}));
                  if (val.length === 6) handlePincodeSearch(val, 'origin');
                }} 
                placeholder="e.g. 110001" 
                maxLength={6}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Origin City</label>
              <Input value={form.origin_city} onChange={e => setForm((f: any) => ({...f, origin_city: e.target.value}))} placeholder="e.g. New Delhi" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Origin State</label>
              <select value={form.origin_state} onChange={e => setForm((f: any) => ({...f, origin_state: e.target.value}))} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none h-10">
                <option value="">Select State</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Full Origin Address (Optional)</label>
            <Input value={form.origin_address || ""} onChange={e => setForm((f: any) => ({...f, origin_address: e.target.value}))} placeholder="Complete address to display on quotation..." />
          </div>
        </div>

        {/* Destination Details */}
        <div className="mb-6 border border-slate-200 rounded-lg p-4 bg-slate-50">
          <h4 className="font-medium text-sm text-slate-800 mb-3">Destination Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Destination PIN Code</label>
              <Input 
                value={form.destination_pincode || ""} 
                onChange={e => {
                  const val = e.target.value;
                  setForm((f: any) => ({...f, destination_pincode: val}));
                  if (val.length === 6) handlePincodeSearch(val, 'destination');
                }} 
                placeholder="e.g. 400001" 
                maxLength={6}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Destination City</label>
              <Input value={form.destination_city} onChange={e => setForm((f: any) => ({...f, destination_city: e.target.value}))} placeholder="e.g. Mumbai" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Destination State</label>
              <select value={form.destination_state} onChange={e => setForm((f: any) => ({...f, destination_state: e.target.value}))} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none h-10">
                <option value="">Select State</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Full Destination Address (Optional)</label>
            <Input value={form.destination_address || ""} onChange={e => setForm((f: any) => ({...f, destination_address: e.target.value}))} placeholder="Complete address to display on quotation..." />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6 border-t pt-5">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Move Date</label>
            <Input type="date" value={form.move_date} onChange={e => setForm((f: any) => ({...f, move_date: e.target.value}))} />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Valid Until</label>
            <Input type="date" value={form.valid_until} onChange={e => setForm((f: any) => ({...f, valid_until: e.target.value}))} />
          </div>
          <div className="flex flex-col justify-center">
            <label className="flex items-center gap-2 cursor-pointer mt-4">
              <input type="checkbox" checked={form.is_move_date_confirmed} onChange={e => setForm((f: any) => ({...f, is_move_date_confirmed: e.target.checked}))} className="w-4 h-4 text-violet-600 rounded border-gray-300" />
              <span className="text-sm font-medium">Date is confirmed</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="font-semibold text-lg text-foreground border-b pb-3 mb-5">Survey & Volume Details</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
          {form.relocation_type.includes("Household") && (
            <>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">BHK/Property Type</label>
                <select value={form.bhk_type} onChange={e => {
                  const val = e.target.value;
                  let cft = "";
                  if (val === "1 RK") cft = "150-250";
                  if (val === "1 BHK") cft = "250-450";
                  if (val === "2 BHK") cft = "450-700";
                  if (val === "3 BHK") cft = "700-1000";
                  if (val === "4 BHK") cft = "1000-1400";
                  setForm((f: any) => ({...f, bhk_type: val, move_details: {...f.move_details, cft_volume: cft}}))
                }} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none h-10">
                  <option value="">Select</option>
                  {["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "Villa", "Other"].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Approx Cartons</label>
                <Input type="number" value={form.move_details.cartons || ""} onChange={e => setForm((f: any) => ({...f, move_details: {...f.move_details, cartons: e.target.value}}))} placeholder="e.g. 30" />
              </div>
            </>
          )}

          {(form.relocation_type.includes("Office") || form.relocation_type.includes("Commercial")) && (
            <>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Workstations</label>
                <Input type="number" value={form.move_details.workstations || ""} onChange={e => setForm((f: any) => ({...f, move_details: {...f.move_details, workstations: e.target.value}}))} />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Cabins</label>
                <Input type="number" value={form.move_details.cabins || ""} onChange={e => setForm((f: any) => ({...f, move_details: {...f.move_details, cabins: e.target.value}}))} />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Employees</label>
                <Input type="number" value={form.move_details.employees || ""} onChange={e => setForm((f: any) => ({...f, move_details: {...f.move_details, employees: e.target.value}}))} />
              </div>
            </>
          )}

          {(form.relocation_type.includes("IT Asset") || form.relocation_type.includes("Server")) && (
            <>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Laptops/Desktops</label>
                <Input type="number" value={form.move_details.laptops || ""} onChange={e => setForm((f: any) => ({...f, move_details: {...f.move_details, laptops: e.target.value}}))} />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Servers/Switches</label>
                <Input type="number" value={form.move_details.servers || ""} onChange={e => setForm((f: any) => ({...f, move_details: {...f.move_details, servers: e.target.value}}))} />
              </div>
            </>
          )}
          
          {(form.relocation_type.includes("Vehicle")) && (
            <>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Vehicle Make/Model</label>
                <Input value={form.move_details.vehicle_model || ""} onChange={e => setForm((f: any) => ({...f, move_details: {...f.move_details, vehicle_model: e.target.value}}))} placeholder="e.g. Honda City" />
              </div>
            </>
          )}

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Est. Volume (CFT)</label>
            <Input value={form.move_details.cft_volume || ""} onChange={e => setForm((f: any) => ({...f, move_details: {...f.move_details, cft_volume: e.target.value}}))} placeholder="e.g. 450-700" />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Recommended Vehicle</label>
            <select value={form.move_details.vehicle_type || ""} onChange={e => setForm((f: any) => ({...f, move_details: {...f.move_details, vehicle_type: e.target.value}}))} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none h-10">
              <option value="">Select Vehicle</option>
              {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>

        <h4 className="font-medium text-sm text-muted-foreground mb-3 border-t pt-4">Additional Logistics Required</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
           <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.lift_origin} onChange={e => setForm((f: any) => ({...f, lift_origin: e.target.checked}))} className="w-4 h-4 text-violet-600 rounded border-gray-300" />
            <span className="text-sm">Lift at Origin</span>
          </label>
           <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.lift_destination} onChange={e => setForm((f: any) => ({...f, lift_destination: e.target.checked}))} className="w-4 h-4 text-violet-600 rounded border-gray-300" />
            <span className="text-sm">Lift at Dest</span>
          </label>
           <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.move_details.stair_carry || false} onChange={e => setForm((f: any) => ({...f, move_details: {...f.move_details, stair_carry: e.target.checked}}))} className="w-4 h-4 text-violet-600 rounded border-gray-300" />
            <span className="text-sm">Stair Carry</span>
          </label>
           <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.move_details.long_carry || false} onChange={e => setForm((f: any) => ({...f, move_details: {...f.move_details, long_carry: e.target.checked}}))} className="w-4 h-4 text-violet-600 rounded border-gray-300" />
            <span className="text-sm">Long Carry</span>
          </label>
           <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.move_details.shuttle_vehicle || false} onChange={e => setForm((f: any) => ({...f, move_details: {...f.move_details, shuttle_vehicle: e.target.checked}}))} className="w-4 h-4 text-violet-600 rounded border-gray-300" />
            <span className="text-sm">Shuttle Vehicle</span>
          </label>
           <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.move_details.crating || false} onChange={e => setForm((f: any) => ({...f, move_details: {...f.move_details, crating: e.target.checked}}))} className="w-4 h-4 text-violet-600 rounded border-gray-300" />
            <span className="text-sm">Crating Reqd.</span>
          </label>
           <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.move_details.storage || false} onChange={e => setForm((f: any) => ({...f, move_details: {...f.move_details, storage: e.target.checked}}))} className="w-4 h-4 text-violet-600 rounded border-gray-300" />
            <span className="text-sm">Storage Reqd.</span>
          </label>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="flex justify-between items-center border-b pb-3 mb-5">
          <h3 className="font-semibold text-lg text-foreground">Easy Cover Warranty (Insurance)</h3>
          <Button variant="outline" size="sm" onClick={() => setForm((f: any) => ({...f, insurances: [...f.insurances, {type: "Household Goods", declared_value: 0, percentage: 1.5}]}))}>
            <Plus className="w-4 h-4 mr-1" /> Add Item
          </Button>
        </div>
        
        {form.insurances.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center border border-dashed rounded-lg">No Easy Cover Warranty items added. Client is moving at owner's risk.</p>
        ) : (
          <div className="space-y-4">
            {form.insurances.map((ins, idx) => (
              <div key={idx} className="flex flex-wrap sm:flex-nowrap items-end gap-3 p-3 bg-slate-50 border rounded-lg">
                <div className="flex-1 min-w-[120px]">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Item/Type</label>
                  <Input value={ins.type} onChange={e => {
                    const newIns = [...form.insurances];
                    newIns[idx].type = e.target.value;
                    setForm((f: any) => ({...f, insurances: newIns}));
                  }} placeholder="e.g. Household Goods" className="h-9" />
                </div>
                <div className="w-32">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Declared Val (₹)</label>
                  <Input type="number" value={ins.declared_value} onChange={e => {
                    const newIns = [...form.insurances];
                    newIns[idx].declared_value = Number(e.target.value);
                    setForm((f: any) => ({...f, insurances: newIns}));
                  }} className="h-9" />
                </div>
                <div className="w-24">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Premium %</label>
                  <Input type="number" step="0.1" value={ins.percentage} onChange={e => {
                    const newIns = [...form.insurances];
                    newIns[idx].percentage = Number(e.target.value);
                    setForm((f: any) => ({...f, insurances: newIns}));
                  }} className="h-9" />
                </div>
                <div className="w-28 pb-2 text-right">
                  <div className="text-xs text-slate-500">Premium Amount</div>
                  <div className="font-semibold text-slate-800">₹{((ins.declared_value * ins.percentage) / 100).toLocaleString('en-IN', {maximumFractionDigits: 0})}</div>
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => {
                  const newIns = form.insurances.filter((_, i) => i !== idx);
                  setForm((f: any) => ({...f, insurances: newIns}));
                }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col justify-center bg-violet-50 p-3 rounded-lg border border-violet-100 mt-6">
           <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_inter_state} onChange={e => setForm((f: any) => ({...f, is_inter_state: e.target.checked}))} className="w-4 h-4 text-violet-600 rounded border-violet-300" />
            <span className="text-sm font-medium text-violet-900">Inter-State GST (Apply IGST instead of CGST/SGST on Quote)</span>
          </label>
        </div>
      </div>
    </div>
  );
}
