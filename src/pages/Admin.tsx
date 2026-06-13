import { useState, useEffect, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  LogOut,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Package,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Loader2,
  X,
  Save,
  BarChart3,
  Users,
  History,
  Shield,
  Briefcase,
  Download,
  MessageSquare,
  Bell,
  Star,
  MoreHorizontal,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../hooks/useAuth";
import { useAuthFetch } from "../hooks/useAuthFetch";
import logo from "@/assets/logo-black.webp";
import FloatingChatWidget from "@/components/FloatingChatWidget";
import { AIChatbot } from "@/components/chat/AIChatbot";
const ServiceInquiriesManagement = lazy(() => import("@/components/admin/ServiceInquiriesManagement").then(m => ({ default: m.ServiceInquiriesManagement })));
const BlogManagement = lazy(() => import("@/components/admin/BlogManagement"));
const ContactMessagesManagement = lazy(() => import("@/components/admin/ContactMessagesManagement").then(m => ({ default: m.ContactMessagesManagement })));
const BrochureDownloadsManagement = lazy(() => import("@/components/admin/BrochureDownloadsManagement").then(m => ({ default: m.BrochureDownloadsManagement })));
const NewsletterManagement = lazy(() => import("@/components/admin/NewsletterManagement").then(m => ({ default: m.NewsletterManagement })));
const ActivityLogs = lazy(() => import("@/components/admin/ActivityLogs").then(m => ({ default: m.ActivityLogs })));
const StaffManagement = lazy(() => import("@/components/admin/StaffManagement").then(m => ({ default: m.StaffManagement })));
const TestimonialsManagement = lazy(() => import("@/components/admin/TestimonialsManagement").then(m => ({ default: m.TestimonialsManagement })));
const AnalyticsSection = lazy(() => import("@/components/admin/AnalyticsSection").then(m => ({ default: m.AnalyticsSection })));
const EventTrackingDashboard = lazy(() => import("@/components/admin/EventTrackingDashboard"));
import DashboardSummaryWidget from "@/components/admin/DashboardSummaryWidget";
import LiveVisitorWidget from "@/components/admin/LiveVisitorWidget";
import LeadsCalendar from "@/components/admin/LeadsCalendar";
const ConsignmentManagement = lazy(() => import("@/components/admin/ConsignmentManagement"));
const QuoteManagement = lazy(() => import("@/components/admin/QuoteManagement").then(m => ({ default: m.QuoteManagement })));
const CRMLayout = lazy(() => import("@/components/admin/crm/CRMLayout"));
const UserManagement = lazy(() => import("@/components/admin/crm/UserManagement"));


interface Lead {
  uid: string;
  id: string;
  lead_type: 'quote' | 'inquiry';
  reference_number: string;
  name: string;
  mobile: string;
  email: string;
  message: string | null;
  source: string;
  status: string;
  status_message: string | null;
  created_at: string;
  updated_at: string;
  created_at_formatted: string;
}

interface LeadCounts {
  total: number; pending: number; confirmed: number;
  in_progress: number; completed: number; quotes: number; inquiries: number;
}

const STATUS_MAP: Record<string, { label: string; dot: string; badge: string }> = {
  pending:     { label: 'Pending',     dot: 'bg-amber-500',  badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  reviewed:    { label: 'Reviewed',    dot: 'bg-blue-500',   badge: 'bg-blue-100  text-blue-700  border-blue-200'  },
  quoted:      { label: 'Quoted',      dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700 border-purple-200' },
  confirmed:   { label: 'Confirmed',   dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700 border-green-200' },
  in_progress: { label: 'In Progress', dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700 border-orange-200' },
  completed:   { label: 'Completed',   dot: 'bg-teal-500',   badge: 'bg-teal-100  text-teal-700  border-teal-200'  },
  cancelled:   { label: 'Cancelled',   dot: 'bg-red-500',    badge: 'bg-red-100   text-red-700   border-red-200'    },
};

const MODULE_PERMISSIONS: Record<string, string> = {
  dashboard: "dashboard",
  consignments: "consignments",
  reviews: "testimonials",
  newsletter: "newsletter",
  blog: "blog",
  quotes: "quotes",
  brochures: "brochures",
  inquiries: "inquiries",
  logs: "logs",
  staff: "users",
  analytics: "analytics",
  crm: "pipeline",
  contact: "inquiries",
};

// Check if user has ANY access (read/write/execute) to a module
const hasAccess = (userRole: string, userPermissions: any, requiredModule: string): boolean => {
  // Admin always has access
  if (userRole === "super_admin" || userRole === "owner") return true;
  
  // If no permissions object, no access
  if (!userPermissions || typeof userPermissions !== 'object') return false;
  
  // Check the permission level for this module
  const level = userPermissions[requiredModule];
  return level === "read" || level === "write" || level === "execute";
};

// Check if user can EDIT (write/execute) a module
const canEdit = (userRole: string, userPermissions: any, requiredModule: string): boolean => {
  if (userRole === "super_admin" || userRole === "owner") return true;
  if (!userPermissions || typeof userPermissions !== 'object') return false;
  const level = userPermissions[requiredModule];
  return level === "write" || level === "execute";
};

const hasPermission = hasAccess; // Backward compatibility alias

const getAccessibleModules = (userRole: string, userPermissions: any): string[] => {
  const modules: string[] = [];
  if (userRole === "super_admin" || userRole === "owner") {
    modules.push("Dashboard", "Consignments", "Reviews", "Newsletter", "Blog", "Quotes", "Brochures", "Inquiries", "Contact", "Logs", "Staff", "Analytics", "CRM");
  } else {
    if (hasPermission(userRole, userPermissions, "dashboard")) modules.push("Dashboard");
    if (hasPermission(userRole, userPermissions, "orders")) modules.push("Consignments");
    if (hasPermission(userRole, userPermissions, "testimonials")) modules.push("Reviews");
    if (hasPermission(userRole, userPermissions, "newsletter")) modules.push("Newsletter");
    if (hasPermission(userRole, userPermissions, "blog")) modules.push("Blog");
    if (hasPermission(userRole, userPermissions, "quotes")) modules.push("Quotes");
    if (hasPermission(userRole, userPermissions, "brochures")) modules.push("Brochures");
    if (hasPermission(userRole, userPermissions, "inquiries")) modules.push("Inquiries");
    if (hasPermission(userRole, userPermissions, "logs")) modules.push("Logs");
    if (hasPermission(userRole, userPermissions, "users")) modules.push("Staff");
    if (hasPermission(userRole, userPermissions, "analytics")) modules.push("Analytics");
    if (hasPermission(userRole, userPermissions, "pipeline") || hasPermission(userRole, userPermissions, "leads")) modules.push("CRM");
  }
  return modules;
};

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading: isLoading, logout: signOut } = useAuth();
  const isAuthenticated = !!user;
  const { authFetch } = useAuthFetch();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [counts, setCounts] = useState<LeadCounts>({ total:0, pending:0, confirmed:0, in_progress:0, completed:0, quotes:0, inquiries:0 });
  const [activeView, setActiveView] = useState<string>("dashboard");
  const [openAIChat, setOpenAIChat] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [deniedModule, setDeniedModule] = useState<string | null>(null);

  // Enforce security: Determine default view based on permissions
  useEffect(() => {
    if (!user) return;
    
    const role = user.role || '';
    const permissions = (typeof user.permissions === 'object' && !Array.isArray(user.permissions)) 
      ? user.permissions 
      : {};
    
    // If super_admin or owner, default to dashboard
    if (['super_admin', 'owner'].includes(role)) {
      return;
    }
    
    // Check if they have dashboard access
    const dashboardLevel = permissions['dashboard'];
    if (dashboardLevel === "read" || dashboardLevel === "write" || dashboardLevel === "execute") {
      return;
    }
    
    // If no dashboard but has CRM, default to CRM
    const pipelineLevel = permissions['pipeline'];
    const leadsLevel = permissions['leads'];
    if (pipelineLevel || leadsLevel) {
      setActiveView("crm");
      return;
    }
    
    // Check for other module permissions and redirect to first available
    const moduleOrder = [
      { key: 'orders', view: 'consignments' },
      { key: 'testimonials', view: 'reviews' },
      { key: 'newsletter', view: 'newsletter' },
      { key: 'blog', view: 'blog' },
      { key: 'quotes', view: 'quotes' },
      { key: 'brochures', view: 'brochures' },
      { key: 'inquiries', view: 'inquiries' },
      { key: 'logs', view: 'logs' },
      { key: 'users', view: 'staff' },
      { key: 'analytics', view: 'analytics' },
    ];
    
    for (const mod of moduleOrder) {
      const level = permissions[mod.key];
      if (level === "read" || level === "write" || level === "execute") {
        setActiveView(mod.view);
        return;
      }
    }
    
    // If no permissions at all, show access denied
    setDeniedModule("all modules");
  }, [user]);

  const isAdmin = ['super_admin', 'owner'].includes(user?.role || '');
  // Handle permissions - ensure it's always a proper object
  const userPermissions = (user?.permissions && typeof user.permissions === 'object') 
    ? user.permissions 
    : {};

  const handleViewChange = (view: string) => {
    const requiredPermission = MODULE_PERMISSIONS[view];
    if (requiredPermission && !hasPermission(user?.role || '', userPermissions, requiredPermission)) {
      const accessible = getAccessibleModules(user?.role || '', userPermissions);
      setDeniedModule(view);
      return;
    }
    setActiveView(view);
  };

  const closeDeniedModal = () => {
    setDeniedModule(null);
  };
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [unreadContactCount, setUnreadContactCount] = useState(0);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [pendingQuoteCount, setPendingQuoteCount] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate("/admin/login");
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchLeads();
      fetchUnreadContactCount();
      fetchPendingQuoteCount();
    }
  }, [isAuthenticated, user]);

  const fetchUnreadContactCount = async () => {
    try {
      const response = await authFetch("/api/contact-messages/list.php?unread=1", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        const msgs: unknown[] = data.data?.messages ?? [];
        setUnreadContactCount(msgs.filter((m: any) => !m.is_read).length);
      }
    } catch (err: unknown) {
      // Silently fail — badge just won't show
    }
  };

  const fetchPendingQuoteCount = async () => {
    try {
      const res = await authFetch("/api/quote-submissions/list.php?status=pending&limit=100", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setPendingQuoteCount(data.data?.pagination?.total ?? (data.data?.quotes?.length ?? 0));
      }
    } catch { /* Non-fatal */ }
  };

  const fetchLeads = async () => {
    setIsLoadingData(true);
    try {
      const response = await authFetch("/api/leads-list.php", { credentials: "include" });
      const data = await response.json();
      if (data.success) {
        setLeads(data.data.leads ?? []);
        setCounts(data.data.counts ?? counts);
      } else {
        throw new Error(data.error || "Failed to fetch leads");
      }
    } catch (err: unknown) {
      toast({ title: "Error", description: "Failed to fetch leads.", variant: "destructive" });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const openLeadDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setEditStatus(lead.status);
    setEditMessage(lead.status_message || "");
  };

  const closeLeadDetails = () => {
    setSelectedLead(null);
    setEditStatus("");
    setEditMessage("");
  };

  const handleUpdateLead = async () => {
    if (!selectedLead) return;
    setIsUpdating(true);
    // Route to the correct update endpoint based on lead type
    const endpoint = selectedLead.lead_type === 'quote'
      ? '/api/quote-submissions/update.php'
      : '/api/service-inquiries/update.php';
    try {
      const res  = await authFetch(endpoint, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedLead.id, status: editStatus, status_message: editMessage || null }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast({ title: 'Lead Updated', description: 'Status saved and customer notified.' });
      fetchLeads();
      closeLeadDetails();
    } catch {
      toast({ title: 'Update Failed', description: 'Could not update this lead.', variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.mobile || '').includes(searchTerm) ||
      lead.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.reference_number || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;

    const matchesDate = !dateFilter || lead.created_at.startsWith(dateFilter);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string,string> = {
      pending: "bg-yellow-500", reviewed: "bg-blue-500", quoted: "bg-purple-500",
      confirmed: "bg-green-500", in_progress: "bg-orange-500",
      completed: "bg-green-600", cancelled: "bg-red-500",
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${statusColors[status] || "bg-gray-500"}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // ── Time-based greeting ──────────────────────────────────────
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const getInitials = (name?: string) => {
    if (!name) return "A";
    return name.trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2);
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-background print:overflow-visible print:bg-white">
      {/* Dynamic Background Element */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 print:hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-pulse-slow delay-500" />
      </div>

      {/* Header */}
      <header className="glass sticky top-0 z-50 animate-fade-in-down shadow-sm print:hidden">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Panya Global" className="h-10 w-auto hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-bold text-gradient-primary text-xl">
                  Admin Workspace
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm shadow-primary/5">
                  <Shield className="w-3 h-3" />
                  {user?.name?.split(" ")[0] || "Administrator"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                System Online &middot; <span className="capitalize">{user?.role?.replace("_", " ") || "admin"}</span>
                {!isAdmin && (
                  <span className="ml-1 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    Limited Access
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Primary Actions (Always Visible) */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewChange("contact")}
              className="relative hidden sm:flex bg-background/50 hover:bg-primary/5 hover:text-primary transition-all border-primary/20 hover:border-primary/40"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden md:inline ml-1">Inbox</span>
              {unreadContactCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-secondary text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-secondary/40 border-2 border-background animate-bounce-gentle">
                  {unreadContactCount > 9 ? "9+" : unreadContactCount}
                </span>
              )}
            </Button>

            {/* More Menu for Mobile/Tablet */}
            {(isAdmin || hasPermission(user?.role || '', userPermissions, 'dashboard')) && (
              <div className="lg:hidden relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
                {showMoreMenu && (
                  <>
                    {/* Backdrop to close on outside click */}
                    <div className="fixed inset-0 z-[60]" onClick={() => setShowMoreMenu(false)} />
                    <div className="absolute top-full right-0 mt-2 w-52 bg-card rounded-xl shadow-2xl border border-border z-[70] py-2 max-h-[70vh] overflow-y-auto">
                      <div className="flex flex-col gap-0.5 px-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { handleViewChange("consignments"); setShowMoreMenu(false); }}
                          className="justify-start text-left px-3 py-2 text-sm"
                        >
                          <Truck className="w-4 h-4 mr-2" />
                          Consignments
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { handleViewChange("reviews"); setShowMoreMenu(false); }}
                          className="justify-start text-left px-3 py-2 text-sm"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Reviews
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { handleViewChange("newsletter"); setShowMoreMenu(false); }}
                          className="justify-start text-left px-3 py-2 text-sm"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Newsletter
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { handleViewChange("blog"); setShowMoreMenu(false); }}
                          className="justify-start text-left px-3 py-2 text-sm"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Blog
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { handleViewChange("quotes"); setShowMoreMenu(false); }}
                          className="justify-start text-left px-3 py-2 text-sm"
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Quotes
                          {pendingQuoteCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-tight">
                              {pendingQuoteCount}
                            </span>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { handleViewChange("brochures"); setShowMoreMenu(false); }}
                          className="justify-start text-left px-3 py-2 text-sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Brochures
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { handleViewChange("inquiries"); setShowMoreMenu(false); }}
                          className="justify-start text-left px-3 py-2 text-sm"
                        >
                          <Briefcase className="w-4 h-4 mr-2" />
                          Inquiries
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { handleViewChange("logs"); setShowMoreMenu(false); }}
                          className="justify-start text-left px-3 py-2 text-sm"
                        >
                          <History className="w-4 h-4 mr-2" />
                          Logs
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { handleViewChange("staff"); setShowMoreMenu(false); }}
                          className="justify-start text-left px-3 py-2 text-sm"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Staff
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { handleViewChange("analytics"); setShowMoreMenu(false); }}
                          className="justify-start text-left px-3 py-2 text-sm"
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Analytics
                        </Button>
                        <div className="h-px bg-border my-1" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { handleViewChange("crm"); setShowMoreMenu(false); }}
                          className="justify-start text-left px-3 py-2 text-sm font-semibold text-violet-600"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          CRM
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 2. Grouped Features - Visible only on Large Screens */}
            {(isAdmin || hasPermission(user?.role || '', userPermissions, 'dashboard')) && (
              <div className="hidden lg:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewChange("consignments")}
                  title="Consignment Tracking"
                >
                  <Truck className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewChange("reviews")}
                  title="Reviews & Testimonials"
                >
                  <Star className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewChange("newsletter")}
                  title="Newsletter Subscribers"
                >
                  <Mail className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewChange("blog")}
                  title="Blog Management"
                >
                  <FileText className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewChange("quotes")}
                  title={`Quote Submissions${pendingQuoteCount > 0 ? ` (${pendingQuoteCount} pending)` : ""}`}
                  className="relative"
                >
                  <Package className="w-4 h-4" />
                  {pendingQuoteCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center leading-none px-0.5">
                      {pendingQuoteCount > 9 ? "9+" : pendingQuoteCount}
                    </span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewChange("brochures")}
                  title="Brochure Downloads"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewChange("inquiries")}
                  title="Service Inquiries"
                >
                  <Briefcase className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewChange("logs")}
                  title="Activity Logs"
                >
                  <History className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewChange("staff")}
                  title="Staff Management"
                >
                  <Shield className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewChange("analytics")}
                  title="Analytics"
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewChange("events")}
                  title="Event Tracking & Visitor Analytics"
                >
                  <TrendingUp className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* CRM Button */}
            {(isAdmin || hasPermission(user?.role || '', userPermissions, 'pipeline') || hasPermission(user?.role || '', userPermissions, 'leads')) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewChange("crm")}
                className="hidden sm:flex bg-gradient-to-r from-violet-500/10 to-indigo-500/10 hover:from-violet-500/20 hover:to-indigo-500/20 border-violet-500/30 text-violet-700 font-semibold gap-1.5"
              >
                <TrendingUp className="w-4 h-4" />
                <span>CRM</span>
              </Button>
            )}

            {/* System Actions */}
            <Button variant="outline" size="sm" onClick={fetchLeads} className="bg-background/50 hover:bg-background transition-all border-border shadow-sm">
              <RefreshCw className="w-4 h-4 text-muted-foreground mr-1" />
              <span className="hidden md:inline">Sync</span>
            </Button>
            <Button variant="default" size="sm" onClick={handleSignOut} className="btn-glow shadow-md shadow-primary/20 gap-1.5 pl-3 pr-4 rounded-full">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10 print:p-0 print:m-0 print:w-full print:max-w-none">
        <Suspense fallback={<div className="flex justify-center p-12 print:hidden"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
        {!isAdmin && !hasPermission(user?.role || '', userPermissions, 'dashboard') ? (
          <CRMLayout onClose={() => setActiveView("dashboard")} adminRole={user?.role || ""} userPermissions={userPermissions} />
        ) : (
          <>
            {activeView === "dashboard" && (
              <>
                {/* ── Welcome Banner ──────────────────────────────────── */}
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl border border-primary/10 shadow-sm px-6 py-4 mb-4 flex items-center justify-between gap-4 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
                  <div className="flex items-center gap-4 relative z-10">
                    {/* Avatar with initials */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30 flex-shrink-0">
                      {getInitials(user?.name)}
                    </div>
                    <div>
                      <p className="text-lg font-heading font-bold text-foreground">
                        {getGreeting()}, <span className="text-gradient-primary">{user?.name?.split(" ")[0] || "Admin"}</span>! 👋
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        {" · "}
                        <span className="capitalize font-medium text-primary/70">{user?.role?.replace("_", " ") || "Admin"}</span>
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 text-xs font-semibold border border-green-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      System Online
                    </span>
                  </div>
                </motion.div>

                <DashboardSummaryWidget />
                
                <div className="mb-4">
                  <LiveVisitorWidget />
                </div>

                {/* ── RECENT LEADS TABLE ── */}
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-4">
                  <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-foreground">Recent Leads</p>
                      <p className="text-xs text-muted-foreground">Latest {Math.min(filteredLeads.length, 8)} of {filteredLeads.length} total</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={fetchLeads} className="h-7 px-2 text-muted-foreground">
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>
                      <span className="text-xs text-primary font-semibold cursor-pointer hover:underline" onClick={() => setActiveView("quotes")}>View all</span>
                    </div>
                  </div>

                  {/* Desktop: full table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/40 text-left">
                          <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">Name</th>
                          <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Type</th>
                          <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Source</th>
                          <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                          <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Date</th>
                          <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredLeads.slice(0, 8).map((lead) => {
                          const s = STATUS_MAP[lead.status] ?? STATUS_MAP.pending;
                          return (
                            <tr key={lead.uid} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => openLeadDetails(lead)}>
                              <td className="px-5 py-3.5">
                                <div>
                                  <p className="font-semibold text-foreground text-sm">{lead.name}</p>
                                  <p className="text-xs text-muted-foreground truncate max-w-[180px]">{lead.email}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${lead.lead_type === 'quote' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-purple-50 text-purple-600 border-purple-200'}`}>
                                  {lead.lead_type === 'quote' ? 'Quote' : 'Inquiry'}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                <p className="text-xs text-muted-foreground capitalize">{lead.source}</p>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-semibold ${s.badge}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                  {s.label}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                <p className="text-xs text-muted-foreground">{lead.created_at_formatted}</p>
                                <p className="text-[10px] text-muted-foreground/60 font-mono">{lead.reference_number}</p>
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <Button variant="ghost" size="sm" className="h-7 opacity-0 group-hover:opacity-100 transition-opacity text-primary text-xs">
                                  View →
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {filteredLeads.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                        <Package className="w-8 h-8 opacity-30" />
                        <p className="text-sm">No leads found.</p>
                      </div>
                    )}
                  </div>

{/* Mobile: card list */}
              <div className="md:hidden divide-y divide-border">
                {filteredLeads.slice(0, 5).map((lead) => {
                  const s = STATUS_MAP[lead.status] ?? STATUS_MAP.pending;
                  return (
                    <div key={lead.uid} onClick={() => openLeadDetails(lead)}
                      className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/30 cursor-pointer transition-colors group">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-foreground truncate">{lead.name}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${s.badge}`}>{s.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{lead.source} · {lead.email}</p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground rotate-[-90deg] opacity-0 group-hover:opacity-100 flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>

        {/* ── TWO COLUMN: Search/Filter leads list + Calendar ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* LEFT: search bar + full leads list */}
          <div className="xl:col-span-2 flex flex-col gap-4">
            <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search name, email, phone, reference, service…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 h-9 text-sm" />
                </div>
                <div className="flex gap-2">
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-9">
                    <option value="all">All Status</option>
                    {Object.entries(STATUS_MAP).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
                  </select>
                  {dateFilter && (
                    <button onClick={() => setDateFilter(null)}
                      className="px-3 py-1.5 h-9 text-xs rounded-lg border border-secondary/40 bg-secondary/10 text-secondary font-semibold flex items-center gap-1 hover:bg-secondary/20 transition-colors">
                      📅 {dateFilter} ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  {dateFilter ? `Leads on ${dateFilter}` : "All Leads"} <span className="text-muted-foreground font-normal ml-1">({filteredLeads.length})</span>
                </p>
                <Button variant="ghost" size="sm" onClick={fetchLeads} className="h-7 px-2 text-muted-foreground hover:text-foreground">
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>
              {filteredLeads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
                  <Package className="w-10 h-10 opacity-30" />
                  <p className="text-sm">{dateFilter ? `No leads on ${dateFilter}` : "No leads found matching your criteria."}</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredLeads.map((lead, idx) => {
                    const s = STATUS_MAP[lead.status] ?? STATUS_MAP.pending;
                    return (
                      <motion.div
                        key={lead.uid}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.025 }}
                        onClick={() => openLeadDetails(lead)}
                        className="flex items-center gap-3 px-4 py-3.5 hover:bg-primary/5 cursor-pointer transition-colors group"
                      >
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.dot}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm text-foreground truncate">{lead.name}</p>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${lead.lead_type === 'quote' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-purple-50 text-purple-600 border-purple-200'}`}>
                              {lead.lead_type === 'quote' ? 'Quote' : 'Inquiry'}
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${s.badge}`}>{s.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{lead.source} · {lead.email}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-xs font-mono text-muted-foreground">{lead.reference_number}</p>
                          <p className="text-xs text-muted-foreground">{lead.created_at_formatted}</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground rotate-[-90deg] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Calendar */}
          <div className="xl:col-span-1">
            <LeadsCalendar onDateFilter={setDateFilter} selectedDate={dateFilter} />
          </div>
        </div>

          </>
        )}


        
        {activeView === "consignments" && <ConsignmentManagement onClose={() => setActiveView("dashboard")} />}
        {activeView === "inquiries" && <ServiceInquiriesManagement onClose={() => setActiveView("dashboard")} />}
        {activeView === "contact" && <ContactMessagesManagement onClose={() => setActiveView("dashboard")} onUnreadCountChange={fetchUnreadContactCount} />}
        {activeView === "brochures" && <BrochureDownloadsManagement onClose={() => setActiveView("dashboard")} />}
        {activeView === "reviews" && <TestimonialsManagement isOpen={activeView === "reviews"} onClose={() => setActiveView("dashboard")} />}
        {activeView === "blog" && <BlogManagement onClose={() => setActiveView("dashboard")} />}
        {activeView === "quotes" && (
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
            <QuoteManagement onClose={() => setActiveView("dashboard")} />
          </div>
        )}
        {activeView === "newsletter" && <NewsletterManagement onClose={() => setActiveView("dashboard")} />}
        {activeView === "logs" && <ActivityLogs onClose={() => setActiveView("dashboard")} />}
        {activeView === "staff" && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-4xl p-8 relative max-h-[90vh] overflow-y-auto">
              <Button variant="ghost" size="icon" onClick={() => setActiveView("dashboard")} className="absolute right-4 top-4 z-10 hover:bg-destructive/10 hover:text-destructive rounded-full">
                <X className="w-5 h-5" />
              </Button>
              <UserManagement />
            </div>
          </div>
        )}
        {activeView === "analytics" && <AnalyticsSection onClose={() => setActiveView("dashboard")} />}
        {activeView === "events" && (
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
            <EventTrackingDashboard onClose={() => setActiveView("dashboard")} />
          </div>
        )}
        {activeView === "crm" && <CRMLayout onClose={() => setActiveView("dashboard")} adminRole={user?.role || ""} userPermissions={userPermissions} />}
          </>
        )}
        </Suspense>
      </main>

      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xl flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass rounded-2xl border border-primary/20 shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(213,55%,23%,0.15)] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary/10 to-transparent border-b border-primary/10 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">
                  {selectedLead.name}
                </h2>
                <p className="text-sm text-muted-foreground">Lead Details</p>
              </div>
              <Button variant="ghost" size="icon" onClick={closeLeadDetails} className="hover:bg-destructive/10 hover:text-destructive rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-8 overflow-y-auto">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-secondary" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium text-foreground">
                      {selectedLead.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <a 
                      href={`mailto:${selectedLead.email}`}
                      className="font-medium text-secondary hover:underline"
                    >
                      {selectedLead.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <a 
                      href={`tel:${selectedLead.mobile}`}
                      className="font-medium text-secondary hover:underline"
                    >
                      {selectedLead.mobile}
                    </a>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Source</p>
                    <p className="font-medium text-foreground capitalize">
                      {selectedLead.source}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message */}
              {selectedLead.message && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Additional Information
                  </h3>
                  <div className="text-sm text-foreground bg-primary/5 border border-primary/10 rounded-xl p-4 shadow-inner">
                    {selectedLead.message}
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div className="border-t border-border/50 pt-8 pb-2">
                <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                  Workflow & Status
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="quoted">Quoted</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Message
                    </label>
                    <Textarea
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      placeholder="Add a message for this lead..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-background/50 border-t border-border/50 px-6 py-4 flex justify-end gap-3 backdrop-blur-sm">
              <Button variant="ghost" onClick={closeLeadDetails} className="hover:bg-muted">
                Cancel
              </Button>
              <Button
                variant="hero"
                onClick={handleUpdateLead}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Floating Chat Widget removed from admin dashboard */}

      {/* Access Denied Modal */}
      {deniedModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDeniedModal} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-card border border-red-200 dark:border-red-900 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
          >
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600 dark:text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access <strong className="text-foreground">{deniedModule}</strong>.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Contact your administrator to request access.
            </p>
            <Button onClick={closeDeniedModal} className="w-full">
              Go Back
            </Button>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default Admin;
