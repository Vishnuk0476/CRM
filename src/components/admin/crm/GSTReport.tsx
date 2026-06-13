import { useState, useEffect } from "react";
import { BarChart3, Download, RefreshCw, Loader2, Calendar, FileText, IndianRupee, PieChart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const GSTReport = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/crm/invoices.php?month=${month}&limit=200`, { credentials: "include" });
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [month]);

  const exportCSV = () => {
    if (!data?.invoices) return;
    const headers = ["Invoice #", "Customer", "Base Amount", "GST Rate", "GST Amount", "Total", "Payment Status", "Date"];
    const rows = data.invoices.map((inv: any) => [
      inv.invoice_number, inv.customer_name, inv.amount, `${inv.gst_rate}%`, inv.gst_amount, inv.total_amount, inv.payment_status, inv.created_at_formatted,
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gst-report-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fmt = (v: number) => `₹${(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 font-outfit tracking-tight flex items-center gap-2">
            <PieChart className="w-8 h-8 text-indigo-600" /> GST & Tax Report
          </h2>
          <p className="text-gray-500 font-medium mt-1">Monthly financial summary and tax liability overview.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/60 backdrop-blur-xl p-2 rounded-2xl border border-gray-100 shadow-sm">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <input 
              type="month" 
              value={month} 
              onChange={e => setMonth(e.target.value)}
              className="pl-9 pr-4 py-2 h-11 text-sm font-bold text-gray-700 rounded-xl border-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
            />
          </div>
          <Button onClick={exportCSV} className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 font-bold px-5">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-indigo-600">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="font-medium">Calculating tax data...</p>
        </div>
      ) : data?.summary ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* GST Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Invoices</p>
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600"><FileText className="w-4 h-4" /></div>
              </div>
              <p className="text-2xl font-bold text-gray-900 font-outfit">{data.summary.invoice_count || 0}</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-blue-100 shadow-sm p-5 hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-bold text-blue-600/80 uppercase tracking-wider">Base Amount</p>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><BarChart3 className="w-4 h-4" /></div>
                </div>
                <p className="text-2xl font-bold text-blue-700 font-outfit">{fmt(data.summary.total_invoiced - data.summary.total_gst)}</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-purple-100 shadow-sm p-5 hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-bold text-purple-600/80 uppercase tracking-wider">Total GST</p>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600"><PieChart className="w-4 h-4" /></div>
                </div>
                <p className="text-2xl font-bold text-purple-700 font-outfit">{fmt(data.summary.total_gst)}</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-emerald-100 shadow-sm p-5 hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-bold text-emerald-600/80 uppercase tracking-wider">Collected</p>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600"><TrendingUp className="w-4 h-4" /></div>
                </div>
                <p className="text-2xl font-bold text-emerald-700 font-outfit">{fmt(data.summary.total_collected)}</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-amber-100 shadow-sm p-5 hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-bold text-amber-600/80 uppercase tracking-wider">Pending</p>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600"><IndianRupee className="w-4 h-4" /></div>
                </div>
                <p className="text-2xl font-bold text-amber-700 font-outfit">{fmt(data.summary.total_pending)}</p>
              </div>
            </div>
          </div>

          {/* Invoice table for the month */}
          {data.invoices && data.invoices.length > 0 && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-6">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 font-outfit text-lg">Invoices Breakdown</h3>
                <span className="text-sm font-medium text-gray-500">{new Date(month + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white border-b border-gray-100 text-left">
                      <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Invoice #</th>
                      <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Base Amount</th>
                      <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Tax (GST)</th>
                      <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total Amount</th>
                      <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.invoices.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4 font-mono text-xs font-bold text-indigo-600 whitespace-nowrap">{inv.invoice_number}</td>
                        <td className="px-5 py-4 font-medium text-gray-900">{inv.customer_name}</td>
                        <td className="px-5 py-4 text-right text-gray-600">{fmt(inv.amount)}</td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-gray-900 font-medium">{fmt(inv.gst_amount)}</span>
                          <span className="text-xs text-gray-400 ml-1">({inv.gst_rate}%)</span>
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-gray-900">{fmt(inv.total_amount)}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                            ${inv.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              inv.payment_status === 'partial' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                            {inv.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {/* Totals row */}
                    <tr className="bg-gray-50/80 border-t-2 border-gray-200">
                      <td className="px-5 py-4 font-bold text-gray-900 uppercase text-xs tracking-wider" colSpan={2}>Monthly Totals</td>
                      <td className="px-5 py-4 text-right font-bold text-gray-900">{fmt(data.summary.total_invoiced - data.summary.total_gst)}</td>
                      <td className="px-5 py-4 text-right font-bold text-purple-700">{fmt(data.summary.total_gst)}</td>
                      <td className="px-5 py-4 text-right font-bold text-gray-900 text-base">{fmt(data.summary.total_invoiced)}</td>
                      <td className="px-5 py-4"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-white/40 backdrop-blur-xl rounded-3xl border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
            <PieChart className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-lg font-medium text-gray-500">No data for this month</p>
          <p className="text-sm">Try selecting a different month to view tax reports.</p>
        </div>
      )}
    </div>
  );
};

export default GSTReport;
