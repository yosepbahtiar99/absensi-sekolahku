import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Users, GraduationCap, BookOpen, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

interface Summary {
  totalGuru: number;
  totalKelas: number;
  totalPelajaran: number;
  todayStats: { hadir: number; telat: number };
}

const AdminDashboard = () => {
  const { token } = useAuthStore();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/admin/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSummary(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [token]);

  const stats = [
    { label: 'Total Guru', value: summary?.totalGuru || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Kelas', value: summary?.totalKelas || 0, icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Pelajaran', value: summary?.totalPelajaran || 0, icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Ringkasan Dashboard</h2>
          <p className="text-slate-500">Pantau status kehadiran sekolah hari ini.</p>
        </header>

        {loading ? (
          <div>Memuat data...</div>
        ) : (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                  <div className={`${stat.bg} ${stat.color} p-4 rounded-xl`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Today's Detail */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-blue-600" />
                  Kehadiran Hari Ini
                </h3>
                <div className="flex gap-4">
                  <div className="flex-1 bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2 text-green-700 mb-1">
                      <CheckCircle size={16} />
                      <span className="text-sm font-bold uppercase tracking-wider">Hadir</span>
                    </div>
                    <p className="text-3xl font-black text-green-800">{summary?.todayStats.hadir}</p>
                  </div>
                  <div className="flex-1 bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-2 text-amber-700 mb-1">
                      <AlertTriangle size={16} />
                      <span className="text-sm font-bold uppercase tracking-wider">Telat</span>
                    </div>
                    <p className="text-3xl font-black text-amber-800">{summary?.todayStats.telat}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-600 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-center">
                <h3 className="text-xl font-bold mb-2">Siap Atur Jadwal?</h3>
                <p className="text-blue-100 text-sm mb-6">Kelola pembagian guru dan pelajaran ke kelas-kelas dengan fitur Drag & Drop.</p>
                <button className="bg-white text-blue-600 px-6 py-2 rounded-xl font-bold self-start hover:bg-blue-50 transition-colors">
                  Buka Pengaturan Jadwal
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
