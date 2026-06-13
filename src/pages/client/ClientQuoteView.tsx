import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { CheckCircle, Download, FileText, MapPin, Calendar, CreditCard, Clock } from "lucide-react";

export default function ClientQuoteView() {
  const { id } = useParams<{ id: string }>();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchQuote();
  }, [id]);

  const fetchQuote = async () => {
    try {
      const res = await fetch(`/api/client/quotation.php?id=${id}`);
      const data = await res.json();
      if (data.success) {
        setQuote(data.data.quotation);
      } else {
        toast({ title: "Error", description: data.message || "Quotation not found", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load quotation", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const res = await fetch(`/api/client/accept-quotation.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quotation_number: id }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Success", description: "Quotation accepted successfully!" });
        fetchQuote(); // refresh
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to accept quotation", variant: "destructive" });
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Helmet><title>Quote Not Found - Panya Global</title></Helmet>
        <FileText className="w-16 h-16 text-slate-300 mb-4" />
        <h1 className="text-2xl font-bold text-slate-800">Quotation Not Found</h1>
        <p className="text-slate-500 mt-2 mb-6">The quotation link appears to be invalid or expired.</p>
        <Link to="/"><Button>Return to Homepage</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <Helmet>
        <title>Quotation {quote.quotation_number} - Panya Global</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/">
              <img src="/assets/logo.webp" alt="Panya Global" className="h-10 mb-6 object-contain" onError={(e) => (e.currentTarget.src = "https://panyaglobal.in/assets/images/logo-white-BXZUiPLa.webp")} />
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Relocation Quote</h1>
            <p className="text-slate-500 mt-1">Ref: {quote.quotation_number}</p>
          </div>
          <div className="text-right">
            {quote.status === 'accepted' ? (
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 font-bold">
                <CheckCircle className="w-5 h-5 mr-2" /> Accepted
              </span>
            ) : (
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-amber-100 text-amber-700 font-bold">
                <Clock className="w-5 h-5 mr-2" /> Pending
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Client Details</h3>
                <p className="font-bold text-lg text-slate-800">{quote.client_name}</p>
                {quote.client_email && <p className="text-slate-600">{quote.client_email}</p>}
                {quote.client_phone && <p className="text-slate-600">{quote.client_phone}</p>}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Move Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5 mr-3 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-500">From</p>
                      <p className="font-medium text-slate-800">{quote.origin_city || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-indigo-400 mt-0.5 mr-3 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-500">To</p>
                      <p className="font-medium text-slate-800">{quote.destination_city || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-500">Move Date</p>
                      <p className="font-medium text-slate-800">{quote.move_date ? new Date(quote.move_date).toLocaleDateString() : 'TBD'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Service Breakdown</h3>
            
            <div className="space-y-4">
              {quote.line_items?.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="font-medium text-slate-800">{item.service_name}</p>
                    {item.description && <p className="text-sm text-slate-500">{item.description}</p>}
                  </div>
                  <p className="font-bold text-slate-700">₹{Number(item.line_total).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200">
              <div className="flex justify-between items-center text-sm text-slate-600 mb-2">
                <span>Subtotal</span>
                <span>₹{Number(quote.subtotal).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-slate-600 mb-2">
                <span>Taxes (GST)</span>
                <span>₹{Number(quote.total_tax).toLocaleString('en-IN')}</span>
              </div>
              {Number(quote.discount_amount) > 0 && (
                <div className="flex justify-between items-center text-sm text-green-600 mb-2">
                  <span>Discount</span>
                  <span>-₹{Number(quote.discount_amount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-200">
                <span className="text-xl font-bold text-slate-800">Grand Total</span>
                <span className="text-3xl font-black text-indigo-600">₹{Number(quote.grand_total).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {quote.status !== 'accepted' && (
            <div className="bg-slate-50 p-8 border-t border-slate-100 text-center">
              <p className="text-slate-600 mb-6">By accepting this quotation, you agree to our terms and conditions. Valid until <span className="font-semibold">{new Date(quote.valid_until).toLocaleDateString()}</span>.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Download className="w-4 h-4 mr-2" /> Download PDF
                </Button>
                <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleAccept} disabled={accepting}>
                  {accepting ? "Processing..." : "Confirm & Accept Quote"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
