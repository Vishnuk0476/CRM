import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Types ──────────────────────────────────────────────────────────────────
interface CalStats {
  year: number; month: number; from: string; to: string;
  total: number; max: number; daily: Record<string, number>;
}

interface Props {
  /** Called when user clicks a date (ISO string "YYYY-MM-DD") or null to clear */
  onDateFilter?: (date: string | null) => void;
  selectedDate?: string | null;
}

const MONTH_NAMES = ["January","February","March","April","May","June",
                     "July","August","September","October","November","December"];
const DAY_LABELS  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Intensity level 0-4 based on count relative to month max
function intensityClass(count: number, max: number): string {
  if (!count || !max) return "bg-muted/40 hover:bg-muted/60";
  const ratio = count / max;
  if (ratio >= 0.75) return "bg-primary       text-white shadow-md shadow-primary/30 hover:bg-primary/90";
  if (ratio >= 0.5)  return "bg-primary/70    text-white hover:bg-primary/80";
  if (ratio >= 0.25) return "bg-primary/40    text-primary-foreground hover:bg-primary/50";
  return                      "bg-primary/15   text-primary hover:bg-primary/25";
}

// ── Component ──────────────────────────────────────────────────────────────
export default function LeadsCalendar({ onDateFilter, selectedDate }: Props) {
  const now       = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-indexed
  const [stats, setStats] = useState<CalStats | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async (y = year, m = month) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/calendar-stats.php?year=${y}&month=${m}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [year, month]);

  // Navigate months
  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };
  const goToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth() + 1); };

  // Build calendar grid
  const buildGrid = () => {
    const firstDow = new Date(year, month - 1, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month, 0).getDate();
    const cells: Array<{ date: string | null; day: number | null }> = [];
    for (let i = 0; i < firstDow; i++) cells.push({ date: null, day: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      cells.push({ date: dateStr, day: d });
    }
    return cells;
  };

  const grid   = buildGrid();
  const today  = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;

  const handleDayClick = (dateStr: string) => {
    if (!onDateFilter) return;
    onDateFilter(selectedDate === dateStr ? null : dateStr);
  };

  return (
    <div className="glass rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Lead Calendar</p>
          {stats && (
            <span className="ml-1 text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
              {stats.total} leads
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <button onClick={goToday}
            className="text-xs font-semibold text-foreground px-2.5 py-1 rounded-lg hover:bg-muted transition-colors min-w-[130px] text-center">
            {MONTH_NAMES[month - 1]} {year}
          </button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => load()}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="p-4">
        {/* Day labels */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${year}-${month}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-7 gap-1"
          >
            {grid.map((cell, idx) => {
              if (!cell.date) return <div key={idx} />;
              const count      = stats?.daily[cell.date] ?? 0;
              const isToday    = cell.date === today;
              const isSelected = cell.date === selectedDate;
              const isCls      = intensityClass(count, stats?.max ?? 0);

              return (
                <motion.button
                  key={cell.date}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDayClick(cell.date!)}
                  title={count ? `${count} lead${count > 1 ? "s" : ""} on ${cell.date}` : cell.date}
                  className={`
                    relative flex flex-col items-center justify-center rounded-xl py-2 px-1 text-xs transition-all cursor-pointer
                    ${count ? isCls : "bg-muted/30 text-muted-foreground hover:bg-muted/50"}
                    ${isToday    ? "ring-2 ring-primary ring-offset-1 font-bold" : ""}
                    ${isSelected ? "ring-2 ring-secondary ring-offset-1" : ""}
                  `}
                >
                  <span className={`font-semibold ${count ? "" : "opacity-60"}`}>{cell.day}</span>
                  {count > 0 && (
                    <span className={`text-[9px] leading-none mt-0.5 font-bold opacity-90`}>{count}</span>
                  )}
                  {isSelected && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-secondary border-2 border-background" />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Selected date banner */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex items-center justify-between px-3 py-2 bg-secondary/10 rounded-xl border border-secondary/20"
            >
              <p className="text-xs font-semibold text-secondary">
                Showing leads for: <span className="font-mono">{selectedDate}</span>
                {stats?.daily[selectedDate] !== undefined && (
                  <span className="ml-2 text-muted-foreground font-normal">
                    ({stats.daily[selectedDate] ?? 0} leads)
                  </span>
                )}
              </p>
              <button onClick={() => onDateFilter?.(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <div className="mt-3 flex items-center gap-2 justify-end">
          <span className="text-[10px] text-muted-foreground">Less</span>
          {[0, 0.15, 0.4, 0.65, 1].map((r, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-sm ${i === 0 ? "bg-muted/40" : i === 1 ? "bg-primary/15" : i === 2 ? "bg-primary/40" : i === 3 ? "bg-primary/70" : "bg-primary"}`}
            />
          ))}
          <span className="text-[10px] text-muted-foreground">More</span>
        </div>
      </div>
    </div>
  );
}
