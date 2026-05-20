import { useState, useEffect } from 'react';
import { useTodaySchedules } from '../hooks/useAttendanceData';
import { Loader2, Clock, Coffee } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';

const GuruSchedule = () => {
  const [selectedDay, setSelectedDay] = useState<string>(
    ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'][new Date().getDay()]
  );
  
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000); // update every 10s
    return () => clearInterval(timer);
  }, []);

  const { data: filteredSchedules, isLoading: isFilteredLoading } = useTodaySchedules(selectedDay);

  const isCurrentSchedule = (startTime: string, endTime: string) => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const start = new Date(now); start.setHours(startH, startM, 0);
    const end = new Date(now); end.setHours(endH, endM, 0);
    return now >= start && now <= end;
  };

  const isToday = selectedDay === ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'][new Date().getDay()];

  const days = [
    { key: 'senin', label: 'Sen' },
    { key: 'selasa', label: 'Sel' },
    { key: 'rabu', label: 'Rab' },
    { key: 'kamis', label: 'Kam' },
    { key: 'jumat', label: 'Jum' },
    { key: 'sabtu', label: 'Sab' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between gap-1">
        {days.map((day) => (
          <button
            key={day.key}
            onClick={() => setSelectedDay(day.key)}
            className={cn(
              "flex-1 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all",
              selectedDay === day.key
                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            )}
          >
            {day.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 pb-10">
        {isFilteredLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={32} className="text-primary animate-spin" />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Jadwal...</p>
          </div>
        ) : filteredSchedules?.length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] text-center border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold text-sm">Tidak ada jadwal di hari {selectedDay}.</p>
          </div>
        ) : (
          filteredSchedules?.map((item) => {
            const active = isToday && isCurrentSchedule(item.startTime, item.endTime);

            if (item.isBreak) {
              return (
                <div 
                  key={item.id} 
                  className={cn(
                    "p-5 rounded-[2rem] flex items-center gap-5 transition-all duration-500",
                    active
                      ? "bg-emerald-50/20 border border-dashed border-emerald-400 ring-2 ring-emerald-500/10 shadow-lg shadow-emerald-950/5 scale-[1.02]"
                      : "bg-slate-50/60 border border-dashed border-slate-200 opacity-80"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-2xl flex flex-col items-center min-w-[70px] transition-colors duration-300",
                    active ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                  )}>
                    <span className="text-[10px] font-black">{item.startTime.substring(0, 5)}</span>
                    <div className="w-4 h-[1px] bg-current opacity-30 my-1"></div>
                    <span className="text-[10px] font-black">{item.endTime.substring(0, 5)}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className={cn(
                      "font-bold text-lg transition-colors",
                      active ? "text-emerald-700 font-extrabold" : "text-slate-500"
                    )}>
                      Jam Kosong
                    </h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.TimeSlot?.label || "Waktu Luang"}</p>
                  </div>
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    active ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-300"
                  )}>
                    <Coffee size={18} className={active ? "animate-bounce" : ""} />
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={item.id} 
                className={cn(
                  "p-5 rounded-[2rem] border flex items-center gap-5 group transition-all duration-500",
                  active
                    ? "bg-white border-emerald-500 ring-2 ring-emerald-500/15 shadow-xl shadow-emerald-950/5 scale-[1.02]"
                    : "bg-white border-slate-100 shadow-sm hover:border-primary/20 hover:shadow-md"
                )}
              >
                <div className={cn(
                  "p-3 rounded-2xl flex flex-col items-center min-w-[70px] transition-colors duration-300",
                  active ? "bg-emerald-600 text-white" : "bg-slate-50 text-slate-400"
                )}>
                  <span className="text-[10px] font-black">{item.startTime.substring(0, 5)}</span>
                  <div className="w-4 h-[1px] bg-current opacity-30 my-1"></div>
                  <span className="text-[10px] font-black">{item.endTime.substring(0, 5)}</span>
                </div>
                <div className="flex-1">
                  <h4 className={cn(
                    "font-bold text-lg transition-colors",
                    active ? "text-emerald-700 font-extrabold" : "text-slate-800 group-hover:text-primary"
                  )}>
                    {item.Lesson?.name}
                  </h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.Class?.name}</p>
                </div>
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                  active ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-300"
                )}>
                  <Clock size={18} className={active ? "animate-spin-slow" : ""} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GuruSchedule;
