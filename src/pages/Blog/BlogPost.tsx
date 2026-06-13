import { useEffect, useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Calendar,
  User,
  ArrowLeft,
  Clock,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
  ChevronRight,
  BookOpen
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import CTASection from "@/components/CTASection";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import { blogPosts } from "@/data/blogPosts";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // Find current post
  const post = useMemo(() => {
    return blogPosts.find((p) => p.slug === slug);
  }, [slug]);

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!post && slug) {
      // If post not found, redirect to 404 or blog index
      toast.error("Relocation guide not found.");
      navigate("/blog", { replace: true });
    }
  }, [slug, post, navigate]);

  // Generate share URLs
  const currentUrl = useMemo(() => {
    return typeof window !== "undefined"
      ? window.location.href
      : `https://www.panyaglobal.in/blog/${slug}`;
  }, [slug]);

  const shareLinks = useMemo(() => {
    if (!post) return { facebook: "", twitter: "", linkedin: "" };
    const text = encodeURIComponent(post.title);
    const url = encodeURIComponent(currentUrl);
    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`,
    };
  }, [post, currentUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Recent/Recommended posts for sidebar
  const recommendedPosts = useMemo(() => {
    if (!post) return [];
    return blogPosts
      .filter((p) => p.slug !== post.slug)
      .slice(0, 4); // Show 4 other posts
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
        <Footer />
      </div>
    );
  }

  // Breadcrumb list schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.panyaglobal.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://www.panyaglobal.in/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `https://www.panyaglobal.in/blog/${post.slug}`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#f8fbff] text-gray-800 font-sans">
      <Helmet>
        <title>{post.metaTitle}</title>
        <meta name="description" content={post.metaDescription} />
        <link rel="canonical" href={`https://www.panyaglobal.in/blog/${post.slug}`} />
        
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.metaTitle} />
        <meta property="og:description" content={post.metaDescription} />
        <meta property="og:image" content={`https://www.panyaglobal.in/blog-images/${post.slug}-featured.webp`} />
        <meta property="og:url" content={`https://www.panyaglobal.in/blog/${post.slug}`} />
        <meta property="og:site_name" content="Panya Global" />
        <meta property="article:published_time" content={post.publishDate} />
        <meta property="article:author" content="Panya Global Relocation" />
        <meta property="article:section" content={post.category} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.metaTitle} />
        <meta name="twitter:description" content={post.metaDescription} />
        <meta name="twitter:image" content={`https://www.panyaglobal.in/blog-images/${post.slug}-featured.webp`} />
        
        {/* JSON-LD Schemas */}
        <script type="application/ld+json">
          {JSON.stringify(post.schema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      <Navbar />

      {/* Hero Header with Featured Image */}
      <div className="pt-24 bg-[#0a1628]">
        <div className="container mx-auto px-4 py-8 lg:py-16">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-sans uppercase tracking-wider">
            <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/blog" className="hover:text-blue-400 transition-colors">Blog</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-200 line-clamp-1">{post.title}</span>
          </nav>

          <div className="max-w-4xl">
            <span className="inline-block bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight font-heading">
              {post.title}
            </h1>

            {/* Meta tags */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-gray-400 font-sans border-t border-white/10 pt-6">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                By Panya Global Team
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Published {new Date(post.publishDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                })}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                {post.readTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image Banner */}
      <section className="relative -mt-1 bg-[#0a1628]">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/5 aspect-[1200/628] relative bg-gray-950">
            <img
              src={`/blog-images/${post.slug}-featured.webp`}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="py-16 pb-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12 items-start max-w-5xl mx-auto">
            {/* Main Article Text */}
            <div className="flex-1 min-w-0 w-full">
              {/* HTML Content Body */}
              <article
                className="prose prose-blue max-w-none blog-content
                  prose-headings:font-heading prose-headings:font-extrabold prose-headings:text-gray-900 prose-headings:leading-tight
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-gray-600 prose-p:leading-relaxed prose-p:text-base prose-p:mb-6
                  prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6
                  prose-li:text-gray-600 prose-li:text-base prose-li:mb-2
                  prose-strong:text-gray-900 prose-strong:font-bold
                  prose-a:text-blue-500 prose-a:underline hover:prose-a:text-blue-600 prose-a:font-semibold
                  prose-table:w-full prose-table:border-collapse prose-table:my-6
                  prose-th:border prose-th:border-gray-200 prose-th:bg-gray-50 prose-th:p-3 prose-th:text-left prose-th:font-semibold prose-th:text-sm
                  prose-td:border prose-td:border-gray-200 prose-td:p-3 prose-td:text-sm"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
              />

              {/* Social Share / Share bar */}
              <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Share2 className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold">Share this relocation guide:</span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={shareLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-white border border-gray-200 text-[#1877f2] hover:bg-gray-50 hover:scale-105 transition-all shadow-sm"
                    aria-label="Share on Facebook"
                  >
                    <Facebook className="w-4 h-4 fill-current" />
                  </a>
                  <a
                    href={shareLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-white border border-gray-200 text-[#1da1f2] hover:bg-gray-50 hover:scale-105 transition-all shadow-sm"
                    aria-label="Share on Twitter"
                  >
                    <Twitter className="w-4 h-4 fill-current" />
                  </a>
                  <a
                    href={shareLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-white border border-gray-200 text-[#0a66c2] hover:bg-gray-50 hover:scale-105 transition-all shadow-sm"
                    aria-label="Share on LinkedIn"
                  >
                    <Linkedin className="w-4 h-4 fill-current" />
                  </a>
                  <button
                    onClick={handleCopyLink}
                    className="p-3 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:scale-105 transition-all shadow-sm flex items-center justify-center"
                    aria-label="Copy Link"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Back to Blog */}
              <div className="mt-12">
                <Link to="/blog">
                  <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Blog Index
                  </Button>
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-80 flex-shrink-0 space-y-8">
              {/* Compact CTA Section sidebar */}
              <CTASection variant="compact" page="blog" />

              {/* Recent articles */}
              {recommendedPosts.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider font-heading mb-5 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    Related Articles
                  </h3>
                  <div className="space-y-4">
                    {recommendedPosts.map((rPost) => (
                      <Link
                        key={rPost.slug}
                        to={`/blog/${rPost.slug}`}
                        className="flex gap-4 group cursor-pointer"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 relative">
                          <img
                            src={`/blog-images/${rPost.slug}-featured.webp`}
                            alt={rPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-500 transition-colors leading-snug font-sans">
                            {rPost.title}
                          </h4>
                          <p className="text-[10px] text-gray-400 mt-1 font-sans">{rPost.readTime}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      <CityWiseLinks />
      <Footer />
    </div>
  );
}
