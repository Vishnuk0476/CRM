import { useState, useEffect } from "react";
import { Loader2, ArrowLeft, Printer, CreditCard, X, ScanLine, Wallet, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Props {
  invoiceId?: number;
  previewData?: any;
  onBack: () => void;
}

export default function InvoicePrint({ invoiceId, previewData, onBack }: Props) {
  const [data, setData] = useState<any>(previewData || null);
  const [loading, setLoading] = useState(!previewData);
  const [showPayModal, setShowPayModal] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (previewData) {
      setData(previewData);
      setLoading(false);
      return;
    }
    
    if (invoiceId) {
      fetch(`/api/crm/invoice_details.php?id=${invoiceId}`, { credentials: "include" })
        .then(r => r.json())
        .then(d => {
          if (d.success) setData(d.data);
        })
        .finally(() => setLoading(false));
    }
  }, [invoiceId, previewData]);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;
  if (!data) return <div className="text-center p-20 text-red-500">Invoice not found</div>;

  const { invoice, items } = data;
  const dateStr = invoice.created_at ? new Date(invoice.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  
  const formatCur = (val: any) => parseFloat(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const toWords = (num: number) => {
    if (!num) return "ZERO RUPEES ONLY";
    const a = ['', 'ONE ', 'TWO ', 'THREE ', 'FOUR ', 'FIVE ', 'SIX ', 'SEVEN ', 'EIGHT ', 'NINE ', 'TEN ', 'ELEVEN ', 'TWELVE ', 'THIRTEEN ', 'FOURTEEN ', 'FIFTEEN ', 'SIXTEEN ', 'SEVENTEEN ', 'EIGHTEEN ', 'NINETEEN '];
    const b = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
    
    if (num.toString().length > 9) return 'OVERFLOW';
    const n = ('000000000' + Math.floor(num)).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (parseInt(n[1]) !== 0) ? (a[Number(n[1])] || b[n[1][0] as any] + ' ' + a[n[1][1] as any]) + 'CRORE ' : '';
    str += (parseInt(n[2]) !== 0) ? (a[Number(n[2])] || b[n[2][0] as any] + ' ' + a[n[2][1] as any]) + 'LAKH ' : '';
    str += (parseInt(n[3]) !== 0) ? (a[Number(n[3])] || b[n[3][0] as any] + ' ' + a[n[3][1] as any]) + 'THOUSAND ' : '';
    str += (parseInt(n[4]) !== 0) ? (a[Number(n[4])] || b[n[4][0] as any] + ' ' + a[n[4][1] as any]) + 'HUNDRED ' : '';
    str += (parseInt(n[5]) !== 0) ? ((str !== '') ? 'AND ' : '') + (a[Number(n[5])] || b[n[5][0] as any] + ' ' + a[n[5][1] as any]) : '';
    return str.trim() + " RUPEES ONLY";
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = async () => {
    if (!invoiceId) {
      toast.error("Please save the invoice before sending");
      return;
    }
    if (!confirm("Are you sure you want to send this invoice to the client?")) return;
    
    setSending(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.getElementById("invoice-print-container");
      if (!element) throw new Error("Invoice container not found");
      
      const opt = {
        margin: 0,
        filename: `Invoice_${invoice.invoice_number}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      
      toast.loading("Generating PDF...", { id: "send-toast" });
      const pdfBase64 = await html2pdf().set(opt).from(element).output('datauristring');
      
      toast.loading("Sending email...", { id: "send-toast" });
      const res = await fetch("/api/crm/invoices/send.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: invoiceId, pdf_base64: pdfBase64 })
      });
      const resData = await res.json();
      if (resData.success) {
        toast.success("Invoice sent successfully to the client.", { id: "send-toast" });
        if (resData.data?.waUrl) {
          window.open(resData.data.waUrl, "_blank");
        }
      } else {
        toast.error(resData.error || "Failed to send invoice", { id: "send-toast" });
      }
    } catch (e: any) {
      toast.error(e.message || "Error generating or sending PDF", { id: "send-toast" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <style>
        {`
          @media print {
            @page { margin: 0; }
            body { 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
            }
          }
        `}
      </style>
      <div className="max-w-4xl mx-auto print:max-w-none print:m-0">
        <div className="flex justify-between items-center p-4 bg-gray-50 border-b print:hidden sticky top-0 z-50">
          <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          <div className="flex gap-2">
            <Button onClick={handleSendEmail} disabled={sending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Send to Client
            </Button>
            <Button onClick={() => setShowPayModal(true)} className="bg-sky-600 hover:bg-sky-700 text-white"><CreditCard className="w-4 h-4 mr-2" /> Pay Now</Button>
            <Button onClick={handlePrint} className="bg-violet-600 hover:bg-violet-700 text-white"><Printer className="w-4 h-4 mr-2" /> Print Invoice</Button>
          </div>
        </div>

        <div id="invoice-print-container" className="bg-white p-8 max-w-4xl mx-auto shadow-xl rounded-lg text-black print:p-8 print:shadow-none print:max-w-none text-[12px] print:text-[11px] font-sans relative">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
          <img src="/logo-black.webp" alt="Watermark" className="w-[60%] object-contain grayscale" loading="lazy" decoding="async" />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center pb-2 mb-2 border-b-4 border-sky-600 relative z-10">
          <div className="flex-1">
            <img src="/logo-black.webp" alt="Logo" className="h-16" loading="lazy" decoding="async" />
          </div>
          <div className="flex-1 text-center whitespace-nowrap">
            <h1 className="text-base sm:text-lg font-extrabold text-sky-600 tracking-tight uppercase leading-tight inline-block">
              PANYA GLOBAL RELOCATION <br/> PRIVATE LIMITED
            </h1>
          </div>
          <div className="flex-1 text-right text-xs space-y-1">
            <p><strong>Tel :</strong> <a href="tel:+911141556447" className="text-blue-600 underline hover:text-blue-800">+91 11 41556447</a></p>
            <p><strong>Web :</strong> <a href="https://www.panyaglobal.in" target="_blank" className="text-blue-600 underline hover:text-blue-800" rel="noopener noreferrer">www.panyaglobal.in</a></p>
            <p><strong>E-Mail :</strong> <a href="mailto:info@panyaglobal.in" className="text-blue-600 underline hover:text-blue-800">info@panyaglobal.in</a></p>
          </div>
        </div>

        <div className="flex justify-between text-xs mb-2 relative z-10">
          <div className="space-y-0.5">
            <p><strong>Corp. Add:</strong> 18/1, Basement, Old Delhi Gurgaon Road, Samalkha, New Delhi - 110037</p>
            <p><strong>Branch Add:</strong> C/o Krishna S/o Ram Phal, Opposite Maruti Gate No 2, Near Shani Mandir, Gurugram 122017</p>
            <div className="flex gap-4 pt-0.5">
              <p><strong>Udyam Reg no:</strong> UDYAM-DL-03-0003485</p>
              <p><strong>GSTIN/UIN:</strong> 06AAJCP2435L1Z8</p>
            </div>
            <div className="flex gap-4">
              <p><strong>State Name:</strong> Haryana, Code : 06</p>
              <p><strong>CIN:</strong> U74999DL2017PTC319048</p>
            </div>
          </div>
        </div>

        <div className="border border-black flex items-stretch font-bold bg-white text-xs relative z-10">
          <div className="w-[30%] border-r border-black p-1 flex items-center">
            PAN : AAJCP2435L
          </div>
          <div className="w-[40%] border-r border-black p-1 flex items-center justify-center text-lg uppercase tracking-widest">
            Tax Invoice
          </div>
          <div className="w-[30%] p-1 flex items-center justify-end text-[10px]">
            ORIGINAL FOR RECIPIENT
          </div>
        </div>

        {/* Details Block */}
        <div className="flex border border-x-black border-b-black mb-4 bg-white text-xs">
          <div className="w-[45%] border-r border-black p-0">
            <div className="border-b border-black text-center font-bold bg-gray-100 p-0.5 text-[10px]">Customer Detail</div>
            <div className="p-2 grid grid-cols-[1fr_2fr] gap-x-2 gap-y-1 text-[11px]">
              <span className="font-bold">M/S</span>
              <span>{invoice.client_name || invoice.customer_name}</span>
              <span className="font-bold">Address</span>
              <span>{invoice.client_address || '(As per Case ' + (invoice.order_number || 'N/A') + ')'}</span>
              <span className="font-bold">Phone</span>
              <span>{invoice.client_phone || invoice.customer_phone || '-'}</span>
              {invoice.customer_gstin ? (
                <>
                  <span className="font-bold">GSTIN</span>
                  <span>{invoice.customer_gstin}</span>
                </>
              ) : null}
              <span className="font-bold">Place of Supply</span>
              <span>{invoice.place_of_supply || invoice.destination_city || '-'}</span>
            </div>
          </div>
          <div className="w-[55%] flex">
             <div className="w-1/2 border-r border-black p-2 space-y-2 text-[11px]">
               <div className="flex justify-between">
                 <span>Invoice No.</span>
                 <span className="font-bold text-red-600">{invoice.invoice_number === 'DRAFT' ? '' : (invoice.invoice_number || '')}</span>
               </div>
               <div className="flex justify-between">
                 <span>E-Way Bill No.</span>
                 <span>{invoice.eway_bill_no || 'N/A'}</span>
               </div>
               <div className="flex justify-between">
                 <span>Transport</span>
                 <span>{invoice.transport_details || 'N/A'}</span>
               </div>
               <div className="flex justify-between">
                 <span>Transport ID</span>
                 <span>N/A</span>
               </div>
             </div>
             <div className="w-1/2 p-2 space-y-2 text-[11px]">
               <div className="flex justify-between">
                 <span>Invoice Date</span>
                 <span>{dateStr}</span>
               </div>
             </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border-collapse border border-black text-[11px] mb-0">
          <thead>
            <tr className="border-b border-black text-center">
              <th className="border-r border-black p-1 w-8" rowSpan={2}>Sr.<br/>No.</th>
              <th className="border-r border-black p-1 text-left" rowSpan={2}>Name of Product / Service</th>
              <th className="border-r border-black p-1 w-16" rowSpan={2}>HSN / SAC</th>
              <th className="border-r border-black p-1 w-12" rowSpan={2}>Qty</th>
              <th className="border-r border-black p-1 w-20" rowSpan={2}>Rate</th>
              <th className="border-r border-black p-1 w-20" rowSpan={2}>Taxable Value</th>
              <th className="border-r border-black p-1 w-24" colSpan={2}>IGST / GST</th>
              <th className="p-1 w-24" rowSpan={2}>Total</th>
            </tr>
            <tr className="border-b border-black text-center">
              <th className="border-r border-black border-t border-black p-1 w-8">%</th>
              <th className="border-r border-black border-t border-black p-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, idx: number) => {
              const qty = parseFloat(item.quantity || 0);
              const rate = parseFloat(item.unit_price || 0);
              const taxable = qty * rate;
              const gstPct = parseFloat(item.gst_rate || 0);
              const gstAmt = taxable * (gstPct / 100);
              const total = taxable + gstAmt;
              return (
              <tr key={idx} className="border-b border-black">
                <td className="border-r border-black p-1 text-center align-top">{idx + 1}</td>
                <td className="border-r border-black p-1 align-top font-bold">{item.service_name}</td>
                <td className="border-r border-black p-1 text-center align-top">{item.hsn_sac || '-'}</td>
                <td className="border-r border-black p-1 text-center align-top">{qty} NOS</td>
                <td className="border-r border-black p-1 text-right align-top">{formatCur(rate)}</td>
                <td className="border-r border-black p-1 text-right align-top">{formatCur(taxable)}</td>
                <td className="border-r border-black p-1 text-center align-top">{gstPct}%</td>
                <td className="border-r border-black p-1 text-right align-top">{formatCur(gstAmt)}</td>
                <td className="p-1 text-right align-top">{formatCur(total)}</td>
              </tr>
            )})}
            
            {/* Empty rows to fill space */}
            {Array.from({ length: Math.max(0, 1 - items.length) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="border-r border-black p-1 h-4"></td>
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1"></td>
                <td className="p-1"></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-black font-bold">
              <td colSpan={3} className="border-r border-black p-1 text-right">Total</td>
              <td className="border-r border-black p-1 text-center">{items.reduce((a: number, b: any) => a + parseFloat(b.quantity || 0), 0)} NOS</td>
              <td className="border-r border-black p-1"></td>
              <td className="border-r border-black p-1 text-right">{formatCur(invoice.subtotal)}</td>
              <td className="border-r border-black p-1 text-center"></td>
              <td className="border-r border-black p-1 text-right">{formatCur(invoice.total_tax)}</td>
              <td className="p-1 text-right">{formatCur(invoice.grand_total)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Totals Block */}
        <div className="flex border border-x-black border-b-black text-[11px]">
          <div className="w-[60%] border-r border-black p-2 flex flex-col justify-start text-center">
            <p className="font-bold mb-2 border-b border-gray-300 pb-1">Total in words</p>
            <p className="uppercase font-medium">{toWords(invoice.grand_total)}</p>
          </div>
          <div className="w-[40%]">
            <div className="flex justify-between border-b border-black p-1 px-2">
              <span className="font-bold">Taxable Amount</span>
              <span>{formatCur(invoice.subtotal)}</span>
            </div>
            {parseFloat(invoice.total_tax || 0) > 0 && (
              parseFloat(invoice.igst_amount || 0) > 0 ? (
                <div className="flex justify-between border-b border-black p-1 px-2">
                  <span className="font-bold">Add : IGST</span>
                  <span>{formatCur(invoice.igst_amount)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between border-b border-black p-1 px-2">
                    <span className="font-bold">Add : CGST</span>
                    <span>{formatCur(invoice.cgst_amount)}</span>
                  </div>
                  <div className="flex justify-between border-b border-black p-1 px-2">
                    <span className="font-bold">Add : SGST</span>
                    <span>{formatCur(invoice.sgst_amount)}</span>
                  </div>
                </>
              )
            )}
            <div className="flex justify-between border-b border-black p-1 px-2">
              <span className="font-bold">Total Tax</span>
              <span>{formatCur(invoice.total_tax)}</span>
            </div>
            <div className="flex justify-between p-1 px-2 font-bold text-sm bg-gray-100">
              <span>Total Amount After Tax</span>
              <span>₹{formatCur(invoice.grand_total)}</span>
            </div>
          </div>
        </div>

        {/* Bank & T&C */}
        <div className="flex border border-x-black border-b-black text-[10px]">
          <div className="w-[60%] border-r border-black flex flex-col">
            <div>
              <div className="border-b border-black p-1 font-bold text-center bg-gray-100">Bank Details</div>
              <div className="flex justify-between p-2">
                <table className="w-2/3 text-[11px]">
                  <tbody>
                    <tr><td className="w-24 font-normal">Bank Name</td><td>: ICICI BANK</td></tr>
                    <tr><td className="font-normal">A/c No.</td><td>: 336105000210</td></tr>
                    <tr><td className="font-normal">Branch & IFS Code</td><td>: SUBHASH NAGAR & ICIC0003361</td></tr>
                  </tbody>
                </table>
                <div className="text-center bg-white p-2 w-fit mx-auto border-2 border-slate-200 rounded-lg">
                <img src="https://quickchart.io/qr?text=upi://pay?pa=panyaglobalrelocationprivatelimited.ibz@icici%26pn=PANYA%20GLOBAL%20RELOCATION%20PVT.%20LTD.&dark=0EA5E9&centerImageUrl=https://s2.googleusercontent.com/s2/favicons?domain=panyaglobal.in%26sz=128&size=100&margin=1" alt="QR" className="w-20 h-20" loading="lazy" decoding="async" />
                <div className="text-[10px] font-bold mt-1 tracking-tight text-sky-700">Pay using UPI</div>
              </div>
              </div>
            </div>
            <div className="border-t border-black">
              <div className="border-b border-black p-1 font-bold text-center bg-gray-100">Terms and Conditions</div>
              <ol className="list-decimal pl-6 pr-2 py-1 space-y-0.5 text-gray-700">
                <li>Subject to Mumbai Jurisdiction.</li>
                <li>Our Responsibility Ceases as soon as goods leave our premises.</li>
                <li>Goods once sold will not be taken back.</li>
                <li>Delivery Ex-Premises.</li>
              </ol>
            </div>
            <div className="border-t border-black p-1 h-12 flex items-end text-[9px]">
              Customer Signature
            </div>
          </div>
          <div className="w-[40%] flex flex-col relative">
             <div className="text-right p-2 font-bold text-xs">
                (E & O.E.)
             </div>
            <div className="text-center text-[9px] mb-2">
              Certified that the particulars given above are true and correct.
            </div>
            <div className="text-center font-bold text-sm">
              For Panya Global
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="transform -rotate-12 opacity-40 text-center">
                <span className="text-gray-600 font-bold text-xs block">This is a computer generated</span>
                <span className="text-gray-600 font-bold text-xs block">invoice no signature required.</span>
              </div>
            </div>
            <div className="text-right p-2 text-[9px] font-bold border-t border-black">
              Authorised Signatory
            </div>
          </div>
        </div>

        <div className="pt-2 text-[10px] text-gray-600">
          Thank you for shopping with us!
        </div>

      </div>

      {/* Pay Now Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-sky-900 to-sky-800 p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg flex items-center gap-2"><CreditCard className="w-5 h-5 text-sky-400"/> Secure Payment Portal</h3>
              <button onClick={() => setShowPayModal(false)} className="hover:bg-white/20 p-1 rounded transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl">
                  <h4 className="font-bold text-sky-900 mb-3 border-b border-sky-200 pb-2">Bank Transfer Details (NEFT/RTGS)</h4>
                  <table className="text-sm w-full">
                    <tbody>
                      <tr><td className="py-1.5 text-slate-600">Beneficiary</td><td className="font-semibold text-slate-900">PANYA GLOBAL RELOCATION PVT. LTD.</td></tr>
                      <tr><td className="py-1.5 text-slate-600">Account No</td><td className="font-bold text-lg tracking-wider text-slate-900">336105000210</td></tr>
                      <tr><td className="py-1.5 text-slate-600">IFSC Code</td><td className="font-bold text-sky-700">ICIC0003361</td></tr>
                      <tr><td className="py-1.5 text-slate-600">Bank Name</td><td className="font-semibold text-slate-900">ICICI BANK LTD., SUBHASH NAGAR.</td></tr>
                      <tr><td className="py-1.5 text-slate-600">MICR Code</td><td className="font-semibold text-slate-900">110229018</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                  <h4 className="font-bold text-amber-900 mb-3 border-b border-amber-200 pb-2">Online Payment Links</h4>
                  <div className="space-y-3">
                    <a href="https://razorpay.me/@panyaglobal" target="_blank" rel="noreferrer noopener noreferrer" className="flex items-center gap-2 text-sm text-sky-700 hover:text-sky-800 hover:underline font-bold bg-sky-100/50 p-2 rounded-lg transition-colors"><Wallet className="w-4 h-4"/> Pay via Razorpay</a>
                    <a href="https://payments.cashfree.com/forms/panyaglobal" target="_blank" rel="noreferrer noopener noreferrer" className="flex items-center gap-2 text-sm text-sky-700 hover:text-sky-800 hover:underline font-bold bg-sky-100/50 p-2 rounded-lg transition-colors"><CreditCard className="w-4 h-4"/> Pay via Cashfree</a>
                  </div>
                  <p className="text-xs text-amber-700 mt-3 font-medium bg-amber-100/50 p-2 rounded">*Note: Bank charges are applicable on payments made by credit card (2 to 3% approximately plus 18% GST).</p>
                </div>
              </div>
              <div className="w-full md:w-64 flex flex-col items-center justify-center bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><ScanLine className="w-5 h-5 text-sky-600"/> Scan to Pay via UPI</h4>
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
                  <img src="https://quickchart.io/qr?text=upi://pay?pa=panyaglobalrelocationprivatelimited.ibz@icici%26pn=PANYA%20GLOBAL%20RELOCATION%20PVT.%20LTD.&dark=0EA5E9&centerImageUrl=https://s2.googleusercontent.com/s2/favicons?domain=panyaglobal.in%26sz=128&size=200&margin=1" alt="UPI QR Code" className="w-48 h-48" loading="lazy" decoding="async" />
                </div>
                <p className="text-sm font-bold text-slate-800 mt-4 text-center break-all w-full">panyaglobalrelocationprivatelimited.ibz@icici</p>
                <div className="flex gap-3 mt-4 items-center opacity-70">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-5" loading="lazy" decoding="async" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Google_Pay_Logo.svg" alt="GPay" className="h-5" loading="lazy" decoding="async" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/PhonePe_Logo.svg" alt="PhonePe" className="h-5" loading="lazy" decoding="async" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
