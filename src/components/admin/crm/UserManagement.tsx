import { useState, useEffect } from "react";
import { UserPlus, Loader2, X, Save, Key, Menu, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const ROLES = [
  { value: "owner", label: "Owner / Director" },
  { value: "manager", label: "Manager" },
  { value: "salesperson", label: "Sales & Corporate" },
  { value: "operations", label: "Operations & Support" },
  { value: "accountant", label: "Accountant" },
  { value: "digital_marketing", label: "Digital Marketing" },
];

type PermissionLevel = "none" | "read" | "write" | "execute";
type PermissionMap = Record<string, PermissionLevel>;

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-green-100 text-green-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
];

const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<any>(null);
  const [form, setForm] = useState<{ name: string; email: string; role: string; password: string; permissions: PermissionMap; avatar: string }>({ 
    name: "", email: "", role: "salesperson", password: "", permissions: {}, avatar: "" 
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/users.php", { credentials: "include" });
      const json = await res.json();
      if (json.success) setUsers(json.data.users || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSave = async (isEdit: boolean) => {
    if (!form.name || !form.email) return;
    setSaving(true);
    try {
      const payload: any = { name: form.name, email: form.email, role: form.role, permissions: form.permissions, avatar: form.avatar };
      if (form.password) payload.password = form.password;
      if (isEdit) payload.id = showEdit.id;

      const res = await fetch("/api/crm/users.php", {
        method: isEdit ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      
      toast({ title: "Success", description: `User ${isEdit ? "updated" : "added"} successfully.` });
      setShowAdd(false);
      setShowEdit(null);
      setForm({ name: "", email: "", role: "salesperson", password: "", permissions: {}, avatar: "" });
      fetchUsers();
    } catch (e: unknown) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleToggleActive = async (id: number, currentStatus: number | undefined) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    
    // Optimistic update
    setUsers(users.map(u => u.id === id ? { ...u, is_active: newStatus } : u));
    
    try {
      const res = await fetch("/api/crm/users.php", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: newStatus }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
    } catch (e: unknown) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
      // Revert on failure
      setUsers(users.map(u => u.id === id ? { ...u, is_active: currentStatus } : u));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this team member?")) return;
    try {
      const res = await fetch(`/api/crm/users.php?id=${id}`, { method: "DELETE", credentials: "include" });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Deleted", description: "Team member removed." });
        fetchUsers();
      } else {
        toast({ title: "Error", description: json.error, variant: "destructive" });
      }
    } catch (e: unknown) {
      toast({ title: "Error", description: "Failed to delete user.", variant: "destructive" });
    }
  };

  const openEdit = (user: any) => {
    let perms: PermissionMap = {};
    if (user.permissions) {
      if (typeof user.permissions === 'string') {
        try {
          perms = JSON.parse(user.permissions);
        } catch { perms = {}; }
      } else if (Array.isArray(user.permissions)) {
        user.permissions.forEach((p: string) => { perms[p] = "execute"; });
      } else if (typeof user.permissions === 'object') {
        perms = user.permissions;
      }
    }
    setForm({ name: user.name, email: user.email, role: user.role, password: "", permissions: perms, avatar: user.avatar || "" });
    setShowEdit(user);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      setUploading(true);
      const res = await fetch("/api/upload.php", { method: "POST", body: formData, credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setForm(p => ({ ...p, avatar: json.data.url }));
        toast({ title: "Success", description: "Avatar uploaded." });
      } else {
        toast({ title: "Error", description: json.error || "Upload failed", variant: "destructive" });
      }
    } catch (e: unknown) {
      toast({ title: "Error", description: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const renderPermissions = (perms: any, role: string) => {
    if (role === 'super_admin' || role === 'owner') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded-md font-bold border border-amber-200 shadow-sm">
          👑 Full System Access
        </span>
      );
    }
    
    if (!perms) return <span className="text-[10px] text-muted-foreground italic bg-gray-50 px-2 py-1 rounded border">No custom access</span>;
    
    let parsed: Record<string, string> = {};
    if (typeof perms === 'string') {
      try { parsed = JSON.parse(perms); } catch {}
    } else if (Array.isArray(perms)) {
      perms.forEach((p: string) => parsed[p] = "execute");
    } else if (typeof perms === 'object') {
      parsed = perms;
    }

    let read = 0, write = 0, execute = 0;
    
    Object.values(parsed).forEach(level => {
      if (level === 'read') read++;
      if (level === 'write') write++;
      if (level === 'execute') execute++;
    });
    
    const total = read + write + execute;
    
    if (total === 0) return <span className="text-[10px] text-muted-foreground italic bg-gray-50 px-2 py-1 rounded border">No access</span>;

    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-foreground">
          {total} Module{total !== 1 ? 's' : ''}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {read > 0 && <span className="text-[9px] uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-bold">{read} Read</span>}
          {write > 0 && <span className="text-[9px] uppercase tracking-wider bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded font-bold">{write} Write</span>}
          {execute > 0 && <span className="text-[9px] uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-bold">{execute} Full</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header matching NocoBase aesthetic */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Team Management</h2>
      </div>

      <div className="bg-white dark:bg-card rounded-md border border-border shadow-sm">
        {/* Action Bar */}
        <div className="flex items-center justify-end gap-3 p-4 border-b border-border">
          <Button variant="outline" size="sm" onClick={fetchUsers} className="text-muted-foreground">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            size="sm"
            onClick={() => { setForm({ name: "", email: "", role: "salesperson", password: "Panya@2026", permissions: {}, avatar: "" }); setShowAdd(true); }} 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-none rounded-[4px]"
          >
            <UserPlus className="w-4 h-4 mr-2" /> New team member
          </Button>
        </div>

        {/* Minimal Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-muted/20 text-left">
                <th className="w-12 px-4 py-3 text-muted-foreground/50">
                  <div className="w-4 h-4 rounded border border-border bg-white" />
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground w-16">Avatar</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">User Details</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Role</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Permissions</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground w-24">Status</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">No team members found.</td>
                </tr>
              ) : (
                users.map((u, i) => (
                  <tr key={u.id} className="hover:bg-muted/30 group">
                    <td className="px-4 py-4 align-middle">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Menu className="w-4 h-4 opacity-30 group-hover:opacity-100 cursor-grab" />
                        <span className="text-xs font-medium">{i + 1}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      {u.avatar ? (
                        <img src={u.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover" loading="lazy" decoding="async" />
                      ) : (
                        <div className={`w-8 h-8 rounded-full ${getAvatarColor(u.name)} flex items-center justify-center font-bold text-xs`}>
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <div>
                        <p className="font-medium text-foreground text-sm">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle text-muted-foreground">
                      <span className="inline-flex px-2 py-0.5 bg-gray-50 border text-xs rounded-md">
                        {ROLES.find(r => r.value === u.role)?.label || u.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <div className="flex flex-wrap gap-1 max-w-[250px]">
                        {renderPermissions(u.permissions, u.role)}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <Switch 
                        checked={u.is_active === 1 || u.is_active === undefined}
                        onCheckedChange={() => handleToggleActive(u.id, u.is_active !== undefined ? u.is_active : 1)}
                        className="data-[state=checked]:bg-blue-600"
                      />
                    </td>
                    <td className="px-4 py-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => openEdit(u)} className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                        <button onClick={() => handleDelete(u.id)} className="text-blue-600 hover:text-blue-700 text-sm font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mock Pagination Footer */}
        <div className="flex items-center justify-end p-4 text-sm text-muted-foreground gap-4 border-t border-border">
          <span>Total {users.length} items</span>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded hover:bg-muted text-muted-foreground/50"><ChevronLeft className="w-4 h-4" /></button>
            <button className="px-2 py-1 rounded bg-blue-50 text-blue-600 font-medium border border-blue-200">1</button>
            <button className="p-1 rounded hover:bg-muted"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <select className="px-2 py-1 bg-transparent border border-border rounded text-sm outline-none">
            <option>20 / page</option>
            <option>50 / page</option>
            <option>100 / page</option>
          </select>
        </div>
      </div>

      {(showAdd || showEdit) && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-2 md:p-4 overflow-auto">
          <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-4xl my-4 md:my-8">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <h3 className="text-base font-bold truncate">{showEdit ? "Edit Team Member" : "New AI employee"}</h3>
              <Button variant="ghost" size="icon" onClick={() => { setShowAdd(false); setShowEdit(null); }} className="rounded-full h-8 w-8 shrink-0"><X className="w-4 h-4" /></Button>
            </div>
            
            <div className="p-3 md:p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  {form.avatar ? (
                    <img src={form.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border" loading="lazy" decoding="async" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground border">
                      <UserPlus className="w-6 h-6" />
                    </div>
                  )}
                  <input type="file" accept="image/*" id="avatarUpload" className="hidden" onChange={handleAvatarUpload} />
                  <label htmlFor="avatarUpload" className="absolute -bottom-1 -right-1 bg-white border shadow-sm p-1 rounded-full cursor-pointer hover:bg-gray-50 text-blue-600">
                    {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  </label>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Profile Avatar</span>
                  <span className="text-xs text-muted-foreground">Upload an image to customize the avatar</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold mb-1 block">Full Name</label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                <div><label className="text-xs font-semibold mb-1 block">Email (Login ID)</label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">Role / Position</label>
                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background">
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground mb-2">
                  <span className="inline-block w-3 h-3 bg-gray-200 rounded mr-1"></span>None
                  <span className="inline-block w-3 h-3 bg-blue-100 rounded ml-2 mr-1"></span>Read
                  <span className="inline-block w-3 h-3 bg-green-100 rounded ml-2 mr-1"></span>Write
                  <span className="inline-block w-3 h-3 bg-purple-100 rounded ml-2 mr-1"></span>Full
                </div>

                <div className="space-y-4">
                  {/* Admin Workspace Permissions */}
                  <div className="bg-muted/10 border border-border p-3 rounded-lg">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Admin Workspace
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {[
                        { id: 'dashboard', label: 'Main Dashboard' },
                        { id: 'analytics', label: 'Analytics' },
                        { id: 'inquiries', label: 'Inquiries & Contact' },
                        { id: 'quotes', label: 'Quote Submissions' },
                        { id: 'consignments', label: 'Web Consignments' },
                        { id: 'testimonials', label: 'Reviews & Testimonials' },
                        { id: 'blog', label: 'Blog Management' },
                        { id: 'newsletter', label: 'Newsletter' },
                        { id: 'brochures', label: 'Brochures' },
                        { id: 'logs', label: 'Activity Logs' },
                      ].map(mod => (
                        <div key={mod.id} className="flex items-center justify-between bg-background border border-border rounded px-2 py-1.5">
                          <span className="text-[11px] font-medium truncate" title={mod.label}>{mod.label}</span>
                          <select 
                            value={form.permissions[mod.id] || "none"}
                            onChange={(e) => setForm(p => ({ 
                              ...p, 
                              permissions: { ...p.permissions, [mod.id]: e.target.value as PermissionLevel }
                            }))}
                            className={`text-[10px] px-1 py-0.5 rounded border outline-none ${
                              form.permissions[mod.id] === "none" || !form.permissions[mod.id] ? "bg-gray-100 text-gray-500" :
                              form.permissions[mod.id] === "read" ? "bg-blue-100 text-blue-700 border-blue-200" :
                              form.permissions[mod.id] === "write" ? "bg-green-100 text-green-700 border-green-200" :
                              "bg-purple-100 text-purple-700 border-purple-200"
                            }`}
                          >
                            <option value="none">-</option>
                            <option value="read">R</option>
                            <option value="write">W</option>
                            <option value="execute">X</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CRM & Operations Permissions */}
                  <div className="bg-muted/10 border border-border p-3 rounded-lg">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                      CRM & Operations
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {[
                        { id: 'pipeline', label: 'CRM Pipeline' },
                        { id: 'leads', label: 'Leads' },
                        { id: 'cases', label: 'Cases & Jobs' },
                        { id: 'surveys', label: 'Site Surveys' },
                        { id: 'follow-ups', label: 'Follow-ups' },
                        { id: 'invoices', label: 'Finance & Invoices' },
                        { id: 'payments', label: 'Payments' },
                        { id: 'expenses', label: 'Expenses' },
                        { id: 'orders', label: 'Orders & LR Tracking' },
                        { id: 'fleet', label: 'Fleet & Drivers' },
                        { id: 'vendors', label: 'Vendors' },
                        { id: 'documents', label: 'Documents' },
                        { id: 'attendance', label: 'Attendance' },
                        { id: 'team-tasks', label: 'Team Tasks' },
                        { id: 'gst-report', label: 'GST Report' },
                        { id: 'social', label: 'Social Planner' },
                        { id: 'properties', label: 'Properties' },
                        { id: 'settings', label: 'App Settings' },
                        { id: 'users', label: 'Team Management' },
                      ].map(mod => (
                        <div key={mod.id} className="flex items-center justify-between bg-background border border-border rounded px-2 py-1.5">
                          <span className="text-[11px] font-medium truncate" title={mod.label}>{mod.label}</span>
                          <select 
                            value={form.permissions[mod.id] || "none"}
                            onChange={(e) => setForm(p => ({ 
                              ...p, 
                              permissions: { ...p.permissions, [mod.id]: e.target.value as PermissionLevel }
                            }))}
                            className={`text-[10px] px-1 py-0.5 rounded border outline-none ${
                              form.permissions[mod.id] === "none" || !form.permissions[mod.id] ? "bg-gray-100 text-gray-500" :
                              form.permissions[mod.id] === "read" ? "bg-blue-100 text-blue-700 border-blue-200" :
                              form.permissions[mod.id] === "write" ? "bg-green-100 text-green-700 border-green-200" :
                              "bg-purple-100 text-purple-700 border-purple-200"
                            }`}
                          >
                            <option value="none">-</option>
                            <option value="read">R</option>
                            <option value="write">W</option>
                            <option value="execute">X</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block">{showEdit ? "New Password (Optional)" : "Password"}</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="text" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="pl-9" placeholder={showEdit ? "Leave blank to keep current" : "Panya@2026"} />
                </div>
              </div>
            </div>

            <Button onClick={() => handleSave(!!showEdit)} disabled={saving} className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-b-xl rounded-t-none">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />} {showEdit ? "Save Changes" : "Create employee"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
