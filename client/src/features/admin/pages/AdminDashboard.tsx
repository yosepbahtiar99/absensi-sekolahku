import React from 'react';
import { useAuthStore } from '../../../shared/store/authStore';
import { useAdminSummary } from '../hooks/useAdminData';
import { Users, GraduationCap, BookOpen, Clock, AlertTriangle, CheckCircle, TrendingUp, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const { data: summary, isLoading } = useAdminSummary();

  const stats = [
    { label: 'Total Guru', value: summary?.totalGuru || 0, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Total Kelas', value: summary?.totalKelas || 0, icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Total Pelajaran', value: summary?.totalPelajaran || 0, icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Overview</h2>
            <p className="text-slate-500 font-medium">Selamat datang kembali, <span className="text-primary font-bold">{user?.name}</span></p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2 text-sm font-bold text-slate-600">
              <Calendar size={18} className="text-primary" />
              {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <Loader2 size={40} className="text-primary animate-spin" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Menyiapkan Data...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="group bg-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 flex flex-col gap-6 transition-all hover:shadow-[0_20px_50px_rgba(8,145,178,0.05)] hover:-translate-y-1">
                  <div className="flex justify-between items-start">
                    <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                      <stat.icon size={28} />
                    </div>
                    <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <TrendingUp size={12} />
                      +12%
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.1em] mb-1">{stat.label}</p>
                    <p className="text-4xl font-black text-slate-900 tabular-nums">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Today's Detail - Bento Style */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                    <Clock size={24} className="text-primary" />
                    Kehadiran Guru Hari Ini
                  </h3>
                  <button className="text-primary font-bold text-sm hover:underline">Lihat Detail</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 rounded-[2.5rem] text-white shadow-lg shadow-green-500/20 relative overflow-hidden group">
                    <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-2 opacity-80">
                        <CheckCircle size={20} />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Hadir Tepat Waktu</span>
                      </div>
                      <p className="text-5xl font-black">{summary?.todayStats.hadir}</p>
                      <p className="mt-4 text-sm font-medium text-green-100">Guru sudah melakukan absensi</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 rounded-[2.5rem] text-white shadow-lg shadow-amber-500/20 relative overflow-hidden group">
                    <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-2 opacity-80">
                        <AlertTriangle size={20} />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Terlambat</span>
                      </div>
                      <p className="text-5xl font-black">{summary?.todayStats.telat}</p>
                      <p className="mt-4 text-sm font-medium text-amber-100">Guru melewati batas waktu</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary p-10 rounded-[3rem] shadow-2xl shadow-primary/20 text-white flex flex-col relative overflow-hidden group">
                <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
                <div className="relative z-10 flex-1">
                  <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-xl border border-white/20">
                    <Calendar size={32} />
                  </div>
                  <h3 className="text-2xl font-black mb-4 leading-tight">Optimalkan Jadwal Belajar</h3>
                  <p className="text-cyan-100 text-sm font-medium leading-relaxed mb-10 opacity-80">
                    Gunakan fitur Drag & Drop untuk mengatur pembagian guru dan mata pelajaran ke setiap kelas secara efisien.
                  </p>
                </div>
                <button className="relative z-10 bg-white text-primary px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-cyan-50 transition-all active:scale-95 shadow-xl group/btn">
                  <span>Atur Jadwal</span>
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
