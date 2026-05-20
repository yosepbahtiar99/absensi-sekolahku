import { useState, useEffect } from 'react';
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

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000); // update every 10s
    return () => clearInterval(timer);
  }, []);

  // Main Data for Header Stats
  const { data: todaySchedules } = useTodaySchedules();
  
  const completedSchedulesCount = todaySchedules?.filter(s => !s.isBreak && s.Attendance).length || 0;
  const totalSchedulesCount = todaySchedules?.filter(s => !s.isBreak).length || 0;

  const getCurrentTime = () => {
    return currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const navItems = [
    { path: '/home', icon: LayoutGrid, label: 'Home' },
    { path: '/schedule', icon: CalendarDays, label: 'Jadwal' },
    { path: '/approvals', icon: CheckCircle, label: 'Approval' },
    { path: '/profile', icon: User, label: 'Profil' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col overflow-hidden">
      {/* Dynamic Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-cyan-700 text-white pt-8 pb-14 px-6 rounded-b-[2.5rem] shadow-xl shadow-primary/10 shrink-0">
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl"></div>
 
        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-1">
            <p className="text-cyan-100/80 text-[10px] font-bold tracking-[0.2em] uppercase">Guru</p>
            <h1 className="text-2xl font-black tracking-tight line-clamp-1">Halo, {user?.name}!</h1>
          </div>
          <button className="bg-white/15 p-2 rounded-xl backdrop-blur-md border border-white/20 hover:bg-white/30 transition-all active:scale-90">
            <Bell size={20} />
          </button>
        </div>
 
        <div className="mt-5 relative z-10">
          <div className="bg-white/15 backdrop-blur-xl border border-white/20 py-3.5 px-5 rounded-2xl flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Calendar size={18} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-cyan-100/60 font-black uppercase tracking-wider">Hari ini</span>
                <span className="text-xs font-bold">
                  {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-white/20"></div>
            <div className="flex items-center gap-2 pr-1">
              <Clock size={16} className="text-cyan-200" />
              <span className="text-base font-black tabular-nums">{getCurrentTime()}</span>
            </div>
          </div>
        </div>
      </div>
 
      {/* Stats Summary - Mini Bento */}
      <div className="px-6 -mt-8 grid grid-cols-2 gap-4 relative z-20 shrink-0">
        <div className="bg-white py-3.5 px-5 rounded-2xl shadow-lg shadow-black/5 border border-slate-100 flex items-center gap-3.5">
          <div className="bg-orange-50 p-2.5 rounded-xl">
            <LayoutGrid size={18} className="text-orange-500" />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Jadwal</p>
            <p className="text-lg font-black text-slate-800 tabular-nums">{totalSchedulesCount}</p>
          </div>
        </div>
        <div className="bg-white py-3.5 px-5 rounded-2xl shadow-lg shadow-black/5 border border-slate-100 flex items-center gap-3.5">
          <div className="bg-emerald-50 p-2.5 rounded-xl">
            <CheckCircle size={18} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Selesai</p>
            <p className="text-lg font-black text-slate-800 tabular-nums">{completedSchedulesCount}</p>
          </div>
        </div>
      </div>
 
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-4 px-6 pb-32 min-h-0">
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
                <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default GuruLayout;
