import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Calendar,
  ArrowRight,
  Clock,
  Search,
  Tag,
  Mail,
  Loader2,
  TrendingUp,
  BookOpen,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import CTASection from "@/components/CTASection";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { blogPosts } from "@/data/blogPosts";

const CATEGORY_COLORS: Record<string, string> = {
  "Moving Guide": "bg-blue-500",
  "Corporate Relocation": "bg-violet-500",
  "International Moving": "bg-indigo-600",
  "City Routes": "bg-emerald-600",
  "City Guide": "bg-teal-500",
  "Vehicle Transport": "bg-rose-500",
  "Default": "bg-primary"
};

const getCategoryColor = (cat: string) =>
  CATEGORY_COLORS[cat] ?? CATEGORY_COLORS["Default"];

const POSTS_PER_PAGE = 6;

export default function BlogIndex() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Scroll to top on page change or category change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, selectedCategory]);

  // Reset page when category or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Categories extraction
  const categories = useMemo(() => {
    const allCats = blogPosts.map((post) => post.category);
    return ["All", ...Array.from(new Set(allCats))];
  }, []);

  // Filter blog posts (excluding the first one from the grid if it's the featured post on 'All' view)
  const featuredPost = useMemo(() => {
    return blogPosts[0]; // First post acts as featured
  }, []);

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      // If we are on 'All' page, we hide the featured post from the grid
      const isFeatured = post.slug === featuredPost.slug;
      const matchesCategory =
        selectedCategory === "All"
          ? !isFeatured
          : post.category === selectedCategory;

      const matchesSearch =
        !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, featuredPost]);

  // Paginated posts
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));

  // Sidebar items
  const sidebarLatest = useMemo(() => {
    return blogPosts.slice(1, 5); // Next 4 posts
  }, []);

  const sidebarTrending = useMemo(() => {
    return [blogPosts[0], blogPosts[2], blogPosts[5]]; // Delhi Cost, International, and Gurgaon Guide
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setIsSubscribing(true);
    try {
      const res = await fetch("/api/newsletter/subscribe.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "blog_index" }),
      });
      const json = await res.json();
      if (!json.success) {
        if (json.message?.toLowerCase().includes("already")) {
          toast.info("You're already subscribed to our newsletter!");
          setEmail("");
          return;
        }
        throw new Error(json.message);
      }
      toast.success("Welcome! Check your inbox for a confirmation email.");
      setEmail("");
    } catch (error: any) {
      toast.error(error.message || "Failed to subscribe. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  // Structured Blog Schema
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Panya Global Relocation Blog",
    "description": "Expert guides on household shifting, office relocation, international moving, and car transport.",
    "publisher": {
      "@type": "Organization",
      "name": "Panya Global Relocation Pvt. Ltd.",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.panyaglobal.in/logo.png"
      }
    },
    "url": "https://www.panyaglobal.in/blog"
  };

  return (
    <div className="min-h-screen bg-[#f8fbff]">
      <Helmet>
        <title>Relocation Guide and Moving Tips Blog | Panya Global</title>
        <meta name="description" content="Expert guides on household shifting, office relocation, international moving, and car transport. Moving tips from Panya Global - 16+ years experience." />
        <link rel="canonical" href="https://www.panyaglobal.in/blog" />
        <script type="application/ld+json">
          {JSON.stringify(blogSchema)}
        </script>
      </Helmet>

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0f2444] to-[#0a1628]">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_20%,rgba(0,149,255,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_20%_80%,rgba(0,200,255,0.05),transparent_50%)]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 text-blue-400 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <BookOpen className="w-3.5 h-3.5" />
              Insights &amp; Shifting Intelligence
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight font-heading">
              Relocation Guides and{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">
                Moving Tips
              </span>
            </h1>
            <p className="text-gray-300 text-lg mb-10 font-sans max-w-2xl mx-auto">
              Expert relocation advice, cost breakdowns, and structural checklists to make your domestic or international move stress-free.
            </p>

            {/* Premium Search input */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search shifting checklists, guides, charges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-32 py-4.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white placeholder-gray-400 text-sm font-medium shadow-2xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
              <button className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-blue-400 transition">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Categories Bar */}
      <section className="sticky top-[72px] z-30 bg-white/85 backdrop-blur-md border-b border-gray-100 shadow-sm py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {categories.map((category) => (
              <button
                key={category}
                id={`category-tab-${category.replace(/\s+/g, "-").toLowerCase()}`}
                onClick={() => setSelectedCategory(category)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === category
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Card (Only visible on home / all-view and when search is clear) */}
      {selectedCategory === "All" && !searchQuery && currentPage === 1 && featuredPost && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">
                Featured relocation guide
              </span>
            </div>
            
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100 group transition-all duration-300 hover:shadow-blue-500/5">
              <Link to={`/blog/${featuredPost.slug}`} className="flex flex-col lg:flex-row min-h-[460px]">
                {/* Image */}
                <div className="lg:w-7/12 relative min-h-[280px] lg:min-h-full overflow-hidden">
                  <img
                    src={`/blog-images/${featuredPost.slug}-featured.webp`}
                    alt={featuredPost.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/80 lg:from-transparent to-transparent" />
                  <span className={`absolute top-6 left-6 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md ${getCategoryColor(featuredPost.category)}`}>
                    {featuredPost.category}
                  </span>
                </div>

                {/* Content */}
                <div className="lg:w-5/12 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-white to-[#fcfdff]">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-heading group-hover:text-blue-500 transition-colors leading-tight">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-600 text-sm md:text-base mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>

                  <div className="flex items-center gap-5 text-gray-400 text-xs mb-8">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(featuredPost.publishDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredPost.readTime}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-2 text-blue-500 font-bold text-sm group-hover:gap-3.5 transition-all">
                    Read Complete Guide <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Main Listing Section */}
      <section className="py-8 pb-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Grid layout */}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 font-heading">
                  {selectedCategory === "All" && !searchQuery ? "All Relocation Articles" : "Filtered Articles"}
                </h2>
                <span className="text-sm text-gray-400 font-sans">
                  Showing {filteredPosts.length} articles
                </span>
              </div>

              {filteredPosts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 p-8">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-semibold mb-2">No articles found</p>
                  <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                    We couldn't find any guides matching "{searchQuery}" in the {selectedCategory} category.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                    variant="outline"
                    className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all rounded-xl"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-8">
                  {paginatedPosts.map((post) => (
                    <article
                      key={post.slug}
                      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                    >
                      <Link to={`/blog/${post.slug}`} className="block flex-1">
                        {/* Image wrapper */}
                        <div className="relative h-52 overflow-hidden bg-gray-50">
                          <img
                            src={`/blog-images/${post.slug}-featured.webp`}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          <span className={`absolute bottom-4 left-4 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getCategoryColor(post.category)}`}>
                            {post.category}
                          </span>
                        </div>

                        {/* Card Content */}
                        <div className="p-6">
                          <h3 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2 group-hover:text-blue-500 transition-colors leading-snug font-heading">
                            {post.title}
                          </h3>
                          <p className="text-gray-500 text-sm mb-5 line-clamp-2 leading-relaxed">
                            {post.excerpt}
                          </p>
                        </div>
                      </Link>

                      {/* Card Footer */}
                      <div className="px-6 pb-6 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(post.publishDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readTime}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-xl text-xs font-bold transition ${
                          currentPage === pageNum
                            ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                            : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar layout */}
            <aside className="w-full lg:w-80 flex-shrink-0 space-y-8">
              {/* Trending stories */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider font-heading">
                    Trending Guides
                  </h3>
                </div>
                <div className="space-y-4">
                  {sidebarTrending.map((post) => (
                    <Link
                      key={post.slug}
                      to={`/blog/${post.slug}`}
                      className="flex gap-4 group cursor-pointer"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 relative">
                        <img
                          src={`/blog-images/${post.slug}-featured.webp`}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-500 transition-colors leading-snug font-sans">
                          {post.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-1 font-sans">{post.readTime}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sidebar Latest Articles */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider font-heading">
                    Recent Articles
                  </h3>
                </div>
                <div className="space-y-4">
                  {sidebarLatest.map((post) => (
                    <Link
                      key={post.slug}
                      to={`/blog/${post.slug}`}
                      className="flex gap-4 group cursor-pointer"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 relative">
                        <img
                          src={`/blog-images/${post.slug}-featured.webp`}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-500 transition-colors leading-snug font-sans">
                          {post.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-1 font-sans">
                          {new Date(post.publishDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mini newsletter */}
              <div className="bg-gradient-to-br from-[#0a1628] to-[#0f2444] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_80%_80%,rgba(0,149,255,0.15),transparent_60%)]" />
                <Mail className="w-8 h-8 mb-4 text-blue-400 relative z-10" />
                <h3 className="font-bold text-base mb-1 font-heading relative z-10">Stay Updated</h3>
                <p className="text-gray-300 text-xs mb-5 leading-relaxed font-sans relative z-10">
                  Get our verified checklists & shifting guides directly to your inbox.
                </p>
                <form onSubmit={handleSubscribe} className="space-y-3 relative z-10">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs outline-none focus:border-blue-500 transition"
                    disabled={isSubscribing}
                  />
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20"
                  >
                    {isSubscribing ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Joining…
                      </>
                    ) : (
                      <>
                        Subscribe <ChevronRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* CTA section integration */}
      <CTASection variant="default" page="blog" />

      <CityWiseLinks />
      <Footer />
    </div>
  );
}
