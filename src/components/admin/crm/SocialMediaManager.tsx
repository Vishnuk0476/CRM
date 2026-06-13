import { useState, useEffect } from "react";
import { Share2, Calendar, Image as ImageIcon, Send, Clock, Edit2, Trash2, Layout, Loader2, Sparkles, TrendingUp, X, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

export function SocialMediaManager() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ platform: "facebook", content: "", scheduled_for: "", media_url: "" });

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/social.php", { credentials: "include" });
      const json = await res.json();
      if (json.success) setPosts(json.data.posts);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreate = async () => {
    if (!createForm.content || !createForm.scheduled_for) return alert("Content and date are required");
    setCreating(true);
    try {
      const res = await fetch("/api/crm/social.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm)
      });
      const json = await res.json();
      if (json.success) {
        setShowCreate(false);
        setCreateForm({ platform: "facebook", content: "", scheduled_for: "", media_url: "" });
        fetchPosts();
      } else {
        alert(json.error || "Failed");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch(platform) {
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      default: return <Share2 className="w-4 h-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch(platform) {
      case 'facebook': return 'bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20';
      case 'instagram': return 'bg-[#E4405F]/10 text-[#E4405F] border-[#E4405F]/20';
      case 'twitter': return 'bg-[#1DA1F2]/10 text-[#1DA1F2] border-[#1DA1F2]/20';
      case 'linkedin': return 'bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]/20';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 font-outfit tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <Share2 className="w-6 h-6" />
            </div>
            Social Planner
          </h2>
          <p className="text-gray-500 font-medium mt-2">Plan, schedule, and analyze posts across your brand channels.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 rounded-xl font-bold text-gray-700 bg-white hover:bg-gray-50 shadow-sm border-gray-200">
            <Layout className="w-4 h-4 mr-2 text-indigo-600" /> Calendar View
          </Button>
          <Button onClick={() => setShowCreate(true)} className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 font-bold px-6 transition-all active:scale-95">
            <Calendar className="w-4 h-4 mr-2" /> Schedule Post
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 font-outfit">Upcoming & Recent</h3>
            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">{posts.length} Posts</span>
          </div>
          
          <div className="space-y-4">
            <AnimatePresence>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-indigo-600 bg-white/60 backdrop-blur-xl rounded-3xl border border-gray-100">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <p className="font-medium">Loading posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-white/60 backdrop-blur-xl rounded-3xl border border-gray-100 p-12 text-center text-gray-500 flex flex-col items-center shadow-sm"
                >
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <Share2 className="w-10 h-10 text-indigo-300" />
                  </div>
                  <p className="text-xl font-bold text-gray-900 mb-2 font-outfit">No posts scheduled</p>
                  <p className="text-sm">Start planning your content to engage with your audience!</p>
                  <Button onClick={() => setShowCreate(true)} variant="outline" className="mt-6 rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold">
                    Create First Post
                  </Button>
                </motion.div>
              ) : (
                posts.map((post, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={post.id} 
                    className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-indigo-500/5 transition-all flex gap-5 group"
                  >
                    <div className="w-24 h-24 shrink-0 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
                      {post.media_url ? (
                        <img src={post.media_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" decoding="async" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-300" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border ${getPlatformColor(post.platform)}`}>
                          {getPlatformIcon(post.platform)}
                          {post.platform}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                            <Clock className="w-3.5 h-3.5 text-gray-400" /> 
                            {new Date(post.scheduled_for).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm ${
                            post.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {post.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm font-medium line-clamp-2 leading-relaxed">{post.content}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 p-6 shadow-sm sticky top-6">
            <h3 className="text-xl font-bold text-gray-900 font-outfit mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" /> Channel Insights
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1877F2]/5 to-[#1877F2]/10 border border-[#1877F2]/20 flex items-center justify-between group hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2]">
                    <Facebook className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-900">Facebook</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-[#1877F2] tracking-tight">450</span>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Followers</p>
                </div>
              </div>
              
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#E4405F]/5 to-[#E4405F]/10 border border-[#E4405F]/20 flex items-center justify-between group hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E4405F]/10 flex items-center justify-center text-[#E4405F]">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-900">Instagram</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-[#E4405F] tracking-tight">1.2k</span>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Followers</p>
                </div>
              </div>
              
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1DA1F2]/5 to-[#1DA1F2]/10 border border-[#1DA1F2]/20 flex items-center justify-between group hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1DA1F2]/10 flex items-center justify-center text-[#1DA1F2]">
                    <Twitter className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-900">Twitter / X</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-[#1DA1F2] tracking-tight">890</span>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Followers</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0A66C2]/5 to-[#0A66C2]/10 border border-[#0A66C2]/20 flex items-center justify-between group hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0A66C2]/10 flex items-center justify-center text-[#0A66C2]">
                    <Linkedin className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-900">LinkedIn</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-[#0A66C2] tracking-tight">320</span>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Followers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden my-8 border border-gray-100"
            >
              <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl font-outfit">Schedule New Post</h3>
                    <p className="text-xs text-gray-500 font-medium">Create content for your audience</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)} className="rounded-full hover:bg-gray-200">
                  <X className="w-5 h-5 text-gray-500" />
                </Button>
              </div>
              
              <div className="p-8 space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Platform</label>
                  <div className="relative">
                    <select 
                      className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                      value={createForm.platform}
                      onChange={e => setCreateForm({...createForm, platform: e.target.value})}
                    >
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="twitter">Twitter / X</option>
                      <option value="linkedin">LinkedIn</option>
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {getPlatformIcon(createForm.platform)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block flex items-center justify-between">
                    <span>Post Content *</span>
                    <span className="text-[10px] text-gray-400 normal-case">{createForm.content.length} characters</span>
                  </label>
                  <textarea 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] resize-none"
                    placeholder="What's on your mind? Add hashtags to boost reach."
                    value={createForm.content}
                    onChange={e => setCreateForm({...createForm, content: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Schedule Date & Time *</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                      type="datetime-local" 
                      className="h-12 pl-12 bg-gray-50 border-gray-200 focus-visible:ring-indigo-500 rounded-xl font-medium"
                      value={createForm.scheduled_for}
                      onChange={e => setCreateForm({...createForm, scheduled_for: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block flex items-center justify-between">
                    <span>Media URL</span>
                    <span className="text-[10px] text-gray-400 normal-case">Optional</span>
                  </label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                      type="url" 
                      placeholder="https://example.com/image.webp"
                      className="h-12 pl-12 bg-gray-50 border-gray-200 focus-visible:ring-indigo-500 rounded-xl"
                      value={createForm.media_url}
                      onChange={e => setCreateForm({...createForm, media_url: e.target.value})}
                    />
                  </div>
                  {createForm.media_url && (
                    <div className="mt-3 p-2 bg-gray-50 rounded-xl border border-gray-100 flex gap-3 items-center">
                      <img src={createForm.media_url} alt="Preview" className="w-12 h-12 rounded-lg object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      <span className="text-xs font-medium text-gray-500">Image Preview</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-[2rem]">
                <Button variant="outline" onClick={() => setShowCreate(false)} className="h-11 px-6 rounded-xl font-bold border-gray-200 text-gray-600 hover:bg-gray-100">Cancel</Button>
                <Button onClick={handleCreate} disabled={creating || !createForm.content || !createForm.scheduled_for} className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20">
                  {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />} Schedule Post
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
