import { useState, useEffect } from "react";
import { X, Phone, Mail, MapPin, Calendar, IndianRupee, User, MessageSquare, Loader2, Clock, Edit, Send, CheckCircle, Truck, Package, ChevronRight, Briefcase, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LeadTimelineTab } from "./LeadTimelineTab";
import { GulfNRIBadge } from "./GulfNRIBadge";
import { LeadTemperatureBadge } from "./LeadTemperatureBadge";

interface LeadDetailProps {
  leadId: number;
  onClose: () => void;
  onUpdated: () => void;
  onEdit?: (leadData: any) => void;
}

const STATUS_COLORS: Record<string, string> = {
  enquiry: "bg-blue-500", quoted: "bg-purple-500", confirmed: "bg-green-500",
  in_transit: "bg-orange-500", completed: "bg-teal-500", cancelled: "bg-red-500",
};

const STATUS_STEPS = ["enquiry", "quoted", "confirmed", "in_transit", "completed"];

const LeadDetail = ({ leadId, onClose, onUpdated, onEdit }: LeadDetailProps) => {
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "timeline" | "quotations" | "followups" | "calls" | "surveys">("details");
  const [callNotes, setCallNotes] = useState("");
  const [callType, setCallType] = useState("outgoing");
  const [callDuration, setCallDuration] = useState("");
  const [savingCall, setSavingCall] = useState(false);
  const [fuDate, setFuDate] = useState("");
  const [fuType, setFuType] = useState("call");
  const [fuNotes, setFuNotes] = useState("");
  const [savingFu, setSavingFu] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Survey State
  const [surveyDate, setSurveyDate] = useState("");
  const [surveyTime, setSurveyTime] = useState("");
  const [surveyType, setSurveyType] = useState("pre_move");
  const [surveyPincode, setSurveyPincode] = useState("");
  const [surveyAddress, setSurveyAddress] = useState("");
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [savingSurvey, setSavingSurvey] = useState(false);

  const fetchLead = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/crm/leads.php?id=${leadId}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) setLead(json.data.lead);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchLead(); }, [leadId]);

  const handleAddCall = async () => {
    if (!callNotes.trim()) return;
    setSavingCall(true);
    try {
      await fetch("/api/crm/call-logs.php", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId, call_type: callType, duration_minutes: callDuration ? parseInt(callDuration) : null, notes: callNotes }),
      });
      setCallNotes(""); setCallDuration("");
      fetchLead();
    } catch {} finally { setSavingCall(false); }
  };

  const handleAddFollowUp = async () => {
    if (!fuDate) return;
    setSavingFu(true);
    try {
      await fetch("/api/crm/follow-ups.php", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId, follow_up_date: fuDate, follow_up_type: fuType, notes: fuNotes }),
      });
      setFuDate(""); setFuNotes("");
      fetchLead();
    } catch {} finally { setSavingFu(false); }
  };

  const handleCompleteFollowUp = async (fuId: number) => {
    try {
      await fetch("/api/crm/follow-ups.php", {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: fuId, status: "completed" }),
      });
      fetchLead();
    } catch {}
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (lead.status === newStatus) return;
    setUpdatingStatus(true);
    try {
      await fetch("/api/crm/leads.php", {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      });
      fetchLead();
      onUpdated();
    } catch {} finally { setUpdatingStatus(false); }
  };

  const handleCreateOrder = async () => {
    setCreatingOrder(true);
    try {
      const res = await fetch("/api/crm/orders.php", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      fetchLead();
      onUpdated();
    } catch (err: unknown) {
      alert("Error: " + err.message);
    } finally { setCreatingOrder(false); }
  };

  const handleScheduleSurvey = async () => {
    if (!surveyDate) return alert("Please select a date");
    setSavingSurvey(true);
    try {
      const res = await fetch("/api/crm/surveys.php", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          lead_id: leadId,
          client_name: lead?.customer_name,
          client_phone: lead?.phone,
          scheduled_date: surveyDate,
          scheduled_time: surveyTime || "09:00:00",
          survey_type: surveyType,
          survey_address: surveyAddress || lead?.origin_city || "",
          survey_pincode: surveyPincode,
          google_maps_link: googleMapsLink
        })
      });
      const json = await res.json();
      if (json.success) {
        alert(`Survey scheduled successfully! ID: ${json.data.survey_number}`);
        setSurveyDate(""); setSurveyTime(""); setSurveyAddress("");
        setSurveyPincode(""); setGoogleMapsLink("");
        fetchLead();
      } else {
        alert(json.error || "Failed to schedule survey");
      }
    } catch (err: unknown) {
      alert("Error: " + err.message);
    } finally { setSavingSurvey(false); }
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

  const generateWhatsAppLink = () => {
    if (!lead?.phone) return "#";
    const phone = lead.phone.replace(/\D/g, "");
    const msg = encodeURIComponent(
      `Hi ${lead.customer_name},\n\nThank you for contacting Panya Global Relocation.\n\nYour Quotation ID: ${lead.quotation_id}\nRoute: ${lead.pickup_city || ""} → ${lead.drop_city || ""}\n\nWe will keep you updated on your moving request.\n\nBest regards,\nPanya Global Relocation\npanyaglobal.in`
    );
    return `https://wa.me/${phone.startsWith("91") ? phone : "91" + phone}?text=${msg}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-violet-500/5 to-transparent">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{lead.customer_name}</h2>
              <GulfNRIBadge isGulfNri={lead.is_gulf_nri} />
              <LeadTemperatureBadge temperature={lead.temperature} />
              <span className={`w-2 h-2 rounded-full ml-1 ${STATUS_COLORS[lead.status] || "bg-gray-500"}`} />
              <span className="text-xs font-medium text-muted-foreground capitalize">{lead.status?.replace("_", " ")}</span>
            </div>
            <p className="text-xs text-muted-foreground font-mono">{lead.quotation_id}</p>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(lead)} className="h-8 gap-1 border-violet-200 text-violet-700 hover:bg-violet-50">
                <Edit className="w-3.5 h-3.5" /> Edit
              </Button>
            )}
            <a href={generateWhatsAppLink()} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-700 text-xs font-semibold border border-green-500/20 hover:bg-green-500/20 transition-colors">
              <Send className="w-3 h-3" /> WhatsApp
            </a>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-border flex gap-4 overflow-x-auto">
          {(["details", "timeline", "quotations", "followups", "calls", "surveys"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${activeTab === tab ? "border-violet-500 text-violet-600" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {tab === "details" ? "Details" : tab === "timeline" ? "Timeline" : tab === "quotations" ? "Quotations" : tab === "surveys" ? "Surveys" : tab === "followups" ? `Follow-ups (${lead.pending_followups || 0})` : `Calls (${lead.total_calls || 0})`}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === "details" && (
            <div className="space-y-6">
              
              {/* Status Stepper */}
              <div className="bg-muted/30 p-4 rounded-xl border border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Update Lead Status</p>
                <div className="flex flex-wrap items-center gap-2">
                  {STATUS_STEPS.map((s, i) => {
                    const isActive = lead.status === s;
                    const isPast = STATUS_STEPS.indexOf(lead.status) > i;
                    return (
                      <div key={s} className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          disabled={updatingStatus}
                          onClick={() => handleUpdateStatus(s)}
                          className={`h-8 px-3 rounded-full border text-xs font-semibold capitalize transition-all
                            ${isActive ? "bg-violet-500 text-white border-violet-600 shadow-md" : 
                              isPast ? "bg-violet-50 text-violet-700 border-violet-200" : 
                              "bg-background text-muted-foreground border-border hover:bg-muted"}`}
                        >
                          {isPast && <CheckCircle className="w-3.5 h-3.5 mr-1" />}
                          {s.replace("_", " ")}
                        </Button>
                        {i < STATUS_STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground/40" />}
                      </div>
                    );
                  })}
                  {lead.status === "cancelled" && (
                    <div className="ml-auto">
                      <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 text-xs font-bold">Cancelled</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Conversion Banner */}
              {lead.status === "confirmed" && !lead.order && (
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-green-700 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Lead Confirmed</h3>
                    <p className="text-xs text-green-600/80 mt-1">Ready to start operations? Convert this lead into an active order.</p>
                  </div>
                  <Button onClick={handleCreateOrder} disabled={creatingOrder} className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 whitespace-nowrap">
                    {creatingOrder ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Package className="w-4 h-4 mr-2" />}
                    Convert to Order
                  </Button>
                </div>
              )}
              {lead.order && (
                <div className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 p-5 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-violet-700 flex items-center gap-1.5"><Truck className="w-4 h-4" /> Active Order</h3>
                    <p className="text-xs text-violet-600/80 mt-1">This lead has been converted. Order: <strong>{lead.order.order_number}</strong></p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Phone, label: "Phone", value: lead.phone },
                  { icon: Phone, label: "Alternate Phone", value: lead.alternate_phone },
                  { icon: Mail, label: "Email", value: lead.email },
                  { icon: Briefcase, label: "Company", value: lead.company_name },
                  { icon: MapPin, label: "Route", value: `${lead.origin_city || lead.pickup_city || "—"} → ${lead.destination_city || lead.drop_city || "—"}` },
                  { icon: Calendar, label: "Shipping Date", value: lead.shipping_date || "Not set" },
                  { icon: Calendar, label: "Move Timeline", value: lead.move_timeline ? lead.move_timeline.replace('_', ' ') : "Not set" },
                  { icon: User, label: "Consultant", value: lead.assigned_to_name || lead.salesperson_name || "Unassigned" },

                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <item.icon className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-medium text-foreground capitalize">{item.value || "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-[10px] text-muted-foreground uppercase">Property</p>
                  <p className="text-sm font-medium text-foreground">{lead.property_type || "—"}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-[10px] text-muted-foreground uppercase">Load Type</p>
                  <p className="text-sm font-medium text-foreground">{lead.load_type || "—"}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-[10px] text-muted-foreground uppercase">Source</p>
                  <p className="text-sm font-medium text-foreground">{lead.lead_source || "—"}</p>
                </div>
              </div>
              {lead.notes && (
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-[10px] text-muted-foreground uppercase mb-1">Notes</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{lead.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "quotations" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Quotations</h3>
                <Button size="sm" onClick={() => {
                  window.dispatchEvent(new CustomEvent("crm-navigate", { detail: { section: "quotation-new", payload: { leadId: lead.id } } }));
                  onClose();
                }}>
                  Create Quotation
                </Button>
              </div>
              <div className="bg-muted/30 p-8 rounded-xl border border-dashed border-border text-center">
                <p className="text-sm text-muted-foreground">Click 'Create Quotation' to generate a new quote for this lead.</p>
              </div>
            </div>
          )}
          
          {activeTab === "timeline" && (
            <div className="p-2">
              <LeadTimelineTab leadId={leadId} />
            </div>
          )}

          {activeTab === "followups" && (
            <div className="space-y-4">
              {/* Add follow-up */}
              <div className="p-4 rounded-xl border border-dashed border-violet-500/30 bg-violet-500/5 space-y-3">
                <p className="text-xs font-semibold text-violet-700">Schedule Follow-up</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input type="date" value={fuDate} onChange={e => setFuDate(e.target.value)} />
                  <select value={fuType} onChange={e => setFuType(e.target.value)}
                    className="px-3 py-2 text-sm rounded-md border border-border bg-background">
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="visit">Visit</option>
                  </select>
                  <Button size="sm" onClick={handleAddFollowUp} disabled={savingFu || !fuDate}
                    className="bg-violet-500 text-white hover:bg-violet-600">
                    {savingFu ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Schedule"}
                  </Button>
                </div>
                <Input placeholder="Notes (optional)" value={fuNotes} onChange={e => setFuNotes(e.target.value)} />
              </div>

              {/* List */}
              <div className="space-y-2">
                {(lead.follow_ups || []).map((fu: any) => (
                  <div key={fu.id} className={`flex items-center gap-3 p-3 rounded-lg border ${fu.status === 'completed' ? 'bg-muted/30 border-border' : fu.follow_up_date < new Date().toISOString().slice(0, 10) ? 'bg-red-500/5 border-red-500/20' : 'bg-card border-border'}`}>
                    <Clock className={`w-4 h-4 flex-shrink-0 ${fu.status === 'completed' ? 'text-green-500' : fu.follow_up_date < new Date().toISOString().slice(0,10) ? 'text-red-500' : 'text-amber-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{fu.follow_up_date} — <span className="capitalize">{fu.follow_up_type}</span></p>
                      {fu.notes && <p className="text-xs text-muted-foreground">{fu.notes}</p>}
                    </div>
                    {fu.status === 'pending' && (
                      <Button size="sm" variant="outline" onClick={() => handleCompleteFollowUp(fu.id)} className="text-xs h-7">Done</Button>
                    )}
                    {fu.status === 'completed' && (
                      <span className="text-xs text-green-600 font-medium">✓ Done</span>
                    )}
                  </div>
                ))}
                {(!lead.follow_ups || lead.follow_ups.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">No follow-ups scheduled</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "calls" && (
            <div className="space-y-4">
              {/* Add call log */}
              <div className="p-4 rounded-xl border border-dashed border-violet-500/30 bg-violet-500/5 space-y-3">
                <p className="text-xs font-semibold text-violet-700">Log a Call</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select value={callType} onChange={e => setCallType(e.target.value)}
                    className="px-3 py-2 text-sm rounded-md border border-border bg-background">
                    <option value="outgoing">Outgoing</option>
                    <option value="incoming">Incoming</option>
                    <option value="missed">Missed</option>
                  </select>
                  <Input type="number" placeholder="Duration (min)" value={callDuration} onChange={e => setCallDuration(e.target.value)} />
                  <Button size="sm" onClick={handleAddCall} disabled={savingCall || !callNotes.trim()}
                    className="bg-violet-500 text-white hover:bg-violet-600">
                    {savingCall ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Log Call"}
                  </Button>
                </div>
                <Textarea placeholder="Call notes..." value={callNotes} onChange={e => setCallNotes(e.target.value)} rows={2} />
              </div>

              {/* List */}
              <div className="space-y-2">
                {(lead.call_logs || []).map((cl: any) => (
                  <div key={cl.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <Phone className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold capitalize text-foreground">{cl.call_type}</span>
                        {cl.duration_minutes && <span className="text-xs text-muted-foreground">{cl.duration_minutes} min</span>}
                        <span className="text-xs text-muted-foreground ml-auto">{cl.created_at_formatted}</span>
                      </div>
                      {cl.notes && <p className="text-xs text-muted-foreground mt-1">{cl.notes}</p>}
                    </div>
                  </div>
                ))}
                {(!lead.call_logs || lead.call_logs.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">No call logs yet</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "surveys" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="w-5 h-5 text-emerald-600" />
                  <p className="text-sm font-bold text-emerald-700">Schedule a New Survey</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Survey Date</label>
                      <Input type="date" value={surveyDate} onChange={e => setSurveyDate(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Survey Time</label>
                      <Input type="time" value={surveyTime} onChange={e => setSurveyTime(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Survey Type</label>
                      <select value={surveyType} onChange={e => setSurveyType(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background">
                        <option value="pre_move">Pre-Move Survey (Physical)</option>
                        <option value="virtual">Virtual Survey (Video Call)</option>
                        <option value="self">Self Survey (Form)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Pincode (Auto-fills Address)</label>
                      <Input type="text" placeholder="e.g. 110001" maxLength={6} value={surveyPincode} onChange={e => handlePincodeChange(e.target.value)} />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Survey Address (Optional)</label>
                    <Textarea placeholder="Enter full origin address" value={surveyAddress} onChange={e => setSurveyAddress(e.target.value)} rows={2} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Google Maps Link (Optional)</label>
                    <Input type="url" placeholder="Paste live location link here" value={googleMapsLink} onChange={e => setGoogleMapsLink(e.target.value)} />
                  </div>
                </div>
                
                <div className="flex justify-end pt-2">
                  <Button onClick={handleScheduleSurvey} disabled={savingSurvey || !surveyDate}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-md">
                    {savingSurvey ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <CheckCircle className="w-3.5 h-3.5 mr-2" />}
                    Confirm Schedule
                  </Button>
                </div>
              </div>

              <div className="text-center p-6 bg-muted/20 rounded-xl border border-border mt-4">
                <p className="text-sm text-muted-foreground">To view all surveys, please visit the main <strong className="text-foreground">Surveys</strong> tab in the sidebar.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
