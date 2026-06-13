import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";
import {
  Globe, TrendingUp, Users, MousePointer, Smartphone, Monitor,
  Tablet, MapPin, Eye, MessageSquare, Phone, FileText, X,
  RefreshCw, Loader2, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
// supabase removed

// ─── Types ───────────────────────────────────────────────────────────────────
interface VisitorEvent {
  id: string;
  page: string;
  event_type: string;
  city: string | null;
  region: string | null;
  country: string | null;
  country_code: string | null;
  device_type: string | null;
  referrer: string | null;
  created_at: string;
}

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  change?: number;
}

const EVENT_COLORS: Record<string, string> = {
  pageview: "#6366f1",
  quote_click: "#f97316",
  track_search: "#22c55e",
  whatsapp_click: "#16a34a",
  call_click: "#eab308",
  form_submit: "#3b82f6",
  brochure_download: "#a855f7",
  pay_click: "#ef4444",
};

const DEVICE_COLORS = ["#6366f1", "#f97316", "#22c55e"];

const CHART_COLORS = [
  "#6366f1", "#f97316", "#22c55e", "#3b82f6", "#a855f7",
  "#ec4899", "#14b8a6", "#eab308", "#ef4444", "#06b6d4",
];

// ─── Component ───────────────────────────────────────────────────────────────
interface EventTrackingDashboardProps {
  onClose: () => void;
}

export default function EventTrackingDashboard({ onClose }: EventTrackingDashboardProps) {
  const [events, setEvents] = useState<VisitorEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<7 | 30 | 90>(30);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const since = new Date(Date.now() - period * 86400000).toISOString();
      const token = localStorage.getItem('token') || '';
      
      const res = await fetch('/api/visitors/log.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          limit: 5000,
          since: since
        })
      });
      
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch visitor logs');
      
      // Map PHP fields back to expected format
      const mappedEvents = (json.data || []).map((e: unknown) => ({
        id: e.id,
        page: e.page_visited,
        event_type: e.page_visited?.startsWith('Action: ') 
          ? e.page_visited.split(' ')[1] 
          : 'pageview',
        city: e.ip_city,
        region: e.ip_region,
        country: e.ip_country,
        country_code: null,
        device_type: e.device_type,
        referrer: null,
        created_at: e.visited_at
      }));
      
      setEvents(mappedEvents);
    } catch (err: unknown) {
      console.error("[EventTracking] Fetch failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [period]);

  // ── Computed stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const pageviews = events.filter(e => e.event_type === "pageview");
    const actions = events.filter(e => e.event_type !== "pageview");
    const uniqueCities = new Set(events.map(e => e.city).filter(Boolean)).size;
    const uniquePages = new Set(pageviews.map(e => e.page)).size;

    // Previous period for comparison
    const half = period / 2;
    const midpoint = new Date(Date.now() - half * 86400000).toISOString();
    const recent = events.filter(e => e.created_at >= midpoint);
    const older = events.filter(e => e.created_at < midpoint);
    const changePercent = older.length > 0
      ? Math.round(((recent.length - older.length) / older.length) * 100)
      : 0;

    return { pageviews: pageviews.length, actions: actions.length, uniqueCities, uniquePages, changePercent };
  }, [events, period]);

  // ── Daily trends ────────────────────────────────────────────────────────────
  const dailyTrends = useMemo(() => {
    const days: Record<string, { pageviews: number; actions: number }> = {};
    for (let i = Math.min(period, 30) - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
      days[d] = { pageviews: 0, actions: 0 };
    }
    events.forEach(e => {
      const d = e.created_at.split("T")[0];
      if (days[d] !== undefined) {
        if (e.event_type === "pageview") days[d].pageviews++;
        else days[d].actions++;
      }
    });
    return Object.entries(days).map(([date, v]) => ({
      date: new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      pageviews: v.pageviews,
      actions: v.actions,
    }));
  }, [events, period]);

  // ── Top pages ───────────────────────────────────────────────────────────────
  const topPages = useMemo(() => {
    const counts: Record<string, number> = {};
    events.filter(e => e.event_type === "pageview").forEach(e => {
      const pg = e.page || "/";
      counts[pg] = (counts[pg] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([page, views]) => ({ page: page.replace(/^https?:\/\/[^/]+/, "") || "/", views }));
  }, [events]);

  // ── Event type breakdown ────────────────────────────────────────────────────
  const eventBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach(e => { counts[e.event_type] = (counts[e.event_type] || 0) + 1; });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name: name.replace(/_/g, " "), rawName: name, value }));
  }, [events]);

  // ── City breakdown ──────────────────────────────────────────────────────────
  const cityBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach(e => {
      if (e.city) counts[e.city] = (counts[e.city] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([city, count]) => ({ city, count }));
  }, [events]);

  // ── Device breakdown ────────────────────────────────────────────────────────
  const deviceBreakdown = useMemo(() => {
    const counts: Record<string, number> = { mobile: 0, tablet: 0, desktop: 0 };
    events.forEach(e => { if (e.device_type) counts[e.device_type] = (counts[e.device_type] || 0) + 1; });
    return [
      { name: "Mobile", value: counts.mobile, icon: <Smartphone className="w-4 h-4" /> },
      { name: "Desktop", value: counts.desktop, icon: <Monitor className="w-4 h-4" /> },
      { name: "Tablet", value: counts.tablet, icon: <Tablet className="w-4 h-4" /> },
    ].filter(d => d.value > 0);
  }, [events]);

  const statCards: StatCard[] = [
    { label: "Page Views", value: stats.pageviews.toLocaleString(), icon: <Eye className="w-5 h-5" />, color: "text-indigo-500", change: stats.changePercent },
    { label: "User Actions", value: stats.actions.toLocaleString(), icon: <MousePointer className="w-5 h-5" />, color: "text-orange-500" },
    { label: "Cities Reached", value: stats.uniqueCities, icon: <MapPin className="w-5 h-5" />, color: "text-emerald-500" },
    { label: "Pages Visited", value: stats.uniquePages, icon: <Globe className="w-5 h-5" />, color: "text-blue-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Event Tracking Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Real visitor behaviour & geo analytics</p>
        </div>
        <div className="flex items-center gap-2">
          {([7, 30, 90] as const).map(p => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? "default" : "outline"}
              onClick={() => setPeriod(p)}
              className="h-8 text-xs"
            >
              {p}d
            </Button>
          ))}
          <Button size="sm" variant="outline" onClick={fetchEvents} className="h-8 gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="outline" onClick={onClose} className="h-8 gap-1.5">
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className={`flex items-center gap-2 mb-2 ${card.color}`}>
                  {card.icon}
                  <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                {card.change !== undefined && (
                  <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${card.change >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {card.change >= 0
                      ? <ArrowUpRight className="w-3 h-3" />
                      : <ArrowDownRight className="w-3 h-3" />
                    }
                    {Math.abs(card.change)}% vs prev period
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Daily Trend */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-5"
          >
            <h3 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Visitors & Actions (Last {Math.min(period, 30)} days)
            </h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrends}>
                  <defs>
                    <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Area type="monotone" dataKey="pageviews" name="Page Views" stroke="#6366f1" fill="url(#pvGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="actions" name="User Actions" stroke="#f97316" fill="url(#actGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Row: Event breakdown + Device breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Event type pie */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <h3 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-orange-500" />
                Action Types
              </h3>
              {eventBreakdown.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No action events yet. Events are tracked when users click WhatsApp, submit quotes, etc.</p>
              ) : (
                <div className="space-y-2">
                  {eventBreakdown.map((item, i) => (
                    <div key={item.rawName} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-xs text-muted-foreground capitalize flex-1">{item.name}</span>
                      <div className="flex-1 bg-muted rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${Math.min(100, (item.value / (eventBreakdown[0]?.value || 1)) * 100)}%`,
                            backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-foreground w-8 text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Device breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <h3 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-500" />
                Device Types
              </h3>
              {deviceBreakdown.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No device data yet</p>
              ) : (
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={deviceBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                        {deviceBreakdown.map((_, i) => (
                          <Cell key={i} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                      <Legend wrapperStyle={{ fontSize: "11px" }} formatter={(v) => <span style={{ color: "hsl(var(--foreground))" }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>
          </div>

          {/* Row: Top pages + City breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top pages */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <h3 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                Top Pages
              </h3>
              <div className="space-y-2.5">
                {topPages.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">No page data yet</p>
                ) : topPages.map((item, i) => (
                  <div key={item.page} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4 text-right">{i + 1}</span>
                    <span className="text-xs text-foreground flex-1 truncate font-mono">{item.page}</span>
                    <div className="flex-1 bg-muted rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-indigo-500"
                        style={{ width: `${Math.min(100, (item.views / (topPages[0]?.views || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-foreground w-8 text-right">{item.views}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* City breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <h3 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                Top Cities
              </h3>
              <div className="space-y-2.5">
                {cityBreakdown.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">No geo data yet. Configure VITE_IPSTACK_KEY or wait for ipapi.co data.</p>
                ) : cityBreakdown.map((item, i) => (
                  <div key={item.city} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4 text-right">{i + 1}</span>
                    <span className="text-xs text-foreground flex-1 truncate">{item.city}</span>
                    <div className="flex-1 bg-muted rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-emerald-500"
                        style={{ width: `${Math.min(100, (item.count / (cityBreakdown[0]?.count || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-foreground w-8 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Conversion Funnel */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card border border-border rounded-xl p-5"
          >
            <h3 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              Conversion Funnel
            </h3>
            <div className="flex items-end gap-2 h-[160px]">
              {[
                { label: "Visitors", value: stats.pageviews, color: "#6366f1" },
                { label: "Quote Clicks", value: events.filter(e => e.event_type === "quote_click").length, color: "#f97316" },
                { label: "Form Submits", value: events.filter(e => e.event_type === "form_submit").length, color: "#22c55e" },
                { label: "WhatsApp", value: events.filter(e => e.event_type === "whatsapp_click").length, color: "#16a34a" },
                { label: "Calls", value: events.filter(e => e.event_type === "call_click").length, color: "#eab308" },
                { label: "Payments", value: events.filter(e => e.event_type === "pay_click").length, color: "#ef4444" },
              ].map(step => {
                const maxVal = stats.pageviews || 1;
                const heightPct = Math.max(5, (step.value / maxVal) * 100);
                return (
                  <div key={step.label} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-foreground">{step.value}</span>
                    <div className="w-full rounded-t-lg transition-all" style={{ height: `${heightPct}%`, backgroundColor: step.color, opacity: 0.85 }} />
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
