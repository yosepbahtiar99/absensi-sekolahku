import { useAuthStore } from '../../../shared/store/authStore';
import { useTodaySchedules } from '../hooks/useAttendanceData';
import ScheduleCard from '../components/ScheduleCard';
import { Bell, User, LayoutGrid, Calendar, Loader2, Clock } from 'lucide-react';
import { Button } from '../../../shared/components/Button';

const GuruHome = () => {
  const { user, logout } = useAuthStore();
  const { data: schedules, isLoading, error } = useTodaySchedules();

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const isCurrentSchedule = (startTime: string, endTime: string) => {
    const now = new Date();
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    const start = new Date(); start.setHours(startH, startM, 0);
    const end = new Date(); end.setHours(endH, endM, 0);
    
    return now >= start && now <= end;
  };

  const completedSchedules = schedules?.filter(s => s.Attendance).length || 0;
  const totalSchedules = schedules?.length || 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* Header Section */}
      <div className="bg-primary pt-14 pb-20 px-6 rounded-b-[3.5rem] shadow-2xl shadow-primary/20 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="relative z-10 flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[1.5rem] bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white font-black text-xl shadow-inner">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-cyan-100/80 text-xs font-bold uppercase tracking-[0.2em] mb-0.5">Selamat Pagi</p>
              <h1 className="text-2xl font-black text-white tracking-tight">{user?.name}</h1>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white relative">
              <Bell size={22} />
              <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-primary"></div>
            </button>
            <button onClick={logout} className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white">
              <User size={22} />
            </button>
          </div>
        </div>

        {/* Quick Stats Bento */}
        <div className="relative z-10 grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/10 p-5 rounded-[2rem]">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-2 rounded-xl text-white">
                <Calendar size={16} />
              </div>
              <p className="text-[10px] font-black text-white/80 uppercase tracking-widest">Selesai</p>
            </div>
            <p className="text-3xl font-black text-white tabular-nums">{completedSchedules}<span className="text-white/40 text-lg ml-1">/{totalSchedules}</span></p>
          </div>
          <div className="bg-white/10 backdrop-blur-2xl border border-white/10 p-5 rounded-[2rem]">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-2 rounded-xl text-white">
                <Clock size={16} />
              </div>
              <p className="text-[10px] font-black text-white/80 uppercase tracking-widest">Waktu</p>
            </div>
            <p className="text-2xl font-black text-white tabular-nums">{getCurrentTime()}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-6 -mt-10 relative z-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <LayoutGrid size={20} className="text-primary" />
            Jadwal Mengajar
          </h2>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Hari Ini</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={40} className="text-primary animate-spin" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Memuat Jadwal...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 text-center">
            <p className="text-red-600 font-bold">Gagal memuat jadwal.</p>
            <Button variant="ghost" onClick={() => window.location.reload()} className="mt-2 text-red-600 font-black text-xs uppercase tracking-widest">Coba Lagi</Button>
          </div>
        ) : schedules?.length === 0 ? (
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 text-center shadow-sm">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Tidak Ada Jadwal</h3>
            <p className="text-slate-400 text-sm font-medium">Santai dulu bro, hari ini lu nggak ada jadwal mengajar.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {schedules?.map((schedule) => (
              <ScheduleCard 
                key={schedule.id} 
                schedule={schedule} 
                isCurrent={isCurrentSchedule(schedule.startTime, schedule.endTime)} 
              />
            ))}
          </div>
        )}
      </main>

      {/* Bottom Nav Mockup */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/80 backdrop-blur-2xl border border-white shadow-2xl shadow-slate-900/10 rounded-[2.5rem] p-3 flex justify-between items-center z-50">
        <button className="flex-1 flex flex-col items-center gap-1 text-primary">
          <div className="bg-primary/10 p-2.5 rounded-2xl">
            <LayoutGrid size={24} />
          </div>
        </button>
        <button className="flex-1 flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors">
          <Calendar size={24} />
        </button>
        <button className="flex-1 flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors">
          <User size={24} />
        </button>
      </nav>
    </div>
  );
};

export default GuruHome;
