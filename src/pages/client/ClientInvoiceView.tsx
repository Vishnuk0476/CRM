import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { CheckCircle, Download, FileText, CreditCard, Loader2 } from "lucide-react";

export default function ClientInvoiceView() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/client/invoice.php?id=${id}`);
      const data = await res.json();
      if (data.success) {
        setInvoice(data.data.invoice);
      } else {
        toast({ title: "Error", description: data.message || "Invoice not found", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load invoice", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setPaying(true);
    // Simulate a payment gateway delay
    setTimeout(async () => {
      try {
        const res = await fetch(`/api/client/pay-invoice.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoice_number: id, transaction_id: 'TXN-' + Math.floor(Math.random()*1000000000) }),
        });
        const data = await res.json();
        if (data.success) {
          toast({ title: "Payment Successful", description: "Thank you for your payment!" });
          fetchInvoice(); // refresh
        } else {
          toast({ title: "Payment Failed", description: data.message, variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "Error", description: "Failed to process payment", variant: "destructive" });
      } finally {
        setPaying(false);
      }
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Helmet><title>Invoice Not Found - Panya Global</title></Helmet>
        <FileText className="w-16 h-16 text-slate-300 mb-4" />
        <h1 className="text-2xl font-bold text-slate-800">Invoice Not Found</h1>
        <p className="text-slate-500 mt-2 mb-6">The invoice link appears to be invalid or expired.</p>
        <Link to="/"><Button>Return to Homepage</Button></Link>
      </div>
    );
  }

  const isPaid = invoice.status === 'paid';

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <Helmet>
        <title>Invoice {invoice.invoice_number} - Panya Global</title>
      </Helmet>

      {/* Mock Payment Overlay */}
      {paying && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Processing Payment...</h3>
            <p className="text-slate-500">Please do not close this window.</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/">
              <img src="/assets/logo.webp" alt="Panya Global" className="h-10 mb-6 object-contain" onError={(e) => (e.currentTarget.src = "https://panyaglobal.in/assets/images/logo-white-BXZUiPLa.webp")} />
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Invoice</h1>
            <p className="text-slate-500 mt-1">Ref: {invoice.invoice_number}</p>
          </div>
          <div className="text-right">
            {isPaid ? (
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 font-bold">
                <CheckCircle className="w-5 h-5 mr-2" /> Paid
              </span>
            ) : (
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-red-700 font-bold">
                <CreditCard className="w-5 h-5 mr-2" /> Unpaid
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Billed To</h3>
                <p className="font-bold text-lg text-slate-800">{invoice.client_name}</p>
                {invoice.client_address && <p className="text-slate-600 mt-1 whitespace-pre-wrap">{invoice.client_address}</p>}
                {invoice.client_phone && <p className="text-slate-600 mt-1">{invoice.client_phone}</p>}
                {invoice.customer_gstin && <p className="text-slate-600 mt-1">GSTIN: {invoice.customer_gstin}</p>}
              </div>
              <div className="md:text-right">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Invoice Details</h3>
                <p className="text-slate-600 mb-1"><span className="font-medium">Date:</span> {new Date(invoice.created_at).toLocaleDateString()}</p>
                {invoice.due_date && <p className="text-slate-600 mb-1"><span className="font-medium">Due Date:</span> {new Date(invoice.due_date).toLocaleDateString()}</p>}
                {invoice.place_of_supply && <p className="text-slate-600 mb-1"><span className="font-medium">Place of Supply:</span> {invoice.place_of_supply}</p>}
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    <th className="pb-3 text-sm font-bold text-slate-600 uppercase">Item Description</th>
                    <th className="pb-3 text-sm font-bold text-slate-600 uppercase text-center">HSN/SAC</th>
                    <th className="pb-3 text-sm font-bold text-slate-600 uppercase text-center">Qty</th>
                    <th className="pb-3 text-sm font-bold text-slate-600 uppercase text-right">Rate</th>
                    <th className="pb-3 text-sm font-bold text-slate-600 uppercase text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-4 font-medium text-slate-800">{item.service_name}</td>
                      <td className="py-4 text-slate-600 text-center">{item.hsn_sac || '-'}</td>
                      <td className="py-4 text-slate-600 text-center">{item.quantity}</td>
                      <td className="py-4 text-slate-600 text-right">₹{Number(item.unit_price).toLocaleString('en-IN')}</td>
                      <td className="py-4 font-bold text-slate-800 text-right">₹{Number(item.line_total).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between">
              <div className="mb-6 md:mb-0 max-w-sm">
                {invoice.notes && (
                  <>
                    <h4 className="font-bold text-slate-800 mb-2">Notes</h4>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{invoice.notes}</p>
                  </>
                )}
              </div>
              <div className="w-full md:w-80 space-y-3">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{Number(invoice.subtotal).toLocaleString('en-IN')}</span>
                </div>
                {Number(invoice.cgst_amount) > 0 && (
                  <div className="flex justify-between text-slate-600 text-sm">
                    <span>CGST</span>
                    <span>₹{Number(invoice.cgst_amount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {Number(invoice.sgst_amount) > 0 && (
                  <div className="flex justify-between text-slate-600 text-sm">
                    <span>SGST</span>
                    <span>₹{Number(invoice.sgst_amount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {Number(invoice.igst_amount) > 0 && (
                  <div className="flex justify-between text-slate-600 text-sm">
                    <span>IGST</span>
                    <span>₹{Number(invoice.igst_amount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-800 font-bold border-t border-slate-200 pt-3">
                  <span>Grand Total</span>
                  <span>₹{Number(invoice.grand_total).toLocaleString('en-IN')}</span>
                </div>
                {!isPaid && (
                  <div className="flex justify-between text-red-600 font-black text-xl border-t border-slate-200 pt-3">
                    <span>Balance Due</span>
                    <span>₹{Number(invoice.balance_due).toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-8 border-t border-slate-100 flex flex-col sm:flex-row justify-end items-center gap-4">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
            {!isPaid && (
              <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handlePay} disabled={paying}>
                <CreditCard className="w-4 h-4 mr-2" /> Pay ₹{Number(invoice.balance_due).toLocaleString('en-IN')} Now
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
