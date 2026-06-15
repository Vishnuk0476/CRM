import { useState, useEffect } from "react";
import { X, Loader2, MapPin, Calendar, Phone, Mail, User, CheckCircle, Package, ClipboardList, FileText, Receipt, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CaseMilestoneTracker } from "./CaseMilestoneTracker";
import { CaseFinancialSummary } from "./CaseFinancialSummary";
import { GulfNRIBadge } from "./GulfNRIBadge";
import { CaseAssignModal } from "./CaseAssignModal";

interface Props {
  caseId: number;
  onClose: () => void;
  onUpdated: () => void;
}

export function CaseDetail({ caseId, onClose, onUpdated }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Assignment State
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Survey State
  const [showSurveyForm, setShowSurveyForm] = useState(false);
  const [surveyDate, setSurveyDate] = useState("");
  const [surveyTime, setSurveyTime] = useState("");
  const [surveyType, setSurveyType] = useState("pre_move");
  const [surveyPincode, setSurveyPincode] = useState("");
  const [surveyAddress, setSurveyAddress] = useState("");
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [showPackingForm, setShowPackingForm] = useState(false);
  const [packingDate, setPackingDate] = useState("");
  const [savingPacking, setSavingPacking] = useState(false);
  const [savingSurvey, setSavingSurvey] = useState(false);

  const fetchCase = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/crm/cases/detail.php?id=${caseId}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePincodeChange = async (val: string) => {
    setSurveyPincode(val);
    if (val.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await res.json();
        if (data && data[0].Status === "Success") {
          const po = data[0].PostOffice[0];
          setSurveyAddress(prev => {
            const newAddr = `${po.Name}, ${po.District}, ${po.State}`;
            return prev ? `${prev}, ${newAddr}` : newAddr;
          });
        }
      } catch (e) {}
    }
  };

  useEffect(() => { fetchCase(); }, [caseId]);

  const handleMilestoneClick = async (milestone: string) => {
    if (!confirm(`Update case milestone to ${milestone.replace(/_/g, ' ')}?`)) return;
    try {
      const res = await fetch(`/api/crm/cases/update.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: caseId, milestone })
      });
      const data = await res.json();
      if (data.success) {
        onUpdated();
        fetchCase();
      } else {
        alert(data.error || "Failed to update milestone");
      }
    } catch (e) {
      alert("Network error");
    }
  };

  const handleScheduleSurvey = async () => {
    if (!surveyDate) return alert("Please select a date");
    setSavingSurvey(true);
    try {
      const res = await fetch("/api/crm/surveys.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "create",
          case_id: caseId,
          client_name: data?.case?.client_name,
          client_phone: data?.lead?.phone,
          scheduled_date: surveyDate,
          scheduled_time: surveyTime || "09:00:00",
          survey_type: surveyType,
          survey_address: surveyAddress || (data?.case?.origin_city) || "",
          survey_pincode: surveyPincode,
          google_maps_link: googleMapsLink
        })
      });
      const json = await res.json();
      if (json.success) {
        alert(`Survey scheduled successfully! ID: ${json.data.survey_number}`);
        setSurveyDate(""); setSurveyTime(""); setSurveyAddress("");
        setSurveyPincode(""); setGoogleMapsLink("");
        setShowSurveyForm(false);
      } else {
        alert(json.error || "Failed to schedule survey");
      }
    } catch (e) {
      alert("Network error");
    } finally { setSavingSurvey(false); }
  };

  const handleSchedulePacking = async () => {
    if (!packingDate) return alert("Please select a packing/move date");
    setSavingPacking(true);
    try {
      const res = await fetch("/api/crm/cases/update.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: caseId,
          move_date_confirmed: packingDate,
          milestone: "packing_scheduled"
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Packing scheduled successfully!");
        setShowPackingForm(false);
        onUpdated();
        fetchCase();
      } else {
        alert(data.error || "Failed to schedule packing");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setSavingPacking(false);
    }
  };

  const handleCreateQuote = () => {
    if (!data) return;
    const c = data.case;
    const l = data.lead;
    const draft = {
      form: {
        case_id: c.id,
        client_name: c.client_name,
        client_phone: l?.phone || "",
        client_email: l?.email || "",
        origin_city: c.origin_city || "",
        destination_city: c.destination_city || "",
        bhk_type: c.bhk_type || "",
        discount_type: "amount",
        discount_value: 0,
        payment_terms: "1. Payment is due within 7 days of invoice date.\n2. Goods are insured only if explicitly stated in writing.\n3. This quotation is valid for 15 days from the date of issue.",
        terms_and_conditions: "1. Payment is due within 7 days of invoice date.\n2. Goods are insured only if explicitly stated in writing.\n3. This quotation is valid for 15 days from the date of issue.",
        is_move_date_confirmed: false, lift_origin: false, lift_destination: false, lift_type: "",
        relocation_type: "Household Relocation", move_details: {}, insurances: [], gst_type: "18", inclusions: [], exclusions: [],
        is_inter_state: false, internal_notes: "", assigned_sales_id: c.assigned_sales_id || "",
        origin_pincode: "", destination_pincode: "", origin_address: "", destination_address: "",
        scope_intro_text: "encompass the following services: Standard relocation services as agreed upon."
      }
    };
    localStorage.setItem("quotation_draft", JSON.stringify(draft));
    window.dispatchEvent(new CustomEvent("crm-navigate", { detail: "quotation-new" }));
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!data) return null;

  const c = data.case;
  const lead = data.lead;

  const totalQuoted   = Number(c.total_quoted || 0);
  const totalInvoiced = data.invoices?.reduce((s: number, i: any) => s + Number(i.grand_total || 0), 0) || Number(c.total_invoiced || 0);
  const totalPaid     = data.invoices?.reduce((s: number, i: any) => s + Number(i.amount_paid || 0), 0) || Number(c.total_collected || 0);
  const totalBalance  = Math.max(0, totalInvoiced - totalPaid);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-blue-500/5 to-transparent">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{c.client_name}</h2>
              <GulfNRIBadge isGulfNri={c.is_gulf_nri} />
              <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wider ${c.case_status === 'completed' ? 'bg-green-100 text-green-700' : c.case_status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-muted text-muted-foreground'}`}>
                {c.case_status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-1">Case #{c.case_number} • Lead L-PG-{String(c.lead_id).padStart(2, '0')}</p>
          </div>
          <div className="flex items-center gap-2">
            {c.case_status !== 'completed' && (
              <>
                <Button size="sm" variant="outline" className="bg-white border-violet-200 text-violet-700 hover:bg-violet-50" onClick={() => setShowAssignModal(true)}>
                  <User className="w-4 h-4 mr-2" /> Assign Team
                </Button>
                <Button size="sm" variant="outline" className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => { setShowSurveyForm(!showSurveyForm); setShowPackingForm(false); }}>
                  <ClipboardList className="w-4 h-4 mr-2" /> Schedule Survey
                </Button>
                <Button size="sm" variant="outline" className="bg-white border-orange-200 text-orange-700 hover:bg-orange-50" onClick={() => { setShowPackingForm(!showPackingForm); setShowSurveyForm(false); }}>
                  <Package className="w-4 h-4 mr-2" /> Schedule Packing
                </Button>
                <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20" onClick={handleCreateQuote}>
                  <FileText className="w-4 h-4 mr-2" /> Create Quote
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          <CaseMilestoneTracker 
            currentMilestone={c.milestone || 'inquiry_received'} 
            onMilestoneClick={handleMilestoneClick}
          />

          {showSurveyForm && (
            <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl space-y-4 shadow-inner">
              <p className="text-sm font-bold text-emerald-700">Schedule a New Survey for {c.client_name}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Survey Date</label>
                    <input type="date" value={surveyDate} onChange={e => setSurveyDate(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Survey Time</label>
                    <input type="time" value={surveyTime} onChange={e => setSurveyTime(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Survey Type</label>
                    <select value={surveyType} onChange={e => setSurveyType(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm bg-white">
                      <option value="pre_move">Pre-Move Survey (Physical)</option>
                      <option value="virtual">Virtual Survey (Video Call)</option>
                      <option value="self">Self Survey (Form)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Pincode (Auto-fills Address)</label>
                    <input type="text" placeholder="e.g. 110001" maxLength={6} value={surveyPincode} onChange={e => handlePincodeChange(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Survey Address</label>
                  <textarea placeholder="Enter full origin address" value={surveyAddress} onChange={e => setSurveyAddress(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" rows={2} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Google Maps Link (Optional)</label>
                  <input type="url" placeholder="Paste live location link here" value={googleMapsLink} onChange={e => setGoogleMapsLink(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={handleScheduleSurvey} disabled={savingSurvey || !surveyDate} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20">
                  {savingSurvey ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Confirm Schedule
                </Button>
              </div>
            </div>
          )}

          {showPackingForm && (
            <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl space-y-4 shadow-inner">
              <p className="text-sm font-bold text-orange-700">Schedule Packing / Move Date for {c.client_name}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Confirmed Move Date</label>
                  <input type="date" value={packingDate} onChange={e => setPackingDate(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm bg-white" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={handleSchedulePacking} disabled={savingPacking || !packingDate} className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20">
                  {savingPacking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Confirm Packing Schedule
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b pb-2"><Package className="w-4 h-4 text-blue-500" /> Move Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Origin</p>
                  <p className="text-sm font-medium">{c.origin_city}{c.origin_state ? `, ${c.origin_state}` : ''}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Destination</p>
                  <p className="text-sm font-medium">{c.destination_city}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Move Date</p>
                  <p className="text-sm font-medium">{c.move_date_expected || "TBD"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">BHK Type</p>
                  <p className="text-sm font-medium">{c.bhk_type || "TBD"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b pb-2"><User className="w-4 h-4 text-blue-500" /> Contact Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Phone</p>
                  <p className="text-sm font-medium">{c.client_phone || lead?.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Email</p>
                  <p className="text-sm font-medium">{c.client_email || lead?.email || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Sales Assigned</p>
                  <p className="text-sm font-medium">{c.assigned_sales_name || "Unassigned"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Manager</p>
                  <p className="text-sm font-medium">{c.assigned_manager_name || "Unassigned"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Linked Documents Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b pb-2">
              <FileText className="w-4 h-4 text-violet-500" /> Linked Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quotations */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  Quotations
                  <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">{data.quotations?.length || 0}</span>
                </h4>
                <div className="space-y-2">
                  {data.quotations && data.quotations.length > 0 ? (
                    data.quotations.map((q: any) => (
                      <div key={q.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{q.quotation_number}</p>
                          <p className="text-xs text-slate-500">₹{Number(q.grand_total).toLocaleString('en-IN')} • <span className="capitalize">{q.status}</span></p>
                        </div>
                        <a href={`/client/quote/${q.quotation_number}`} target="_blank" rel="noreferrer" className="text-violet-600 hover:text-violet-700 bg-violet-50 p-2 rounded-md transition-colors" title="View Client Portal Link">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No quotations generated yet.</p>
                  )}
                </div>
              </div>

              {/* Invoices */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5" /> Invoices
                  <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">{data.invoices?.length || 0}</span>
                </h4>
                <div className="space-y-2">
                  {data.invoices && data.invoices.length > 0 ? (
                    data.invoices.map((i: any) => (
                      <div key={i.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{i.invoice_number}</p>
                          <p className="text-xs text-slate-500">₹{Number(i.grand_total).toLocaleString('en-IN')} • <span className={`capitalize ${i.status === 'paid' ? 'text-green-600 font-medium' : ''}`}>{i.status}</span></p>
                        </div>
                        <a href={`/client/invoice/${i.invoice_number}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-700 bg-indigo-50 p-2 rounded-md transition-colors" title="View Client Portal Link">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No invoices generated yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <CaseFinancialSummary 
            caseId={caseId}
            invoices={data.invoices || []}
            quoted={totalQuoted} 
            invoiced={totalInvoiced}
            collected={totalPaid}
            pending={totalBalance}
            paymentFollowupDate={c.payment_followup_date}
            onUpdated={() => { fetchCase(); onUpdated(); }}
          />

        </div>
      </div>

      {showAssignModal && (
        <CaseAssignModal
          caseId={caseId}
          currentSalesId={c.assigned_sales_id}
          currentManagerId={c.assigned_manager_id}
          onClose={() => setShowAssignModal(false)}
          onAssigned={() => {
            setShowAssignModal(false);
            fetchCase();
            onUpdated();
          }}
        />
      )}
    </div>
  );
}
