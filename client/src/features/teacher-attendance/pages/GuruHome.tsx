import { useState } from 'react';
import { useAuthStore } from '../../../shared/store/authStore';
import { useTodaySchedules } from '../hooks/useAttendanceData';
import ScheduleCard from '../components/ScheduleCard';
import { Bell, User, LayoutGrid, Calendar, Loader2, Clock, LogOut, Settings, ChevronRight, ShieldCheck } from 'lucide-react';
import { Button } from '../../../shared/components/Button';

const GuruHome = () => {
  const { user, logout } = useAuthStore();
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
    <>
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center justify-between mb-8">
        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Jadwal Mengajar
          </h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(8,145,178,0.4)]"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Sesi Hari Ini</p>
          </div>
        </div>
        <div className="w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-primary shadow-inner">
          <Calendar size={24} />
        </div>
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
          <p className="text-slate-400 text-sm font-medium">Santai dulu ya, hari ini anda tidak ada jadwal mengajar ☕.</p>
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
    </>
  );

  const renderApproval = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
        <ShieldCheck size={48} />
      </div>
      <h3 className="text-xl font-black text-slate-800 mb-2">Riwayat Approval</h3>
      <p className="text-slate-500 text-sm max-w-[250px] font-medium">Fitur ini bakal nampilin riwayat absensi lu yang udah di-approve admin.</p>
      <div className="mt-8 bg-white p-6 rounded-3xl border border-dashed border-slate-200 w-full">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Coming Soon</p>
      </div>
    </div>
  );

  const renderUser = () => (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-primary font-black text-3xl">
            {user?.name?.charAt(0)}
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{user?.name}</h3>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">NIP: {user?.username}</p>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest mt-4">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            Guru Aktif
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 bg-slate-50/50">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Pengaturan Akun</p>
        </div>
        <button className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
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
        <button className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
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

      <div className="text-center py-4">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Absensi Sekolahku v1.0.0</p>
      </div>
    </div>
  );

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
              <p className="text-cyan-100/80 text-xs font-bold uppercase tracking-[0.2em] mb-0.5">Semangat Pagi!</p>
              <h1 className="text-2xl font-black text-white tracking-tight">{user?.name}</h1>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white relative">
              <Bell size={22} />
              <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-primary"></div>
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
        {activeTab === 'home' && renderHome()}
        {activeTab === 'approval' && renderApproval()}
        {activeTab === 'user' && renderUser()}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/80 backdrop-blur-2xl border border-white shadow-2xl shadow-slate-900/10 rounded-[2.5rem] p-3 flex justify-between items-center z-50">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex-1 flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'home' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className={`p-2.5 rounded-2xl transition-all duration-300 ${activeTab === 'home' ? 'bg-primary/10 scale-110' : ''}`}>
            <LayoutGrid size={24} />
          </div>
        </button>
        <button
          onClick={() => setActiveTab('approval')}
          className={`flex-1 flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'approval' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className={`p-2.5 rounded-2xl transition-all duration-300 ${activeTab === 'approval' ? 'bg-primary/10 scale-110' : ''}`}>
            <Calendar size={24} />
          </div>
        </button>
        <button
          onClick={() => setActiveTab('user')}
          className={`flex-1 flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'user' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className={`p-2.5 rounded-2xl transition-all duration-300 ${activeTab === 'user' ? 'bg-primary/10 scale-110' : ''}`}>
            <User size={24} />
          </div>
        </button>
      </nav>
    </div>
  );
};

export default GuruHome;
