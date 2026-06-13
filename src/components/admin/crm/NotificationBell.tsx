import { useState, useEffect } from "react";
import { Bell, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/crm/notifications.php?limit=30", { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setNotifications(Array.isArray(json.data?.notifications) ? json.data.notifications : []);
        setUnreadCount(json.data?.unread_count || 0);
      }
    } catch (e) {
      console.error("Error fetching notifications", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await fetch("/api/crm/notifications.php?action=mark_read", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      fetchNotifications();
    } catch (e) {}
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/crm/notifications.php?action=mark_all_read", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      fetchNotifications();
    } catch (e) {}
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-[340px] bg-card rounded-xl border border-border shadow-2xl z-50 overflow-hidden flex flex-col max-h-[70vh] sm:max-h-[400px]">
          <div className="p-3 border-b border-border bg-muted/50 flex items-center justify-between">
            <h4 className="font-bold text-sm text-foreground">Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-violet-600 font-semibold hover:underline">
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No new notifications
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-3 rounded-lg text-sm transition-colors ${notif.is_read ? 'opacity-60 hover:bg-muted/30' : 'bg-violet-50/50 hover:bg-violet-50 border border-violet-100'}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{notif.title}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">{notif.message}</p>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2">
                        <Clock className="w-3 h-3" /> {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </div>
                    {notif.is_read === 0 && (
                      <button 
                        onClick={() => markAsRead(notif.id)}
                        className="text-violet-600 hover:text-violet-800 p-1 rounded-full hover:bg-violet-100 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
}
