import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Shield,
  ShieldCheck,
  Crown,
  User,
  Mail,
  Calendar,
  Loader2,
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  UserPlus,
  AlertTriangle,
  KeyRound,
  Briefcase,
  TrendingUp,
  Calculator,
  Settings,
  Headphones,
  Settings2,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface AdminUser {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  role: string;
  permissions?: Record<string, string>;
}

interface StaffManagementProps {
  onClose: () => void;
}

const roleConfig = {
  super_admin: {
    label: "Super Admin",
    description: "Full system access + admin management",
    icon: Crown,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  owner: {
    label: "Owner",
    description: "Full system ownership",
    icon: Crown,
    color: "text-amber-600",
    bgColor: "bg-amber-600/10",
    borderColor: "border-amber-600/30",
  },
  admin: {
    label: "Admin",
    description: "Full access to all features",
    icon: ShieldCheck,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  },
  manager: {
    label: "Manager",
    description: "Manage operations and sales",
    icon: Briefcase,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
  },
  salesperson: {
    label: "Sales",
    description: "Manage leads and quotes",
    icon: TrendingUp,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  accountant: {
    label: "Accountant",
    description: "Manage billing and invoices",
    icon: Calculator,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  operations: {
    label: "Operations",
    description: "Manage consignments",
    icon: Settings,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
  },
  support: {
    label: "Support",
    description: "Manage customer inquiries",
    icon: Headphones,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
  },
  staff: {
    label: "Staff",
    description: "Can view and update data",
    icon: Shield,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
};

const MODULES = [
  { id: "dashboard", label: "Dashboard" },
  { id: "consignments", label: "Consignments" },
  { id: "testimonials", label: "Reviews & Testimonials" },
  { id: "quotes", label: "Quotes" },
  { id: "inquiries", label: "Inquiries" },
  { id: "newsletter", label: "Newsletter" },
  { id: "blog", label: "Blog" },
  { id: "brochures", label: "Brochures" },
  { id: "users", label: "Staff & Users" },
  { id: "analytics", label: "Analytics" },
  { id: "pipeline", label: "CRM Pipeline" },
  { id: "attendance", label: "Attendance & Leaves" },
  { id: "logs", label: "Activity Logs" },
];

export const StaffManagement = ({ onClose }: StaffManagementProps) => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [showResetPw, setShowResetPw] = useState(false);

  // Permissions state
  const [permissionsId, setPermissionsId] = useState<string | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<Record<string, string>>({});

  // Create form state
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const isSuperAdmin = currentUser?.role === "super_admin";

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admins/list.php", { credentials: "include" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch");
      setAdmins(
        json.data.map((a: any) => ({
          id: a.id,
          email: a.email,
          full_name: a.full_name,
          created_at: a.created_at,
          role: a.role,
          permissions: typeof a.permissions === 'string' ? JSON.parse(a.permissions) : (a.permissions || {}),
        }))
      );
    } catch (err: unknown) {
      toast({ title: "Error", description: err.message || "Failed to load admins.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  // ─── Create Admin ──────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast({ title: "Missing Fields", description: "All fields are required.", variant: "destructive" });
      return;
    }
    if (createForm.password.length < 8) {
      toast({ title: "Weak Password", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    setIsCreating(true);
    try {
      const res = await fetch("/api/admins/update.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "create", ...createForm }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to create admin.");
      toast({ title: "Admin Created", description: `Account created for ${createForm.email}.` });
      setCreateForm({ name: "", email: "", password: "", role: "staff" });
      setShowCreate(false);
      fetchAdmins();
    } catch (err: unknown) {
      toast({ title: "Create Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  // ─── Update Role ───────────────────────────────────────
  const handleRoleChange = async (id: string, newRole: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admins/update.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "update_role", id, role: newRole }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to update role.");
      toast({ title: "Role Updated", description: json.message });
      fetchAdmins();
    } catch (err: unknown) {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  // ─── Update Permissions ────────────────────────────────
  const handleSavePermissions = async (id: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admins/update.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "update_permissions", id, permissions: editingPermissions }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to update permissions.");
      toast({ title: "Permissions Saved", description: json.message });
      setPermissionsId(null);
      fetchAdmins();
    } catch (err: unknown) {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const openPermissions = (admin: AdminUser) => {
    if (permissionsId === admin.id) {
      setPermissionsId(null);
    } else {
      setEditingPermissions(admin.permissions || {});
      setPermissionsId(admin.id);
      setResetPasswordId(null);
    }
  };

  // ─── Delete Admin ──────────────────────────────────────
  const handleDelete = async (id: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admins/update.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "delete", id }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to delete admin.");
      toast({ title: "Admin Deleted", description: json.message });
      setDeleteConfirm(null);
      fetchAdmins();
    } catch (err: unknown) {
      toast({ title: "Delete Failed", description: err.message, variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  // ─── Reset Password ──────────────────────────────────────
  const handleResetPassword = async (id: string) => {
    if (resetPassword.length < 8) {
      toast({ title: "Weak Password", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admins/update.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "reset_password", id, password: resetPassword }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to reset password.");
      toast({ title: "Password Reset", description: json.message });
      setResetPasswordId(null);
      setResetPassword("");
      setShowResetPw(false);
    } catch (err: unknown) {
      toast({ title: "Reset Failed", description: err.message, variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleInfo = (role: string) =>
    roleConfig[role as keyof typeof roleConfig] || roleConfig.staff;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">
                Staff & Roles Management
              </h2>
              <p className="text-sm text-muted-foreground">
                {isSuperAdmin ? "Manage team members and configure granular module permissions" : "View team members"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <Button size="sm" onClick={() => setShowCreate(true)} className="gap-2">
                <UserPlus className="w-4 h-4" /> New Staff
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Role Legend */}
        <div className="px-6 py-3 bg-muted/30 border-b border-border overflow-x-auto whitespace-nowrap hide-scrollbar">
          <div className="flex items-center gap-4">
            {Object.entries(roleConfig).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <div key={key} className="flex items-center gap-2 flex-shrink-0">
                  <div className={`w-6 h-6 rounded ${config.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-3 h-3 ${config.color}`} />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-foreground leading-tight">{config.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Create Form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-border overflow-hidden"
            >
              <form onSubmit={handleCreate} className="p-6 bg-primary/5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground text-sm">Create New Account</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Full Name *</label>
                    <Input
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      placeholder="e.g. Rajesh Kumar"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Email *</label>
                    <Input
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Password *</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={createForm.password}
                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                        placeholder="Min 8 characters"
                        required
                        minLength={8}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Role *</label>
                    <Select
                      value={createForm.role}
                      onValueChange={(v) => setCreateForm({ ...createForm, role: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roleConfig).map(([k, v]) => {
                          const Icon = v.icon;
                          return (
                            <SelectItem key={k} value={k}>
                              <div className="flex items-center gap-2">
                                <Icon className={`w-4 h-4 ${v.color}`} /> {v.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
                  <Button type="submit" size="sm" disabled={isCreating} className="gap-2">
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Create Account
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admin List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto opacity-30 mb-3" />
              <p className="text-sm">No accounts found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => {
                const info = getRoleInfo(admin.role);
                const Icon = info.icon;
                const isUpdating = updatingId === admin.id;
                const isSelf = String(admin.id) === String(currentUser?.id);
                const isMainSuperAdmin = admin.email === 'cartoonfunonly@gmail.com';

                return (
                  <div
                    key={admin.id}
                    className={`rounded-xl p-4 border transition-colors ${isSelf ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border"}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* User Info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-full ${info.bgColor} flex items-center justify-center shrink-0`}>
                          <Icon className={`w-5 h-5 ${info.color}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground truncate">
                              {admin.full_name || "Unknown User"}
                            </p>
                            {isSelf && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">YOU</span>
                            )}
                            {isMainSuperAdmin && !isSelf && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-semibold border border-amber-500/20">ROOT</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{admin.email || "No email"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Role Controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isSuperAdmin && !isSelf ? (
                          <>
                            <Select
                              value={admin.role}
                              onValueChange={(v) => handleRoleChange(admin.id, v)}
                              disabled={isUpdating || isMainSuperAdmin}
                            >
                              <SelectTrigger className="w-[145px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(roleConfig).map(([k, v]) => (
                                  <SelectItem key={k} value={k}>
                                    <div className="flex items-center gap-2">
                                      <v.icon className={`w-4 h-4 ${v.color}`} />
                                      {v.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {/* Permissions Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openPermissions(admin)}
                              disabled={isUpdating}
                              className={`h-9 w-9 ${permissionsId === admin.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                              title="Manage Permissions"
                            >
                              <Settings2 className="w-4 h-4" />
                            </Button>

                            {/* Delete Button */}
                            {deleteConfirm === admin.id ? (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDelete(admin.id)}
                                  disabled={isUpdating || isMainSuperAdmin}
                                  className="h-8 text-xs gap-1"
                                >
                                  {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertTriangle className="w-3 h-3" />}
                                  Confirm
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)} className="h-8 text-xs">
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteConfirm(admin.id)}
                                disabled={isUpdating || isMainSuperAdmin}
                                className="text-destructive hover:text-destructive h-9 w-9 disabled:opacity-30"
                                title={isMainSuperAdmin ? "Cannot delete Root Super Admin" : "Delete user"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}

                            {/* Reset Password Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setResetPasswordId(resetPasswordId === admin.id ? null : admin.id);
                                setResetPassword("");
                                setShowResetPw(false);
                                setPermissionsId(null);
                              }}
                              disabled={isUpdating}
                              className="text-amber-600 hover:text-amber-600 h-9 w-9"
                              title="Reset password"
                            >
                              <KeyRound className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-semibold ${info.bgColor} ${info.borderColor} ${info.color}`}>
                            <Icon className="w-3 h-3" />
                            {info.label}
                            {isSelf && " (You)"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Inline Reset Password Form */}
                    {resetPasswordId === admin.id && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-amber-500 shrink-0" />
                          <span className="text-xs font-semibold text-foreground">Reset Password for {admin.full_name || admin.email}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="relative flex-1">
                            <Input
                              type={showResetPw ? "text" : "password"}
                              value={resetPassword}
                              onChange={(e) => setResetPassword(e.target.value)}
                              placeholder="New password (min 8 chars)"
                              minLength={8}
                              className="pr-10 h-9 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setShowResetPw(!showResetPw)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showResetPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleResetPassword(admin.id)}
                            disabled={isUpdating || resetPassword.length < 8}
                            className="h-9 gap-1 text-xs"
                          >
                            {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <KeyRound className="w-3 h-3" />}
                            Reset
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setResetPasswordId(null); setResetPassword(""); }}
                            className="h-9 text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Inline Permissions Form */}
                    {permissionsId === admin.id && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                          <div className="flex items-center gap-2">
                            <Settings2 className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-sm font-semibold text-foreground">
                              Module Permissions
                            </span>
                          </div>
                          {(admin.role === 'super_admin' || admin.role === 'owner') && (
                            <span className="text-xs text-amber-600 bg-amber-600/10 px-2 py-1 rounded-md">
                              Super Admins/Owners bypass all restrictions
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
                          {MODULES.map(module => (
                            <div key={module.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-background border border-border">
                              <span className="text-xs font-medium">{module.label}</span>
                              <Select
                                value={editingPermissions[module.id] || "none"}
                                onValueChange={(val) => setEditingPermissions(p => ({ ...p, [module.id]: val }))}
                              >
                                <SelectTrigger className="h-7 text-xs w-[90px] px-2">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none"><span className="text-muted-foreground">Hidden</span></SelectItem>
                                  <SelectItem value="read"><span className="text-blue-500">Read</span></SelectItem>
                                  <SelectItem value="write"><span className="text-green-500">Read & Write</span></SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border/50">
                          <Button variant="outline" size="sm" onClick={() => setPermissionsId(null)}>
                            Cancel
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleSavePermissions(admin.id)}
                            disabled={isUpdating}
                            className="gap-2"
                          >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Save Permissions
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-muted/30 border-t border-border px-6 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
            <Lock className="w-3 h-3" />
            {isSuperAdmin
              ? "Super Admins can create accounts and configure granular access for all roles."
              : "Contact your Super Admin to manage accounts and permissions."}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StaffManagement;
