import { useState, useEffect } from "react";
import { X, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  caseId: number;
  currentSalesId?: number | null;
  currentManagerId?: number | null;
  onClose: () => void;
  onAssigned: () => void;
}

export function CaseAssignModal({ caseId, currentSalesId, currentManagerId, onClose, onAssigned }: Props) {
  const [salesUsers, setSalesUsers] = useState<any[]>([]);
  const [managerUsers, setManagerUsers] = useState<any[]>([]);
  const [salesId, setSalesId] = useState(currentSalesId ? currentSalesId.toString() : "");
  const [managerId, setManagerId] = useState(currentManagerId ? currentManagerId.toString() : "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/crm/users.php?role=salesperson,consultant")
      .then(res => res.json())
      .then(json => { 
        if (json.success && Array.isArray(json.data?.users)) {
          setSalesUsers(json.data.users); 
        } else {
          setSalesUsers([]);
        }
      })
      .catch(() => setSalesUsers([]));
      
    fetch("/api/crm/users.php?role=manager,super_admin,owner")
      .then(res => res.json())
      .then(json => { 
        if (json.success && Array.isArray(json.data?.users)) {
          setManagerUsers(json.data.users); 
        } else {
          setManagerUsers([]);
        }
      })
      .catch(() => setManagerUsers([]));
  }, []);

  const handleAssign = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/cases/update.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: caseId,
          assigned_sales_id: salesId ? parseInt(salesId) : null,
          assigned_manager_id: managerId ? parseInt(managerId) : null
        })
      });
      const json = await res.json();
      if (json.success) onAssigned();
      else alert(json.error || "Failed to assign team");
    } catch (e) {
      console.error(e);
      alert("Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card w-full max-w-sm rounded-xl border border-border shadow-2xl p-6 relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Assign Team</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Sales Assigned</label>
            <select 
              value={salesId} 
              onChange={e => setSalesId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="">Select a salesperson...</option>
              {salesUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Manager</label>
            <select 
              value={managerId} 
              onChange={e => setManagerId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="">Select a manager...</option>
              {managerUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>
          
          <Button 
            className="w-full bg-violet-600 hover:bg-violet-700 text-white mt-4" 
            disabled={loading}
            onClick={handleAssign}
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserCheck className="w-4 h-4 mr-2" />}
            Confirm Assignment
          </Button>
        </div>
      </div>
    </div>
  );
}
