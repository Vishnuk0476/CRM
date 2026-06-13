import { useState, useEffect } from "react";
import { Clock, Phone, Mail, FileText, CheckCircle, Flame, Briefcase } from "lucide-react";

interface Props {
  leadId: number;
}

export function LeadTimelineTab({ leadId }: Props) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now we simulate an API call or fetch from existing call logs / followups
    // The activity table was created in crm_08_extend_activities.sql
    // But since we haven't built the exact activities endpoint yet, we'll fetch followups 
    // and format them as a timeline.
    const fetchActivities = async () => {
      try {
        const res = await fetch(`/api/crm/follow-ups.php?lead_id=${leadId}`, { credentials: "include" });
        const json = await res.json();
        if (json.success) {
          setActivities(json.data.map((f: any) => ({
            id: f.id,
            type: f.follow_up_type,
            title: f.notes,
            date: f.created_at_formatted,
            user: f.salesperson_name
          })));
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [leadId]);

  if (loading) return <div className="p-4 text-center text-sm text-muted-foreground animate-pulse">Loading timeline...</div>;

  if (activities.length === 0) return (
    <div className="p-8 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
      No activities recorded yet.
    </div>
  );

  return (
    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
      {activities.map((act, i) => (
        <div key={act.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-violet-100 text-violet-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
            <Clock className="w-4 h-4" />
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-foreground text-sm capitalize">{act.type.replace('_', ' ')}</span>
              <time className="text-xs font-medium text-violet-500">{act.date}</time>
            </div>
            <p className="text-sm text-muted-foreground">{act.title}</p>
            {act.user && <p className="text-[10px] text-muted-foreground mt-2 border-t pt-1">By {act.user}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
