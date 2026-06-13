import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Mail,
  Users,
  TrendingUp,
  Calendar,
  Search,
  Loader2,
  UserCheck,
  UserX,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { toast } from "sonner";

interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  is_active: boolean;
  subscribed_at: string;
}

interface NewsletterManagementProps {
  onClose: () => void;
}

export const NewsletterManagement = ({ onClose }: NewsletterManagementProps) => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe.php", { credentials: "include" });
      const json = await res.json();
      if (json.success) setSubscribers(json.data?.subscribers || json.data || []);
      else throw new Error(json.message);
    } catch (err: unknown) {
      console.error("Error fetching subscribers:", err);
      toast.error("Failed to fetch subscribers");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSubscriberStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/newsletter/update.php", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setSubscribers(subscribers.map(sub => 
        sub.id === id ? { ...sub, is_active: !currentStatus } : sub
      ));
      toast.success(`Subscriber ${!currentStatus ? "activated" : "deactivated"}`);
    } catch (err: unknown) {
      console.error("Error updating subscriber:", err);
      toast.error("Failed to update subscriber");
    }
  };

  const deleteSubscriber = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) return;
    try {
      const res = await fetch("/api/newsletter/delete.php", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setSubscribers(subscribers.filter(sub => sub.id !== id));
      toast.success("Subscriber deleted");
    } catch (err: unknown) {
      console.error("Error deleting subscriber:", err);
      toast.error("Failed to delete subscriber");
    }
  };

  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesSearch = 
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "active" && sub.is_active) ||
      (statusFilter === "inactive" && !sub.is_active);

    return matchesSearch && matchesStatus;
  });

  // Analytics calculations
  const totalSubscribers = subscribers.length;
  const activeSubscribers = subscribers.filter(s => s.is_active).length;
  const inactiveSubscribers = totalSubscribers - activeSubscribers;
  
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const newThisWeek = subscribers.filter(s => new Date(s.subscribed_at) >= last7Days).length;
  
  const sourceBreakdown = subscribers.reduce((acc, sub) => {
    const source = sub.source || "unknown";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <motion.div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold text-foreground">Newsletter Subscribers</h2>
              <p className="text-sm text-muted-foreground">Manage your newsletter audience</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Analytics Cards */}
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalSubscribers}</p>
                  <p className="text-xs text-muted-foreground">Total Subscribers</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{activeSubscribers}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{newThisWeek}</p>
                  <p className="text-xs text-muted-foreground">New This Week</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <UserX className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{inactiveSubscribers}</p>
                  <p className="text-xs text-muted-foreground">Inactive</p>
                </div>
              </div>
            </div>
          </div>

          {/* Source Breakdown */}
          {Object.keys(sourceBreakdown).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Sources:</span>
              {Object.entries(sourceBreakdown).map(([source, count]) => (
                <Badge key={source} variant="secondary" className="capitalize">
                  {source}: {count}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("active")}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === "inactive" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("inactive")}
            >
              Inactive
            </Button>
            <Button variant="outline" size="sm" onClick={fetchSubscribers}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Subscribers List */}
        <div className="overflow-auto max-h-[40vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No subscribers found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase px-6 py-3">Email</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase px-6 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase px-6 py-3">Source</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase px-6 py-3">Subscribed</th>
                  <th className="text-center text-xs font-medium text-muted-foreground uppercase px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-foreground">{subscriber.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {subscriber.name || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="capitalize">
                        {subscriber.source || "unknown"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={subscriber.is_active ? "default" : "secondary"}>
                        {subscriber.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(subscriber.subscribed_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSubscriberStatus(subscriber.id, subscriber.is_active)}
                          title={subscriber.is_active ? "Deactivate" : "Activate"}
                        >
                          {subscriber.is_active ? (
                            <UserX className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <UserCheck className="w-4 h-4 text-green-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSubscriber(subscriber.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
