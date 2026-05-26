import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../shared/store/authStore';
import { useAdminSummary } from '../hooks/useAdminData';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  LayoutDashboard, 
  Tv, 
  CalendarDays, 
  UserPlus, 
  FileSpreadsheet,
  ArrowRight,
  Loader2
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { useAcademicYearStore } from '../../../shared/store/academicYearStore';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { selectedYearId } = useAcademicYearStore();
  const { data: summary, isLoading } = useAdminSummary(selectedYearId || undefined);

  const stats = [
    { label: 'Total Guru', value: summary?.totalGuru || 0, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Total Kelas', value: summary?.totalKelas || 0, icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Total Pelajaran', value: summary?.totalPelajaran || 0, icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  const quickActions = [
    {
      title: 'Pantau Wallboard',
      description: 'Monitoring kehadiran real-time',
      icon: Tv,
      color: 'bg-blue-500 shadow-blue-500/30',
      path: '/admin/wallboard'
    },
    {
      title: 'Atur Jadwal',
      description: 'Kelola jadwal mengajar guru',
      icon: CalendarDays,
      color: 'bg-emerald-500 shadow-emerald-500/30',
      path: '/admin/schedule'
    },
    {
      title: 'Kelola Guru',
      description: 'Tambah atau edit data guru',
      icon: UserPlus,
      color: 'bg-amber-500 shadow-amber-500/30',
      path: '/admin/guru'
    },
    {
      title: 'Laporan Kehadiran',
      description: 'Export data presensi harian',
      icon: FileSpreadsheet,
      color: 'bg-purple-500 shadow-purple-500/30',
      path: '/admin/reports/daily'
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <AdminSidebar />
      
      <main className="flex-1 overflow-hidden flex flex-col">
        <AdminHeader 
          title="Admin Hub" 
          subtitle={`Selamat datang kembali, ${user?.name}`}
          icon={<LayoutDashboard size={28} />}
        />

        <div className="flex-1 p-8 overflow-y-auto">

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <Loader2 size={40} className="text-primary animate-spin" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Menyiapkan Data...</p>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
            
            {/* Quick Actions Section */}
            <div>
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                ⚡ Aksi Cepat
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(action.path)}
                    className="group bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-start text-left transition-all hover:-translate-y-1 active:scale-95"
                  >
                    <div className={`${action.color} text-white p-4 rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg`}>
                      <action.icon size={28} />
                    </div>
                    <h4 className="text-lg font-black text-slate-800 mb-1">{action.title}</h4>
                    <p className="text-sm font-medium text-slate-500 mb-6">{action.description}</p>
                    
                    <div className="mt-auto w-full flex items-center justify-between text-slate-400 group-hover:text-primary transition-colors">
                      <span className="text-xs font-bold uppercase tracking-wider">Buka Menu</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Static Stats Grid */}
            <div>
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                📊 Ringkasan Data Master
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                  <div key={i} className="group bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-6 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:-translate-y-1">
                    <div className="flex justify-between items-start">
                      <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                        <stat.icon size={28} />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.1em] mb-1">{stat.label}</p>
                      <p className="text-4xl font-black text-slate-900 tabular-nums">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
