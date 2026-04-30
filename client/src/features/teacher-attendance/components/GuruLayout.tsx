import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../shared/store/authStore';
import { useTodaySchedules } from '../hooks/useAttendanceData';
import {
  Bell, LayoutGrid, Calendar, Clock, CheckCircle, User, CalendarDays
} from 'lucide-react';
import { cn } from '../../../shared/lib/utils';

const GuruLayout = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Main Data for Header Stats
  const { data: todaySchedules } = useTodaySchedules();
  
  const completedSchedulesCount = todaySchedules?.filter(s => s.Attendance).length || 0;
  const totalSchedulesCount = todaySchedules?.length || 0;

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const navItems = [
    { path: '/home', icon: LayoutGrid, label: 'Home' },
    { path: '/schedule', icon: CalendarDays, label: 'Jadwal' },
    { path: '/approvals', icon: CheckCircle, label: 'Approval' },
    { path: '/profile', icon: User, label: 'Profil' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-40">
      {/* Dynamic Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-cyan-700 text-white pt-12 pb-20 px-6 rounded-b-[3.5rem] shadow-2xl shadow-primary/20">
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl"></div>

        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-1">
            <p className="text-cyan-100/80 text-xs font-bold tracking-[0.2em] uppercase">Guru</p>
            <h1 className="text-3xl font-black tracking-tight line-clamp-1">Halo, {user?.name}!</h1>
          </div>
          <button className="bg-white/15 p-3 rounded-2xl backdrop-blur-md border border-white/20 hover:bg-white/30 transition-all active:scale-90">
            <Bell size={24} />
          </button>
        </div>

        <div className="mt-8 relative z-10">
          <div className="bg-white/15 backdrop-blur-xl border border-white/20 p-5 rounded-[2rem] flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2.5 rounded-xl">
                <Calendar size={20} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-cyan-100/60 font-black uppercase tracking-wider">Hari ini</span>
                <span className="text-sm font-bold">
                  {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
            </div>
            <div className="h-10 w-[1px] bg-white/20"></div>
            <div className="flex items-center gap-3 pr-2">
              <Clock size={18} className="text-cyan-200" />
              <span className="text-lg font-black tabular-nums">{getCurrentTime()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary - Mini Bento */}
      <div className="px-6 -mt-10 grid grid-cols-2 gap-4 relative z-20">
        <div className="bg-white p-5 rounded-[2rem] shadow-xl shadow-black/5 border border-slate-50 flex items-center gap-4">
          <div className="bg-orange-50 p-3 rounded-2xl">
            <LayoutGrid size={22} className="text-orange-500" />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Jadwal</p>
            <p className="text-xl font-black text-slate-800 tabular-nums">{totalSchedulesCount}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-[2rem] shadow-xl shadow-black/5 border border-slate-50 flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-2xl">
            <CheckCircle size={22} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Selesai</p>
            <p className="text-xl font-black text-slate-800 tabular-nums">{completedSchedulesCount}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        <Outlet />
      </main>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-8 left-6 right-6 z-50">
        <nav className="bg-white/90 backdrop-blur-2xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2.5rem] p-2 flex justify-between items-center px-6">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-300",
                  active ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
                )}
              >
                <div className={cn(
                  "p-2.5 rounded-2xl transition-all duration-500",
                  active && "bg-primary text-white shadow-lg shadow-primary/40 -mt-8 scale-110"
                )}>
                  <item.icon size={20} />
                </div>
                {!active && <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default GuruLayout;
