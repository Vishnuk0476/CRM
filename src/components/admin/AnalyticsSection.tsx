import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { TrendingUp, PieChart as PieChartIcon, BarChart3, X, Loader2 } from "lucide-react";

interface QuoteSubmission {
  id: string;
  service_type: string;
  status: string;
  created_at: string;
}

interface AnalyticsSectionProps {
  onClose: () => void;
}

const serviceLabels: Record<string, string> = {
  "local": "Local",
  "domestic": "Domestic",
  "international": "International",
  "office": "Office",
  "vehicle": "Vehicle",
  "storage": "Storage",
  "packing": "Packing",
  "insurance": "Insurance",
};

const statusColors: Record<string, string> = {
  pending: "#eab308",
  reviewed: "#3b82f6",
  quoted: "#a855f7",
  confirmed: "#22c55e",
  in_progress: "#f97316",
  completed: "#16a34a",
  cancelled: "#ef4444",
};

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "#3b82f6",
  "#22c55e",
  "#f97316",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
];

export const AnalyticsSection = ({ onClose }: AnalyticsSectionProps) => {
  const [quotes, setQuotes] = useState<QuoteSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const res = await fetch("/api/quote-submissions/list.php", { credentials: "include" });
        const json = await res.json();
        if (json.success && json.data) {
          setQuotes(Array.isArray(json.data) ? json.data : (json.data.quotes || []));
        }
      } catch (err: unknown) {
        console.error("Error fetching quotes:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  // Calculate quotes over the last 30 days
  const dailyQuotes = useMemo(() => {
    const last30Days: Record<string, number> = {};
    const today = new Date();
    
    // Initialize last 30 days with 0
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last30Days[dateStr] = 0;
    }
    
    // Count quotes per day
    quotes.forEach((quote) => {
      const dateStr = quote.created_at.split('T')[0];
      if (last30Days[dateStr] !== undefined) {
        last30Days[dateStr]++;
      }
    });
    
    return Object.entries(last30Days).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      quotes: count,
    }));
  }, [quotes]);

  // Calculate status distribution
  const statusDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    
    quotes.forEach((quote) => {
      distribution[quote.status] = (distribution[quote.status] || 0) + 1;
    });
    
    return Object.entries(distribution).map(([status, count]) => ({
      name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: count,
      color: statusColors[status] || "#6b7280",
    }));
  }, [quotes]);

  // Calculate service type breakdown
  const serviceBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    
    quotes.forEach((quote) => {
      const label = serviceLabels[quote.service_type] || quote.service_type;
      breakdown[label] = (breakdown[label] || 0) + 1;
    });
    
    return Object.entries(breakdown)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [quotes]);

  // Calculate weekly comparison
  const weeklyComparison = useMemo(() => {
    const thisWeek = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    let thisWeekCount = 0;
    let lastWeekCount = 0;
    
    quotes.forEach((quote) => {
      const quoteDate = new Date(quote.created_at);
      if (quoteDate >= lastWeek && quoteDate <= thisWeek) {
        thisWeekCount++;
      } else if (quoteDate >= twoWeeksAgo && quoteDate < lastWeek) {
        lastWeekCount++;
      }
    });
    
    const percentChange = lastWeekCount > 0 
      ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100)
      : thisWeekCount > 0 ? 100 : 0;
    
    return { thisWeekCount, lastWeekCount, percentChange };
  }, [quotes]);

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-8 border-primary/10 flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 border-primary/10 shadow-card relative flex items-center justify-center min-h-[400px]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <p className="text-center text-muted-foreground font-medium">No data available for analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8 glass rounded-2xl shadow-card border-primary/10 p-6 sm:p-8 relative z-10 animate-fade-in-up">
      <button
        onClick={onClose}
        className="absolute right-6 top-6 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 hover:scale-105 transition-all"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner shadow-primary/20">
            <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <h2 className="font-heading font-bold text-gradient-primary text-2xl tracking-tight">Analytics Overview</h2>
      </div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass card-hover rounded-xl p-5 border-primary/10 relative overflow-hidden group"
        >
          <p className="text-sm text-muted-foreground mb-1">This Week</p>
          <p className="text-3xl font-bold text-foreground">{weeklyComparison.thisWeekCount}</p>
          <p className="text-xs text-muted-foreground mt-1">quotes received</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass card-hover rounded-xl p-5 border-primary/10 relative overflow-hidden group"
        >
          <p className="text-sm text-muted-foreground mb-1">Last Week</p>
          <p className="text-3xl font-bold text-foreground">{weeklyComparison.lastWeekCount}</p>
          <p className="text-xs text-muted-foreground mt-1">quotes received</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass card-hover rounded-xl p-5 border-primary/10 relative overflow-hidden group"
        >
          <p className="text-sm text-muted-foreground mb-1">Week over Week</p>
          <p className={`text-3xl font-bold ${weeklyComparison.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {weeklyComparison.percentChange >= 0 ? '+' : ''}{weeklyComparison.percentChange}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">change</p>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Quotes Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass card-hover rounded-xl p-5 border-primary/10 relative overflow-hidden group"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-secondary" />
            <h3 className="font-medium text-foreground">Quote Trends (Last 30 Days)</h3>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyQuotes}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="quotes" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: 'hsl(var(--secondary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Status Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass card-hover rounded-xl p-5 border-primary/10 relative overflow-hidden group"
        >
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-4 h-4 text-secondary" />
            <h3 className="font-medium text-foreground">Status Distribution</h3>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '11px' }}
                  formatter={(value) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Service Breakdown Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass card-hover rounded-xl p-5 border-primary/10 relative overflow-hidden group lg:col-span-2"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-secondary" />
            <h3 className="font-medium text-foreground">Quotes by Service Type</h3>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis 
                  type="number"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  allowDecimals={false}
                />
                <YAxis 
                  type="category"
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  width={90}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[0, 4, 4, 0]}
                >
                  {serviceBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
