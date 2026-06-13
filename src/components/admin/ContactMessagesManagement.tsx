import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Search, Mail, Phone, Calendar, User,
  MessageSquare, Loader2, CheckCircle, Circle, Trash2, MailOpen, MailX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { contactService, ContactMessage } from "@/services/apiService";
import { usePermissions } from "@/hooks/useAuth";
import { ShieldAlert } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
// Types moved to apiService

interface Props {
  onClose: () => void;
  onUnreadCountChange?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const ContactMessagesManagement = ({ onClose, onUnreadCountChange }: Props) => {
  const { toast } = useToast();
  const [messages,         setMessages]         = useState<ContactMessage[]>([]);
  const [isLoading,        setIsLoading]        = useState(true);
  const [searchTerm,       setSearchTerm]       = useState("");
  const [selectedMessage,  setSelectedMessage]  = useState<ContactMessage | null>(null);
  const [filterRead,       setFilterRead]       = useState<"all" | "unread" | "read">("all");
  const { canDelete } = usePermissions();
  const [deleteTarget,     setDeleteTarget]     = useState<ContactMessage | null>(null);
  const [isDeleting,       setIsDeleting]       = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await contactService.list();
      if (error) throw error;
      setMessages(data || []);
    } catch {
      toast({ title: "Error", description: "Failed to fetch messages.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  // ── Mark as read / unread ──────────────────────────────────────────────
  const setReadStatus = async (id: string, is_read: boolean) => {
    try {
      await contactService.update(id, { is_read });
      // Optimistically update UI
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read } : m));
      // Also update selected message state
      setSelectedMessage(prev => prev && prev.id === id ? { ...prev, is_read } : prev);
      // Notify parent to refresh badge count
      onUnreadCountChange?.();
    } catch { /* silent */ }
  };

  const markAsRead   = (id: string) => setReadStatus(id, true);
  const markAsUnread = (id: string) => setReadStatus(id, false);

  const handleSelectMessage = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (!msg.is_read) markAsRead(msg.id);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (!canDelete) {
      toast({ title: "Permission Denied", description: "Only Administrators can delete messages.", variant: "destructive", action: <ShieldAlert className="w-5 h-5 text-white" /> });
      return;
    }
    setIsDeleting(true);
    try {
      const { error } = await contactService.delete(deleteTarget.id!);
      if (error) throw error;
      toast({ title: "Deleted", description: `Message from "${deleteTarget.name}" removed.` });
      setMessages(prev => prev.filter(m => m.id !== deleteTarget.id));
      if (selectedMessage?.id === deleteTarget.id) setSelectedMessage(null);
      setDeleteTarget(null);
    } catch {
      toast({ title: "Failed", description: "Could not delete message.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = messages.filter(m => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q ||
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q);
    const matchFilter =
      filterRead === "all" ||
      (filterRead === "unread" && !m.is_read) ||
      (filterRead === "read"   &&  m.is_read);
    return matchSearch && matchFilter;
  });

  const unreadCount = messages.filter(m => !m.is_read).length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-border flex flex-col"
      >
        {/* Header */}
        <div className="bg-primary p-4 sm:p-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-white">Contact Messages</h2>
              <p className="text-white/80 text-sm">{messages.length} total · {unreadCount} unread</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Filter bar */}
        <div className="p-4 border-b border-border bg-muted/30 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or subject..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "unread", "read"] as const).map(f => (
                <Button
                  key={f}
                  variant={filterRead === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterRead(f)}
                >
                  {f === "all" ? "All" : f === "unread" ? (
                    <><Circle className="w-3 h-3 mr-1 fill-current" />Unread ({unreadCount})</>
                  ) : (
                    <><CheckCircle className="w-3 h-3 mr-1" />Read</>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Content split */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0">
          {/* Message list */}
          <div className="w-full lg:w-2/5 border-r border-border overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center p-6">
                <Mail className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No messages found</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map(msg => (
                  <div key={msg.id} className="relative group">
                    <button
                      onClick={() => handleSelectMessage(msg)}
                      className={`w-full text-left p-4 pr-12 hover:bg-muted/50 transition-colors ${
                        selectedMessage?.id === msg.id ? "bg-muted/60" : ""
                      } ${!msg.is_read ? "bg-secondary/5" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${msg.is_read ? "bg-muted-foreground/30" : "bg-secondary"}`} />
                        <div className="flex-1 min-w-0">
                          <span className={`font-medium text-foreground truncate block ${!msg.is_read ? "font-semibold" : ""}`}>
                            {msg.name}
                          </span>
                          <p className={`text-sm truncate ${!msg.is_read ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                            {msg.subject}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {msg.created_at ? new Date(msg.created_at).toLocaleDateString() : "—"}
                            {" "}
                            {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                          </p>
                        </div>
                      </div>
                    </button>
                    {/* Delete hover button */}
                    <button
                      onClick={e => { e.stopPropagation(); setDeleteTarget(msg); }}
                      className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600 text-muted-foreground"
                      title="Delete message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message detail */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedMessage ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-foreground mb-2">{selectedMessage.subject}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="w-4 h-4" />{selectedMessage.name}</span>
                      <a href={`mailto:${selectedMessage.email}`} className="flex items-center gap-1 text-secondary hover:underline">
                        <Mail className="w-4 h-4" />{selectedMessage.email}
                      </a>
                      {selectedMessage.phone && (
                        <a href={`tel:${selectedMessage.phone}`} className="flex items-center gap-1 text-secondary hover:underline">
                          <Phone className="w-4 h-4" />{selectedMessage.phone}
                        </a>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />{selectedMessage.created_at ? new Date(selectedMessage.created_at).toLocaleString() : "—"}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(selectedMessage)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>

                <div className="bg-muted/30 rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Message</span>
                  </div>
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {selectedMessage.is_read ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsUnread(selectedMessage.id)}
                      className="text-amber-600 border-amber-300 hover:bg-amber-50"
                    >
                      <MailX className="w-4 h-4 mr-2" />
                      Mark as Unread
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsRead(selectedMessage.id)}
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      <MailOpen className="w-4 h-4 mr-2" />
                      Mark as Read
                    </Button>
                  )}
                  <Button variant="secondary" onClick={() => (window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`)}>
                    <Mail className="w-4 h-4 mr-2" />Reply via Email
                  </Button>
                  {selectedMessage.phone && (
                    <Button variant="outline" onClick={() => (window.location.href = `tel:${selectedMessage.phone}`)}>
                      <Phone className="w-4 h-4 mr-2" />Call
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Select a message to view details</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 24 } }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl border border-border shadow-2xl p-6 w-full max-w-sm text-center"
            >
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-1">Delete Message?</h3>
              <p className="text-sm text-muted-foreground mb-1 font-mono">{deleteTarget.subject}</p>
              <p className="text-sm text-muted-foreground mb-6">
                From {deleteTarget.name} — <span className="text-red-500 font-medium">cannot be undone.</span>
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
                  Cancel
                </Button>
                <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4 mr-1" />Delete</>}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
