import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  History,
  User,
  FileText,
  Edit,
  Loader2,
  X,
  RefreshCw,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityLog {
  id: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_reference: string | null;
  details: Record<string, any> | null;
  created_at: string;
}

interface ActivityLogsProps {
  onClose: () => void;
}

const actionColors: Record<string, string> = {
  status_updated: "bg-blue-500",
  quote_created: "bg-green-500",
  quote_deleted: "bg-red-500",
  message_updated: "bg-purple-500",
};

const actionLabels: Record<string, string> = {
  status_updated: "Updated Status",
  quote_created: "Quote Created",
  quote_deleted: "Quote Deleted",
  message_updated: "Updated Message",
};

export const ActivityLogs = ({ onClose }: ActivityLogsProps) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/activity-logs/list.php", { credentials: "include" });
      const json = await res.json();
      if (json.success) setLogs((json.data?.logs || json.data || []) as ActivityLog[]);
    } catch (err: unknown) {
      console.error("Error fetching activity logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = filter === "all" 
    ? logs 
    : logs.filter(log => log.action === filter);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <History className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">
                Activity Logs
              </h2>
              <p className="text-sm text-muted-foreground">
                Track all changes made to quotes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={fetchLogs}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Filter */}
        <div className="px-6 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="all">All Activities</option>
            <option value="status_updated">Status Updates</option>
            <option value="message_updated">Message Updates</option>
            <option value="quote_created">Quote Created</option>
          </select>
          <span className="text-xs text-muted-foreground ml-auto">
            {filteredLogs.length} activities
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No activity logs found.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Activities will appear here when quotes are updated.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-muted/30 rounded-xl p-4 border border-border"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${actionColors[log.action] || 'bg-muted-foreground'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground text-sm">
                          {log.user_name || log.user_email || "Unknown User"}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {actionLabels[log.action] || log.action}
                        </span>
                      </div>
                      
                      {log.entity_reference && (
                        <div className="flex items-center gap-1 mt-1">
                          <FileText className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs font-mono text-muted-foreground">
                            {log.entity_reference}
                          </span>
                        </div>
                      )}
                      
                      {log.details && (
                        <div className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
                          {log.details.old_status && log.details.new_status && (
                            <p>
                              Status: <span className="line-through">{log.details.old_status}</span>
                              {" → "}
                              <span className="font-medium text-foreground">{log.details.new_status}</span>
                            </p>
                          )}
                          {log.details.message && (
                            <p className="mt-1">Message: "{log.details.message}"</p>
                          )}
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTime(log.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
