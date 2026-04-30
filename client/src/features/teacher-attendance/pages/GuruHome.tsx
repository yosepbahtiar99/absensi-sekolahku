import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../shared/store/authStore';
import { useTodaySchedules } from '../hooks/useAttendanceData';
import { 
  Bell, User, LayoutGrid, Calendar, Loader2, Clock, 
  LogOut, Settings, ChevronRight, ShieldCheck, MapPin, 
  CheckCircle, Camera, ArrowRight 
} from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { cn } from '../../../shared/lib/utils';

const GuruHome = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { data: schedules, isLoading, error } = useTodaySchedules();
  const [activeTab, setActiveTab] = useState<'home' | 'approval' | 'user'>('home');

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

  const renderHome = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          Jadwal Mengajar
        </h2>
        <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
          Aktif Sekarang
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium text-sm">Menyiapkan jadwal...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 text-center">
          <p className="text-red-600 font-bold">Gagal memuat jadwal.</p>
          <Button variant="ghost" onClick={() => window.location.reload()} className="mt-2 text-red-600 font-black text-xs uppercase tracking-widest">Coba Lagi</Button>
        </div>
      ) : schedules?.length === 0 ? (
        <div className="bg-white p-10 rounded-[2.5rem] text-center shadow-xl shadow-cyan-900/5 border border-slate-50">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Calendar size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Libur Mengajar</h3>
          <p className="text-slate-500 text-sm leading-relaxed px-4">Nikmati waktu istirahat Anda, tidak ada jadwal mengajar untuk hari ini.</p>
        </div>
      ) : (
        <div className="space-y-4 pb-10">
          {schedules?.map((item) => {
            const active = isCurrentSchedule(item.startTime, item.endTime);
            const hasAbsen = !!item.Attendance;

            return (
              <div 
                key={item.id} 
                className={cn(
                  "group relative overflow-hidden transition-all duration-500 rounded-[2rem] p-5 border",
                  active && !hasAbsen 
                    ? 'bg-white ring-2 ring-primary ring-offset-4 border-transparent' 
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
                  {/* Time Badge */}
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

  const renderApproval = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
        <ShieldCheck size={48} />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">Riwayat Approval</h3>
      <p className="text-slate-500 text-sm max-w-[250px] font-medium">Fitur ini bakal nampilin riwayat absensi lu yang udah di-approve admin.</p>
      <div className="mt-8 bg-white p-6 rounded-3xl border border-dashed border-slate-200 w-full text-slate-300 font-bold uppercase tracking-widest text-[10px]">
        Segera Hadir
      </div>
    </div>
  );

  const renderUser = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-primary font-black text-3xl">
            {user?.name?.charAt(0)}
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{user?.name}</h3>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">NIP: {user?.username}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-2">
        <button className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors group rounded-[1.5rem]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <User size={20} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-700">Detail Profil</p>
              <p className="text-[10px] text-slate-400 font-medium">Lihat info lengkap lu</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-300" />
        </button>
        <button className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors group rounded-[1.5rem] mt-1">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <Settings size={20} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-700">Keamanan</p>
              <p className="text-[10px] text-slate-400 font-medium">Ganti password & akses</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-300" />
        </button>
      </div>

      <button
        onClick={logout}
        className="w-full bg-red-50 hover:bg-red-100 text-red-600 p-6 rounded-[2.5rem] flex items-center justify-between transition-all group active:scale-[0.98]"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-200 group-hover:rotate-12 transition-transform">
            <LogOut size={24} />
          </div>
          <div className="text-left">
            <p className="text-base font-black tracking-tight">Keluar Aplikasi</p>
            <p className="text-xs font-bold text-red-600/60 uppercase tracking-widest">Logout Sekarang</p>
          </div>
        </div>
        <ChevronRight size={20} className="text-red-300" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-36">
      {/* Dynamic Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-cyan-700 text-white pt-12 pb-20 px-6 rounded-b-[3.5rem] shadow-2xl shadow-primary/20">
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl"></div>
        
        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-1">
            <p className="text-cyan-100/80 text-xs font-bold tracking-[0.2em] uppercase">Selamat Datang</p>
            <h1 className="text-3xl font-black tracking-tight">{user?.name}</h1>
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
            <div className="h-10 w-[px] bg-white/20"></div>
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
            <p className="text-xl font-black text-slate-800 tabular-nums">{totalSchedules}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-[2rem] shadow-xl shadow-black/5 border border-slate-50 flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-2xl">
            <CheckCircle size={22} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Selesai</p>
            <p className="text-xl font-black text-slate-800 tabular-nums">{completedSchedules}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6 pb-12">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'approval' && renderApproval()}
        {activeTab === 'user' && renderUser()}
      </main>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-8 left-6 right-6 z-50">
        <nav className="bg-white/90 backdrop-blur-2xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2.5rem] p-3 flex justify-between items-center px-10">
          <button 
            onClick={() => setActiveTab('home')}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              activeTab === 'home' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
            )}
          >
            <div className={cn(
              "p-3 rounded-2xl transition-all duration-500",
              activeTab === 'home' && "bg-primary text-white shadow-lg shadow-primary/40 -mt-10 scale-110"
            )}>
              <LayoutGrid size={24} />
            </div>
            {activeTab !== 'home' && <span className="text-[9px] font-black uppercase tracking-widest">Beranda</span>}
          </button>
          
          <button 
            onClick={() => setActiveTab('approval')}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              activeTab === 'approval' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
            )}
          >
            <div className={cn(
              "p-3 rounded-2xl transition-all duration-500",
              activeTab === 'approval' && "bg-primary text-white shadow-lg shadow-primary/40 -mt-10 scale-110"
            )}>
              <ShieldCheck size={24} />
            </div>
            {activeTab !== 'approval' && <span className="text-[9px] font-black uppercase tracking-widest">Approval</span>}
          </button>

          <button 
            onClick={() => setActiveTab('user')}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              activeTab === 'user' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
            )}
          >
            <div className={cn(
              "p-3 rounded-2xl transition-all duration-500",
              activeTab === 'user' && "bg-primary text-white shadow-lg shadow-primary/40 -mt-10 scale-110"
            )}>
              <User size={24} />
            </div>
            {activeTab !== 'user' && <span className="text-[9px] font-black uppercase tracking-widest">Profil</span>}
          </button>
        </nav>
      </div>
    </div>
  );
};

export default GuruHome;
