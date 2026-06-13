import { useState, useEffect } from "react";
import { X, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  leadIds: number[];
  onClose: () => void;
  onAssigned: () => void;
}

export function LeadAssignModal({ leadIds, onClose, onAssigned }: Props) {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/crm/users.php?role=salesperson,consultant")
      .then(res => res.json())
      .then(json => { if (json.success) setUsers(json.data); });
  }, []);

  const handleAssign = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const res = await fetch("/api/crm/leads/assign.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_ids: leadIds, assigned_to: parseInt(selectedUser) })
      });
      const json = await res.json();
      if (json.success) onAssigned();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card w-full max-w-sm rounded-xl border border-border shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Assign {leadIds.length} Lead(s)</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Assign To</label>
            <select 
              value={selectedUser} 
              onChange={e => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
            >
              <option value="">Select a user...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>
          
          <Button 
            className="w-full bg-violet-600 hover:bg-violet-700 text-white" 
            disabled={!selectedUser || loading}
            onClick={handleAssign}
          >
            {loading ? "Assigning..." : <><UserCheck className="w-4 h-4 mr-2" /> Confirm Assignment</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
