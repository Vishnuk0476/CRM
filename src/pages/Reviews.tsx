import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ThumbsUp, Calendar, PenLine, Video, MessageSquare, Loader2, Play } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import CTA from "@/components/home/CTA";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WriteTestimonialForm from "@/components/reviews/WriteTestimonialForm";
import { useToast } from "@/hooks/use-toast";

interface MediaItem {
  url: string;
  type: "image" | "video";
  name: string;
  size: number;
}

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
  media_urls: MediaItem[];
  is_video: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
}

const Reviews = () => {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [helpfulClicked, setHelpfulClicked] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/testimonials/list.php");
      const json = await res.json();
      if (json.success) {
        setTestimonials(Array.isArray(json.data) ? json.data : (json.data?.testimonials || []));
      }
    } catch (err: unknown) {
      console.error("Error fetching testimonials:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHelpful = async (id: string) => {
    if (helpfulClicked.has(id)) return;
    setHelpfulClicked((prev) => new Set([...prev, id]));
    try {
      const testimonial = testimonials.find((t) => t.id === id);
      if (!testimonial) return;
      await fetch("/api/testimonials/update.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, helpful_count: testimonial.helpful_count + 1 }),
      });
      setTestimonials((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, helpful_count: t.helpful_count + 1 } : t
        )
      );
    } catch (err: unknown) {
      console.error("Error updating helpful count:", err);
      setHelpfulClicked((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const videoTestimonials = testimonials.filter((t) => t.is_video && t.video_url);
  const textTestimonials = testimonials.filter((t) => !t.is_video);

  const displayedTestimonials =
    activeTab === "all"
      ? testimonials
      : activeTab === "video"
      ? videoTestimonials
      : textTestimonials;

  // Calculate overall stats
  const totalReviews = testimonials.length;
  const avgRating =
    totalReviews > 0
      ? (testimonials.reduce((acc, t) => acc + t.rating, 0) / totalReviews).toFixed(1)
      : "5.0";

  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = testimonials.filter((t) => t.rating === stars).length;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, percentage };
  });

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return "";

    // Live db has some restricted/private videos. Swap them automatically to working ones.
    const brokenToWorkingMap: Record<string, string> = {
      // Live server broken IDs
      "I-_A_IlZxT0": "v6HwOz6pyyI", // Zeeshan Ali
      "9Y2d5cCU9Hw": "Gxxwe9gdWzA", // Shishir Upadhyaya
      "3XiU-4dKN3U": "gpeqm1Ew3sE", // Paursh Pandit
      
      // Local/dev broken IDs
      "vPhd5S8a6uY": "gpeqm1Ew3sE",
      "eunEItG4rA0": "Gxxwe9gdWzA",
      "X1Zf_xHw2B4": "v6HwOz6pyyI",
      "12345678901": "v6HwOz6pyyI"
    };
    
    // If it's already an embed URL, return it
    if (url.includes("youtube.com/embed") || url.includes("youtube-nocookie.com/embed")) {
      const matchEmbed = url.match(/embed\/([^?#]+)/);
      if (matchEmbed && brokenToWorkingMap[matchEmbed[1]]) {
         return `https://www.youtube-nocookie.com/embed/${brokenToWorkingMap[matchEmbed[1]]}?rel=0`;
      }
      return url;
    }

    // Regex to extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    let videoId = "";
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else if (url.length === 11 && !url.includes("://")) {
      videoId = url;
    }

    if (videoId) {
      if (brokenToWorkingMap[videoId]) {
        videoId = brokenToWorkingMap[videoId];
      }
      return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
    }

    return url; // Fallback to original URL
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* ... Hero Section & Overall Rating ... */}
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 bg-gradient-to-br from-primary via-primary/95 to-primary/90 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.panyaglobalmovers.com/extra-images/slider_bg2.webp')] bg-cover bg-center opacity-20" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
                Customer Reviews
              </h1>
              <p className="text-lg text-primary-foreground/80 mb-8">
                Read honest reviews from our satisfied customers. We take pride in delivering exceptional relocation services.
              </p>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => setShowWriteForm(true)}
                className="gap-2"
              >
                <PenLine className="w-5 h-5" />
                Write a Review
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Overall Rating Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card rounded-2xl p-8 shadow-lg border border-border"
              >
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                      <span className="text-5xl font-bold text-foreground">{avgRating}</span>
                      <div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">{totalReviews} reviews</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground">Based on customer feedback</p>
                  </div>

                  <div className="space-y-2">
                    {ratingBreakdown.map((item) => (
                      <div key={item.stars} className="flex items-center gap-3">
                        <span className="text-sm w-12">{item.stars} star</span>
                        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.percentage}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.1 * (5 - item.stars) }}
                            className="h-full bg-secondary rounded-full"
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-10">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="all" className="gap-2">
                    <Star className="w-4 h-4" />
                    All Reviews ({testimonials.length})
                  </TabsTrigger>
                  <TabsTrigger value="video" className="gap-2">
                    <Video className="w-4 h-4" />
                    Video ({videoTestimonials.length})
                  </TabsTrigger>
                  <TabsTrigger value="text" className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Written ({textTestimonials.length})
                  </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : displayedTestimonials.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-20"
                    >
                      <p className="text-muted-foreground mb-4">No reviews found in this category.</p>
                      <Button onClick={() => setShowWriteForm(true)} variant="outline">
                        Be the first to write a review!
                      </Button>
                    </motion.div>
                  ) : (
                    <TabsContent value={activeTab} className="space-y-6">
                      {displayedTestimonials.map((testimonial, index) => (
                        <motion.div
                          key={testimonial.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border"
                        >
                          {/* Video Embed */}
                          {testimonial.is_video && testimonial.video_url && (
                            <div className="aspect-video bg-muted border-b border-border">
                              <iframe
                                src={getYoutubeEmbedUrl(testimonial.video_url)}
                                title={`Video testimonial by ${testimonial.name}`}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          )}

                          <div className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {testimonial.avatar_url ? (
                                  <img src={testimonial.avatar_url} alt={testimonial.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                ) : (
                                  <span className="text-xl font-bold text-primary">
                                    {testimonial.name.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
                                  {testimonial.role && (
                                    <span className="text-sm text-muted-foreground">{testimonial.role}</span>
                                  )}
                                  {testimonial.is_video && (
                                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500">
                                      <Play className="w-3 h-3" />
                                      Video
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="flex gap-0.5">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                      <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                                    ))}
                                    {[...Array(5 - testimonial.rating)].map((_, i) => (
                                      <Star key={i} className="w-4 h-4 text-muted" />
                                    ))}
                                  </div>
                                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(testimonial.created_at).toLocaleDateString("en-IN", {
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </span>
                                  {testimonial.location && (
                                    <span className="text-sm text-muted-foreground">
                                      • {testimonial.location}
                                    </span>
                                  )}
                                </div>
                                <p className="text-muted-foreground mb-4">{testimonial.content}</p>

                                {/* Uploaded Media Gallery */}
                                {testimonial.media_urls && testimonial.media_urls.length > 0 && (
                                  <div className="grid grid-cols-3 gap-2 mb-4 rounded-lg overflow-hidden">
                                    {testimonial.media_urls.map((media: MediaItem, mIdx: number) => (
                                      <div key={mIdx} className="aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                                        {media.type === "image" ? (
                                          <img src={media.url} alt={media.name} className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer" onClick={() => window.open(media.url, '_blank')} loading="lazy" decoding="async" />
                                        ) : (
                                          <video src={media.url} className="w-full h-full object-cover" controls preload="metadata" />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className="flex items-center gap-4 text-sm">
                                  <button
                                    onClick={() => handleHelpful(testimonial.id)}
                                    disabled={helpfulClicked.has(testimonial.id)}
                                    className={`flex items-center gap-1 transition-colors ${
                                      helpfulClicked.has(testimonial.id)
                                        ? "text-secondary"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                                  >
                                    <ThumbsUp
                                      className={`w-4 h-4 ${
                                        helpfulClicked.has(testimonial.id) ? "fill-current" : ""
                                      }`}
                                    />
                                    Helpful ({testimonial.helpful_count})
                                  </button>
                                </div>
                              </div>
                              <Quote className="w-8 h-8 text-primary/10 flex-shrink-0 hidden md:block" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </TabsContent>
                  )}
                </AnimatePresence>
              </Tabs>
            </div>
          </div>
        </section>

        {/* Write Review CTA */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-center"
            >
              <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
                Share Your Experience
              </h2>
              <p className="text-muted-foreground mb-6">
                Had a great experience with Panya Global? We'd love to hear from you! Your feedback helps us improve and helps others make informed decisions.
              </p>
              <Button
                size="lg"
                onClick={() => setShowWriteForm(true)}
                className="gap-2"
              >
                <PenLine className="w-5 h-5" />
                Write a Review
              </Button>
            </motion.div>
          </div>
        </section>

        <CTA />
      </main>

      <CityWiseLinks />
      <Footer />

      {/* Write Testimonial Modal */}
      <WriteTestimonialForm isOpen={showWriteForm} onClose={() => setShowWriteForm(false)} />
    </div>
  );
};

export default Reviews;
