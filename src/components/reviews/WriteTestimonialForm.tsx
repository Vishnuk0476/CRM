import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, X, Loader2, CheckCircle, Camera, Upload, Film, Image as ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const testimonialSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.string().optional(),
  location: z.string().optional(),
  content: z.string().min(20, "Review must be at least 20 characters").max(1000, "Review must be less than 1000 characters"),
});

type TestimonialFormValues = z.infer<typeof testimonialSchema>;

interface UploadedMedia {
  url: string;
  type: "image" | "video";
  name: string;
  size: number;
}

interface WriteTestimonialFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const WriteTestimonialForm = ({ isOpen, onClose }: WriteTestimonialFormProps) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Media state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: "",
      role: "",
      location: "",
      content: "",
    },
  });

  // ─── Avatar Upload ──────────────────────────
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Avatar must be under 5MB.", variant: "destructive" });
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setIsUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("type", "avatar");
      fd.append("avatar", file);

      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${baseUrl}/testimonials/upload.php`, { method: "POST", body: fd });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Upload failed");

      setAvatarUrl(json.data.avatar_url);
      toast({ title: "Avatar uploaded!" });
    } catch (err: unknown) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // ─── Media Upload (photos + videos) ─────────
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const totalFiles = uploadedMedia.length + files.length;
    if (totalFiles > 10) {
      toast({ title: "Too many files", description: "Maximum 10 files allowed.", variant: "destructive" });
      return;
    }

    // Validate each file
    for (const file of Array.from(files)) {
      if (file.size > 100 * 1024 * 1024) {
        toast({ title: "File too large", description: `${file.name} exceeds 100MB limit.`, variant: "destructive" });
        return;
      }
    }

    setIsUploadingMedia(true);
    setUploadProgress(0);

    try {
      const fd = new FormData();
      fd.append("type", "media");
      for (const file of Array.from(files)) {
        fd.append("files[]", file);
      }

      const xhr = new XMLHttpRequest();
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await new Promise<any>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          try { resolve(JSON.parse(xhr.responseText)); } catch { reject(new Error("Invalid response")); }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.open("POST", `${baseUrl}/testimonials/upload.php`);
        xhr.send(fd);
      });

      if (!response.success) throw new Error(response.message || "Upload failed");

      setUploadedMedia((prev) => [...prev, ...(response.data.files || [])]);

      if (response.data.errors?.length) {
        toast({ title: "Some files failed", description: response.data.errors.join(", "), variant: "destructive" });
      } else {
        toast({ title: "Files uploaded!" });
      }
    } catch (err: unknown) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUploadingMedia(false);
      setUploadProgress(0);
      if (mediaInputRef.current) mediaInputRef.current.value = "";
    }
  };

  const removeMedia = (idx: number) => {
    setUploadedMedia((prev) => prev.filter((_, i) => i !== idx));
  };

  // ─── Submit ─────────────────────────────────
  const onSubmit = async (values: TestimonialFormValues) => {
    setIsSubmitting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${baseUrl}/testimonials/submit.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          role: values.role || null,
          location: values.location || null,
          rating,
          content: values.content,
          avatar_url: avatarUrl,
          media_urls: uploadedMedia.length > 0 ? uploadedMedia : null,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Submission failed");

      setIsSuccess(true);
      toast({
        title: "Thank you for your review!",
        description: "Your testimonial has been submitted and will appear after approval.",
      });

      setTimeout(() => {
        form.reset();
        setRating(5);
        setIsSuccess(false);
        setAvatarUrl(null);
        setAvatarPreview(null);
        setUploadedMedia([]);
        onClose();
      }, 3000);
    } catch (err: unknown) {
      toast({ title: "Submission Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
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
            className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
          {isSuccess ? (
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-10 h-10 text-green-500" />
              </motion.div>
              <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                Thank You!
              </h3>
              <p className="text-muted-foreground">
                Your review has been submitted successfully. It will be visible after approval.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-xl font-heading font-bold text-foreground">
                    Write a Review
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Share your experience with Panya Global
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">

                  {/* Avatar Upload */}
                  <div className="flex items-center gap-4">
                    <div
                      className="relative w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden group"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      ) : avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                      ) : (
                        <Camera className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Profile Photo</p>
                      <p className="text-xs text-muted-foreground">Optional · Max 5MB</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Your Rating *
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 transition-colors ${
                              star <= (hoveredRating || rating)
                                ? "fill-secondary text-secondary"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {rating} out of 5
                      </span>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Role</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., IT Professional" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Delhi" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Review *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share your experience with our services..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <div className="flex justify-between">
                          <FormMessage />
                          <span className="text-xs text-muted-foreground">
                            {field.value?.length || 0}/1000
                          </span>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Media Upload Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">Photos & Videos</label>
                      <span className="text-xs text-muted-foreground">Optional · Max 100MB each</span>
                    </div>

                    {/* Upload area */}
                    <div
                      className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                      onClick={() => mediaInputRef.current?.click()}
                    >
                      {isUploadingMedia ? (
                        <div className="space-y-2">
                          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                          <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex gap-2">
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                            <Film className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Click to upload photos or videos
                          </p>
                          <p className="text-xs text-muted-foreground/70">
                            JPG, PNG, WebP, MP4, WebM · Up to 10 files
                          </p>
                        </div>
                      )}
                      <input
                        ref={mediaInputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        className="hidden"
                        onChange={handleMediaUpload}
                      />
                    </div>

                    {/* Uploaded media preview */}
                    {uploadedMedia.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {uploadedMedia.map((media, idx) => (
                          <div key={idx} className="relative group rounded-lg overflow-hidden border border-border bg-muted aspect-square">
                            {media.type === "image" ? (
                              <img src={media.url} alt={media.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-primary/5">
                                <Film className="w-6 h-6 text-primary mb-1" />
                                <span className="text-[10px] text-muted-foreground">{formatFileSize(media.size)}</span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeMedia(idx)}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || isUploadingMedia || isUploadingAvatar}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Review
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Your review will be published after verification by our team.
                  </p>
                </form>
              </Form>
            </>
          )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WriteTestimonialForm;
