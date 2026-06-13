import { useState } from "react";
import { BookOpen, ShieldCheck, UserCheck, Briefcase, FileText, Settings, Key, AlertTriangle, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const CRMGuideReport = () => {
  const [activeSection, setActiveSection] = useState<string>("roles");

  const sections = [
    { id: "roles", title: "Roles & Permissions", icon: ShieldCheck },
    { id: "attendance", title: "Attendance & HR", icon: UserCheck },
    { id: "operations", title: "Operations & Fleet", icon: Briefcase },
    { id: "finance", title: "Finance & GST", icon: FileText },
    { id: "settings", title: "System Settings", icon: Settings },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 font-outfit tracking-tight flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-indigo-600" /> CRM Guide & Documentation
          </h2>
          <p className="text-gray-500 font-medium mt-1">Interactive manual for the Panya Global CRM ecosystem.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all font-bold text-sm ${
                activeSection === sec.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white/60 backdrop-blur-xl border border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <sec.icon className={`w-5 h-5 ${activeSection === sec.id ? "text-indigo-200" : "text-indigo-500"}`} />
                {sec.title}
              </div>
              <ChevronRight className={`w-4 h-4 ${activeSection === sec.id ? "opacity-100" : "opacity-0"}`} />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl p-8 shadow-sm"
          >
            {activeSection === "roles" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Key className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 font-outfit">Role Management Guide</h3>
                    <p className="text-gray-500 font-medium">How permissions are handled across the system.</p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-900">Owner vs Super Admin</h4>
                    <p className="text-amber-800 text-sm mt-1">
                      "owner" and "super_admin" roles bypass all permission checks automatically in the backend (`admin-guard.php`). 
                      Other roles like "admin" or "hr" require explicit JSON permissions stored in the database.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Standard Admin</h4>
                    <ul className="text-sm text-gray-600 space-y-2 font-medium">
                      <li>• Restricted to assigned modules.</li>
                      <li>• Needs array validation during session login.</li>
                      <li>• Cannot access Settings or User Management.</li>
                    </ul>
                  </div>
                  <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> HR Role</h4>
                    <ul className="text-sm text-gray-600 space-y-2 font-medium">
                      <li>• Access to Attendance, Leaves, Team Tasks.</li>
                      <li>• Can approve/reject leave requests.</li>
                      <li>• Can track live field visits.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "attendance" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 font-outfit">Attendance & HR Module</h3>
                    <p className="text-gray-500 font-medium">Managing employee time, leaves, and field tracking.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 text-lg">Check-in Process</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Employees must check in through the Attendance Dashboard. The system uses the browser's Geolocation API to capture latitude and longitude. 
                    Selfies can also be uploaded via the device camera. Check-out calculates the total hours worked automatically.
                  </p>

                  <h4 className="font-bold text-gray-900 text-lg mt-6">Leave Balance</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Leaves are categorized into Casual, Sick, Earned, etc. Employees can apply via "My Leaves" tab. 
                    Admins and HR can approve/reject via the "Team Leaves" tab.
                  </p>
                </div>
              </div>
            )}

            {activeSection === "operations" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 font-outfit">Operations & Fleet</h3>
                    <p className="text-gray-500 font-medium">Logistics, orders, and vehicle management.</p>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                  <p><strong>Fleet Management:</strong> Track company vehicles, capacities (Tata 407, Mini Truck, etc.), and assign drivers. Vehicles can be marked Active, Inactive, or Maintenance.</p>
                  <p><strong>Order Tracking:</strong> Orders move through a lifecycle (Pending &rarr; Confirmed &rarr; In Transit &rarr; Delivered). Generates Digital Packing Lists and LR Receipts.</p>
                  <p><strong>Vendor Payments:</strong> Track outstanding balances with third-party transport providers and partners.</p>
                </div>
              </div>
            )}

            {activeSection === "finance" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 font-outfit">Finance & GST</h3>
                    <p className="text-gray-500 font-medium">Invoicing, quotations, and tax calculations.</p>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                  <p><strong>Quotations:</strong> Sent dynamically with PDF generation. Clients can approve directly via email links. Data is decoded properly via `json_decode` to prevent blank entries.</p>
                  <p><strong>Invoices & GST:</strong> Base amounts and GST (CGST/SGST/IGST) are calculated based on HSN/SAC codes. The monthly GST Report aggregates this data for filing.</p>
                  <p><strong>Expense Tracker:</strong> Internal company expenses, categorized, with receipt uploads.</p>
                </div>
              </div>
            )}

            {activeSection === "settings" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 font-outfit">System Settings</h3>
                    <p className="text-gray-500 font-medium">Configuration for the CRM ecosystem.</p>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                  <p>Use the global Settings page to configure Company details (Logo, GST Number, PAN, Address), which reflect dynamically on all generated PDFs and emails.</p>
                  <p>Holidays can be added via Attendance settings, preventing employees from being marked absent on official off-days.</p>
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CRMGuideReport;
