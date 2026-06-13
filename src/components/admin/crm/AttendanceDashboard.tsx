import { useState, useEffect, useCallback, useRef } from "react";
import {
  Clock, MapPin, CheckCircle, UserCheck, LogOut, Calendar, Plus, X, Check, XCircle,
  Navigation, Camera, FileText, BarChart3, Settings, Briefcase, TrendingUp,
  AlertTriangle, Download, ChevronLeft, ChevronRight, Loader2, Home, Eye, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ── Types ──────────────────────────────────────────────────────
interface Attendance {
  id: number;
  attendance_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  time_in: string | null;
  time_out: string | null;
  hours_worked: number;
  status: string;
  selfie_path: string | null;
  notes: string | null;
  check_in_latitude: number | null;
  check_in_longitude: number | null;
}
interface LeaveBalance { type: string; label: string; quota: number; used: number; remaining: number; }
interface LeaveRequest {
  id: number; admin_id: number; leave_type: string; from_date: string; to_date: string;
  days_count: number; reason: string; status: string; rejection_reason: string | null;
  created_at: string; employee_name?: string; role?: string;
}
interface LiveMember {
  id: number; name: string; role: string; current_status: string;
  time_in: string | null; visit_client: string | null;
}
interface LiveSummary { checked_in: number; on_field: number; absent: number; on_leave: number; total: number; }
interface FieldVisit {
  id: number; visit_date: string; date_formatted: string; client_name: string;
  visit_purpose: string; visit_notes: string | null; kilometers_traveled: number | null;
  checkin_formatted: string | null; checkout_formatted: string | null;
  case_number?: string; survey_number?: string; photos: string[];
}
interface MonthlyRow {
  id: number; name: string; role: string;
  days: Record<number, string>;
  summary: { present: number; late: number; absent: number; leave: number; holiday: number; wfh: number; half_day: number; field_visit: number; total_hours: number };
}
interface Holiday { id: number; title: string; holiday_date: string; holiday_type: string; }

type Tab = "dashboard" | "my_leaves" | "team_leaves" | "field_visits" | "monthly_report" | "settings";

// ── Status badge helper ────────────────────────────────────────
const statusColors: Record<string, string> = {
  present: "bg-green-100 text-green-700",
  late: "bg-amber-100 text-amber-700",
  half_day: "bg-orange-100 text-orange-700",
  absent: "bg-red-100 text-red-700",
  on_leave: "bg-blue-100 text-blue-700",
  wfh: "bg-indigo-100 text-indigo-700",
  field_visit: "bg-purple-100 text-purple-700",
  holiday: "bg-teal-100 text-teal-700",
  week_off: "bg-gray-100 text-gray-500",
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};
function StatusBadge({ status }: { status: string }) {
  const cls = statusColors[status] || "bg-gray-100 text-gray-600";
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ── Report cell color helper ───────────────────────────────────
const cellColors: Record<string, string> = {
  P: "bg-green-100 text-green-800", LT: "bg-amber-100 text-amber-800",
  A: "bg-red-100 text-red-800", L: "bg-blue-100 text-blue-800",
  H: "bg-teal-100 text-teal-800", WO: "bg-gray-100 text-gray-400",
  HD: "bg-orange-100 text-orange-800", WFH: "bg-indigo-100 text-indigo-800",
  FV: "bg-purple-100 text-purple-800", "-": "bg-gray-50 text-gray-300",
};

// ── GPS Helper ─────────────────────────────────────────────────
function getGPS(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Geolocation not supported"));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

// ================================================================
//   MAIN COMPONENT
// ================================================================
export function AttendanceDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Dashboard state
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState("");
  const [history, setHistory] = useState<Attendance[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([]);
  const [liveTeam, setLiveTeam] = useState<LiveMember[]>([]);
  const [liveSummary, setLiveSummary] = useState<LiveSummary | null>(null);

  // Leaves
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
  const [teamLeaves, setTeamLeaves] = useState<LeaveRequest[]>([]);
  const [teamLeaveFilter, setTeamLeaveFilter] = useState("");

  // Field visits
  const [myVisits, setMyVisits] = useState<FieldVisit[]>([]);
  const [activeVisit, setActiveVisit] = useState<FieldVisit | null>(null);

  // Monthly report
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));
  const [reportData, setReportData] = useState<MonthlyRow[]>([]);
  const [reportDays, setReportDays] = useState(0);

  // Settings
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  // Modals
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);

  // Manual entry form
  const [manualEntryForm, setManualEntryForm] = useState({
    admin_id: "",
    attendance_date: new Date().toISOString().slice(0, 10),
    status: "present",
    check_in_time: "10:00:00",
    check_out_time: "19:00:00",
    notes: ""
  });

  // Check-in form
  const [checkinNotes, setCheckinNotes] = useState("");
  const [checkinStatus, setCheckinStatus] = useState("");
  const selfieRef = useRef<HTMLInputElement>(null);

  // Leave form
  const [leaveForm, setLeaveForm] = useState({ leave_type: "casual", from_date: "", to_date: "", days_count: 1, reason: "" });

  // Field visit form
  const [visitForm, setVisitForm] = useState({ case_id: "", survey_id: "", client_name: "", visit_purpose: "" });

  // Holiday form
  const [holidayForm, setHolidayForm] = useState({ title: "", holiday_date: "", holiday_type: "company" });

  // Bulk mark form
  const [showBulkMarkModal, setShowBulkMarkModal] = useState(false);
  const [bulkMarkForm, setBulkMarkForm] = useState({ attendance_date: "", status: "present" });

  // ── Fetch helpers ──────────────────────────────────────────
  const api = useCallback(async (url: string, opts?: RequestInit) => {
    const res = await fetch(url, { credentials: "include", ...opts });
    return res.json();
  }, []);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [todayRes, histRes, balRes] = await Promise.all([
        api("/api/crm/attendance.php?action=today"),
        api("/api/crm/attendance.php?action=history"),
        api("/api/crm/attendance.php?action=leave_balance"),
      ]);
      if (todayRes.success) {
        setTodayAttendance(todayRes.data.attendance);
        setIsHoliday(todayRes.data.is_holiday);
        setHolidayName(todayRes.data.holiday?.title || "");
      }
      if (histRes.success) setHistory(histRes.data.history);
      if (balRes.success) setLeaveBalance(balRes.data.balance);

      // Try admin endpoints — if they fail, user is not admin
      const liveRes = await api("/api/crm/attendance.php?action=live_status");
      if (liveRes.success) {
        setIsSuperAdmin(true);
        setLiveTeam(liveRes.data.team);
        setLiveSummary(liveRes.data.summary);
      }

      // My field visits
      const visitRes = await api("/api/crm/field_visits.php?action=my_visits");
      if (visitRes.success) {
        setMyVisits(visitRes.data.visits);
        const active = visitRes.data.visits.find((v: FieldVisit) => !v.checkout_formatted);
        setActiveVisit(active || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [api]);

  const fetchLeaves = useCallback(async () => {
    const [myRes, teamRes] = await Promise.all([
      api("/api/crm/attendance.php?action=my_leaves"),
      api("/api/crm/attendance.php?action=team_leaves" + (teamLeaveFilter ? `&status=${teamLeaveFilter}` : "")),
    ]);
    if (myRes.success) setMyLeaves(myRes.data.leaves);
    if (teamRes.success) { setTeamLeaves(teamRes.data.team_leaves); setIsSuperAdmin(true); }
  }, [api, teamLeaveFilter]);

  const fetchReport = useCallback(async () => {
    const res = await api(`/api/crm/attendance.php?action=monthly_report&month=${reportMonth}`);
    if (res.success) { setReportData(res.data.report); setReportDays(res.data.days_in_month); }
  }, [api, reportMonth]);

  const fetchSettings = useCallback(async () => {
    const [sRes, hRes] = await Promise.all([
      api("/api/crm/attendance.php?action=settings"),
      api("/api/crm/attendance.php?action=holidays"),
    ]);
    if (sRes.success) setSettings(sRes.data.settings);
    if (hRes.success) setHolidays(hRes.data.holidays);
  }, [api]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);
  useEffect(() => { if (activeTab === "my_leaves" || activeTab === "team_leaves") fetchLeaves(); }, [activeTab, fetchLeaves]);
  useEffect(() => { if (activeTab === "monthly_report") fetchReport(); }, [activeTab, fetchReport]);
  useEffect(() => { if (activeTab === "settings") fetchSettings(); }, [activeTab, fetchSettings]);

  // ── Actions ────────────────────────────────────────────────
  const handleCheckin = async () => {
    setActionLoading(true);
    try {
      const gps = await getGPS().catch(() => ({ lat: 0, lng: 0 }));

      // Check if a selfie was selected
      const selfieFile = selfieRef.current?.files?.[0];
      let body: any;
      let headers: Record<string, string> = {};

      if (selfieFile) {
        const fd = new FormData();
        fd.append("latitude", String(gps.lat));
        fd.append("longitude", String(gps.lng));
        fd.append("notes", checkinNotes);
        fd.append("status", checkinStatus);
        fd.append("selfie", selfieFile);
        body = fd;
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({ latitude: gps.lat, longitude: gps.lng, notes: checkinNotes, status: checkinStatus });
      }

      const res = await fetch("/api/crm/attendance.php?action=checkin", {
        method: "POST", credentials: "include", headers, body,
      }).then((r) => r.json());

      if (res.success) {
        alert(res.data?.message || "Checked in!");
        setShowCheckinModal(false);
        setCheckinNotes("");
        setCheckinStatus("");
        fetchDashboard();
      } else {
        alert(res.error || "Check-in failed.");
      }
    } catch (e: unknown) {
      alert("Error: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckout = async () => {
    setActionLoading(true);
    try {
      const gps = await getGPS().catch(() => ({ lat: 0, lng: 0 }));
      const notes = prompt("Checkout notes (optional):");
      const res = await api("/api/crm/attendance.php?action=checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: gps.lat, longitude: gps.lng, notes: notes || "" }),
      });
      if (res.success) {
        alert(res.data?.message || "Checked out!");
        fetchDashboard();
      } else {
        alert(res.error || "Checkout failed.");
      }
    } catch (e: unknown) {
      alert("Error: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api("/api/crm/attendance.php?action=apply_leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leaveForm),
      });
      if (res.success) {
        alert("Leave request submitted.");
        setShowLeaveModal(false);
        setLeaveForm({ leave_type: "casual", from_date: "", to_date: "", days_count: 1, reason: "" });
        fetchLeaves();
        fetchDashboard();
      } else {
        alert(res.error || "Failed");
      }
    } catch (e) { console.error(e); } finally { setActionLoading(false); }
  };

  const handleLeaveAction = async (leaveId: number, action: "approve_leave" | "reject_leave") => {
    const reason = action === "reject_leave" ? prompt("Rejection reason:") : "";
    if (action === "reject_leave" && reason === null) return;
    setActionLoading(true);
    try {
      const res = await api(`/api/crm/attendance.php?action=${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leave_id: leaveId, rejection_reason: reason }),
      });
      if (res.success) { alert("Done!"); fetchLeaves(); } else { alert(res.error || "Failed"); }
    } catch (e) { console.error(e); } finally { setActionLoading(false); }
  };

  const handleStartVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const gps = await getGPS().catch(() => ({ lat: 0, lng: 0 }));
      const res = await api("/api/crm/field_visits.php?action=start_visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...visitForm, latitude: gps.lat, longitude: gps.lng }),
      });
      if (res.success) {
        alert("Field visit started!");
        setShowVisitModal(false);
        setVisitForm({ case_id: "", survey_id: "", client_name: "", visit_purpose: "" });
        fetchDashboard();
      } else { alert(res.error || "Failed"); }
    } catch (e) { console.error(e); } finally { setActionLoading(false); }
  };

  const handleEndVisit = async (visitId: number) => {
    const km = prompt("Kilometers traveled (optional):", "0");
    if (km === null) return;
    const notes = prompt("Visit notes (optional):");
    setActionLoading(true);
    try {
      const gps = await getGPS().catch(() => ({ lat: 0, lng: 0 }));
      const res = await api("/api/crm/field_visits.php?action=end_visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visit_id: visitId, latitude: gps.lat, longitude: gps.lng, kilometers_traveled: parseFloat(km), visit_notes: notes || "" }),
      });
      if (res.success) { alert("Visit completed!"); fetchDashboard(); } else { alert(res.error || "Failed"); }
    } catch (e) { console.error(e); } finally { setActionLoading(false); }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api("/api/crm/attendance.php?action=save_settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.success) { alert("Settings saved!"); } else { alert(res.error || "Failed"); }
    } catch (e) { console.error(e); } finally { setActionLoading(false); }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api("/api/crm/attendance.php?action=add_holiday", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(holidayForm),
      });
      if (res.success) {
        alert("Holiday added!");
        setShowHolidayModal(false);
        setHolidayForm({ title: "", holiday_date: "", holiday_type: "company" });
        fetchSettings();
      } else { alert(res.error || "Failed"); }
    } catch (e) { console.error(e); } finally { setActionLoading(false); }
  };

  const handleDeleteHoliday = async (id: number) => {
    if (!confirm("Delete this holiday?")) return;
    await api("/api/crm/attendance.php?action=delete_holiday", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
    });
    fetchSettings();
  };

  const handleManualEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api("/api/crm/attendance.php?action=admin_update_attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manualEntryForm),
      });
      if (res.success) {
        alert("Attendance updated successfully!");
        setShowManualEntryModal(false);
        fetchReport();
        if (activeTab === "dashboard") fetchDashboard();
      } else {
        alert(res.error || "Failed to update attendance.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkMarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api("/api/crm/attendance.php?action=bulk_mark_attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bulkMarkForm),
      });
      if (res.success) {
        alert("Bulk attendance marked successfully!");
        setShowBulkMarkModal(false);
        fetchReport();
        if (activeTab === "dashboard") fetchDashboard();
      } else {
        alert(res.error || "Failed to mark bulk attendance.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickUpdate = async (adminId: number, dateStr: string, status: string) => {
    setActionLoading(true);
    try {
      const defaultIn = settings ? `${settings.office_start_time}:00` : '10:00:00';
      const defaultOut = settings ? `${settings.office_end_time}:00` : '18:00:00';

      const res = await api("/api/crm/attendance.php?action=admin_update_attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_id: adminId,
          attendance_date: dateStr,
          status: status,
          check_in_time: (status === 'present' || status === 'wfh' || status === 'late' || status === 'field_visit') ? defaultIn : null,
          check_out_time: (status === 'present' || status === 'wfh' || status === 'late' || status === 'field_visit') ? defaultOut : null,
          notes: "Quick update from dashboard"
        }),
      });
      if (res.success) {
        fetchReport();
      } else {
        alert(res.error || "Failed to update attendance.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────
  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Loading attendance...</div>;

  const tabs: { id: Tab; label: string; icon: any; adminOnly?: boolean }[] = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "my_leaves", label: "My Leaves", icon: Calendar },
    { id: "team_leaves", label: "Team Leaves", icon: UserCheck, adminOnly: true },
    { id: "field_visits", label: "Field Visits", icon: MapPin },
    { id: "monthly_report", label: "Monthly Report", icon: BarChart3, adminOnly: true },
    { id: "settings", label: "Settings", icon: Settings, adminOnly: true },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 font-outfit tracking-tight flex items-center gap-2">
            <UserCheck className="w-8 h-8 text-indigo-600" /> Attendance & Leave Management
          </h2>
          <p className="text-gray-500 font-medium mt-1">Check-in, leaves, field visits, and attendance reports.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-gray-100 p-2 shadow-sm inline-flex gap-2 overflow-x-auto w-full sm:w-auto">
        {tabs.filter((t) => !t.adminOnly || isSuperAdmin).map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all relative whitespace-nowrap ${
              activeTab === t.id
                ? "text-indigo-700"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {activeTab === t.id && (
              <motion.div layoutId="attendanceTab" className="absolute inset-0 bg-indigo-50 border border-indigo-100 rounded-xl" />
            )}
            <t.icon className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════
          DASHBOARD TAB
         ════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
      {activeTab === "dashboard" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column: Today + Quick Actions ── */}
          <div className="lg:col-span-1 space-y-6">
            {/* Today's Status Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
              <h3 className="font-bold text-gray-900 font-outfit mb-4 flex items-center gap-2 relative z-10">
                <Calendar className="w-5 h-5 text-indigo-600" /> Today's Status
              </h3>

              {isHoliday && (
                <div className="mb-4 p-3 bg-teal-50 rounded-xl border border-teal-200 text-teal-700 text-sm font-bold text-center relative z-10">
                  🎉 Holiday: {holidayName}
                </div>
              )}

              <div className="space-y-4 text-center relative z-10">
                <div className="text-5xl font-bold text-gray-900 font-outfit tracking-tight">{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                <p className="text-sm text-gray-500 font-medium">{new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>

                {todayAttendance && (
                  <div className="flex justify-center mt-2">
                    <StatusBadge status={todayAttendance.status} />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 text-sm mt-4 border-t border-gray-100 pt-4">
                  <div><p className="text-gray-400 mb-1 text-[10px] uppercase font-bold tracking-wider">Check In</p><p className="font-bold text-gray-800 font-outfit text-base">{todayAttendance?.time_in || "--:--"}</p></div>
                  <div><p className="text-gray-400 mb-1 text-[10px] uppercase font-bold tracking-wider">Check Out</p><p className="font-bold text-gray-800 font-outfit text-base">{todayAttendance?.time_out || "--:--"}</p></div>
                  <div><p className="text-gray-400 mb-1 text-[10px] uppercase font-bold tracking-wider">Hours</p><p className="font-bold text-indigo-600 font-outfit text-base">{todayAttendance?.hours_worked ? `${todayAttendance.hours_worked}h` : "--"}</p></div>
                </div>

                {todayAttendance?.notes && (
                  <div className="text-xs text-gray-600 font-medium bg-gray-50/50 p-3 rounded-xl mt-4 text-left border border-gray-100">
                    <strong className="text-gray-900">Notes:</strong> {todayAttendance.notes}
                  </div>
                )}

                {/* Check In / Out buttons */}
                {!todayAttendance ? (
                  <Button
                    className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white mt-6 shadow-lg shadow-emerald-600/20 font-bold"
                    onClick={() => setShowCheckinModal(true)}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="w-5 h-5 mr-2" /> Check In Now
                  </Button>
                ) : !todayAttendance.time_out ? (
                  <Button
                    className="w-full h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white mt-6 shadow-lg shadow-rose-600/20 font-bold"
                    onClick={handleCheckout}
                    disabled={actionLoading}
                  >
                    <LogOut className="w-5 h-5 mr-2" /> Check Out
                  </Button>
                ) : (
                  <div className="w-full py-3 bg-emerald-50 text-emerald-700 rounded-xl mt-6 font-bold border border-emerald-200 text-sm flex justify-center items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Attendance Completed — {todayAttendance.hours_worked}h
                  </div>
                )}
              </div>
            </div>

            {/* Active Field Visit */}
            {activeVisit && (
              <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-3xl border border-purple-100 p-6 shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <h3 className="font-bold text-purple-900 font-outfit mb-3 flex items-center gap-2 relative z-10">
                  <MapPin className="w-5 h-5 text-purple-600" /> Active Field Visit
                </h3>
                <div className="relative z-10">
                  <p className="text-lg text-purple-900 font-bold font-outfit">{activeVisit.client_name}</p>
                  <p className="text-sm text-purple-600 font-medium mt-1 bg-white/50 inline-block px-3 py-1 rounded-lg">Started at {activeVisit.checkin_formatted}</p>
                  <Button className="w-full h-11 mt-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20" onClick={() => handleEndVisit(activeVisit.id)} disabled={actionLoading}>
                    <CheckCircle className="w-4 h-4 mr-2" /> End Visit & Submit
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 font-outfit mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-dashed border-gray-300 hover:border-purple-300 hover:bg-purple-50 font-medium text-gray-700 transition-colors" onClick={() => setShowVisitModal(true)}>
                  <MapPin className="w-5 h-5 mr-3 text-purple-600" /> Log Field Visit
                </Button>
                <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-dashed border-gray-300 hover:border-blue-300 hover:bg-blue-50 font-medium text-gray-700 transition-colors" onClick={() => setShowLeaveModal(true)}>
                  <Calendar className="w-5 h-5 mr-3 text-blue-600" /> Apply Leave
                </Button>
              </div>
            </div>

            {/* Leave Balance */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 font-outfit mb-5 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" /> Leave Balance <span className="text-gray-400 font-medium ml-1">({new Date().getFullYear()})</span>
              </h3>
              <div className="space-y-4">
                {leaveBalance.map((lb) => (
                  <div key={lb.type} className="group">
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-gray-700 font-semibold capitalize">{lb.type}</span>
                      <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">{lb.remaining}/{lb.quota}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all group-hover:scale-y-110" style={{ width: `${lb.quota > 0 ? (lb.used / lb.quota) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column: Live Board + History ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Team Status (admin only) */}
            {isSuperAdmin && liveSummary && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 font-outfit flex items-center gap-2 text-lg">
                    <Eye className="w-5 h-5 text-indigo-600" /> Live Team Status
                  </h3>
                  <Button variant="outline" size="sm" onClick={fetchDashboard} disabled={loading} className="rounded-xl h-8 px-3 text-gray-600">
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Sync
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-0 border-b border-gray-100 divide-x divide-gray-100">
                  {[
                    { label: "Checked In", count: liveSummary.checked_in, color: "text-emerald-600", bg: "bg-emerald-50/50" },
                    { label: "On Field", count: liveSummary.on_field, color: "text-purple-600", bg: "bg-purple-50/50" },
                    { label: "On Leave", count: liveSummary.on_leave, color: "text-blue-600", bg: "bg-blue-50/50" },
                    { label: "Absent", count: liveSummary.absent, color: "text-rose-600", bg: "bg-rose-50/50" },
                  ].map((s) => (
                    <div key={s.label} className={`p-5 text-center ${s.bg}`}>
                      <div className={`text-3xl font-bold font-outfit ${s.color}`}>{s.count}</div>
                      <div className="text-[11px] uppercase tracking-wider text-gray-500 font-bold mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-100">
                      {liveTeam.map((m) => (
                        <tr key={m.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-3.5 font-bold text-gray-900">{m.name}</td>
                          <td className="px-6 py-3.5 text-xs text-gray-500 uppercase tracking-wider font-semibold">{m.role}</td>
                          <td className="px-6 py-3.5 text-gray-700 font-medium">{m.time_in || "--"}</td>
                          <td className="px-6 py-3.5"><StatusBadge status={m.current_status} /></td>
                          <td className="px-6 py-3.5 text-xs text-gray-500 font-medium">{m.visit_client || ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Attendance History */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-900 font-outfit flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 text-indigo-600" /> Attendance History <span className="text-sm text-gray-500 font-medium ml-1">(Last 30 Days)</span>
                </h3>
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                    <tr>
                      <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Day</th>
                      <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">In</th>
                      <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Out</th>
                      <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Hours</th>
                      <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500 font-medium">No history available.</td></tr>
                    ) : (
                      history.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-3.5 font-bold text-gray-900">{r.date}</td>
                          <td className="px-6 py-3.5 text-gray-500 font-medium">{r.day_name}</td>
                          <td className="px-6 py-3.5 text-gray-700 font-medium">{r.time_in || "--"}</td>
                          <td className="px-6 py-3.5 text-gray-700 font-medium">{r.time_out || "--"}</td>
                          <td className="px-6 py-3.5 font-bold text-indigo-600">{r.hours_worked ? `${r.hours_worked}h` : "--"}</td>
                          <td className="px-6 py-3.5"><StatusBadge status={r.status} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Field Visits */}
            {myVisits.length > 0 && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-gray-900 font-outfit flex items-center gap-2 text-lg">
                    <MapPin className="w-5 h-5 text-purple-600" /> Recent Field Visits
                  </h3>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                      <tr>
                        <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Client</th>
                        <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">In / Out</th>
                        <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">KM</th>
                        <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Case</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {myVisits.slice(0, 5).map((v) => (
                        <tr key={v.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-3.5 text-gray-700 font-medium">{v.date_formatted}</td>
                          <td className="px-6 py-3.5 font-bold text-gray-900">{v.client_name}</td>
                          <td className="px-6 py-3.5 text-sm text-gray-600"><span className="text-gray-400 font-medium">{v.checkin_formatted || "--"}</span> &rarr; <span className="font-semibold text-gray-800">{v.checkout_formatted || "Active"}</span></td>
                          <td className="px-6 py-3.5 text-gray-700 font-medium">{v.kilometers_traveled ?? "--"}</td>
                          <td className="px-6 py-3.5 text-sm text-gray-500 font-medium">{v.case_number || v.survey_number || "--"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════
          MY LEAVES TAB
         ════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
      {activeTab === "my_leaves" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="font-bold text-gray-900 font-outfit flex items-center gap-2 text-lg"><Calendar className="w-5 h-5 text-indigo-600" /> My Leave Requests</h3>
            <Button onClick={() => setShowLeaveModal(true)} className="h-10 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold px-5">
              <Plus className="w-4 h-4 mr-2" /> Apply Leave
            </Button>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                <tr>
                  <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myLeaves.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500 font-medium">No leave requests.</td></tr>
                ) : myLeaves.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 capitalize">{l.leave_type}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-800">{new Date(l.from_date).toLocaleDateString()} &rarr; {new Date(l.to_date).toLocaleDateString()}</div>
                      <div className="text-xs font-bold text-indigo-600 bg-indigo-50 inline-block px-2 py-0.5 rounded-md mt-1">{l.days_count} day(s)</div>
                    </td>
                    <td className="px-6 py-4 max-w-[200px] truncate text-sm text-gray-600">{l.reason}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={l.status} />
                      {l.rejection_reason && <div className="text-xs text-rose-600 font-medium mt-1.5">{l.rejection_reason}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{new Date(l.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════
          TEAM LEAVES TAB (admin only)
         ════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
      {activeTab === "team_leaves" && isSuperAdmin && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="font-bold text-gray-900 font-outfit flex items-center gap-2 text-lg"><UserCheck className="w-5 h-5 text-indigo-600" /> Team Leave Requests</h3>
            <div className="flex flex-wrap gap-2">
              {["", "pending", "approved", "rejected"].map((f) => (
                <Button key={f} variant={teamLeaveFilter === f ? "default" : "outline"} className={`h-9 rounded-xl px-4 text-sm font-bold uppercase tracking-wider ${teamLeaveFilter === f ? 'bg-indigo-600 hover:bg-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setTeamLeaveFilter(f)}>
                  {f || "All"}
                </Button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                <tr>
                  <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teamLeaves.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500 font-medium">No leave requests.</td></tr>
                ) : teamLeaves.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4"><div className="font-bold text-gray-900 text-base">{l.employee_name}</div><div className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-0.5">{l.role}</div></td>
                    <td className="px-6 py-4 font-bold text-gray-900 capitalize">{l.leave_type}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-800">{new Date(l.from_date).toLocaleDateString()} &rarr; {new Date(l.to_date).toLocaleDateString()}</div>
                      <div className="text-xs font-bold text-indigo-600 bg-indigo-50 inline-block px-2 py-0.5 rounded-md mt-1">{l.days_count} day(s)</div>
                    </td>
                    <td className="px-6 py-4 max-w-[200px] truncate text-sm text-gray-600" title={l.reason}>{l.reason}</td>
                    <td className="px-6 py-4"><StatusBadge status={l.status} /></td>
                    <td className="px-6 py-4 text-right">
                      {l.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="h-9 w-9 rounded-xl p-0 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300" onClick={() => handleLeaveAction(l.id, "approve_leave")} disabled={actionLoading}><Check className="w-5 h-5" /></Button>
                          <Button size="sm" variant="outline" className="h-9 w-9 rounded-xl p-0 text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300" onClick={() => handleLeaveAction(l.id, "reject_leave")} disabled={actionLoading}><XCircle className="w-5 h-5" /></Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════
          FIELD VISITS TAB
         ════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
      {activeTab === "field_visits" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h3 className="font-bold text-gray-900 font-outfit text-xl">My Field Visits</h3>
            <Button onClick={() => setShowVisitModal(true)} className="h-10 rounded-xl bg-purple-600 text-white hover:bg-purple-700 font-bold px-5">
              <Plus className="w-4 h-4 mr-2" /> New Visit
            </Button>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                  <tr>
                    <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Purpose</th>
                    <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">In / Out</th>
                    <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">KM</th>
                    <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Photos</th>
                    <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myVisits.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-500 font-medium">No field visits recorded.</td></tr>
                  ) : myVisits.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">{v.date_formatted}</td>
                      <td className="px-6 py-4 font-bold text-gray-900 text-base">{v.client_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">{v.visit_purpose || "--"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600"><span className="text-gray-400 font-medium">{v.checkin_formatted || "--"}</span> &rarr; {v.checkout_formatted ? <span className="font-semibold text-gray-800">{v.checkout_formatted}</span> : <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Active</span>}</td>
                      <td className="px-6 py-4 text-gray-700 font-medium">{v.kilometers_traveled ?? "--"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">{v.photos?.length || 0}</td>
                      <td className="px-6 py-4">
                        {!v.checkout_formatted && (
                          <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs font-bold uppercase tracking-wider text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300" onClick={() => handleEndVisit(v.id)}>End Visit</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════
          MONTHLY REPORT TAB (admin only)
         ════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
      {activeTab === "monthly_report" && isSuperAdmin && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h3 className="font-bold text-gray-900 font-outfit text-xl flex items-center gap-2"><BarChart3 className="w-6 h-6 text-indigo-600" /> Monthly Attendance Sheet</h3>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" className="h-10 w-10 p-0 rounded-xl border-gray-200" onClick={() => {
                const d = new Date(reportMonth + "-01"); d.setMonth(d.getMonth() - 1);
                setReportMonth(d.toISOString().slice(0, 7));
              }}><ChevronLeft className="w-5 h-5 text-gray-600" /></Button>
              <Input type="month" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} className="h-10 w-40 font-bold text-gray-700 rounded-xl border-gray-200" />
              <Button variant="outline" className="h-10 w-10 p-0 rounded-xl border-gray-200" onClick={() => {
                const d = new Date(reportMonth + "-01"); d.setMonth(d.getMonth() + 1);
                setReportMonth(d.toISOString().slice(0, 7));
              }}><ChevronRight className="w-5 h-5 text-gray-600" /></Button>
              <Button className="h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold ml-2 shadow-md px-4" onClick={() => setShowBulkMarkModal(true)}>
                <CheckCircle className="w-4 h-4 mr-2" /> Bulk Mark
              </Button>
              <Button className="h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold ml-2 shadow-md px-4" onClick={() => setShowManualEntryModal(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Manual Entry
              </Button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 text-xs bg-white/60 backdrop-blur-xl p-3 rounded-2xl border border-gray-100 shadow-sm">
            {[["P", "Present"], ["LT", "Late"], ["A", "Absent"], ["L", "Leave"], ["H", "Holiday"], ["WO", "Week Off"], ["HD", "Half Day"], ["WFH", "WFH"], ["FV", "Field Visit"]].map(([code, label]) => (
              <div key={code} className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
                <span className={`w-6 h-6 flex items-center justify-center rounded-md text-[10px] font-bold ${cellColors[code] || ""}`}>{code}</span>
                <span className="text-gray-600 font-medium">{label}</span>
              </div>
            ))}
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar pb-2">
              <table className="text-[11px] w-full min-w-max">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500">
                    <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider sticky left-0 bg-gray-50 z-20 min-w-[150px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Employee</th>
                    {Array.from({ length: reportDays }, (_, i) => (
                      <th key={i} className="px-1 py-3 text-center font-bold text-xs w-8">{i + 1}</th>
                    ))}
                    <th className="px-3 py-3 text-center font-bold text-xs bg-emerald-50 text-emerald-700 uppercase">P</th>
                    <th className="px-3 py-3 text-center font-bold text-xs bg-amber-50 text-amber-700 uppercase">LT</th>
                    <th className="px-3 py-3 text-center font-bold text-xs bg-rose-50 text-rose-700 uppercase">A</th>
                    <th className="px-3 py-3 text-center font-bold text-xs bg-blue-50 text-blue-700 uppercase">L</th>
                    <th className="px-3 py-3 text-center font-bold text-xs bg-indigo-50 text-indigo-700 uppercase">Hrs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reportData.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-4 py-2 font-medium sticky left-0 bg-white group-hover:bg-gray-50/80 z-10 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors">
                        <div className="font-bold text-gray-900 text-sm truncate max-w-[140px]">{row.name}</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{row.role}</div>
                      </td>
                      {Array.from({ length: reportDays }, (_, i) => {
                        const code = row.days[i + 1] || "-";
                        const cls = cellColors[code] || "bg-gray-50 text-gray-300";
                        const dateStr = `${reportMonth}-${String(i + 1).padStart(2, '0')}`;
                        return (
                          <td key={i} className="px-0 py-2 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className={`inline-flex items-center justify-center w-7 h-6 rounded-md text-[10px] font-bold mx-auto transition-transform hover:scale-110 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${cls}`}>
                                  {code}
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="center" className="min-w-[120px]">
                                {[
                                  { val: "present", label: "Present (P)" },
                                  { val: "late", label: "Late (LT)" },
                                  { val: "absent", label: "Absent (A)" },
                                  { val: "on_leave", label: "Leave (L)" },
                                  { val: "half_day", label: "Half Day (HD)" },
                                  { val: "wfh", label: "WFH (WFH)" },
                                  { val: "field_visit", label: "Field Visit (FV)" },
                                  { val: "week_off", label: "Week Off (WO)" },
                                  { val: "holiday", label: "Holiday (H)" }
                                ].map(opt => (
                                  <DropdownMenuItem 
                                    key={opt.val} 
                                    onClick={() => handleQuickUpdate(row.id, dateStr, opt.val)}
                                    className="text-xs cursor-pointer font-medium"
                                  >
                                    {opt.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 text-center font-bold text-emerald-700 bg-emerald-50/30 text-sm">{row.summary.present}</td>
                      <td className="px-3 py-2 text-center font-bold text-amber-700 bg-amber-50/30 text-sm">{row.summary.late}</td>
                      <td className="px-3 py-2 text-center font-bold text-rose-700 bg-rose-50/30 text-sm">{row.summary.absent}</td>
                      <td className="px-3 py-2 text-center font-bold text-blue-700 bg-blue-50/30 text-sm">{row.summary.leave}</td>
                      <td className="px-3 py-2 text-center font-bold text-indigo-700 bg-indigo-50/30 text-sm">{row.summary.total_hours}</td>
                    </tr>
                  ))}
                  {reportData.length === 0 && (
                     <tr><td colSpan={reportDays + 6} className="px-6 py-10 text-center text-gray-500 font-medium bg-white">No report data found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════
          SETTINGS TAB (admin only)
         ════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
      {activeTab === "settings" && isSuperAdmin && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Office Hours & Geo-fence */}
          <form onSubmit={handleSaveSettings} className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-900 font-outfit text-lg flex items-center gap-2"><Settings className="w-5 h-5 text-indigo-600" /> Office Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Office Start Time</label>
                <Input type="time" value={settings.office_start_time || ""} onChange={(e) => setSettings({ ...settings, office_start_time: e.target.value })} className="h-11 rounded-xl border-gray-200" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Office End Time</label>
                <Input type="time" value={settings.office_end_time || ""} onChange={(e) => setSettings({ ...settings, office_end_time: e.target.value })} className="h-11 rounded-xl border-gray-200" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Half Day Threshold (hours)</label>
              <Input type="number" step="0.5" value={settings.half_day_hours || ""} onChange={(e) => setSettings({ ...settings, half_day_hours: e.target.value })} className="h-11 rounded-xl border-gray-200" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Office Latitude</label>
                <Input value={settings.office_latitude || ""} onChange={(e) => setSettings({ ...settings, office_latitude: e.target.value })} className="h-11 rounded-xl border-gray-200" placeholder="28.6139" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Office Longitude</label>
                <Input value={settings.office_longitude || ""} onChange={(e) => setSettings({ ...settings, office_longitude: e.target.value })} className="h-11 rounded-xl border-gray-200" placeholder="77.2090" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Geo-fence (m)</label>
                <Input type="number" value={settings.geofence_radius_meters || ""} onChange={(e) => setSettings({ ...settings, geofence_radius_meters: e.target.value })} className="h-11 rounded-xl border-gray-200" />
              </div>
            </div>

            <h3 className="font-bold text-gray-900 font-outfit text-lg pt-4 border-t border-gray-100 mt-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-600" /> Annual Leave Quotas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {["casual", "sick", "earned", "compensatory", "unpaid"].map((t) => (
                <div key={t}>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{t} Leave</label>
                  <Input type="number" value={settings[`${t}_leave_quota`] || ""} onChange={(e) => setSettings({ ...settings, [`${t}_leave_quota`]: e.target.value })} className="h-11 rounded-xl border-gray-200" />
                </div>
              ))}
            </div>
            <Button type="submit" disabled={actionLoading} className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-bold text-base mt-4">Save Settings</Button>
          </form>

          {/* Holiday Master List */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <h3 className="font-bold text-gray-900 font-outfit text-lg flex items-center gap-2"><Calendar className="w-5 h-5 text-teal-600" /> Holiday Master <span className="text-sm text-gray-500">({new Date().getFullYear()})</span></h3>
              <Button onClick={() => setShowHolidayModal(true)} className="h-10 rounded-xl bg-teal-600 text-white hover:bg-teal-700 font-bold px-4">
                <Plus className="w-4 h-4 mr-2" /> Add Holiday
              </Button>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {holidays.length === 0 ? (
                <p className="text-sm text-gray-500 font-medium text-center py-10">No holidays added for this year.</p>
              ) : holidays.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-4 bg-gray-50/80 rounded-2xl border border-gray-100 group hover:border-teal-200 transition-colors">
                  <div>
                    <div className="font-bold text-gray-900 text-base">{h.title}</div>
                    <div className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">{new Date(h.holiday_date).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })} &bull; {h.holiday_type}</div>
                  </div>
                  <Button variant="ghost" className="h-10 w-10 rounded-xl p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteHoliday(h.id)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════
          MODALS
         ════════════════════════════════════════════════════════ */}

      {/* Check-in Modal */}
      <AnimatePresence>
      {showCheckinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 font-outfit text-xl">Check In</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-200" onClick={() => setShowCheckinModal(false)}><X className="w-5 h-5 text-gray-500" /></Button>
            </div>
            <div className="p-6 space-y-5">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-blue-700 text-sm font-medium flex items-start gap-3">
                <Navigation className="w-5 h-5 mt-0.5 shrink-0 text-blue-500" />
                <span>Your GPS location will be captured automatically when you check in.</span>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Check-in Type</label>
                <select className="w-full px-4 py-3 h-12 text-sm rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" value={checkinStatus} onChange={(e) => setCheckinStatus(e.target.value)}>
                  <option value="">Auto-detect (Present / Late)</option>
                  <option value="wfh">Work from Home</option>
                  <option value="field_visit">Starting with Field Visit</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Notes <span className="font-medium normal-case text-gray-400">(optional)</span></label>
                <textarea className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-white resize-none h-24 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="WFH reason, early start, etc." value={checkinNotes} onChange={(e) => setCheckinNotes(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-1"><Camera className="w-4 h-4 text-gray-400" /> Selfie <span className="font-medium normal-case text-gray-400">(optional)</span></label>
                <input ref={selfieRef} type="file" accept="image/*" capture="user" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-colors w-full cursor-pointer" />
              </div>
              <Button className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md shadow-emerald-600/20 mt-2" onClick={handleCheckin} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                Confirm Check In
              </Button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Apply Leave Modal */}
      <AnimatePresence>
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 font-outfit text-xl">Apply for Leave</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-200" onClick={() => setShowLeaveModal(false)}><X className="w-5 h-5 text-gray-500" /></Button>
            </div>
            <form onSubmit={handleApplyLeave} className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Leave Type</label>
                <select className="w-full px-4 py-3 h-12 text-sm rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={leaveForm.leave_type} onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })} required>
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="earned">Earned Leave</option>
                  <option value="compensatory">Compensatory Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">From</label><Input type="date" value={leaveForm.from_date} onChange={(e) => setLeaveForm({ ...leaveForm, from_date: e.target.value })} required className="h-12 rounded-xl border-gray-200" /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">To</label><Input type="date" value={leaveForm.to_date} onChange={(e) => setLeaveForm({ ...leaveForm, to_date: e.target.value })} required className="h-12 rounded-xl border-gray-200" /></div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Number of Days</label>
                <Input type="number" step="0.5" min="0.5" value={leaveForm.days_count} onChange={(e) => setLeaveForm({ ...leaveForm, days_count: parseFloat(e.target.value) })} required className="h-12 rounded-xl border-gray-200" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Reason</label>
                <textarea className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-white resize-none h-24 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Reason for leave..." value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} required />
              </div>
              {/* Show balance hint */}
              {leaveBalance.length > 0 && (() => {
                const bal = leaveBalance.find((b) => b.type === leaveForm.leave_type);
                return bal ? (
                  <div className="text-sm p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                    <span className="text-indigo-700 font-medium">Available Balance</span>
                    <span className="font-bold text-indigo-900 bg-white px-3 py-1 rounded-lg shadow-sm">{bal.remaining} <span className="text-gray-400 font-medium ml-1">/ {bal.quota}</span></span>
                  </div>
                ) : null;
              })()}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                <Button type="button" variant="outline" className="h-11 rounded-xl px-6 font-bold text-gray-600" onClick={() => setShowLeaveModal(false)}>Cancel</Button>
                <Button type="submit" disabled={actionLoading} className="h-11 rounded-xl px-8 bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-md shadow-indigo-600/20">Submit</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Field Visit Modal */}
      <AnimatePresence>
      {showVisitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 font-outfit text-xl">Start Field Visit</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-200" onClick={() => setShowVisitModal(false)}><X className="w-5 h-5 text-gray-500" /></Button>
            </div>
            <form onSubmit={handleStartVisit} className="p-6 space-y-5">
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-purple-700 text-sm font-medium flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-purple-500" />
                <span>GPS location will be captured at the client site when you start the visit.</span>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Client Name</label>
                <Input value={visitForm.client_name} onChange={(e) => setVisitForm({ ...visitForm, client_name: e.target.value })} placeholder="e.g. Mr. Sharma" required className="h-12 rounded-xl border-gray-200" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Visit Purpose</label>
                <textarea className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-white resize-none h-24 focus:ring-2 focus:ring-purple-500 transition-all outline-none" placeholder="Purpose of the visit..." value={visitForm.visit_purpose} onChange={(e) => setVisitForm({ ...visitForm, visit_purpose: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Link to Case <span className="font-medium normal-case text-gray-400">(opt)</span></label>
                  <Input value={visitForm.case_id} onChange={(e) => setVisitForm({ ...visitForm, case_id: e.target.value })} placeholder="Case ID" className="h-12 rounded-xl border-gray-200" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Link to Survey <span className="font-medium normal-case text-gray-400">(opt)</span></label>
                  <Input value={visitForm.survey_id} onChange={(e) => setVisitForm({ ...visitForm, survey_id: e.target.value })} placeholder="Survey ID" className="h-12 rounded-xl border-gray-200" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                <Button type="button" variant="outline" className="h-11 rounded-xl px-6 font-bold text-gray-600" onClick={() => setShowVisitModal(false)}>Cancel</Button>
                <Button type="submit" disabled={actionLoading} className="h-11 rounded-xl px-8 bg-purple-600 text-white hover:bg-purple-700 font-bold shadow-md shadow-purple-600/20">
                  <Navigation className="w-4 h-4 mr-2" /> Start Visit
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Add Holiday Modal */}
      <AnimatePresence>
      {showHolidayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-sm shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 font-outfit text-xl">Add Holiday</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-200" onClick={() => setShowHolidayModal(false)}><X className="w-5 h-5 text-gray-500" /></Button>
            </div>
            <form onSubmit={handleAddHoliday} className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Holiday Name</label>
                <Input value={holidayForm.title} onChange={(e) => setHolidayForm({ ...holidayForm, title: e.target.value })} placeholder="e.g. Republic Day" required className="h-12 rounded-xl border-gray-200" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Date</label>
                <Input type="date" value={holidayForm.holiday_date} onChange={(e) => setHolidayForm({ ...holidayForm, holiday_date: e.target.value })} required className="h-12 rounded-xl border-gray-200" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Type</label>
                <select className="w-full px-4 py-3 h-12 text-sm rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" value={holidayForm.holiday_type} onChange={(e) => setHolidayForm({ ...holidayForm, holiday_type: e.target.value })}>
                  <option value="national">National</option>
                  <option value="regional">Regional</option>
                  <option value="company">Company</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                <Button type="button" variant="outline" className="h-11 rounded-xl px-6 font-bold text-gray-600" onClick={() => setShowHolidayModal(false)}>Cancel</Button>
                <Button type="submit" disabled={actionLoading} className="h-11 rounded-xl px-8 bg-teal-600 text-white hover:bg-teal-700 font-bold shadow-md shadow-teal-600/20">Add Holiday</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Bulk Mark Modal */}
      <AnimatePresence>
      {showBulkMarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 font-outfit text-xl flex items-center gap-2"><CheckCircle className="w-5 h-5 text-purple-600" /> Bulk Mark Attendance</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-200" onClick={() => setShowBulkMarkModal(false)}><X className="w-5 h-5 text-gray-500" /></Button>
            </div>
            <form onSubmit={handleBulkMarkSubmit} className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Date</label>
                <Input type="date" value={bulkMarkForm.attendance_date} onChange={(e) => setBulkMarkForm({ ...bulkMarkForm, attendance_date: e.target.value })} required className="h-12 rounded-xl border-gray-200" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Status to Apply</label>
                <select className="w-full px-4 py-3 h-12 text-sm rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-purple-500 transition-all outline-none" value={bulkMarkForm.status} onChange={(e) => setBulkMarkForm({ ...bulkMarkForm, status: e.target.value })} required>
                  <option value="present">Present (P)</option>
                  <option value="wfh">Work from Home (WFH)</option>
                  <option value="holiday">Holiday (H)</option>
                  <option value="week_off">Week Off (WO)</option>
                  <option value="absent">Absent (A)</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 font-medium bg-purple-50 p-3 rounded-lg border border-purple-100 text-purple-700">
                This will mark everyone as {bulkMarkForm.status} for the selected date, except for those who already have an entry or are on leave.
              </p>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                <Button type="button" variant="outline" className="h-11 rounded-xl px-6 font-bold text-gray-600" onClick={() => setShowBulkMarkModal(false)}>Cancel</Button>
                <Button type="submit" disabled={actionLoading} className="h-11 rounded-xl px-8 bg-purple-600 text-white hover:bg-purple-700 font-bold shadow-md shadow-purple-600/20">Mark All</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Manual Entry Modal */}
      <AnimatePresence>
      {showManualEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 font-outfit text-xl">Add/Edit Manual Attendance</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-200" onClick={() => setShowManualEntryModal(false)}><X className="w-5 h-5 text-gray-500" /></Button>
            </div>
            <form onSubmit={handleManualEntrySubmit} className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Employee</label>
                <select className="w-full px-4 py-3 h-12 text-sm rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" value={manualEntryForm.admin_id} onChange={(e) => setManualEntryForm({ ...manualEntryForm, admin_id: e.target.value })} required>
                  <option value="">Select Employee...</option>
                  {reportData.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Date</label>
                  <Input type="date" value={manualEntryForm.attendance_date} onChange={(e) => setManualEntryForm({ ...manualEntryForm, attendance_date: e.target.value })} required className="h-12 rounded-xl border-gray-200" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Status</label>
                  <select className="w-full px-4 py-3 h-12 text-sm rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" value={manualEntryForm.status} onChange={(e) => setManualEntryForm({ ...manualEntryForm, status: e.target.value })} required>
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="half_day">Half Day</option>
                    <option value="absent">Absent</option>
                    <option value="on_leave">On Leave</option>
                    <option value="wfh">Work from Home</option>
                    <option value="field_visit">Field Visit</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Check In Time</label>
                  <Input type="time" step="1" value={manualEntryForm.check_in_time} onChange={(e) => setManualEntryForm({ ...manualEntryForm, check_in_time: e.target.value })} className="h-12 rounded-xl border-gray-200" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Check Out Time</label>
                  <Input type="time" step="1" value={manualEntryForm.check_out_time} onChange={(e) => setManualEntryForm({ ...manualEntryForm, check_out_time: e.target.value })} className="h-12 rounded-xl border-gray-200" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Notes <span className="font-medium normal-case text-gray-400">(opt)</span></label>
                <textarea className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-white resize-none h-24 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="Reason for manual entry..." value={manualEntryForm.notes} onChange={(e) => setManualEntryForm({ ...manualEntryForm, notes: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                <Button type="button" variant="outline" className="h-11 rounded-xl px-6 font-bold text-gray-600" onClick={() => setShowManualEntryModal(false)}>Cancel</Button>
                <Button type="submit" disabled={actionLoading} className="h-11 rounded-xl px-8 bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-md shadow-indigo-600/20">Save Entry</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
}
