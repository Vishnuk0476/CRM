import { Flame, Snowflake, ThermometerSun, AlertCircle } from "lucide-react";

interface Props {
  temperature: string;
}

export function LeadTemperatureBadge({ temperature }: Props) {
  const config: Record<string, { color: string; icon: any; label: string }> = {
    hot: { color: "bg-red-100 text-red-700 border-red-200", icon: Flame, label: "Hot" },
    warm: { color: "bg-orange-100 text-orange-700 border-orange-200", icon: ThermometerSun, label: "Warm" },
    cold: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Snowflake, label: "Cold" },
    urgent: { color: "bg-rose-100 text-rose-700 border-rose-200 animate-pulse", icon: AlertCircle, label: "Urgent" },
  };

  const c = config[temperature?.toLowerCase()] || config.cold;
  const Icon = c.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${c.color}`}>
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}
