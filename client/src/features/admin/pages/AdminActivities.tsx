import { useState } from 'react';
import { useAdminActivities, useSystemSettings, useDailyPresence, useApproveClockOut } from '../hooks/useAdminData';
import { useGurus } from '../../master-data/guru/hooks/useGuruData';
import { useClasses } from '../../master-data/kelas/hooks/useKelasData';
import { useLessons } from '../../master-data/lesson/hooks/useLessonData';
import { adminService } from '../services/admin.service';
import { DataTable } from '../../../shared/components/DataTable';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import { useAcademicYearStore } from '../../../shared/store/academicYearStore';
import { useNotificationStore } from '../../../shared/store/notificationStore';
import { Search, Clock, Filter, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

const AdminActivities = () => {
  const [activeTab, setActiveTab] = useState<'history' | 'approval'>('history');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  // Applied Filters
  const [teacherId, setTeacherId] = useState('');
  const [classId, setClassId] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  // Staging Filters (UI states)
  const [tempTeacherId, setTempTeacherId] = useState('');
  const [tempClassId, setTempClassId] = useState('');
  const [tempLessonId, setTempLessonId] = useState('');
  const [tempStatus, setTempStatus] = useState('');
  const [tempStartDate, setTempStartDate] = useState(today);
  const [tempEndDate, setTempEndDate] = useState(today);

  const { selectedYearId } = useAcademicYearStore();
  const { showNotification } = useNotificationStore();

  const { data: response, isLoading } = useAdminActivities({ 
    search, page, limit, teacherId, classId, lessonId, status, startDate, endDate, academicYearId: selectedYearId || undefined 
  });

  const { data: settings } = useSystemSettings();
  const isFullDayFlow = settings?.attendance_flow === 'full_day';

  const { data: dailyPresenceRes, isLoading: isLoadingPresence } = useDailyPresence();
  const approveMutation = useApproveClockOut();

  const handleApproveClockOut = (userId: string) => {
    approveMutation.mutate(userId, {
      onSuccess: () => {
        showNotification('Berhasil melakukan clock out untuk guru ini', 'success');
      }
    });
  };

  const { data: guruRes } = useGurus({ limit: 100 });
  const { data: kelasRes } = useClasses({ limit: 100 });
  const { data: lessonRes } = useLessons({ limit: 100 });

  const activities = response?.data || [];
  const meta = response?.meta;

  const handleApplyFilters = () => {
    setTeacherId(tempTeacherId);
    setClassId(tempClassId);
    setLessonId(tempLessonId);
    setStatus(tempStatus);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setPage(1);
  };

  const handleResetFilters = () => {
    const d2 = new Date();
    const todayStr = `${d2.getFullYear()}-${String(d2.getMonth() + 1).padStart(2, '0')}-${String(d2.getDate()).padStart(2, '0')}`;
    if (!startDate) setStartDate(todayStr);
    if (!endDate) setEndDate(todayStr);
    setTempTeacherId('');
    setTempClassId('');
    setTempLessonId('');
    setTempStatus('');
    setTempStartDate(todayStr);
    setTempEndDate(todayStr);
    
    setTeacherId('');
    setClassId('');
    setLessonId('');
    setStatus('');
    setStartDate(todayStr);
    setEndDate(todayStr);
    setPage(1);
  };

  const handleExport = async () => {
    try {
      showNotification('Menyiapkan file Excel, riwayat aktivitas sedang diunduh...', 'info');
      await adminService.exportReport({ teacherId, classId, lessonId, status, startDate, endDate });
      showNotification('Riwayat aktivitas berhasil diunduh', 'success');
    } catch (error) {
      console.error('Export failed', error);
      showNotification('Gagal mengunduh riwayat aktivitas', 'error');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <AdminSidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader 
          title="Riwayat Aktivitas" 
          subtitle="Monitoring kehadiran guru secara real-time." 
          icon={<Clock className="text-primary" size={28} />}
        />

        <div className="p-8 pb-0 flex-1 flex flex-col overflow-hidden">

              <div className="mb-6 flex justify-between items-end">
            <div>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Filter & Export</h3>
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
          </div>

        {showFilters && (
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm mb-8 animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Guru</label>
                <select 
                  value={tempTeacherId} 
                  onChange={(e) => setTempTeacherId(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  <option value="">Semua Guru</option>
                  {guruRes?.data.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pelajaran</label>
                <select 
                  value={tempLessonId} 
                  onChange={(e) => setTempLessonId(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  <option value="">Semua Pelajaran</option>
                  {lessonRes?.data.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kelas</label>
                <select 
                  value={tempClassId} 
                  onChange={(e) => setTempClassId(e.target.value)}
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
                  value={tempStartDate} 
                  onChange={(e) => setTempStartDate(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">End Date</label>
                <input 
                  type="date" 
                  value={tempEndDate} 
                  onChange={(e) => setTempEndDate(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
                <select 
                  value={tempStatus} 
                  onChange={(e) => setTempStatus(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  <option value="">Semua Status</option>
                  <option value="masuk">Masuk</option>
                  <option value="telat">Telat</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end items-center gap-6">
              <button 
                onClick={handleResetFilters}
                className="text-xs font-bold text-slate-400 hover:text-red-500 transition-all uppercase tracking-widest"
              >
                Reset Filters
              </button>
              <button 
                onClick={handleApplyFilters}
                className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2"
              >
                <Search size={16} />
                Terapkan Filter
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col min-h-0">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari guru atau mata pelajaran... (Tekan Enter)" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearch(searchInput);
                    setPage(1);
                  }
                }}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>

          <DataTable 
            data={activities}
            isLoading={isLoading}
            emptyMessage="Belum ada aktivitas tercatat."
            className="border-none shadow-none rounded-none flex-1 min-h-0"
            meta={meta}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            columns={[
              {
                header: 'No',
                accessor: (_, index) => (
                  <span className="text-[11px] font-bold text-slate-400 tabular-nums">
                    {(page - 1) * limit + index + 1}
                  </span>
                ),
                className: "w-10 px-6"
              },
              {
                header: 'Guru',
                accessor: (act: any) => (
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-cyan-700 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-primary/10">
                      {act.User?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm leading-tight">{act.User?.name || 'Unknown'}</p>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">ID: {act.id}</p>
                    </div>
                  </div>
                )
              },
              {
                header: 'Pelajaran / Kelas',
                accessor: (act: any) => (
                  <div className="bg-slate-50 px-4 py-2 rounded-xl inline-block border border-slate-100">
                    <div className="text-sm font-black text-slate-800">{act.snapshotLessonName || act.Schedule?.Lesson?.name || '-'}</div>
                    <div className="text-[11px] font-bold text-primary uppercase tracking-wider">{act.snapshotClassName || act.Schedule?.Class?.name || '-'}</div>
                  </div>
                )
              },
              {
                header: 'Waktu Absensi',
                accessor: (act: any) => (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock size={16} className="text-primary/60" />
                    <span className="text-sm font-bold tabular-nums">
                      {act.timestamp ? new Date(act.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </span>
                  </div>
                )
              },
              {
                header: 'Status',
                accessor: (act: any) => (
                  <div className="space-y-1">
                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      act.status === 'masuk' 
                        ? 'bg-green-100 text-green-600 border border-green-200' 
                        : 'bg-amber-100 text-amber-600 border border-amber-200'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${act.status === 'masuk' ? 'bg-green-600' : 'bg-amber-600'}`}></div>
                      {act.status}
                    </span>
                    {act.description && (
                      <p className="text-[10px] text-slate-400 font-medium italic max-w-[150px] truncate">
                        "{act.description}"
                      </p>
                    )}
                  </div>
                )
              },
              {
                header: 'Visual',
                accessor: (act: any) => (
                  <div className="flex gap-2">
                    {act.photoSelfie ? (
                      <a 
                        href={`${import.meta.env.VITE_UPLOAD_URL}/${act.photoSelfie}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 hover:border-primary transition-colors shadow-sm"
                      >
                        <img src={`${import.meta.env.VITE_UPLOAD_URL}/${act.photoSelfie}`} className="w-full h-full object-cover" alt="Selfie" />
                      </a>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center" title="Manual / Tidak ada foto selfie">
                        <span className="text-xs text-slate-400 font-bold">-</span>
                      </div>
                    )}
                    {act.photoClass ? (
                      <a 
                        href={`${import.meta.env.VITE_UPLOAD_URL}/${act.photoClass}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 hover:border-primary transition-colors shadow-sm"
                      >
                        <img src={`${import.meta.env.VITE_UPLOAD_URL}/${act.photoClass}`} className="w-full h-full object-cover" alt="Class" />
                      </a>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center" title="Manual / Tidak ada foto kelas">
                        <span className="text-xs text-slate-400 font-bold">-</span>
                      </div>
                    )}
                  </div>
                )
              }
            ]}
          />
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            {/* Removed internal pagination here because it's now in DataTable */}
          </div>
        )}
        </div>
      </main>
    </div>
  );
};

export default AdminActivities;
