import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTodaySchedules } from '../hooks/useAttendanceData';
import {
  Calendar, Clock, MapPin, CheckCircle, Camera, Coffee
} from 'lucide-react';
import { cn } from '../../../shared/lib/utils';

const GuruDashboard = () => {
  const navigate = useNavigate();

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000); // update every 10s
    return () => clearInterval(timer);
  }, []);

  // Main Data (Today)
  const { data: todaySchedules, isLoading: isTodayLoading } = useTodaySchedules();

  const isCurrentSchedule = (startTime: string, endTime: string) => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const start = new Date(now); start.setHours(startH, startM, 0);
    const end = new Date(now); end.setHours(endH, endM, 0);
    return now >= start && now <= end;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          Jadwal Mengajar
        </h2>
        <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
          Hari Ini
        </span>
      </div>

      {isTodayLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium text-sm">Menyiapkan jadwal...</p>
        </div>
      ) : todaySchedules?.length === 0 ? (
        <div className="bg-white p-10 rounded-[2.5rem] text-center shadow-xl shadow-cyan-900/5 border border-slate-50">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Calendar size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Libur Mengajar</h3>
          <p className="text-slate-500 text-sm leading-relaxed px-4">Nikmati waktu istirahat Anda, tidak ada jadwal mengajar untuk hari ini.</p>
        </div>
      ) : (
        <div className="space-y-4 pb-10">
          {todaySchedules?.map((item) => {
            if (item.isBreak) {
              const active = isCurrentSchedule(item.startTime, item.endTime);
              return (
                <div
                  key={item.id}
                  className={cn(
                    "transition-all duration-500 rounded-[2rem] p-5 flex items-center gap-5",
                    active
                      ? "bg-emerald-50/20 border border-dashed border-emerald-400 ring-2 ring-emerald-500/10 shadow-lg shadow-emerald-950/5 scale-[1.02]"
                      : "bg-slate-50/60 border border-dashed border-slate-200 opacity-80"
                  )}
                >
                  <div className={cn(
                    "flex flex-col items-center justify-center min-w-[70px] p-3 rounded-2xl transition-colors duration-300",
                    active ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                  )}>
                    <span className="text-[10px] font-black uppercase">{item.startTime.substring(0, 5)}</span>
                    <div className="w-4 h-[2px] bg-current opacity-30 my-1"></div>
                    <span className="text-[10px] font-black uppercase">{item.endTime.substring(0, 5)}</span>
                  </div>

                  <div className="flex-1 space-y-1">
                    <h3 className={cn(
                      "font-bold text-lg leading-tight transition-colors",
                      active ? "text-emerald-700" : "text-slate-500"
                    )}>
                      Jam Kosong
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <Clock size={12} className={active ? "text-emerald-500" : "text-slate-450"} />
                      <span className={active ? "text-emerald-600/85 font-black" : ""}>{item.TimeSlot?.label || "Waktu Luang"}</span>
                    </div>
                  </div>

                  <div className={cn("pl-2 pr-2 transition-colors", active ? "text-emerald-500" : "text-slate-400")}>
                    <Coffee size={20} className={active ? "animate-bounce" : ""} />
                  </div>
                </div>
              );
            }

            const active = isCurrentSchedule(item.startTime, item.endTime);
            const hasAbsen = !!item.Attendance;

            return (
              <div
                key={item.id}
                className={cn(
                  "group relative overflow-hidden transition-all duration-500 rounded-[2rem] p-5 border",
                  active
                    ? hasAbsen
                      ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/10 shadow-xl shadow-emerald-950/5 scale-[1.02]'
                      : 'bg-white ring-2 ring-emerald-500 ring-offset-4 border-transparent shadow-2xl shadow-emerald-950/15 scale-[1.02]'
                    : 'bg-white shadow-sm border-slate-100 hover:shadow-xl hover:-translate-y-1'
                )}
              >
                {active && (
                  <div className="absolute top-0 right-0 p-3">
                    <span className="flex h-2.5 w-2.5 relative">
                      {!hasAbsen && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                      )}
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-5">
                  <div className={cn(
                    "flex flex-col items-center justify-center min-w-[70px] p-3 rounded-2xl transition-colors duration-300",
                    hasAbsen 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                      : active 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-50 text-slate-400'
                  )}>
                    <span className="text-[10px] font-black uppercase">{item.startTime.substring(0, 5)}</span>
                    <div className="w-4 h-[2px] bg-current opacity-30 my-1"></div>
                    <span className="text-[10px] font-black uppercase">{item.endTime.substring(0, 5)}</span>
                  </div>

                  <div className="flex-1 space-y-1">
                    <h3 className={cn(
                      "font-bold text-lg leading-tight transition-colors",
                      hasAbsen 
                        ? 'text-slate-300 line-through' 
                        : active 
                          ? 'text-emerald-700 font-extrabold group-hover:text-emerald-600' 
                          : 'text-slate-800 group-hover:text-primary'
                    )}>
                      {item.Lesson?.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <MapPin size={12} className={active ? "text-emerald-500" : "text-primary/60"} />
                      <span className={active && !hasAbsen ? "text-emerald-600/80 font-black" : ""}>{item.Class?.name}</span>
                    </div>
                  </div>

                  <div className="pl-2">
                    {hasAbsen ? (
                      <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg shadow-emerald-200">
                        <CheckCircle size={20} />
                      </div>
                    ) : (
                      <button
                        onClick={() => active && navigate(`/attendance/${item.id}`)}
                        disabled={!active}
                        className={cn(
                          "p-4 rounded-2xl transition-all flex items-center justify-center",
                          active
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 active:scale-90 hover:scale-105"
                            : "bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed"
                        )}
                      >
                        {active ? <Camera size={20} /> : <Clock size={20} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GuruDashboard;
