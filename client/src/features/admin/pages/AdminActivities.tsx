import React, { useState } from 'react';
import { useAdminActivities } from '../hooks/useAdminData';
import { Search, Clock, Filter, FileSpreadsheet, User, BookOpen, Loader2 } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { Pagination } from '../../../shared/components/Pagination';
import { useGurus } from '../../master-data/guru/hooks/useGuruData';
import { useClasses } from '../../master-data/kelas/hooks/useKelasData';
import { useLessons } from '../../master-data/lesson/hooks/useLessonData';
import { adminService } from '../services/admin.service';

const AdminActivities = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced Filters
  const [teacherId, setTeacherId] = useState('');
  const [classId, setClassId] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: response, isLoading } = useAdminActivities({ 
    search, page, limit: 10, teacherId, classId, lessonId, status, startDate, endDate 
  });

  const { data: guruRes } = useGurus({ limit: 100 });
  const { data: kelasRes } = useClasses({ limit: 100 });
  const { data: lessonRes } = useLessons({ limit: 100 });

  const activities = response?.data || [];
  const meta = response?.meta;

  const handleExport = async () => {
    try {
      await adminService.exportReport({ teacherId, classId, lessonId, status, startDate, endDate });
    } catch (error) {
      console.error('Export failed', error);
    }
  };

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
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all shadow-sm active:scale-95 ${
                showFilters ? 'bg-primary text-white' : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter size={18} />
              Filter
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 active:scale-95"
            >
              <FileSpreadsheet size={18} />
              Export Report
            </button>
          </div>
        </header>

        {showFilters && (
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm mb-8 animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Guru</label>
                <select 
                  value={teacherId} 
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  <option value="">Semua Guru</option>
                  {guruRes?.data.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pelajaran</label>
                <select 
                  value={lessonId} 
                  onChange={(e) => setLessonId(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  <option value="">Semua Pelajaran</option>
                  {lessonRes?.data.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kelas</label>
                <select 
                  value={classId} 
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  <option value="">Semua Kelas</option>
                  {kelasRes?.data.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Start Date</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">End Date</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  <option value="">Semua Status</option>
                  <option value="masuk">Masuk</option>
                  <option value="telat">Telat</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => {
                  setTeacherId(''); setClassId(''); setLessonId(''); setStatus(''); setStartDate(''); setEndDate('');
                }}
                className="text-xs font-bold text-slate-400 hover:text-primary transition-all"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari guru atau mata pelajaran..." 
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // Reset to page 1 on search
                }}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div className="text-sm font-bold text-slate-400 px-4">
              Total: {meta?.total || 0} Record
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
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 size={32} className="text-primary animate-spin" />
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading Records...</p>
                    </div>
                  </td>
                </tr>
              ) : activities?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-slate-400 font-medium">Belum ada aktivitas tercatat.</p>
                  </td>
                </tr>
              ) : (
                activities?.map((act) => (
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

          {meta && meta.totalPages > 1 && (
            <div className="p-6 border-t border-slate-50 flex justify-center bg-slate-50/30">
              <Pagination 
                currentPage={page} 
                totalPages={meta.totalPages} 
                onPageChange={setPage} 
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminActivities;
