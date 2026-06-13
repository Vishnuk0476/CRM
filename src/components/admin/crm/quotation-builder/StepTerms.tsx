import { useState, useEffect } from "react";
import { QuotationForm } from "./QuotationBuilderWizard";
import { Button } from "@/components/ui/button";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export function StepTerms({ form, setForm }: { form: QuotationForm, setForm: any }) {
  const [templates, setTemplates] = useState<any[]>([]);

  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['clean']
    ]
  };

  useEffect(() => {
    // Fetch T&C Templates
    fetch("/api/crm/settings/templates.php?type=tc&active=1")
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setTemplates(json.data);
        }
      })
      .catch(err => console.error("Failed to load templates", err));
  }, []);

  const handleApplyTemplate = (content: string) => {
    if (confirm("Replace current Terms & Conditions with this template?")) {
      setForm((f: any) => ({ ...f, terms_and_conditions: content }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="font-semibold text-lg text-foreground border-b pb-3 mb-5">4. Terms & Conditions</h3>
        
        {templates.length > 0 && (
          <div className="mb-4">
            <label className="text-sm font-medium text-muted-foreground block mb-2">Available Templates</label>
            <div className="flex flex-wrap gap-2">
              {templates.map(t => (
                <Button 
                  key={t.id} 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleApplyTemplate(t.content)}
                  className="bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100"
                >
                  Apply {t.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Scope Introduction Text</label>
            <div className="bg-background rounded-lg border border-input overflow-hidden">
              <ReactQuill 
                theme="snow"
                modules={quillModules}
                value={form.scope_intro_text || ""} 
                onChange={val => setForm((f: any) => ({...f, scope_intro_text: val}))} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Inclusions (per line)</label>
              <div className="bg-background rounded-lg border border-input overflow-hidden">
                <ReactQuill 
                  theme="snow"
                  modules={quillModules}
                  value={form.inclusions?.[0] || ""} 
                  onChange={val => setForm((f: any) => ({...f, inclusions: [val]}))} 
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Exclusions (per line)</label>
              <div className="bg-background rounded-lg border border-input overflow-hidden">
                <ReactQuill 
                  theme="snow"
                  modules={quillModules}
                  value={form.exclusions?.[0] || ""} 
                  onChange={val => setForm((f: any) => ({...f, exclusions: [val]}))} 
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Terms & Conditions</label>
            <div className="bg-background rounded-lg border border-input overflow-hidden">
              <ReactQuill 
                theme="snow"
                modules={quillModules}
                value={form.terms_and_conditions || ""} 
                onChange={val => setForm((f: any) => ({...f, terms_and_conditions: val}))} 
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Payment Schedule / Terms</label>
            <div className="bg-background rounded-lg border border-input overflow-hidden">
              <ReactQuill 
                theme="snow"
                modules={quillModules}
                value={form.payment_terms || ""} 
                onChange={val => setForm((f: any) => ({...f, payment_terms: val}))} 
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Internal Notes (Not shown on PDF)</label>
            <textarea 
              value={form.notes} 
              onChange={e => setForm((f: any) => ({...f, notes: e.target.value}))} 
              className="w-full min-h-[80px] p-3 rounded-lg border border-input bg-yellow-50/50 text-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none resize-y"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
