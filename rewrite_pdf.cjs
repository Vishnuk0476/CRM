const fs = require('fs');

const fileContent = `import React from "react";
import { format } from "date-fns";

export interface QuotationPDFData {
  quotation_number?: string;
  client_company?: string;
  client_name: string;
  origin_city: string;
  destination_city: string;
  client_email?: string;
  client_phone?: string;
  move_date?: string;
  valid_until?: string;
  bhk_type?: string;
  
  // Totals & specifics
  subtotal: number;
  discount_amount: number;
  taxable_amount: number;
  cgst: number;
  sgst: number;
  igst: number;
  grand_total: number;
  same_state: boolean;
  
  // Custom additions for the PDF template
  moving_plan?: string;
  goods_type?: string;
  shipment_mode?: string;
  transit_time?: string;
  declared_value?: number;
  insurance_percentage?: number;
  insurance_amount?: number;

  categories?: string[];
  additional_services?: string[];
  vehicle_details?: string;
  pet_details?: string;
  commercial_details?: string;

  is_move_date_confirmed?: boolean;
  lift_origin?: boolean;
  lift_destination?: boolean;
  lift_type?: string;
  origin_floor?: string;
  destination_floor?: string;
  origin_lift_type?: string;
  destination_lift_type?: string;
  car_declared_value?: number;
  car_insurance_percentage?: number;
  car_insurance_amount?: number;
  gst_type?: string;
  inclusions?: string[];
  exclusions?: string[];

  // New CRM fields
  origin_pincode?: string;
  destination_pincode?: string;
  origin_address?: string;
  destination_address?: string;
  scope_intro_text?: string;
  approx_area_sqft?: string;
  approx_distance_km?: string;
  access_road_condition?: string;
  total_boxes_estimated?: string;
  payment_schedule?: string;
  payment_terms?: string;

  line_items?: any[];
}

const numberToWords = (num: number): string => {
  const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
  const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];

  if ((num = num.toString()).length > 9) return 'overflow';
  let n = ('000000000' + num).substr(-9).match(/^(\\d{2})(\\d{2})(\\d{2})(\\d{1})(\\d{2})$/);
  if (!n) return ''; 
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only ' : '';
  return str.trim() === '' ? 'Zero Only' : str.trim();
};

export const QuotationPDFTemplate = React.forwardRef<HTMLDivElement, { data: QuotationPDFData }>(
  ({ data }, ref) => {
    
    const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    const cats = data.categories || [];
    const isHousehold = cats.includes("Household");
    const isCar = cats.includes("Car Relocation");
    const isPet = cats.includes("Pet Relocation");
    const isCommercial = cats.includes("Commercial");
    const isIT = cats.includes("IT Assets");
    const isBooks = cats.includes("Books, Files & Documentation");

    // Dynamic Subject Construction
    const buildSubject = () => {
      let items: string[] = [];
      if (isHousehold) items.push(data.bhk_type ? \`\${data.bhk_type} Effects\` : "Personal House Hold Effects");
      if (isCommercial || isIT || isBooks) items.push("Commercial/Office Goods");
      if (isCar) items.push("Vehicle/Car");
      if (isPet) items.push("Pet(s)");

      if (items.length === 0) items.push("Goods");

      const joinedItems = items.length > 1 
        ? items.slice(0, -1).join(", ") + " and " + items[items.length - 1] 
        : items[0];

      return \`Packing & Moving of \${joinedItems} from \`;
    };

    const m_plan = data.moving_plan || "Yet to be confirmed";
    const ref_no = data.quotation_number || \`PGR-\${new Date().getFullYear()}-New\`;
    const q_date = format(new Date(), "do MMMM yyyy");
    
    const insuranceTotal = (data.insurance_amount || 0) + (data.car_insurance_amount || 0);
    const taxTotal = data.gst_type === 'additional' ? 0 : (data.cgst + data.sgst + data.igst);
    
    // If we have line items, calculate total from them (excluding insurance if we add it separately)
    // Actually, subtotal is already calculated in parent and passed in.
    const finalGrandTotal = data.taxable_amount + insuranceTotal + taxTotal;
    
    return (
      <div 
        ref={ref} 
        // 794px width approx matches A4 at 96 DPI. Setting a fixed width ensures consistency for html-to-image.
        className="w-[794px] min-h-[1123px] bg-white text-black text-sm font-sans relative box-border"
        style={{ fontFamily: "'Arial', sans-serif" }}
      >
        {/* Navy Orange Header Bar */}
        <div className="bg-[#0f172a] border-b-4 border-[#f97316] p-6 flex justify-between items-center text-white">
          <div className="w-64">
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              Panya<br />
              <span className="ml-8 text-[#f97316]">Global</span>
            </h1>
            <p className="ml-8 text-[#f97316] text-xs font-semibold tracking-widest mt-1">RELOCATE SMILE</p>
          </div>
          <div className="text-right text-[11px] leading-tight text-slate-300">
            <h2 className="text-xl font-bold tracking-widest text-white mb-2 uppercase">QUOTATION</h2>
            <p>Office Cum Warehouse : 18/1, Basement, Village Samalkha,</p>
            <p>Old Delhi Gurgaon Road, New Delhi - 110037</p>
            <p>Phone: +91-1141556447 | Mob: +91-8800446447</p>
            <p className="text-[#f97316] mt-1">info@panyaglobal.in | www.panyaglobal.in</p>
          </div>
        </div>

        <div className="p-8">
          {/* Top Info Section */}
          <div className="flex justify-between gap-6 mb-6">
            <div className="w-1/2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quotation Details</h3>
              <table className="w-full text-xs">
                <tbody>
                  <tr><td className="font-semibold w-24 pb-1 text-slate-700">Ref No:</td><td className="font-bold text-[#0f172a]">{ref_no}</td></tr>
                  <tr><td className="font-semibold pb-1 text-slate-700">Date:</td><td className="font-medium text-[#0f172a]">{q_date}</td></tr>
                  <tr><td className="font-semibold pb-1 text-slate-700">Valid Until:</td><td className="font-medium text-[#0f172a]">{data.valid_until || "30 Days"}</td></tr>
                  <tr><td className="font-semibold pb-1 text-slate-700">Moving Plan:</td><td className="font-medium text-[#0f172a]">{data.is_move_date_confirmed ? m_plan : "Yet to be confirmed"}</td></tr>
                </tbody>
              </table>
            </div>
            
            <div className="w-1/2 bg-blue-50 p-3 rounded-lg border border-blue-100">
              <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Prepared For</h3>
              <table className="w-full text-xs">
                <tbody>
                  <tr><td className="font-semibold w-20 pb-1 text-blue-900">Name:</td><td className="font-bold text-[#0f172a]">{data.client_company ? \`\${data.client_company} (\${data.client_name})\` : data.client_name}</td></tr>
                  <tr><td className="font-semibold pb-1 text-blue-900">Phone:</td><td className="font-medium text-[#0f172a]">{data.client_phone || "N/A"}</td></tr>
                  <tr><td className="font-semibold pb-1 text-blue-900">Email:</td><td className="font-medium text-blue-600">{data.client_email || "N/A"}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Move Summary Box */}
          <div className="bg-white border-2 border-[#0f172a] rounded-lg overflow-hidden mb-6 shadow-sm">
            <div className="bg-[#0f172a] text-white py-2 px-4">
              <h3 className="text-sm font-bold tracking-wide">MOVE SUMMARY</h3>
            </div>
            <div className="p-4 flex flex-wrap gap-y-4 gap-x-6 text-sm">
              <div className="flex-1 min-w-[200px]">
                <div className="text-xs text-slate-500 uppercase font-semibold">Origin</div>
                <div className="font-bold text-lg text-blue-900">{data.origin_city} {data.origin_pincode && <span className="text-sm text-slate-500">({data.origin_pincode})</span>}</div>
                {data.origin_address && <div className="text-xs text-slate-700 mt-1 max-w-[200px] whitespace-pre-wrap leading-tight">{data.origin_address}</div>}
                <div className="text-xs text-slate-600 mt-1">Floor: {data.origin_floor || "Ground"} {data.lift_origin ? \`(\${data.origin_lift_type} lift)\` : '(No lift)'}</div>
              </div>
              <div className="flex items-center justify-center px-4">
                <div className="w-12 h-0.5 bg-orange-500 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-orange-500"></div>
                </div>
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="text-xs text-slate-500 uppercase font-semibold">Destination</div>
                <div className="font-bold text-lg text-blue-900">{data.destination_city} {data.destination_pincode && <span className="text-sm text-slate-500">({data.destination_pincode})</span>}</div>
                {data.destination_address && <div className="text-xs text-slate-700 mt-1 max-w-[200px] whitespace-pre-wrap leading-tight">{data.destination_address}</div>}
                <div className="text-xs text-slate-600 mt-1">Floor: {data.destination_floor || "Ground"} {data.lift_destination ? \`(\${data.destination_lift_type} lift)\` : '(No lift)'}</div>
              </div>
              
              <div className="w-full h-px bg-slate-200 my-2"></div>
              
              <div className="w-1/4">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Configuration</div>
                <div className="font-semibold text-sm">{data.bhk_type || "N/A"}</div>
              </div>
              <div className="w-1/4">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Distance</div>
                <div className="font-semibold text-sm">{data.approx_distance_km ? \`\${data.approx_distance_km} km\` : "N/A"}</div>
              </div>
              <div className="w-1/4">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Area</div>
                <div className="font-semibold text-sm">{data.approx_area_sqft ? \`\${data.approx_area_sqft} sq ft\` : "N/A"}</div>
              </div>
              <div className="w-1/4">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Access Road</div>
                <div className="font-semibold text-sm">{data.access_road_condition || "Good"}</div>
              </div>
            </div>
          </div>

          {/* Letter body */}
          <div className="text-xs mb-6 space-y-3 leading-relaxed text-slate-800">
            <p>Dear Sir/ Madam,</p>
            <p className="font-bold text-blue-900 border-l-4 border-[#f97316] pl-3 py-1 bg-slate-50">
              Subject: {buildSubject()} {data.origin_city} to {data.destination_city} on Door to Door Basis.
            </p>
            {data.scope_intro_text ? (
              <p className="whitespace-pre-wrap">{data.scope_intro_text}</p>
            ) : (
              <p>
                We thank you for your valued enquiry regarding packing & moving. We take this opportunity to inform you that <strong className="text-blue-800">PANYA GLOBAL is an ISO 9001:2015, 14001:2015 & 18001:2015 Certified Co.</strong> This is the highest quality recognition for a moving company. Having surveyed the goods to be packed & moved, we have pleasure in submitting our proposal as under:
              </p>
            )}
          </div>

          {/* Services Table */}
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="bg-[#0f172a] text-white text-xs">
                <th className="border border-slate-700 py-2 px-2 text-center w-10">Sr</th>
                <th className="border border-slate-700 py-2 px-2 text-left w-48">Service</th>
                <th className="border border-slate-700 py-2 px-2 text-left">Description</th>
                <th className="border border-slate-700 py-2 px-2 text-center w-16">Qty</th>
                <th className="border border-slate-700 py-2 px-2 text-right w-20">Rate</th>
                <th className="border border-slate-700 py-2 px-2 text-right w-24">Amount</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {data.line_items && data.line_items.length > 0 ? (
                data.line_items.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="border border-slate-300 py-2 px-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-300 py-2 px-2 font-semibold text-slate-800">{item.service_name}</td>
                    <td className="border border-slate-300 py-2 px-2 text-slate-600">{item.description || "-"}</td>
                    <td className="border border-slate-300 py-2 px-2 text-center">{item.qty}</td>
                    <td className="border border-slate-300 py-2 px-2 text-right">{fmt(item.rate)}</td>
                    <td className="border border-slate-300 py-2 px-2 text-right font-medium">{fmt(item.qty * item.rate)}</td>
                  </tr>
                ))
              ) : (
                <tr className="bg-white">
                  <td className="border border-slate-300 py-4 px-2 text-center" colSpan={6}>
                    <p className="text-slate-500 italic">No specific line items added. See total relocation charges below.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Insurance Table (if applicable) */}
          {(insuranceTotal > 0 || cats.length > 0) && (
            <div className="mb-6">
              <h4 className="font-bold text-sm text-[#0f172a] mb-2 border-b-2 border-[#f97316] inline-block pb-1">Value Additions & Insurance</h4>
              <table className="w-full text-xs border-collapse">
                <tbody>
                  {data.insurance_amount > 0 && (
                    <tr className="bg-blue-50">
                      <td className="border border-blue-200 py-2 px-3 font-semibold w-3/4">
                        Easy Cover Warranty for Household Effects (Declared Value {fmt(data.declared_value || 0)} @ {data.insurance_percentage}%)
                      </td>
                      <td className="border border-blue-200 py-2 px-3 text-right font-bold text-blue-900">{fmt(data.insurance_amount)}</td>
                    </tr>
                  )}
                  {data.car_insurance_amount > 0 && (
                    <tr className="bg-blue-50">
                      <td className="border border-blue-200 py-2 px-3 font-semibold w-3/4">
                        Easy Cover Warranty for Vehicle (IDV {fmt(data.car_declared_value || 0)} @ {data.car_insurance_percentage}%)
                      </td>
                      <td className="border border-blue-200 py-2 px-3 text-right font-bold text-blue-900">{fmt(data.car_insurance_amount)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals Box */}
          <div className="flex justify-end mb-4">
            <div className="w-1/2 bg-slate-50 rounded-lg border-2 border-slate-300 p-4">
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1 text-slate-600 font-semibold">Sub Total</td>
                    <td className="py-1 text-right font-bold">{fmt(data.subtotal)}</td>
                  </tr>
                  {data.discount_amount > 0 && (
                    <tr>
                      <td className="py-1 text-green-600 font-semibold">Discount</td>
                      <td className="py-1 text-right font-bold text-green-700">- {fmt(data.discount_amount)}</td>
                    </tr>
                  )}
                  {insuranceTotal > 0 && (
                    <tr>
                      <td className="py-1 text-slate-600 font-semibold">Insurance</td>
                      <td className="py-1 text-right font-bold">{fmt(insuranceTotal)}</td>
                    </tr>
                  )}
                  <tr className="border-t border-slate-300">
                    <td className="py-2 text-slate-800 font-bold">Taxable Amount</td>
                    <td className="py-2 text-right font-bold">{fmt(data.taxable_amount + insuranceTotal)}</td>
                  </tr>
                  {data.gst_type !== 'additional' && (
                    <>
                      <tr>
                        <td className="py-1 text-slate-600 font-semibold text-xs">
                          {data.same_state ? "CGST + SGST" : "IGST"} ({data.gst_type}%)
                        </td>
                        <td className="py-1 text-right font-bold text-xs">{fmt(taxTotal)}</td>
                      </tr>
                    </>
                  )}
                  {data.gst_type === 'additional' && (
                    <tr>
                      <td className="py-1 text-slate-600 font-semibold text-xs">GST</td>
                      <td className="py-1 text-right font-bold text-xs text-red-600">Additional (18%)</td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-black">
                    <td className="py-3 text-[#0f172a] font-extrabold text-lg">GRAND TOTAL</td>
                    <td className="py-3 text-right font-extrabold text-lg text-[#f97316]">
                      ₹ {fmt(finalGrandTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="text-center mt-2 text-xs italic font-semibold text-slate-600 bg-white p-2 rounded border border-dashed border-slate-300">
                Amount in Words: <span className="text-blue-900 uppercase">{numberToWords(Math.round(finalGrandTotal))}</span>
              </div>
            </div>
          </div>

          <div className="page-break-before" style={{ pageBreakBefore: 'always' }}></div>

          {/* Scope of Services */}
          <div className="mb-6 pt-4">
            <h4 className="font-bold text-sm text-[#0f172a] mb-2 border-b-2 border-[#f97316] inline-block pb-1">Scope of Services Include & Exclude</h4>
            <div className="flex border border-slate-300 rounded-lg overflow-hidden">
              <div className="w-1/2 border-r border-slate-300">
                <div className="bg-green-100 font-bold text-green-900 py-2 px-3 text-xs uppercase tracking-wider text-center border-b border-slate-300">Included at Origin & Destination</div>
                <div className="p-4 text-xs space-y-2 text-slate-700 bg-green-50/30 h-full">
                  {data.inclusions && data.inclusions.length > 0 ? (
                    data.inclusions.map((inc, i) => <div key={i} className="flex gap-2"><span className="text-green-600">✓</span> {inc}</div>)
                  ) : (
                    <>
                      <div className="flex gap-2"><span className="text-green-600">✓</span> Packing & Handling of household goods</div>
                      <div className="flex gap-2"><span className="text-green-600">✓</span> One Point Packing & Pickup</div>
                      <div className="flex gap-2"><span className="text-green-600">✓</span> Safe Loading & Transportation</div>
                      <div className="flex gap-2"><span className="text-green-600">✓</span> Unloading & Unpacking at Destination</div>
                      {isCar && <div className="flex gap-2"><span className="text-green-600">✓</span> Vehicle Condition Report & Transport</div>}
                    </>
                  )}
                </div>
              </div>
              <div className="w-1/2">
                <div className="bg-red-100 font-bold text-red-900 py-2 px-3 text-xs uppercase tracking-wider text-center border-b border-slate-300">Excluded (Additional Charges)</div>
                <div className="p-4 text-xs space-y-2 text-slate-700 bg-red-50/30 h-full">
                  {data.exclusions && data.exclusions.length > 0 ? (
                    data.exclusions.map((exc, i) => <div key={i} className="flex gap-2"><span className="text-red-500">✗</span> {exc}</div>)
                  ) : (
                    <>
                      <div className="flex gap-2"><span className="text-red-500">✗</span> Wooden Crating Service</div>
                      <div className="flex gap-2"><span className="text-red-500">✗</span> Vehicle Halting & Storage charges</div>
                      <div className="flex gap-2"><span className="text-red-500">✗</span> Union / Society / Lift / Mathadi Charges</div>
                      <div className="flex gap-2"><span className="text-red-500">✗</span> Shuttle Service & Long carry charges</div>
                      <div className="flex gap-2"><span className="text-red-500">✗</span> Handyman Services (Carpentry, Plumbing, etc.)</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-6 mb-6">
            {/* Payment Terms */}
            <div className="w-1/2">
              <h4 className="font-bold text-sm text-[#0f172a] mb-2 border-b-2 border-[#f97316] inline-block pb-1">Payment Schedule</h4>
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 text-xs">
                <p className="font-semibold text-blue-900 mb-2">{data.payment_schedule || "100% advance before dispatch."}</p>
                <p className="text-slate-600 italic whitespace-pre-wrap">{data.payment_terms || "All payments must be made in favor of Panya Global."}</p>
              </div>
            </div>

            {/* Bank Details */}
            <div className="w-1/2">
              <h4 className="font-bold text-sm text-[#0f172a] mb-2 border-b-2 border-[#f97316] inline-block pb-1">Bank Account Details</h4>
              <table className="w-full text-xs border border-slate-300 rounded-lg overflow-hidden shadow-sm">
                <tbody>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <td className="p-2 font-semibold text-slate-700 w-32">ACCOUNT NAME</td>
                    <td className="p-2 font-bold text-[#0f172a]">PANYA GLOBAL</td>
                  </tr>
                  <tr className="bg-white border-b border-slate-200">
                    <td className="p-2 font-semibold text-slate-700">ACCOUNT NO.</td>
                    <td className="p-2 font-extrabold text-blue-700 text-sm tracking-widest">336105000210</td>
                  </tr>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <td className="p-2 font-semibold text-slate-700">IFSC CODE</td>
                    <td className="p-2 font-bold text-[#0f172a]">ICIC0003361</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-2 font-semibold text-slate-700">BANK & BRANCH</td>
                    <td className="p-2 font-medium text-slate-800">ICICI BANK LTD., SUBHASH NAGAR.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="mb-8">
            <h4 className="font-bold text-sm text-[#0f172a] mb-2 border-b-2 border-[#f97316] inline-block pb-1">Terms & Conditions</h4>
            <div className="text-[10px] space-y-1.5 text-slate-600 leading-relaxed text-justify">
              <p><strong>1. Breakage / Insurance:</strong> If due to any reason there is any breakage at the time of loading/unloading, shipper would not deduct any amount from our payment and all the claim will be settled by Insurance Co. directly. Claim must be filed within 48 hours of shipment reaching destination. Do not file a breakage claim of less than INR 5,000.00. Processing fees of INR 5,000 applies to claims.</p>
              <p><strong>2. Car Relocation Note:</strong> No liability for interior personal items left in the car. Scratches not documented at origin are not covered unless Major Impact.</p>
              <p><strong>3. Pet Relocation Note:</strong> We are not liable for any health issues, distress, or death of the pet during transit not caused by gross negligence.</p>
              <p><strong>4. Validity:</strong> This proposal is valid for 30 days from the date of submission. However, this proposal does not cover any increase in rates due to Government regulations.</p>
              <p><strong>5. Cancellation:</strong> Once the move dates are confirmed to us, should you wish to postponement or cancel the move, please inform us 36 hours in advance else cancellation charges will be applicable.</p>
            </div>
          </div>

          {/* Signature Block */}
          <div className="flex justify-between mt-12 mb-6">
            <div className="w-64 text-center">
              <div className="border-t border-slate-400 pt-2 mb-1 text-xs">
                <p className="font-bold text-[#0f172a]">Acceptance of Proposal</p>
                <p className="text-[10px] text-slate-500 mt-1">Client Signature & Date</p>
              </div>
            </div>
            <div className="w-64 text-center">
              <div className="border-t border-slate-400 pt-2 mb-1 text-xs">
                <p className="font-bold text-blue-900">For Panya Global</p>
                <p className="text-[10px] text-slate-500 mt-1">Authorized Signatory</p>
              </div>
            </div>
          </div>
          
          <div className="text-center text-[9px] text-slate-400 mt-8 border-t border-slate-200 pt-2">
            This is a computer-generated quotation and does not require a physical signature.
          </div>
        </div>
      </div>
    );
  }
);

QuotationPDFTemplate.displayName = "QuotationPDFTemplate";
`;

fs.writeFileSync('src/components/admin/crm/QuotationPDFTemplate.tsx', fileContent);
console.log('QuotationPDFTemplate rewritten successfully');
