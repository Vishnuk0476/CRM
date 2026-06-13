import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  X,
  Search,
  Loader2,
  Trash2,
  Video,
  MessageSquare,
  Eye,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Check,
  ImageIcon,
  Save,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { TestimonialCreateModal } from "./TestimonialCreateModal";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  location: string | null;
  rating: number;
  content: string;
  image_url: string | null;
  video_url: string | null;
  avatar_url: string | null;
  media_urls: { url: string; type: string; name: string; size: number }[];
  is_video: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

interface TestimonialsManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestimonialsManagement = ({ isOpen, onClose }: TestimonialsManagementProps) => {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Media editing state
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<Set<number>>(new Set());
  const [isSavingMedia, setIsSavingMedia] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTestimonials();
    }
  }, [isOpen]);

  // ── Fetch all testimonials via PHP API ────────────────────────────────────
  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/testimonials/list.php?admin=1", {
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Failed to fetch");
      setTestimonials(data.data?.testimonials ?? []);
    } catch (err: unknown) {
      console.error("Error fetching testimonials:", err);
      toast({
        title: "Error",
        description: "Failed to fetch testimonials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Approve / Reject ───────────────────────────────────────────────────────
  const handleStatusChange = async (id: string, is_approved: boolean) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/testimonials/update.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_approved: is_approved ? 1 : 0 }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Update failed");

      // Optimistic update
      setTestimonials(prev =>
        prev.map(t => t.id === id ? { ...t, is_approved } : t)
      );

      toast({
        title: "Status Updated",
        description: `Testimonial is now ${is_approved ? "approved" : "pending"}.`,
      });
    } catch (err: unknown) {
      console.error("Error updating status:", err);
      toast({
        title: "Error",
        description: "Failed to update testimonial status.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    setActionLoading(id);
    try {
      const res = await fetch("/api/testimonials/delete.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Delete failed");

      // Remove from list
      setTestimonials(prev => prev.filter(t => t.id !== id));

      toast({
        title: "Testimonial Deleted",
        description: "The testimonial has been removed.",
      });
    } catch (err: unknown) {
      console.error("Error deleting testimonial:", err);
      toast({
        title: "Error",
        description: "Failed to delete testimonial.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // ── Media Management ──────────────────────────────────────────────────────
  const openMediaEditor = (testimonial: Testimonial) => {
    setEditingMediaId(testimonial.id);
    // Select all by default
    const allIndexes = new Set<number>(testimonial.media_urls.map((_, i) => i));
    setSelectedMedia(allIndexes);
  };

  const toggleMediaSelection = (idx: number) => {
    setSelectedMedia((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const saveMediaSelection = async () => {
    if (!editingMediaId) return;
    const testimonial = testimonials.find((t) => t.id === editingMediaId);
    if (!testimonial) return;

    const kept = testimonial.media_urls.filter((_, i) => selectedMedia.has(i));

    setIsSavingMedia(true);
    try {
      const res = await fetch("/api/testimonials/update.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingMediaId,
          media_urls: JSON.stringify(kept),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Update failed");

      setTestimonials((prev) =>
        prev.map((t) =>
          t.id === editingMediaId ? { ...t, media_urls: kept } : t
        )
      );
      setEditingMediaId(null);
      toast({ title: "Media Updated", description: `${kept.length} file(s) kept.` });
    } catch (err: unknown) {
      console.error("Error saving media:", err);
      toast({ title: "Error", description: "Failed to update media.", variant: "destructive" });
    } finally {
      setIsSavingMedia(false);
    }
  };

  const filteredTestimonials = testimonials.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && !t.is_approved) ||
      (filter === "approved" && t.is_approved);

    return matchesSearch && matchesFilter;
  });

  const pendingCount = testimonials.filter(t => !t.is_approved).length;

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border flex-shrink-0">
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground">
                  Testimonials Management
                </h2>
                <p className="text-sm text-muted-foreground">
                  {testimonials.length} total · {pendingCount} pending review
                </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(true)} className="gap-2 hidden sm:flex">
                    <Plus className="w-4 h-4" /> New
                  </Button>
                  <Button variant="outline" size="sm" onClick={fetchTestimonials} disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20"
                  >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-border flex flex-wrap gap-3 flex-shrink-0">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search testimonials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {(["all", "pending", "approved"] as const).map((f) => (
                  <Button
                    key={f}
                    variant={filter === f ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(f)}
                  >
                    {f === "all" && "All"}
                    {f === "pending" && `Pending (${pendingCount})`}
                    {f === "approved" && "Approved"}
                  </Button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : filteredTestimonials.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No testimonials found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTestimonials.map((testimonial) => (
                    <motion.div
                      key={testimonial.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-muted/50 rounded-xl p-4 border ${
                        testimonial.is_approved ? "border-green-500/30" : "border-yellow-500/30"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {testimonial.avatar_url ? (
                            <img src={testimonial.avatar_url} alt={testimonial.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                          ) : testimonial.is_video ? (
                            <Video className="w-5 h-5 text-primary" />
                          ) : (
                            <MessageSquare className="w-5 h-5 text-primary" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Name & meta */}
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground">{testimonial.name}</span>
                            {testimonial.role && (
                              <span className="text-sm text-muted-foreground">• {testimonial.role}</span>
                            )}
                            {testimonial.location && (
                              <span className="text-sm text-muted-foreground">• {testimonial.location}</span>
                            )}
                          </div>

                          {/* Stars + status badges */}
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < testimonial.rating
                                      ? "fill-secondary text-secondary"
                                      : "text-muted"
                                  }`}
                                />
                              ))}
                            </div>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                testimonial.is_approved
                                  ? "bg-green-500/10 text-green-600"
                                  : "bg-yellow-500/10 text-yellow-600"
                              }`}
                            >
                              {testimonial.is_approved ? "✓ Approved" : "⏳ Pending"}
                            </span>
                            {testimonial.is_video && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500">
                                Video
                              </span>
                            )}
                          </div>

                          {/* Content preview */}
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                            {testimonial.content}
                          </p>

                          {/* Media preview */}
                          {testimonial.media_urls && testimonial.media_urls.length > 0 && (
                            <div className="mb-3">
                              {editingMediaId === testimonial.id ? (
                                /* ─── Expanded Media Editor ─── */
                                <div className="bg-background rounded-lg border border-primary/30 p-3 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-foreground">Select media to keep ({selectedMedia.size}/{testimonial.media_urls.length})</span>
                                    <div className="flex gap-1.5">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs px-2"
                                        onClick={() => setEditingMediaId(null)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="h-7 text-xs px-2 gap-1"
                                        onClick={saveMediaSelection}
                                        disabled={isSavingMedia}
                                      >
                                        {isSavingMedia ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                        Save
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-4 gap-2">
                                    {testimonial.media_urls.map((m, i) => {
                                      const isSelected = selectedMedia.has(i);
                                      return (
                                        <div
                                          key={i}
                                          onClick={() => toggleMediaSelection(i)}
                                          className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                                            isSelected
                                              ? "border-green-500 ring-2 ring-green-500/20"
                                              : "border-red-300 opacity-40 grayscale"
                                          }`}
                                        >
                                          {m.type === 'image' ? (
                                            <img src={m.url} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                          ) : (
                                            <div className="w-full h-full bg-primary/5 flex flex-col items-center justify-center">
                                              <Video className="w-5 h-5 text-primary" />
                                              <span className="text-[9px] text-muted-foreground mt-0.5">Video</span>
                                            </div>
                                          )}
                                          {/* Selection indicator */}
                                          <div className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs ${
                                            isSelected ? "bg-green-500" : "bg-red-400"
                                          }`}>
                                            {isSelected ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  {selectedMedia.size === 0 && (
                                    <p className="text-xs text-red-500 text-center">All media will be removed if you save with nothing selected.</p>
                                  )}
                                </div>
                              ) : (
                                /* ─── Collapsed Media Thumbnails ─── */
                                <div className="flex gap-1 flex-wrap items-center">
                                  {testimonial.media_urls.slice(0, 4).map((m, i) => (
                                    <div key={i} className="w-10 h-10 rounded border border-border overflow-hidden bg-muted">
                                      {m.type === 'image' ? (
                                        <img src={m.url} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <Video className="w-4 h-4 text-primary" />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  {testimonial.media_urls.length > 4 && (
                                    <div className="w-10 h-10 rounded border border-border flex items-center justify-center bg-muted text-xs text-muted-foreground">+{testimonial.media_urls.length - 4}</div>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-xs text-primary hover:text-primary/80 px-2 gap-1"
                                    onClick={() => openMediaEditor(testimonial)}
                                  >
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    Manage
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Approve / Reject toggle */}
                            {testimonial.is_approved ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(testimonial.id, false)}
                                disabled={actionLoading === testimonial.id}
                                className="h-9 text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                              >
                                {actionLoading === testimonial.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                ) : (
                                  <ThumbsDown className="w-3.5 h-3.5 mr-1" />
                                )}
                                Reject
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(testimonial.id, true)}
                                disabled={actionLoading === testimonial.id}
                                className="h-9 text-green-600 border-green-300 hover:bg-green-50"
                              >
                                {actionLoading === testimonial.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                ) : (
                                  <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                                )}
                                Approve
                              </Button>
                            )}

                            {/* View video */}
                            {testimonial.video_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(testimonial.video_url!, "_blank")}
                                className="h-9"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Video
                              </Button>
                            )}

                            {/* Delete */}
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDelete(testimonial.id)}
                              disabled={actionLoading === testimonial.id}
                              title="Delete Testimonial"
                              className="h-9 w-9 bg-red-100 text-red-600 hover:bg-red-200 border-none"
                            >
                              {actionLoading === testimonial.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Date */}
                        <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                          {new Date(testimonial.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    <TestimonialCreateModal 
      isOpen={isCreateOpen} 
      onClose={() => setIsCreateOpen(false)} 
      onCreated={fetchTestimonials} 
    />
  </>
);
};
