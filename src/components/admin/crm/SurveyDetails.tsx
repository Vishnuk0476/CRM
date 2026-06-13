import { useState, useEffect } from "react";
import { X, Loader2, MapPin, Calendar, Clock, Video, User, CheckCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  surveyId: number;
  onClose: () => void;
  onUpdated: () => void;
}

export function SurveyDetails({ surveyId, onClose, onUpdated }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [estimatedVolume, setEstimatedVolume] = useState("");
  const [truckSize, setTruckSize] = useState("");
  const [inventoryNotes, setInventoryNotes] = useState("");
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);

  // Surveyor Assignment State
  const [surveyors, setSurveyors] = useState<any[]>([]);
  const [isEditingSurveyor, setIsEditingSurveyor] = useState(false);
  const [selectedSurveyor, setSelectedSurveyor] = useState("");
  const [assigningSurveyor, setAssigningSurveyor] = useState(false);

  useEffect(() => {
    fetch("/api/crm/users.php?role=salesperson,consultant,manager,super_admin,owner")
      .then(res => res.json())
      .then(json => { if (json.success) setSurveyors(json.data.users || []); });
  }, []);

  const fetchSurvey = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/crm/surveys.php?id=${surveyId}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        const s = json.data.survey;
        setData(s);
        // Map DB columns to frontend state
        if (s.total_area_sqft) setEstimatedVolume(s.total_area_sqft);
        if (s.vehicle_assigned) setTruckSize(s.vehicle_assigned);
        if (s.general_notes) setInventoryNotes(s.general_notes);
        if (s.special_packing_notes) setSpecialRequirements(s.special_packing_notes);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSurvey(); }, [surveyId]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const res = await fetch("/api/crm/surveys/checkin.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          survey_id: surveyId,
          estimated_volume_cft: estimatedVolume,
          vehicle_assigned: truckSize,
          inventory_notes: inventoryNotes,
          special_requirements: specialRequirements
        })
      });
      const json = await res.json();
      if (json.success) {
        onUpdated();
        fetchSurvey();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleAssignSurveyor = async () => {
    setAssigningSurveyor(true);
    try {
      const res = await fetch("/api/crm/surveys.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: surveyId, team_lead_id: selectedSurveyor ? parseInt(selectedSurveyor) : null })
      });
      const json = await res.json();
      if (json.success) {
        setIsEditingSurveyor(false);
        fetchSurvey();
        onUpdated();
      } else {
        alert(json.error || "Failed to assign surveyor");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAssigningSurveyor(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-emerald-500/5 to-transparent">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">Survey Details</h2>
              <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wider ${data.status === 'completed' ? 'bg-green-100 text-green-700' : data.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                {data.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Client: {data.client_name} • Case #{data.case_number}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-muted/30 p-3 rounded-lg border border-border">
              <p className="text-[10px] text-muted-foreground uppercase mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Date</p>
              <p className="text-sm font-semibold">{data.scheduled_date}</p>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg border border-border">
              <p className="text-[10px] text-muted-foreground uppercase mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Time</p>
              <p className="text-sm font-semibold">{data.scheduled_time || 'TBD'}</p>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg border border-border">
              <p className="text-[10px] text-muted-foreground uppercase mb-1 flex items-center gap-1"><Video className="w-3 h-3" /> Type</p>
              <p className="text-sm font-semibold capitalize">{data.survey_type}</p>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg border border-border relative group">
              <p className="text-[10px] text-muted-foreground uppercase mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Surveyor</p>
              {isEditingSurveyor ? (
                <div className="flex flex-col gap-2 mt-1">
                  <select 
                    value={selectedSurveyor} 
                    onChange={e => setSelectedSurveyor(e.target.value)}
                    className="w-full text-xs px-2 py-1 rounded border border-border bg-background"
                  >
                    <option value="">Select Surveyor...</option>
                    {surveyors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <div className="flex gap-1">
                    <Button size="sm" onClick={handleAssignSurveyor} disabled={assigningSurveyor} className="h-6 text-[10px] px-2 py-0 bg-emerald-600 hover:bg-emerald-700 text-white">Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditingSurveyor(false)} className="h-6 text-[10px] px-2 py-0">Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold line-clamp-1">{data.surveyor_name || 'Unassigned'}</p>
                  <button onClick={() => { setSelectedSurveyor(data.team_lead_id?.toString() || ""); setIsEditingSurveyor(true); }} className="text-[10px] text-blue-600 hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Change</button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-xl border border-border">
            <h3 className="font-bold text-sm mb-3">Address & Link</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  {data.survey_type === 'pre_move' || data.survey_type === 'physical' ? (
                    <p className="text-sm">{data.survey_address || "No address provided."}</p>
                  ) : (
                    <a href={data.meeting_link || "#"} target="_blank" className="text-sm text-blue-600 hover:underline break-all" rel="noopener noreferrer">
                      {data.meeting_link || "No meeting link provided."}
                    </a>
                  )}
                  {data.google_maps_link && (
                    <div>
                      <a href={data.google_maps_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-xs font-semibold border border-blue-200 transition-colors">
                        <MapPin className="w-3.5 h-3.5" /> Open Google Maps Live Location
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Survey Check-in
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Estimated Volume (CFT)</label>
                  <Input 
                    type="number" 
                    value={estimatedVolume} 
                    onChange={e => setEstimatedVolume(e.target.value)} 
                    disabled={data.status === 'completed'}
                    className="w-full"
                    placeholder="e.g. 450"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Est. Truck Size</label>
                  <Input 
                    type="text" 
                    value={truckSize} 
                    onChange={e => setTruckSize(e.target.value)} 
                    disabled={data.status === 'completed'}
                    className="w-full"
                    placeholder="e.g. 14ft, 17ft"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Inventory Notes (Articles, Boxes, etc.)</label>
                <Textarea 
                  value={inventoryNotes} 
                  onChange={e => setInventoryNotes(e.target.value)} 
                  disabled={data.status === 'completed'}
                  rows={4}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Special Handling Requirements</label>
                <Textarea 
                  value={specialRequirements} 
                  onChange={e => setSpecialRequirements(e.target.value)} 
                  disabled={data.status === 'completed'}
                  rows={2}
                />
              </div>

              {data.status !== 'completed' && (
                <div className="pt-2">
                  <Button 
                    onClick={handleCheckIn} 
                    disabled={checkingIn || !estimatedVolume}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {checkingIn ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Complete Survey & Save Results
                  </Button>
                  {!estimatedVolume && <p className="text-xs text-red-500 mt-2 text-center">Volume is required to complete the survey.</p>}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
