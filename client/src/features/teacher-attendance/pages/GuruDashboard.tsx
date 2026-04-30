import { useNavigate } from 'react-router-dom';
import { useTodaySchedules } from '../hooks/useAttendanceData';
import {
  Calendar, Clock, MapPin, CheckCircle, Camera
} from 'lucide-react';
import { cn } from '../../../shared/lib/utils';

const GuruDashboard = () => {
  const navigate = useNavigate();

  // Main Data (Today)
  const { data: todaySchedules, isLoading: isTodayLoading } = useTodaySchedules();

  const isCurrentSchedule = (startTime: string, endTime: string) => {
    const now = new Date();
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const start = new Date(); start.setHours(startH, startM, 0);
    const end = new Date(); end.setHours(endH, endM, 0);
    return now >= start && now <= end;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          Jadwal Mengajar
        </h2>
        <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
          Aktif Sekarang
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
            const active = isCurrentSchedule(item.startTime, item.endTime);
            const hasAbsen = !!item.Attendance;

            return (
              <div
                key={item.id}
                className={cn(
                  "group relative overflow-hidden transition-all duration-500 rounded-[2rem] p-5 border",
                  active && !hasAbsen
                    ? 'bg-white ring-2 ring-primary ring-offset-4 border-transparent shadow-2xl shadow-primary/10'
                    : 'bg-white shadow-sm border-slate-100 hover:shadow-xl hover:-translate-y-1'
                )}
              >
                {active && !hasAbsen && (
                  <div className="absolute top-0 right-0 p-3">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-5">
                  <div className={cn(
                    "flex flex-col items-center justify-center min-w-[70px] p-3 rounded-2xl transition-colors duration-300",
                    hasAbsen ? 'bg-emerald-50 text-emerald-600' : active ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'
                  )}>
                    <span className="text-[10px] font-black uppercase">{item.startTime.substring(0, 5)}</span>
                    <div className="w-4 h-[2px] bg-current opacity-30 my-1"></div>
                    <span className="text-[10px] font-black uppercase">{item.endTime.substring(0, 5)}</span>
                  </div>

                  <div className="flex-1 space-y-1">
                    <h3 className={cn(
                      "font-bold text-lg leading-tight transition-colors",
                      hasAbsen ? 'text-slate-300 line-through' : 'text-slate-800 group-hover:text-primary'
                    )}>
                      {item.Lesson.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <MapPin size={12} className="text-primary/60" />
                      <span>{item.Class.name}</span>
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
                            ? "bg-primary text-white shadow-lg shadow-primary/30 active:scale-90 hover:scale-105"
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
