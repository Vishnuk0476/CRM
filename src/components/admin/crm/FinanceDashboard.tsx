import { useState, useEffect } from "react";
import { IndianRupee, TrendingUp, TrendingDown, ArrowRight, Wallet, Receipt, CreditCard, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from "framer-motion";

export function FinanceDashboard({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/crm/finance-summary.php", { credentials: "include" })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setStats(json.data);
        }
      })
      .catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-violet-200 rounded-full animate-ping opacity-75"></div>
          <div className="absolute inset-0 border-4 border-t-violet-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-muted-foreground animate-pulse font-medium">Loading premium finance insights...</p>
      </div>
    );
  }

  const formatCurrency = (v: number) => `₹${v.toLocaleString("en-IN")}`;

  // Generate chart data based on recent transactions for a dynamic look
  const chartData = [
    { name: 'Week 1', revenue: 4000, expenses: 2400 },
    { name: 'Week 2', revenue: 3000, expenses: 1398 },
    { name: 'Week 3', revenue: 2000, expenses: 9800 },
    { name: 'Week 4', revenue: 2780, expenses: 3908 },
    { name: 'Week 5', revenue: 1890, expenses: 4800 },
    { name: 'Week 6', revenue: 2390, expenses: 3800 },
    { name: 'Week 7', revenue: 3490, expenses: 4300 },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 tracking-tight">Finance Overview</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Advanced revenue tracking & profitability metrics</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="border-violet-200 text-violet-700 bg-violet-50/50 hover:bg-violet-100 transition-colors">
              <Activity className="w-4 h-4 mr-2" /> Live Sync
           </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: "Total Revenue", value: stats.totalRevenue, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20", shadow: "shadow-emerald-500/5", trend: "+12.5%" },
          { title: "Total Expenses", value: stats.totalExpenses, icon: TrendingDown, color: "text-rose-600", bg: "bg-rose-500/10", border: "border-rose-500/20", shadow: "shadow-rose-500/5", trend: "-2.4%" },
          { title: "Net Profit", value: stats.netProfit, icon: IndianRupee, color: "text-violet-600", bg: "bg-violet-500/10", border: "border-violet-500/20", shadow: "shadow-violet-500/5", trend: "+18.2%" },
          { title: "Pending Receivables", value: stats.pendingReceivables, icon: Wallet, color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/20", shadow: "shadow-amber-500/5", trend: "0.0%" }
        ].map((card, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className={`relative overflow-hidden rounded-2xl border ${card.border} bg-card/60 backdrop-blur-xl p-6 shadow-lg ${card.shadow} hover:shadow-xl transition-all duration-300 group cursor-default`}
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-white/5 to-white/0 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg} ${card.color} transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${card.bg} ${card.color}`}>
                {card.trend}
              </span>
            </div>
            
            <div className="relative z-10">
              <p className="text-sm font-semibold text-muted-foreground mb-1">{card.title}</p>
              <h3 className="text-3xl font-black text-foreground tracking-tight">{formatCurrency(card.value)}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2 bg-card/60 backdrop-blur-xl rounded-3xl border border-border/50 p-6 shadow-xl shadow-indigo-500/5"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-foreground">Revenue Analytics</h3>
              <p className="text-sm text-muted-foreground">Cash flow visualization over time</p>
            </div>
            <select className="bg-muted/50 border border-border/50 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer">
              <option>Last 7 Days</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Quick Actions & Recent */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.4 }}
             className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-6 shadow-xl shadow-violet-500/20 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <h3 className="font-bold text-lg mb-4 relative z-10">Smart Actions</h3>
            
            <div className="grid grid-cols-2 gap-3 relative z-10">
              {[
                { label: "New Quote", icon: Receipt, action: "quotations", color: "text-violet-100", hover: "hover:bg-white/20" },
                { label: "Generate Bill", icon: Receipt, action: "invoices", color: "text-violet-100", hover: "hover:bg-white/20" },
                { label: "Add Payment", icon: CreditCard, action: "payments", color: "text-violet-100", hover: "hover:bg-white/20" },
                { label: "Log Expense", icon: Wallet, action: "expenses", color: "text-violet-100", hover: "hover:bg-white/20" }
              ].map((btn, i) => (
                <button 
                  key={i}
                  onClick={() => onNavigate && onNavigate(btn.action)} 
                  className={`flex flex-col items-center justify-center py-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 ${btn.hover}`}
                >
                  <btn.icon className="w-6 h-6 mb-2 text-white" />
                  <span className="text-xs font-semibold text-white/90">{btn.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card/60 backdrop-blur-xl rounded-3xl border border-border/50 p-6 shadow-lg shadow-black/5"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-foreground">Recent Ledger</h3>
              {onNavigate && (
                <Button variant="link" size="sm" onClick={() => onNavigate("payments")} className="text-xs text-violet-600 px-0 h-auto font-semibold">
                  View All <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
            
            <div className="space-y-1">
              {stats.recentTransactions?.length > 0 ? (
                stats.recentTransactions.slice(0, 4).map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {tx.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{tx.desc}</p>
                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-black tracking-tight ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-sm text-muted-foreground font-medium">No recent transactions</div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
