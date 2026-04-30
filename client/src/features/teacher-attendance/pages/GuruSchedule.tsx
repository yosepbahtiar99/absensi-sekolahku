import { useState } from 'react';
import { useTodaySchedules } from '../hooks/useAttendanceData';
import { Loader2, Clock } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';

const GuruSchedule = () => {
  const [selectedDay, setSelectedDay] = useState<string>(
    ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'][new Date().getDay()]
  );
  
  const { data: filteredSchedules, isLoading: isFilteredLoading } = useTodaySchedules(selectedDay);

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
          filteredSchedules?.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-primary/20 transition-all">
              <div className="bg-slate-50 text-slate-400 p-3 rounded-2xl flex flex-col items-center min-w-[70px]">
                <span className="text-[10px] font-black">{item.startTime.substring(0, 5)}</span>
                <div className="w-4 h-[1px] bg-slate-300 my-1"></div>
                <span className="text-[10px] font-black">{item.endTime.substring(0, 5)}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 text-lg group-hover:text-primary transition-colors">{item.Lesson.name}</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.Class.name}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                <Clock size={18} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GuruSchedule;
