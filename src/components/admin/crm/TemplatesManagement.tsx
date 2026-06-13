import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: number;
  type: string;
  name: string;
  content: string;
  is_active: number;
}

export function TemplatesManagement() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{id?: number, type: string, name: string, content: string, is_active: number}>({
    type: "tc", name: "", content: "", is_active: 1
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/settings/templates.php", { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setTemplates(json.data);
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to load templates", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSave = async () => {
    if (!form.name || !form.content) {
      return toast({ title: "Name and Content are required", variant: "destructive" });
    }

    setSaving(true);
    try {
      const method = form.id ? "PUT" : "POST";
      const res = await fetch("/api/crm/settings/templates.php", {
        method, credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      
      if (json.success) {
        toast({ title: form.id ? "Template Updated" : "Template Created" });
        setIsEditing(false);
        fetchTemplates();
      } else {
        toast({ title: "Failed to save", description: json.error, variant: "destructive" });
      }
    } catch (e: unknown) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this template?")) return;
    try {
      const res = await fetch(`/api/crm/settings/templates.php?id=${id}`, {
        method: "DELETE", credentials: "include"
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Template Deleted" });
        fetchTemplates();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleActive = async (t: Template) => {
    try {
      await fetch("/api/crm/settings/templates.php", {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: t.id, is_active: t.is_active ? 0 : 1 })
      });
      fetchTemplates();
    } catch (e) {
      console.error(e);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-5">
        <div className="flex justify-between items-center border-b pb-4">
          <h3 className="font-bold text-lg">{form.id ? "Edit Template" : "New Template"}</h3>
          <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Template Type</label>
            <select 
              value={form.type} 
              onChange={e => setForm({...form, type: e.target.value})}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
            >
              <option value="tc">Terms & Conditions</option>
              <option value="inclusion">Inclusions</option>
              <option value="exclusion">Exclusions</option>
              <option value="payment_schedule">Payment Schedule</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Template Name</label>
            <Input 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              placeholder="e.g. Standard Local Move T&C"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-1 block">Content (HTML/Rich Text Supported)</label>
            <textarea 
              value={form.content} 
              onChange={e => setForm({...form, content: e.target.value})} 
              className="w-full min-h-[300px] p-3 font-mono text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="<ul><li>Payment is due...</li></ul>"
            />
            <p className="text-xs text-muted-foreground mt-1">You can use standard HTML tags like &lt;b&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;br&gt; to format the output.</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-violet-600 hover:bg-violet-700 text-white">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Template
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border">
        <div>
          <h3 className="font-bold">Quotation Templates</h3>
          <p className="text-sm text-muted-foreground">Manage reusable snippets for quotations.</p>
        </div>
        <Button onClick={() => {
          setForm({ type: "tc", name: "", content: "", is_active: 1 });
          setIsEditing(true);
        }} className="bg-violet-600 text-white hover:bg-violet-700">
          <Plus className="w-4 h-4 mr-1.5" /> Add Template
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-violet-500" /></div>
      ) : templates.length === 0 ? (
        <div className="text-center p-12 bg-card rounded-xl border border-dashed border-border text-muted-foreground">
          No templates found. Create your first one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(t => (
            <div key={t.id} className={`bg-card p-4 rounded-xl border transition-all ${t.is_active ? 'border-border' : 'border-dashed opacity-75'}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs font-bold uppercase text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">
                    {t.type}
                  </span>
                  <h4 className="font-bold mt-2">{t.name}</h4>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleToggleActive(t)} title="Toggle Active">
                    {t.is_active ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground line-clamp-3 mb-4 bg-muted/30 p-2 rounded">
                {t.content}
              </div>
              <div className="flex justify-end gap-2 border-t pt-3">
                <Button variant="ghost" size="sm" onClick={() => { setForm(t); setIsEditing(true); }}>
                  <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(t.id)}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
