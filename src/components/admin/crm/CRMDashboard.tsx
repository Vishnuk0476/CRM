import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Users, IndianRupee, Receipt, CalendarClock,
  AlertTriangle, ArrowRight, RefreshCw, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardData {
  month: string;
  leads: any;
  conversion_rate: number;
  revenue: any;
  total_expenses: number;
  net_profit: number;
  team_performance: unknown[];
  city_wise: unknown[];
  today_followups: number;
  overdue_payments: number;
  monthly_trend: unknown[];
}

interface CRMDashboardProps {
  onNavigate: (section: string) => void;
}

const CRMDashboard = ({ onNavigate }: CRMDashboardProps) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    // If it's the 1st, 2nd, or 3rd day of the month, default to the previous month
    // to prevent the "where is my data?" shock when a new month just starts.
    if (today.getDate() <= 3) {
      today.setMonth(today.getMonth() - 1);
    }
    return today.toISOString().slice(0, 7); // YYYY-MM
  });

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/crm/dashboard-stats.php?month=${selectedMonth}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err: unknown) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, [selectedMonth]);

  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  const kpiCards = data ? [
    {
      label: "Total Leads",
      value: data.leads?.total_leads ?? 0,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      shadow: "shadow-blue-500/20",
      sub: `${data.leads?.enquiry ?? 0} new enquiries`,
      onClick: () => onNavigate("leads"),
    },
    {
      label: "Conversion Rate",
      value: `${data.conversion_rate}%`,
      icon: TrendingUp,
      color: "from-emerald-500 to-green-500",
      shadow: "shadow-emerald-500/20",
      sub: `${(data.leads?.confirmed ?? 0) + (data.leads?.completed ?? 0)} converted`,
      onClick: () => onNavigate("pipeline"),
    },
    {
      label: "Revenue Collected",
      value: formatCurrency(data.revenue?.total_collected ?? 0),
      icon: IndianRupee,
      color: "from-violet-500 to-purple-500",
      shadow: "shadow-violet-500/20",
      sub: `${formatCurrency(data.revenue?.total_pending ?? 0)} pending`,
      onClick: () => onNavigate("payments"),
    },
    {
      label: "Net Profit",
      value: formatCurrency(data.net_profit ?? 0),
      icon: data.net_profit >= 0 ? TrendingUp : TrendingDown,
      color: data.net_profit >= 0 ? "from-amber-500 to-orange-500" : "from-red-500 to-rose-500",
      shadow: data.net_profit >= 0 ? "shadow-amber-500/20" : "shadow-red-500/20",
      sub: `Expenses: ${formatCurrency(data.total_expenses ?? 0)}`,
      onClick: () => onNavigate("expenses"),
    },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with month selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Business overview at a glance</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
          <Button variant="outline" size="sm" onClick={fetchDashboard}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Alert banners */}
      {data && (data.today_followups > 0 || data.overdue_payments > 0) && (
        <div className="flex flex-wrap gap-3">
          {data.today_followups > 0 && (
            <button
              onClick={() => onNavigate("follow-ups")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 text-sm font-medium hover:bg-amber-500/15 transition-colors cursor-pointer"
            >
              <CalendarClock className="w-4 h-4" />
              {data.today_followups} follow-up{data.today_followups > 1 ? 's' : ''} due today
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          )}
          {data.overdue_payments > 0 && (
            <button
              onClick={() => onNavigate("invoices")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-sm font-medium hover:bg-red-500/15 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              {data.overdue_payments} overdue payment{data.overdue_payments > 1 ? 's' : ''}
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={card.onClick}
              className={`bg-card/50 backdrop-blur-xl rounded-2xl border border-border shadow-sm p-5 cursor-pointer
                hover:shadow-xl hover:-translate-y-1 hover:border-violet-500/30 transition-all duration-300 group relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} ${card.shadow}
                  flex items-center justify-center shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
              <p className="text-[11px] text-muted-foreground/70 mt-1">{card.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Pipeline Funnel */}
      {data?.leads && (
        <div className="bg-card/50 backdrop-blur-xl rounded-2xl border border-border shadow-sm p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Lead Pipeline</h3>
          <div className="flex items-end gap-2">
            {[
              { key: "enquiry", label: "Enquiry", color: "bg-blue-500" },
              { key: "quoted", label: "Quoted", color: "bg-purple-500" },
              { key: "confirmed", label: "Confirmed", color: "bg-green-500" },
              { key: "in_transit", label: "In Transit", color: "bg-orange-500" },
              { key: "completed", label: "Done", color: "bg-teal-500" },
            ].map((stage) => {
              const count = parseInt(data.leads[stage.key] ?? 0);
              const total = parseInt(data.leads.total_leads ?? 1);
              const pct = total > 0 ? Math.max((count / total) * 100, 4) : 4;
              return (
                <div key={stage.key} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-foreground">{count}</span>
                  <div
                    className={`w-full rounded-t-lg ${stage.color} transition-all duration-500`}
                    style={{ height: `${pct}px`, minHeight: "4px", maxHeight: "80px" }}
                  />
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">{stage.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom row: Team Performance + City-wise */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Team Performance */}
        {data?.team_performance && data.team_performance.length > 0 && (
          <div className="bg-card/50 backdrop-blur-xl rounded-2xl border border-border shadow-sm p-5">
            <h3 className="text-sm font-bold text-foreground mb-3">Team Performance</h3>
            <div className="space-y-3">
              {data.team_performance.slice(0, 5).map((member: any) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center text-xs font-bold text-violet-700">
                    {(member.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{member.name || "Unknown"}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{member.total_leads} leads</span>
                      <span>{member.converted} converted</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {member.total_leads > 0 ? Math.round((member.converted / member.total_leads) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* City-wise Distribution */}
        {data?.city_wise && data.city_wise.length > 0 && (
          <div className="bg-card/50 backdrop-blur-xl rounded-2xl border border-border shadow-sm p-5">
            <h3 className="text-sm font-bold text-foreground mb-3">Top Cities</h3>
            <div className="space-y-2.5">
              {data.city_wise.slice(0, 6).map((city: any, i: number) => {
                const maxCount = data.city_wise[0]?.count ?? 1;
                const pct = Math.round((city.count / maxCount) * 100);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm text-foreground font-medium w-28 truncate">{city.city}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-foreground w-6 text-right">{city.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Revenue Summary Card */}
      {data?.revenue && (
        <div className="bg-card/50 backdrop-blur-xl rounded-2xl border border-border shadow-sm p-5">
          <h3 className="text-sm font-bold text-foreground mb-3">Revenue Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Invoiced", value: formatCurrency(data.revenue.total_invoiced ?? 0), color: "text-blue-600" },
              { label: "Collected", value: formatCurrency(data.revenue.total_collected ?? 0), color: "text-green-600" },
              { label: "Pending", value: formatCurrency(data.revenue.total_pending ?? 0), color: "text-amber-600" },
              { label: "GST Collected", value: formatCurrency(data.revenue.total_gst ?? 0), color: "text-purple-600" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMDashboard;
