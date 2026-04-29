import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Search, Download, ExternalLink, User, BookOpen, Clock } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

interface Activity {
  id: number;
  status: string;
  timestamp: string;
  photoSelfie: string;
  photoClass: string;
  User: { name: string };
  Schedule: {
    Class: { name: string };
    Lesson: { name: string };
  };
}

const AdminActivities = () => {
  const { token } = useAuthStore();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/admin/activities', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActivities(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [token]);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Riwayat Kehadiran</h2>
            <p className="text-slate-500">Daftar aktivitas absensi guru seluruh sekolah.</p>
          </div>
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={18} />
            Export Excel
          </button>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Guru</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pelajaran / Kelas</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Waktu</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Bukti Foto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">Memuat data...</td></tr>
              ) : activities.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">Belum ada aktivitas hari ini.</td></tr>
              ) : (
                activities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {act.User.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-700">{act.User.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{act.Schedule.Lesson.name}</div>
                      <div className="text-xs text-slate-500">{act.Schedule.Class.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(act.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        act.status === 'masuk' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {act.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <a 
                          href={`http://localhost:3001/uploads/${act.photoSelfie}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                          title="Lihat Selfie"
                        >
                          <User size={18} />
                        </a>
                        <a 
                          href={`http://localhost:3001/uploads/${act.photoClass}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                          title="Lihat Foto Kelas"
                        >
                          <BookOpen size={18} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminActivities;
