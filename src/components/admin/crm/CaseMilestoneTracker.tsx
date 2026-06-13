import { CheckCircle, Circle, ArrowRight } from "lucide-react";

interface Props {
  currentMilestone: string;
  onMilestoneClick?: (milestone: string) => void;
}

const MILESTONES = [
  "inquiry_received", 
  "survey_completed", 
  "quotation_sent", 
  "quotation_accepted", 
  "packing_scheduled",
  "in_transit",
  "delivered"
];

export function CaseMilestoneTracker({ currentMilestone, onMilestoneClick }: Props) {
  const currentIndex = MILESTONES.indexOf(currentMilestone);
  
  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex items-center min-w-max px-2">
        {MILESTONES.map((ms, i) => {
          const isCompleted = i <= currentIndex;
          const isCurrent = i === currentIndex;
          
          return (
            <div key={ms} className="flex items-center">
              <div 
                className={`flex flex-col items-center ${onMilestoneClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                onClick={() => onMilestoneClick?.(ms)}
                title={`Mark as ${ms.replace(/_/g, ' ')}`}
              >
                {isCompleted ? (
                  <CheckCircle className={`w-6 h-6 ${isCurrent ? 'text-blue-600' : 'text-green-500'}`} />
                ) : (
                  <Circle className="w-6 h-6 text-muted-foreground/30 hover:text-blue-400 transition-colors" />
                )}
                <span className={`text-[10px] font-semibold mt-1 uppercase tracking-wider ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-muted-foreground/50'}`}>
                  {ms.replace(/_/g, ' ')}
                </span>
              </div>
              
              {i < MILESTONES.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${i < currentIndex ? 'bg-green-500' : 'bg-muted-foreground/20'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
