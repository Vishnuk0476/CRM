import { MapPin, Calendar, CheckCircle, Trash2, ArrowRight } from "lucide-react";
import { GulfNRIBadge } from "./GulfNRIBadge";

interface Props {
  data: any;
  onClick: () => void;
  onDelete?: (e: React.MouseEvent) => void;
}

export function CaseCard({ data, onClick, onDelete }: Props) {
  return (
    <div 
      onClick={onClick}
      className="bg-white/60 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 p-6 cursor-pointer relative overflow-hidden group hover:-translate-y-1 transition-all duration-300"
    >
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute -right-12 -top-12 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md tracking-wider">
            {data.case_number}
          </span>
          <h3 className="font-bold text-gray-900 mt-3 text-lg leading-tight group-hover:text-blue-700 transition-colors">{data.client_name}</h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          <GulfNRIBadge isGulfNri={data.is_gulf_nri} />
          {onDelete && (
            <button 
              onClick={onDelete}
              className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
              title="Delete Case"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-3 mb-5 relative z-10">
        <div className="flex items-start gap-2.5 text-xs text-gray-500 font-medium bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
          <span className="line-clamp-1 flex items-center gap-1.5">
            {data.origin_city || "Origin"} <ArrowRight className="w-3 h-3 text-gray-400" /> {data.destination_city || "Destination"}
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-gray-500 font-medium px-1">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span>Move: <strong className="text-gray-700">{data.move_date_expected || "TBD"}</strong></span>
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between relative z-10">
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 uppercase tracking-wider">
          {data.bhk_type || "Type TBD"}
        </span>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
          <CheckCircle className={`w-3.5 h-3.5 ${data.case_status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`} />
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-700">
            {data.milestone ? data.milestone.replace(/_/g, ' ') : 'Started'}
          </span>
        </div>
      </div>
    </div>
  );
}
