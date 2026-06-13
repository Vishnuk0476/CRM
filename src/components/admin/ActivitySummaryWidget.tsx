import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Briefcase, 
  MessageSquare, 
  Download,
  TrendingUp,
  Loader2,
  Star,
  RefreshCw
} from "lucide-react";

interface ActivityStats {
  quotes: { total: number; today: number; pending: number };
  inquiries: { total: number; today: number; pending: number };
  messages: { total: number; today: number; unread: number };
  brochures: { total: number; today: number };
  testimonials: { total: number; pending: number };
}

const ActivitySummaryWidget = () => {
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Single PHP stats endpoint replaces 13 individual Supabase count queries
      const res = await fetch('/api/stats.php', { credentials: 'include' });
      const json = await res.json();
      if (json.success && json.data) {
        setStats({
          quotes:       { total: json.data.quotes?.total ?? 0,       today: json.data.quotes?.today ?? 0,       pending: json.data.quotes?.pending ?? 0       },
          inquiries:    { total: json.data.inquiries?.total ?? 0,    today: json.data.inquiries?.today ?? 0,    pending: json.data.inquiries?.pending ?? 0    },
          messages:     { total: json.data.messages?.total ?? 0,     today: json.data.messages?.today ?? 0,     unread:  json.data.messages?.unread ?? 0      },
          brochures:    { total: json.data.brochures?.total ?? 0,    today: json.data.brochures?.today ?? 0                                                   },
          testimonials: { total: json.data.testimonials?.total ?? 0, pending: json.data.testimonials?.pending ?? 0                                            },
        });
      }
    } catch (err: unknown) {
      console.error("Error fetching activity stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return null;

  const widgets = [
    {
      title: "Quote Requests",
      icon: FileText,
      total: stats.quotes.total,
      today: stats.quotes.today,
      actionLabel: "Pending",
      actionCount: stats.quotes.pending,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Service Inquiries",
      icon: Briefcase,
      total: stats.inquiries.total,
      today: stats.inquiries.today,
      actionLabel: "Pending",
      actionCount: stats.inquiries.pending,
      bgColor: "bg-secondary/10",
      iconColor: "text-secondary",
    },
    {
      title: "Contact Messages",
      icon: MessageSquare,
      total: stats.messages.total,
      today: stats.messages.today,
      actionLabel: "Unread",
      actionCount: stats.messages.unread,
      bgColor: "bg-accent/10",
      iconColor: "text-accent",
    },
    {
      title: "Brochure Downloads",
      icon: Download,
      total: stats.brochures.total,
      today: stats.brochures.today,
      actionLabel: null,
      actionCount: 0,
      bgColor: "bg-green-500/10",
      iconColor: "text-green-500",
    },
    {
      title: "Testimonials",
      icon: Star,
      total: stats.testimonials.total,
      today: 0,
      actionLabel: "Pending Approval",
      actionCount: stats.testimonials.pending,
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 border-primary/10 shadow-card mb-8 relative z-10"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-bold text-gradient-primary">Activity Summary</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Overview of all leads and requests</p>
        </div>
        <button 
          onClick={fetchStats}
          className="text-sm font-medium text-primary hover:text-secondary transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/5 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {widgets.map((widget, index) => (
          <motion.div
            key={widget.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass card-hover rounded-xl p-5 border-border/50 bg-background/50 relative overflow-hidden group"
          >
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className={`w-10 h-10 rounded-xl ${widget.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                <widget.icon className={`w-5 h-5 ${widget.iconColor}`} />
              </div>
              <span className="text-sm font-medium text-foreground">{widget.title}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-foreground">{widget.total}</span>
                {widget.today > 0 && (
                  <span className="flex items-center gap-1 text-xs text-green-500 font-medium">
                    <TrendingUp className="w-3 h-3" />
                    +{widget.today} today
                  </span>
                )}
              </div>

              {widget.actionLabel && widget.actionCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-yellow-600 font-medium bg-yellow-500/10 px-2 py-1 rounded-full w-fit">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  {widget.actionCount} {widget.actionLabel}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ActivitySummaryWidget;
