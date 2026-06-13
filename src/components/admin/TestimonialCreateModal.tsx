import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileUploader } from "@/components/ui/FileUploader";

export function TestimonialCreateModal({ isOpen, onClose, onCreated }: { isOpen: boolean, onClose: () => void, onCreated: () => void }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    role: "",
    location: "",
    rating: 5,
    content: "",
    avatar_url: "",
    video_url: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.content) {
      toast({ title: "Required Fields", description: "Name and Content are required.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/testimonials/create.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          is_approved: 1, // Admin-created are auto-approved
          is_video: !!form.video_url
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to create testimonial.");
      
      toast({ title: "Testimonial Created", description: "The new testimonial is now live." });
      onCreated();
      onClose();
    } catch (err: unknown) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <h2 className="text-lg font-bold text-foreground">Add New Testimonial</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <form id="testimonial-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Customer Name *</label>
                    <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Rating (1-5)</label>
                    <Input type="number" min={1} max={5} value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Role (e.g. CEO)</label>
                    <Input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Location</label>
                    <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Review Content *</label>
                  <Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required rows={4} />
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold mb-3">Upload Media (Optional)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Avatar / Profile Picture (Image)</label>
                      <FileUploader 
                        accept="image/*"
                        maxSizeMB={5}
                        label="Upload Avatar"
                        onUploadSuccess={(url) => setForm({ ...form, avatar_url: url })}
                      />
                      {form.avatar_url && <img src={form.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full mt-2 object-cover border border-border" loading="lazy" decoding="async" />}
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Video Testimonial (MP4)</label>
                      <FileUploader 
                        accept="video/*"
                        maxSizeMB={50}
                        label="Upload Video"
                        onUploadSuccess={(url) => setForm({ ...form, video_url: url })}
                      />
                      {form.video_url && <p className="text-xs text-green-500 mt-2">✓ Video attached</p>}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-border flex justify-end gap-3 flex-shrink-0">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
              <Button form="testimonial-form" type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Create Testimonial
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
