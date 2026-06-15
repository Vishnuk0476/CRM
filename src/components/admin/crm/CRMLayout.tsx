import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Kanban, FileText, Receipt, CreditCard, Truck,
  CalendarClock, Phone, ClipboardList, Wallet, BarChart3, Settings,
  ArrowLeft, ChevronRight, TrendingUp, Bell, Menu, X, Shield, Briefcase, Share2, Home, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CRMDashboard from "./CRMDashboard";
import LeadPipeline from "./LeadPipeline";
import LeadManagement from "./LeadManagement";
import { CasesList } from "./CasesList";
import { SurveysList } from "./SurveysList";
import { AttendanceDashboard } from "./AttendanceDashboard";
import FollowUpManager from "./FollowUpManager";
import InvoiceManagement from "./InvoiceManagement";
import PaymentTracker from "./PaymentTracker";
import ExpenseTracker from "./ExpenseTracker";
import TeamTasks from "./TeamTasks";
import OrderManagement from "./OrderManagement";
import GSTReport from "./GSTReport";
import FleetManagement from "./FleetManagement";
import UserManagement from "./UserManagement";
import { FinanceDashboard } from "./FinanceDashboard";
import { QuotationBuilder } from "./QuotationBuilder";
import { VendorsList } from "./VendorsList";
import { DocumentManager } from "./DocumentManager";
import { SocialMediaManager } from "./SocialMediaManager";
import { PropertyList } from "./PropertyList";
import { SettingsPage } from "./SettingsPage";
import { NotificationBell } from "./NotificationBell";
import { VendorPaymentsTracker } from "./VendorPaymentsTracker";
import CRMGuideReport from "./CRMGuideReport";

interface CRMLayoutProps {
  onClose: () => void;
  adminRole: string;
  userPermissions?: string[];
}

const NAV_SECTIONS = [
  {
    title: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: null, perm: null }, // everyone sees dashboard
      { id: "guide", label: "CRM Guide", icon: BookOpen, badge: null, perm: null },
    ],
  },
  {
    title: "Sales & CRM",
    items: [
      { id: "pipeline",   label: "Pipeline",        icon: Kanban,        badge: null,       perm: "pipeline" },
      { id: "leads",      label: "Leads",            icon: Users,         badge: null,       perm: "leads" },
      { id: "cases",      label: "Cases & Jobs",     icon: Briefcase,     badge: null,       perm: "cases" },
      { id: "surveys",    label: "Site Surveys",     icon: ClipboardList, badge: null,       perm: "surveys" },
      { id: "follow-ups", label: "Follow-ups",       icon: CalendarClock, badge: "followups",perm: "follow-ups" },
    ],
  },
  {
    title: "Finance & Accounts",
    items: [
      { id: "finance-dashboard", label: "Finance Overview", icon: BarChart3,  badge: null, perm: "invoices" },
      { id: "quotations",        label: "Quotations",        icon: FileText,   badge: null, perm: "invoices" },
      { id: "invoices",          label: "Invoices",          icon: Receipt,    badge: null, perm: "invoices" },
      { id: "payments",          label: "Payments",          icon: CreditCard, badge: null, perm: "payments" },
      { id: "vendor-payments",   label: "Vendor Payments",   icon: Wallet,     badge: null, perm: "expenses" },
      { id: "expenses",          label: "Expenses",          icon: Wallet,     badge: null, perm: "expenses" },
    ],
  },
  {
    title: "Operations",
    items: [
      { id: "orders",    label: "Order & LR Tracking", icon: Truck,     badge: null, perm: "orders" },
      { id: "fleet",     label: "Fleet & Drivers",     icon: Truck,     badge: null, perm: "fleet" },
      { id: "vendors",   label: "Vendors & Partners",  icon: Users,     badge: null, perm: "vendors" },
      { id: "documents", label: "Documents",            icon: FileText,  badge: null, perm: "documents" },
    ],
  },
  {
    title: "Team & HR",
    items: [
      { id: "attendance",  label: "Attendance & Visits", icon: CalendarClock, badge: null, perm: "attendance" },
      { id: "team-tasks",  label: "Team Tasks",           icon: FileText,      badge: null, perm: "team-tasks" },
    ],
  },
  {
    title: "Reports",
    items: [
      { id: "gst-report", label: "GST Report", icon: BarChart3, badge: null, perm: "gst-report" },
    ],
  },
  {
    title: "Marketing & Assets",
    items: [
      { id: "social-media", label: "Social Planner",   icon: Share2, badge: null, perm: "social" },
      { id: "properties",   label: "Property Listings", icon: Home,   badge: null, perm: "properties" },
    ],
  },
  {
    title: "Settings",
    items: [
      { id: "users",    label: "Team Management", icon: Shield,   badge: null, perm: "users" },
      { id: "settings", label: "App Settings",    icon: Settings, badge: null, perm: "settings" },
    ],
  },
];


const CRMLayout = ({ onClose, adminRole, userPermissions = [] }: CRMLayoutProps) => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [navPayload, setNavPayload] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleNav = (e: any) => {
      if (typeof e.detail === 'string') {
        setActiveSection(e.detail);
        setNavPayload(null);
      } else if (e.detail && e.detail.section) {
        setActiveSection(e.detail.section);
        setNavPayload(e.detail.payload || null);
      }
    };
    window.addEventListener("crm-navigate", handleNav);
    return () => window.removeEventListener("crm-navigate", handleNav);
  }, []);

  // Permission-based visibility
  // perm: null → always visible to all authenticated users
  // perm: string → only visible if hasPerm(perm) returns true
  const hasPerm = (perm: string | null) => {
    if (perm === null) return true; // dashboard, etc.
    if (adminRole === "owner" || adminRole === "super_admin") return true;
    if (!userPermissions) return false;

    // Handle new object format { perm: 'read'|'write'|'execute' }
    if (typeof userPermissions === 'object' && !Array.isArray(userPermissions)) {
      const level = (userPermissions as any)[perm];
      return level === "read" || level === "write" || level === "execute";
    }

    // Handle legacy array format ['pipeline','leads',...]
    if (Array.isArray(userPermissions)) {
      return userPermissions.includes(perm);
    }

    return false;
  };

  // Access-denied component shown when a user navigates to a section they lack permission for
  const AccessDenied = () => (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
        <Shield className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">Access Denied</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        You don't have permission to view this section. Contact your administrator.
      </p>
    </div>
  );


  const filteredNavSections = NAV_SECTIONS.map(section => {
    const filteredItems = section.items.filter(item => hasPerm(item.perm));
    if (filteredItems.length === 0) return null;
    return { ...section, items: filteredItems };
  }).filter(Boolean) as typeof NAV_SECTIONS;


  const renderContent = () => {
    // Permission gate — prevents direct navigation to unauthorized sections
    const permMap: Record<string, string | null> = {
      dashboard:         null, // always
      guide:             null, // always
      pipeline:          "pipeline",
      leads:             "leads",
      cases:             "cases",
      surveys:           "surveys",
      "follow-ups":      "follow-ups",
      "finance-dashboard": "invoices",
      quotations:        "invoices",
      "quotation-new":   "invoices",
      invoices:          "invoices",
      payments:          "payments",
      "vendor-payments": "expenses",
      expenses:          "expenses",
      orders:            "orders",
      fleet:             "fleet",
      vendors:           "vendors",
      documents:         "documents",
      "team-tasks":      "team-tasks",
      tasks:             "team-tasks",
      attendance:        "attendance",
      "social-media":    "social",
      properties:        "properties",
      "gst-report":      "gst-report",
      settings:          "settings",
      users:             "users",
      team:              "users",
    };

    const requiredPerm = permMap[activeSection] ?? activeSection;
    if (!hasPerm(requiredPerm)) return <AccessDenied />;

    switch (activeSection) {
      case "dashboard":          return <CRMDashboard onNavigate={setActiveSection} />;
      case "guide":              return <CRMGuideReport />;
      case "pipeline":           return <LeadPipeline />;
      case "leads":              return <LeadManagement />;
      case "cases":              return <CasesList />;
      case "surveys":            return <SurveysList />;
      case "follow-ups":         return <FollowUpManager />;
      case "finance-dashboard":  return <FinanceDashboard onNavigate={setActiveSection} />;
      case "quotations":         return <QuotationBuilder onBack={() => setActiveSection("finance-dashboard")} />;
      case "quotation-new":      return <QuotationBuilder onBack={() => setActiveSection("quotations")} initialView="form" leadId={navPayload?.leadId} />;
      case "invoices":           return <InvoiceManagement />;
      case "payments":           return <PaymentTracker />;
      case "vendor-payments":    return <VendorPaymentsTracker />;
      case "expenses":           return <ExpenseTracker />;
      case "orders":             return <OrderManagement />;
      case "fleet":              return <FleetManagement />;
      case "vendors":            return <VendorsList />;
      case "documents":          return <DocumentManager />;
      case "team-tasks":         return <TeamTasks />;
      case "tasks":              return <TeamTasks />;
      case "attendance":         return <AttendanceDashboard />;
      case "social-media":       return <SocialMediaManager />;
      case "properties":         return <PropertyList />;
      case "gst-report":         return <GSTReport />;
      case "settings":           return <SettingsPage />;
      case "users":              return <UserManagement />;
      case "team":               return <UserManagement />;
      default:                   return <CRMDashboard onNavigate={setActiveSection} />;
    }
  };


  const currentItem = filteredNavSections.flatMap(s => s.items).find(i => i.id === activeSection);

  return (
    <div className="min-h-[80vh] flex flex-col print:min-h-0 print:h-auto">
      {/* CRM Header */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-3">
          {['super_admin', 'owner'].includes(adminRole) && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Admin</span>
              </Button>
              <div className="h-6 w-px bg-border" />
            </>
          )}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">CRM</h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5">Sales & Accounts</p>
            </div>
          </div>
        </div>

        {/* Mobile menu toggle */}
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      <div className="flex gap-6 flex-1 print:gap-0 print:block">
        {/* Sidebar — Desktop always visible, mobile toggleable */}
        <aside className={`
          ${sidebarOpen ? 'block' : 'hidden'} lg:block
          w-full lg:w-56 xl:w-60 flex-shrink-0
          fixed lg:relative inset-0 lg:inset-auto z-40 lg:z-auto
          bg-background/95 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none
          pt-4 lg:pt-0 px-4 lg:px-0 print:hidden
        `}>
          {/* Mobile close overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 lg:hidden -z-10" onClick={() => setSidebarOpen(false)} />
          )}

          <nav className="bg-card rounded-xl border border-border shadow-sm p-3 space-y-4 max-w-[280px] lg:max-w-none mx-auto lg:mx-0 lg:sticky lg:top-24">
            {filteredNavSections.map((section) => (
              <div key={section.title}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-2 mb-1.5">
                  {section.title}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`
                          w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium
                          transition-all duration-150 cursor-pointer group
                          ${isActive
                            ? 'bg-gradient-to-r from-violet-500/10 to-indigo-500/10 text-violet-700 border border-violet-500/20 shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          }
                        `}
                      >
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-violet-600' : ''}`} />
                        <span className="truncate">{item.label}</span>
                        {isActive && <ChevronRight className="w-3 h-3 ml-auto text-violet-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default CRMLayout;
