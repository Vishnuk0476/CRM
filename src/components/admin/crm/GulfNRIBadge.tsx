import { Plane } from "lucide-react";

export function GulfNRIBadge({ isGulfNri }: { isGulfNri: boolean | number }) {
  if (!isGulfNri) return null;
  
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200" title="Gulf NRI Lead">
      <Plane className="w-3 h-3" />
      GULF NRI
    </span>
  );
}
