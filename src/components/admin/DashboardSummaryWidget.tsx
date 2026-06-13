import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Minus, RefreshCw,
  FileText, Briefcase, Clock, CheckCircle2, Mail, Users,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";

// ── Types ────────────────────────────────────────────────────────────────────
interface DeltaInfo  { value: number; direction: "up" | "down" | "flat"; }
interface TypeStat   { current: number; prev?: number; delta: DeltaInfo; }
interface SparkPoint { date: string; count: number; }
interface TrendPoint { month: string; quotes: number; inquiries: number; total: number; }

interface DashStats {
  all_time: number;
  this_month: number; last_month: number;
  month_delta: DeltaInfo;
  quotes: TypeStat; inquiries: TypeStat;
  pending: TypeStat; completed: TypeStat;
  this_week: TypeStat;
  unread_msgs: number;
  sparkline: SparkPoint[];
  monthly_trend: TrendPoint[];
}

// ── Sparkline (canvas) ───────────────────────────────────────────────────────
function Sparkline({ data, color = "#22c55e" }: { data: SparkPoint[]; color?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !data.length) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width, H = canvas.height;
    const vals = data.map(d => d.count);
    const max  = Math.max(...vals, 1);
    ctx.clearRect(0, 0, W, H);
    const step = W / (vals.length - 1 || 1);
    const pts  = vals.map((v, i) => ({ x: i * step, y: H - (v / max) * (H - 6) - 3 }));
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, color + "55");
    grad.addColorStop(1, color + "00");
    ctx.beginPath();
    ctx.moveTo(pts[0].x, H);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();
  }, [data, color]);
  return <canvas ref={ref} width={160} height={44} className="w-full h-full" />;
}

// ── Delta badge ──────────────────────────────────────────────────────────────
function Delta({ delta, compact }: { delta: DeltaInfo; compact?: boolean }) {
  const up   = delta.direction === "up";
  const flat = delta.direction === "flat";
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
  const cls  = flat ? "text-muted-foreground bg-muted" : up ? "text-emerald-600 bg-emerald-50" : "text-red-500 bg-red-50";
  const txt  = flat ? "—" : `${up ? "+" : "-"}${delta.value}%`;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-bold ${cls}`}>
      <Icon className="w-3 h-3" />
      {txt}
    </span>
  );
}

// ── Donut label ──────────────────────────────────────────────────────────────
const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.08) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const DONUT_COLORS = ["#0369a1", "#d97706"];
const BAR_COLORS   = { quotes: "#0ea5e9", inquiries: "#f59e0b" };

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-xl p-3 text-xs">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
          <span className="font-bold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function DashboardSummaryWidget() {
  const [stats,   setStats]   = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/dashboard-stats.php", { credentials: "include" });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 animate-pulse">
      {[1,2,3].map(i => <div key={i} className="h-48 rounded-2xl bg-muted/60" />)}
    </div>
  );
  if (!stats) return null;

  const MONTH = new Date().toLocaleString("en-IN", { month: "long" });

  // Stat card definitions
  const statCards = [
    {
      label: "Total Leads",
      sub: "All time",
      value: stats.all_time,
      delta: stats.month_delta,
      icon: Users,
      color: "#0ea5e9",
      sparkColor: "#0ea5e9",
    },
    {
      label: "This Month",
      sub: MONTH,
      value: stats.this_month,
      delta: stats.month_delta,
      icon: FileText,
      color: "#8b5cf6",
      sparkColor: "#8b5cf6",
    },
    {
      label: "Pending Review",
      sub: "Awaiting action",
      value: stats.pending.current,
      delta: { value: stats.pending.current, direction: stats.pending.current > 0 ? "flat" as const : "flat" as const },
      icon: Clock,
      color: "#f59e0b",
      sparkColor: "#f59e0b",
    },
    {
      label: "Unread Messages",
      sub: "Contact inbox",
      value: stats.unread_msgs,
      delta: { value: stats.unread_msgs, direction: "flat" as const },
      icon: Mail,
      color: "#ef4444",
      sparkColor: "#ef4444",
    },
  ];

  // Donut data
  const donutData = [
    { name: "Quotes",   value: stats.quotes.current   || 0 },
    { name: "Inquiries",value: stats.inquiries.current || 0 },
  ];
  const donutTotal = donutData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-4 mb-6">

      {/* ── Row 1: Stat cards + Donut + Bar ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* LEFT: 4 stat cards stacked 2×2 (takes 3/12) */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
          {statCards.map(({ label, sub, value, delta, icon: Icon, color, sparkColor }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-card rounded-2xl border border-border shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow overflow-hidden relative"
            >
              {/* Background glow */}
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20 -mr-6 -mt-6"
                style={{ background: color }} />

              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + "22" }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <Delta delta={delta} compact />
              </div>

              <div className="relative z-10">
                <p className="text-2xl font-bold font-heading text-foreground">{value}</p>
                <p className="text-xs font-semibold text-muted-foreground mt-0.5">{label}</p>
                <p className="text-[10px] text-muted-foreground/60">{sub}</p>
              </div>

              {/* Mini sparkline */}
              <div className="h-10 mt-2 relative z-10 opacity-80">
                <Sparkline data={stats.sparkline} color={sparkColor} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* MIDDLE: Donut — Lead Type Breakdown (takes 3/12) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-3 bg-card rounded-2xl border border-border shadow-sm p-5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-sm font-bold text-foreground">Lead Breakdown</p>
              <p className="text-xs text-muted-foreground">{MONTH}</p>
            </div>
            <button onClick={load} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center relative">
            {donutTotal === 0 ? (
              <div className="text-center text-muted-foreground text-sm">No data yet</div>
            ) : (
              <div className="w-full">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                      label={renderCustomLabel}
                    >
                      {donutData.map((_, idx) => (
                        <Cell key={idx} fill={DONUT_COLORS[idx]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [val, ""]}
                      contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Centre label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center mt-2">
                    <p className="text-2xl font-black font-heading text-foreground">{donutTotal}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold">Total</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex gap-4 justify-center mt-2">
            {donutData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: DONUT_COLORS[i] }} />
                <span className="text-xs text-muted-foreground">{d.name}</span>
                <span className="text-xs font-bold text-foreground">{d.value}</span>
              </div>
            ))}
          </div>

          {/* Delta chips row */}
          <div className="flex justify-between mt-3 pt-3 border-t border-border">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Quotes</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm font-bold text-foreground">{stats.quotes.current}</span>
                <Delta delta={stats.quotes.delta} compact />
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Inquiries</p>
              <div className="flex items-center gap-1.5 mt-0.5 justify-end">
                <span className="text-sm font-bold text-foreground">{stats.inquiries.current}</span>
                <Delta delta={stats.inquiries.delta} compact />
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT: Bar chart — 6-month trend (takes 6/12) */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-6 bg-card rounded-2xl border border-border shadow-sm p-5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-foreground">Monthly Lead Trend</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-black font-heading text-foreground">{stats.this_month}</span>
                <Delta delta={stats.month_delta} />
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: BAR_COLORS.quotes }} />
                Quotes
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: BAR_COLORS.inquiries }} />
                Inquiries
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-[160px]">
            {stats.monthly_trend?.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={stats.monthly_trend} barGap={3} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => v.split(" ")[0]}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    width={24}
                  />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "var(--muted)", radius: 6, opacity: 0.5 }} />
                  <Bar dataKey="quotes"    fill={BAR_COLORS.quotes}    radius={[4,4,0,0]} name="Quotes" />
                  <Bar dataKey="inquiries" fill={BAR_COLORS.inquiries} radius={[4,4,0,0]} name="Inquiries" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No trend data yet
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Row 2: Quick Stats Strip ───────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Completed",   value: stats.completed.current, delta: stats.completed.delta, icon: CheckCircle2, color: "text-emerald-600" },
          { label: "This Week",   value: stats.this_week.current, delta: stats.this_week.delta,  icon: TrendingUp, color: "text-blue-600" },
          { label: "Last Month",  value: stats.last_month, delta: { value: 0, direction: "flat" as const }, icon: Briefcase, color: "text-purple-600" },
          { label: "All Time",    value: stats.all_time, delta: stats.month_delta, icon: Users, color: "text-primary" },
        ].map(({ label, value, delta, icon: Icon, color }) => (
          <div key={label} className="bg-card rounded-xl border border-border shadow-sm px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold font-heading text-foreground leading-none">{value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{label}</p>
            </div>
            <div className="ml-auto flex-shrink-0">
              <Delta delta={delta} compact />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
