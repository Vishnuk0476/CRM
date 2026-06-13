import { useState, useEffect, useRef } from "react";
import { ArrowLeft, FileText, CheckCircle2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { StepClientDetails } from "./StepClientDetails";
import { StepMoveDetails } from "./StepMoveDetails";
import { StepLineItems } from "./StepLineItems";
import { StepTerms } from "./StepTerms";
import { LiveCalculatorPanel } from "./LiveCalculatorPanel";
import { QuotationPDFTemplate } from "./QuotationPDFTemplate";

export interface LineItem {
  id?: number;
  service_name: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  gst_rate: number;
  line_total: number;
}

export interface QuotationForm {
  case_id: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  client_address: string;
  client_company: string;
  client_gst: string;
  origin_city: string;
  origin_state: string;
  destination_city: string;
  destination_state: string;
  bhk_type: string;
  move_date: string;
  valid_until: string;
  discount_type: "amount" | "percent";
  discount_value: number;
  payment_terms: string;
  notes: string;
  terms_and_conditions: string;
  is_move_date_confirmed: boolean;
  lift_origin: boolean;
  lift_destination: boolean;
  lift_type: string;
  relocation_type: string;
  move_details: any;
  insurances: { type: string; declared_value: number; percentage: number }[];
  gst_type: string;
  inclusions: string[];
  exclusions: string[];
  is_inter_state: boolean;
  quotation_number?: string;
  internal_notes?: string;
  assigned_sales_id?: string | number;
  origin_pincode?: string;
  destination_pincode?: string;
  origin_address?: string;
  destination_address?: string;
  scope_intro_text?: string;
}

const LOCAL_STORAGE_KEY = "quotation_draft";

const DEFAULT_TERMS = `1. Payment is due within 7 days of invoice date.
2. Goods are insured only if explicitly stated in writing.
3. This quotation is valid for 15 days from the date of issue.`;

export function QuotationBuilderWizard({ onBack, editId = null }: { onBack: () => void, editId?: number | null }) {
  const { toast } = useToast();
  const pdfRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { service_name: "", description: "", quantity: 1, unit: "job", unit_price: 0, gst_rate: 18, line_total: 0 }
  ]);
  const [form, setForm] = useState<QuotationForm>({
    case_id: "", client_name: "", client_phone: "", client_email: "",
    client_address: "", client_company: "", client_gst: "",
    origin_city: "", origin_state: "", destination_city: "", destination_state: "",
    bhk_type: "", move_date: "", valid_until: "",
    discount_type: "amount", discount_value: 0,
    payment_terms: DEFAULT_TERMS, notes: "", terms_and_conditions: DEFAULT_TERMS,
    is_move_date_confirmed: false, lift_origin: false, lift_destination: false, lift_type: "",
    relocation_type: "Household Relocation", move_details: {}, insurances: [], gst_type: "18", inclusions: [], exclusions: [],
    is_inter_state: false, internal_notes: "", assigned_sales_id: "",
    origin_pincode: "", destination_pincode: "", origin_address: "", destination_address: "",
    scope_intro_text: "encompass the following services: Standard relocation services as agreed upon."
  });

  useEffect(() => {
    if (editId) {
      // Fetch existing quotation
      fetch(`/api/crm/quotations/detail.php?id=${editId}`, { credentials: "include" })
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            setForm(prev => ({ ...prev, ...json.data, is_inter_state: json.data.igst_amount > 0 }));
            if (json.data.line_items && json.data.line_items.length > 0) {
              setLineItems(json.data.line_items);
            }
          }
        });
    } else {
      // Load draft from local storage if available
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.form) setForm(parsed.form);
          if (parsed.lineItems) setLineItems(parsed.lineItems);
        }
      } catch (e) {
        console.error("Failed to load quotation draft", e);
      }
    }
  }, [editId]);

  // Auto-save to local storage on changes (only if not editing)
  useEffect(() => {
    if (editId) return;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ form, lineItems }));
  }, [form, lineItems, editId]);

  const handleSave = async (isFinalize = false) => {
    if (!form.client_name) return toast({ title: "Client name required", variant: "destructive" });
    const validLines = lineItems.filter(l => l.service_name.trim());
    if (validLines.length === 0) return toast({ title: "At least one line item required", variant: "destructive" });

    setSaving(true);
    try {
      const url = editId ? "/api/crm/quotations/update.php" : "/api/crm/quotations/create.php";
      const method = editId ? "PUT" : "POST";
      const body = { ...form, line_items: validLines, force_update: isFinalize, id: editId };
      
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      
      if (json.success) {
        toast({ title: editId ? "Updated Successfully!" : "Created Successfully!" });
        if (!editId) {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
        // If we finalized, we might update form to hold the generated quotation number
        if (json.data && json.data.quotation_number) {
          setForm(prev => ({ ...prev, quotation_number: json.data.quotation_number }));
        }
        onBack();
      } else {
        toast({ title: "Failed to save", description: json.error, variant: "destructive" });
      }
    } catch (e: unknown) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const page1 = document.getElementById('pdf-page-1');
      const page2 = document.getElementById('pdf-page-2');
      if (!page1 || !page2) throw new Error("Could not find PDF pages.");

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      
      const imgData1 = await toPng(page1, { quality: 1, pixelRatio: 2, backgroundColor: '#ffffff' });
      pdf.addImage(imgData1, 'PNG', 0, 0, 210, 297);
      pdf.addPage();
      const imgData2 = await toPng(page2, { quality: 1, pixelRatio: 2, backgroundColor: '#ffffff' });
      pdf.addImage(imgData2, 'PNG', 0, 0, 210, 297);
      
      pdf.save(`Quotation_${form.quotation_number || "Draft"}.pdf`);
      toast({ title: "PDF Generated Successfully!" });
    } catch (e: unknown) {
      toast({ title: "PDF Generation Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const [showPreview, setShowPreview] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* --- PREVIEW MODAL --- */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-gray-900 overflow-y-auto no-print">
          <div className="sticky top-0 bg-gray-800 p-4 flex justify-between items-center text-white shadow-md z-50">
            <div>
              <h3 className="font-bold text-lg">Quotation Preview</h3>
              <p className="text-xs text-gray-300">This is exactly how it will look when printed/saved as PDF.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="text-black bg-white hover:bg-gray-100" onClick={() => setShowPreview(false)}>
                Close Preview
              </Button>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={handlePrint}>
                <Download className="w-4 h-4 mr-2" /> Print to PDF
              </Button>
            </div>
          </div>
          <div className="p-8 pb-32 flex justify-center w-full">
            <div className="bg-white shadow-2xl overflow-hidden rounded">
              <QuotationPDFTemplate ref={pdfRef} form={form} lineItems={lineItems} quotationNumber={form.quotation_number || "DRAFT"} />
            </div>
          </div>
        </div>
      )}
      
      {/* We need to inject the printable template natively for window.print() so it works properly */}
      <div className="hidden print:block">
        <QuotationPDFTemplate form={form} lineItems={lineItems} quotationNumber={form.quotation_number || "DRAFT"} />
      </div>

      <div className="flex items-center gap-3 mb-6 no-print">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <FileText className="w-6 h-6 text-violet-600" />
            {editId ? "Edit Quotation" : "New Quotation Wizard"}
          </h2>
          <p className="text-sm text-muted-foreground">Step {step} of 4</p>
        </div>
        
        {/* Preview Button */}
        {step === 4 && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="border-violet-300 text-violet-700 bg-violet-50 hover:bg-violet-100"
              onClick={() => setShowPreview(true)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Preview Document
            </Button>
            <Button 
              className="bg-violet-600 hover:bg-violet-700 text-white"
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Download PDF
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          {/* Steps Nav */}
          <div className="flex gap-2 border-b pb-3">
            {[1, 2, 3, 4].map(s => (
              <button 
                key={s} 
                onClick={() => setStep(s)}
                className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 ${step === s ? "border-violet-600 text-violet-700 bg-violet-50/50" : "border-transparent text-muted-foreground hover:bg-gray-50"}`}
              >
                Step {s}
              </button>
            ))}
          </div>

          {/* Forms */}
          {step === 1 && <StepClientDetails form={form} setForm={setForm} />}
          {step === 2 && <StepMoveDetails form={form} setForm={setForm} />}
          {step === 3 && <StepLineItems lineItems={lineItems} setLineItems={setLineItems} gstType={form.gst_type} />}
          {step === 4 && <StepTerms form={form} setForm={setForm} />}

          {/* Controls */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => step > 1 ? setStep(step - 1) : onBack()}>
              {step === 1 ? "Cancel" : "Back"}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" disabled={saving} onClick={() => handleSave(false)}>
                Save Draft
              </Button>
              {step < 4 ? (
                <Button onClick={() => setStep(step + 1)}>Next Step</Button>
              ) : (
                <Button className="bg-violet-600 hover:bg-violet-700 text-white" disabled={saving} onClick={() => handleSave(true)}>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Finalize Quotation
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Live Calculator Panel */}
        <div className="w-full lg:w-80 shrink-0 no-print">
          <LiveCalculatorPanel form={form} setForm={setForm} lineItems={lineItems} />
        </div>
      </div>
    </div>
  );
}
