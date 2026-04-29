import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Search, Download, ExternalLink, User, BookOpen, Clock, Filter, FileSpreadsheet, Eye } from 'lucide-react';
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
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Riwayat Aktivitas</h2>
            <p className="text-slate-500 font-medium">Monitoring kehadiran guru secara real-time.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white border border-slate-100 px-5 py-3 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95">
              <Filter size={18} />
              Filter
            </button>
            <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-cyan-700 transition-all shadow-lg shadow-primary/20 active:scale-95">
              <FileSpreadsheet size={18} />
              Export Report
            </button>
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari guru atau mata pelajaran..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div className="text-sm font-bold text-slate-400 px-4">
              Total: {activities.length} Record
            </div>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Guru</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pelajaran / Kelas</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Waktu Absensi</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Visual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading Records...</p>
                    </div>
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-slate-400 font-medium">Belum ada aktivitas tercatat hari ini.</p>
                  </td>
                </tr>
              ) : (
                activities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-cyan-700 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-primary/10">
                          {act.User.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm leading-tight">{act.User.name}</p>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">NIP: {act.id + 1000}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="bg-slate-50 px-4 py-2 rounded-xl inline-block border border-slate-100">
                        <div className="text-sm font-black text-slate-800">{act.Schedule.Lesson.name}</div>
                        <div className="text-[11px] font-bold text-primary uppercase tracking-wider">{act.Schedule.Class.name}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock size={16} className="text-primary/60" />
                        <span className="text-sm font-bold tabular-nums">
                          {new Date(act.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        act.status === 'masuk' 
                          ? 'bg-green-100 text-green-600 border border-green-200' 
                          : 'bg-amber-100 text-amber-600 border border-amber-200'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${act.status === 'masuk' ? 'bg-green-600' : 'bg-amber-600'}`}></div>
                        {act.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2">
                        <a 
                          href={`http://localhost:3001/uploads/${act.photoSelfie}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm"
                          title="Lihat Selfie"
                        >
                          <User size={18} />
                        </a>
                        <a 
                          href={`http://localhost:3001/uploads/${act.photoClass}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm"
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
          
          <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex justify-between items-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Showing {activities.length} of {activities.length} activities
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white border border-slate-100 rounded-lg text-xs font-bold text-slate-400 cursor-not-allowed">Previous</button>
              <button className="px-4 py-2 bg-white border border-slate-100 rounded-lg text-xs font-bold text-slate-400 cursor-not-allowed">Next</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminActivities;
