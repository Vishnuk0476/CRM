import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  X,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  Star,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { FileUpload } from "@/components/ui/FileUpload";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  image: string | null;
  read_time: string;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const categories = [
  "Moving Tips",
  "Corporate Moving",
  "International Moving",
  "Pet Relocation Tips",
  "Storage Solutions",
  "Cleaning Services",
  "Vehicle Transport",
  "Industry News",
];

interface BlogManagementProps {
  onClose: () => void;
}

const BlogManagement = ({ onClose }: BlogManagementProps) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    author: "Panya Team",
    image: "",
    read_time: "5 min read",
    featured: false,
    published: true,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blog/list.php?admin=1", { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setPosts(json.data?.posts || json.data || []);
      } else {
        toast.error("Failed to fetch blog posts");
      }
    } catch (err: unknown) {
      toast.error("Failed to fetch blog posts");
      console.error(err);
    }
    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: editingPost ? formData.slug : generateSlug(title),
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: "",
      author: "Panya Team",
      image: "",
      read_time: "5 min read",
      featured: false,
      published: true,
    });
    setEditingPost(null);
  };

  const openEditor = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        author: post.author,
        image: post.image || "",
        read_time: post.read_time,
        featured: post.featured,
        published: post.published,
      });
    } else {
      resetForm();
    }
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug || !formData.excerpt || !formData.content || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingPost) {
      try {
        const res = await fetch("/api/blog/update.php", {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingPost.id, ...formData, image: formData.image || null }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        toast.success("Post updated successfully");
        setShowEditor(false);
        resetForm();
        fetchPosts();
      } catch (err: unknown) {
        toast.error(err?.message || "Failed to update post");
      }
    } else {
      try {
        const res = await fetch("/api/blog/create.php", {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, image: formData.image || null }),
        });
        const json = await res.json();
        if (!json.success) {
          toast.error(json.message || "Failed to create post");
        } else {
          toast.success("Post created successfully");
          setShowEditor(false);
          resetForm();
          fetchPosts();
        }
      } catch (err: unknown) {
        toast.error("Failed to create post");
        console.error(err);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch("/api/blog/delete.php", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      toast.success("Post deleted successfully");
      fetchPosts();
    } catch (err: unknown) {
      toast.error(err?.message || "Failed to delete post");
    }
  };

  const togglePublished = async (post: BlogPost) => {
    try {
      const res = await fetch("/api/blog/update.php", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id, published: !post.published }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      toast.success(post.published ? "Post unpublished" : "Post published");
      fetchPosts();
    } catch { toast.error("Failed to update post status"); }
  };

  const toggleFeatured = async (post: BlogPost) => {
    try {
      const res = await fetch("/api/blog/update.php", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id, featured: !post.featured }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      toast.success(post.featured ? "Removed from featured" : "Marked as featured");
      fetchPosts();
    } catch { toast.error("Failed to update featured status"); }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || post.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: posts.length,
    published: posts.filter((p) => p.published).length,
    drafts: posts.filter((p) => !p.published).length,
    featured: posts.filter((p) => p.featured).length,
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Blog Management
            </span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {!showEditor ? (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-sm text-muted-foreground">Total Posts</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-secondary">{stats.published}</div>
                  <p className="text-sm text-muted-foreground">Published</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-accent">{stats.drafts}</div>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-primary">{stats.featured}</div>
                  <p className="text-sm text-muted-foreground">Featured</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => openEditor()}>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </div>

            {/* Posts Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredPosts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No posts found. Create your first blog post!
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPosts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium line-clamp-1">{post.title}</p>
                              <p className="text-xs text-muted-foreground">/{post.slug}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{post.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={post.published ? "default" : "secondary"}
                              className="cursor-pointer"
                              onClick={() => togglePublished(post)}
                            >
                              {post.published ? "Published" : "Draft"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleFeatured(post)}
                              className={post.featured ? "text-yellow-500" : "text-muted-foreground"}
                            >
                              <Star className={`h-4 w-4 ${post.featured ? "fill-current" : ""}`} />
                            </Button>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(post.created_at), "MMM d, yyyy")}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditor(post)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(post.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Editor Form */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {editingPost ? "Edit Post" : "Create New Post"}
              </h3>
              <Button variant="ghost" onClick={() => setShowEditor(false)}>
                Back to List
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="post-url-slug"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Author name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <div className="flex flex-col gap-2">
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/image.webp"
                  />
                  <FileUpload 
                    bucket="public"
                    folder="blog-images"
                    onUploadSuccess={(url) => {
                      setFormData({ ...formData, image: url });
                      toast.success("Image uploaded successfully");
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="read_time">Read Time</Label>
                <Input
                  id="read_time"
                  value={formData.read_time}
                  onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                  placeholder="5 min read"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt *</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief description of the post (shown in listings)"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content * (HTML supported)</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your blog post content here... HTML tags are supported."
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                />
                <Label htmlFor="published">Published</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
                <Label htmlFor="featured">Featured</Label>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setShowEditor(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingPost ? "Update Post" : "Create Post"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BlogManagement;
