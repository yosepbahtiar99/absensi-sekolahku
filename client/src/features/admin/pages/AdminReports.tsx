import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import api from '../../../shared/lib/axios';
import {
  FileText, Calendar, Users, Download, Search, 
  CheckCircle, Clock, XCircle, AlertCircle, CalendarDays, 
  ChevronRight, RefreshCw, X, UserCheck, Eye, EyeOff, BookOpen, GraduationCap,
  Filter, FileSpreadsheet
} from 'lucide-react';
import { DataTable } from '../../../shared/components/DataTable';
import { useGurus } from '../../master-data/guru/hooks/useGuruData';
import { useClasses } from '../../master-data/kelas/hooks/useKelasData';
import { useLessons } from '../../master-data/lesson/hooks/useLessonData';

interface DailyReportSummary {
  totalScheduled: number;
  totalHadir: number;
  totalTelat: number;
  totalAlpa: number;
  totalIzin: number;
  totalBelumMulai: number;
  totalBelumAbsen: number;
}

interface DailyReportDetail {
  id: string;
  date: string;
  scheduleId: string;
  teacherId: string;
  teacherName: string;
  className: string;
  lessonName: string;
  timeSlotLabel: string;
  timeRange: string;
  status: 'hadir' | 'telat' | 'izin' | 'alpa' | 'belum_absen' | 'belum_mulai';
  checkInTime: string | null;
  photoSelfie: string | null;
  photoClass: string | null;
}

interface DailyReportResponse {
  summary: DailyReportSummary;
  details: DailyReportDetail[];
  meta?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

interface IGuru {
  id: string;
  name: string;
  username: string;
}

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'teacher'>('daily');
  
  const todayStr = new Date().toISOString().split('T')[0];

  // Daily Report Pagination & Filter States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Applied Filters
  const [teacherId, setTeacherId] = useState('');
  const [classId, setClassId] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  // Staging Filters (UI states)
  const [tempTeacherId, setTempTeacherId] = useState('');
  const [tempClassId, setTempClassId] = useState('');
  const [tempLessonId, setTempLessonId] = useState('');
  const [tempStatus, setTempStatus] = useState('');
  const [tempStartDate, setTempStartDate] = useState(todayStr);
  const [tempEndDate, setTempEndDate] = useState(todayStr);

  const [dailyData, setDailyData] = useState<DailyReportResponse | null>(null);
  const [isDailyLoading, setIsDailyLoading] = useState(false);

  // Teacher Report State (Tab 2)
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);

  // Photo Viewer Modal
  const [viewPhotoUrl, setViewPhotoUrl] = useState<string | null>(null);
  const [viewPhotoTitle, setViewPhotoTitle] = useState<string>('');

  // Fetch options data
  const { data: guruRes } = useGurus({ limit: 100 });
  const { data: kelasRes } = useClasses({ limit: 100 });
  const { data: lessonRes } = useLessons({ limit: 100 });

  const teachers = guruRes?.data || [];

  // Fetch Daily Attendance Report
  const fetchDailyReport = async () => {
    try {
      setIsDailyLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        teacherId,
        classId,
        lessonId,
        status,
        startDate,
        endDate
      });
      const response = await api.get(`/admin/reports/daily?${params.toString()}`);
      setDailyData(response.data);
    } catch (err) {
      console.error('Gagal mengambil laporan harian:', err);
    } finally {
      setIsDailyLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'daily') {
      fetchDailyReport();
    }
  }, [page, limit, search, teacherId, classId, lessonId, status, startDate, endDate, activeTab]);

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

  // Daily Status Render
  const renderStatusBadge = (status: DailyReportDetail['status']) => {
    switch (status) {
      case 'hadir':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle size={12} className="text-emerald-500" />
            Hadir (Tepat)
          </span>
        );
      case 'telat':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-100 animate-pulse">
            <Clock size={12} className="text-amber-500" />
            Terlambat
          </span>
        );
      case 'izin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-100">
            <UserCheck size={12} className="text-indigo-500" />
            Izin / Sakit
          </span>
        );
      case 'alpa':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-100">
            <XCircle size={12} className="text-rose-500" />
            Alpa (Kosong)
          </span>
        );
      case 'belum_absen':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-sky-50 text-sky-700 border border-sky-100 animate-pulse">
            <RefreshCw size={12} className="text-sky-500 animate-spin" />
            Berlangsung
          </span>
        );
      case 'belum_mulai':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-slate-50 text-slate-500 border border-slate-100">
            <Calendar size={12} className="text-slate-400" />
            Belum Mulai
          </span>
        );
    }
  };

  const handleDownloadDailyListExcel = async () => {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        ...(teacherId && { teacherId }),
        ...(classId && { classId }),
        ...(lessonId && { lessonId }),
        ...(status && { status }),
        ...(search && { search })
      });
      const response = await api.get(`/admin/reports/daily/list-excel?${params.toString()}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `export_data_list_${startDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error('Gagal mengunduh Excel Data List:', err);
    }
  };


  const handleDownloadDailyExcel = async () => {
    try {
      const response = await api.get(`/admin/reports/daily/excel?date=${startDate}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rekap_absensi_${startDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error('Gagal mengunduh Excel:', err);
    }
  };

  const handleDownloadTeacherExcel = async () => {
    if (!selectedTeacherId) return;
    try {
      const response = await api.get(`/admin/reports/teacher-schedule/${selectedTeacherId}/excel`, {
        responseType: 'blob'
      });
      const teacherName = teachers.find(t => t.id === selectedTeacherId)?.name || 'guru';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `jadwal_${teacherName.toLowerCase().replace(/\s+/g, '_')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error('Gagal mengunduh Excel:', err);
    }
  };

  const getFullPhotoUrl = (relativePath: string) => {
    const baseUrl = api.defaults.baseURL || '';
    // If the base URL ends with /api and relativePath starts with /uploads, trim accordingly
    const cleanBaseUrl = baseUrl.replace(/\/api\/?$/, '');
    return `${cleanBaseUrl}${relativePath}`;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar - Hidden on print view */}
      <div className="print:hidden">
        <AdminSidebar />
      </div>
      
      <main className="flex-1 flex flex-col overflow-hidden p-8 print:p-0 print:bg-white print:overflow-visible">
        {/* Header - Hidden on print */}
        <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 print:hidden">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <FileText size={24} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Laporan Sekolah</h2>
            </div>
            <p className="text-slate-500 font-medium mt-1">Eksport data jadwal, rekap guru alpa, dan pantau kedisiplinan kehadiran harian.</p>
          </div>
        </header>

        {/* Tab Selector - Hidden on print */}
        <div className="flex border-b border-slate-200/80 mb-6 gap-6 print:hidden">
          <button
            onClick={() => setActiveTab('daily')}
            className={`pb-4 text-sm font-black transition-all relative ${
              activeTab === 'daily' 
                ? 'text-primary' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Laporan Kehadiran Harian
            {activeTab === 'daily' && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('teacher')}
            className={`pb-4 text-sm font-black transition-all relative ${
              activeTab === 'teacher' 
                ? 'text-primary' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Eksport Jadwal Per Guru
            {activeTab === 'teacher' && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></span>
            )}
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 print:overflow-visible">
          
          {/* TAB 1: DAILY ATTENDANCE */}
          {activeTab === 'daily' && (
            <div className="flex-1 flex flex-col min-h-0 print:overflow-visible">
              
              {/* Daily Filter Bar - Hidden on print */}
              <div className="mb-6 flex justify-between items-end print:hidden">
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
                    onClick={handleDownloadDailyListExcel}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                  >
                    <Download size={18} />
                    Unduh Excel Data List
                  </button>
                  <button 
                    onClick={handleDownloadDailyExcel}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 active:scale-95"
                  >
                    <FileSpreadsheet size={18} />
                    Unduh Matriks
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm mb-6 animate-in slide-in-from-top-4 duration-300 print:hidden">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Guru</label>
                      <select 
                        value={tempTeacherId} 
                        onChange={(e) => setTempTeacherId(e.target.value)}
                        className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      >
                        <option value="">Semua Guru</option>
                        {teachers.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
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
                        {lessonRes?.data?.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
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
                        {kelasRes?.data?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                        <option value="hadir">Hadir (Tepat)</option>
                        <option value="telat">Telat</option>
                        <option value="izin">Izin / Sakit</option>
                        <option value="alpa">Alpa (Kosong)</option>
                        <option value="belum_absen">Berlangsung</option>
                        <option value="belum_mulai">Belum Mulai</option>
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

              {/* Print Only Header */}
              <div className="hidden print:block mb-8 text-center text-slate-900 border-b-2 border-slate-900 pb-4">
                <h1 className="text-2xl font-black uppercase tracking-wider">Laporan Kehadiran Harian Guru</h1>
                <p className="text-sm font-bold mt-1">SMP TUNAS BARU CIPARAY</p>
                <p className="text-xs font-semibold text-slate-600 mt-0.5">Tanggal Laporan: {startDate === endDate ? startDate : `${startDate} s/d ${endDate}`}</p>
              </div>

              {/* Bento Grid Stats */}
              {dailyData && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 print:grid-cols-6 print:gap-2">
                  <div className="bg-slate-50 border border-slate-100 p-5 rounded-[1.75rem] shadow-sm flex flex-col justify-between print:p-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Jadwal Hari Ini</span>
                    <span className="text-2xl font-black text-slate-800 mt-2">{dailyData.summary.totalScheduled}</span>
                  </div>
                  
                  <div className="bg-emerald-50/60 border border-emerald-100 p-5 rounded-[1.75rem] shadow-sm flex flex-col justify-between print:p-3">
                    <span className="text-[10px] font-bold text-emerald-600/80 uppercase tracking-widest leading-none">Hadir Tepat</span>
                    <span className="text-2xl font-black text-emerald-700 mt-2">{dailyData.summary.totalHadir}</span>
                  </div>

                  <div className="bg-amber-50/60 border border-amber-100 p-5 rounded-[1.75rem] shadow-sm flex flex-col justify-between print:p-3">
                    <span className="text-[10px] font-bold text-amber-600/80 uppercase tracking-widest leading-none">Terlambat</span>
                    <span className="text-2xl font-black text-amber-700 mt-2">{dailyData.summary.totalTelat}</span>
                  </div>

                  <div className="bg-indigo-50/60 border border-indigo-100 p-5 rounded-[1.75rem] shadow-sm flex flex-col justify-between print:p-3">
                    <span className="text-[10px] font-bold text-indigo-600/80 uppercase tracking-widest leading-none">Izin / Sakit</span>
                    <span className="text-2xl font-black text-indigo-700 mt-2">{dailyData.summary.totalIzin}</span>
                  </div>

                  <div className="bg-rose-50/60 border border-rose-100 p-5 rounded-[1.75rem] shadow-sm flex flex-col justify-between print:p-3">
                    <span className="text-[10px] font-bold text-rose-600/80 uppercase tracking-widest leading-none">Alpa (Kosong)</span>
                    <span className="text-2xl font-black text-rose-700 mt-2">{dailyData.summary.totalAlpa}</span>
                  </div>

                  <div className="bg-slate-100/50 border border-slate-200/40 p-5 rounded-[1.75rem] shadow-sm flex flex-col justify-between print:p-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Belum Mulai</span>
                    <span className="text-2xl font-black text-slate-500 mt-2">
                      {dailyData.summary.totalBelumMulai + dailyData.summary.totalBelumAbsen}
                    </span>
                  </div>
                </div>
              )}

              {/* Attendance Table */}
              <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col min-h-0 print:border-none print:shadow-none print:overflow-visible relative">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between print:hidden">
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
                  <button 
                    onClick={fetchDailyReport}
                    className="p-3 text-slate-500 hover:text-primary bg-slate-50 hover:bg-primary/5 rounded-xl border border-slate-200/40 transition-colors"
                    title="Refresh Data"
                  >
                    <RefreshCw size={18} className={isDailyLoading ? 'animate-spin' : ''} />
                  </button>
                </div>
                
                <DataTable 
                  data={dailyData?.details || []}
                  isLoading={isDailyLoading}
                  emptyMessage="Tidak ada jadwal KBM yang terplotting pada filter ini."
                  className="border-none shadow-none rounded-none flex-1 min-h-0"
                  meta={dailyData?.meta ? {
                    total: dailyData.meta.totalItems,
                    page: dailyData.meta.currentPage,
                    limit: dailyData.meta.itemsPerPage,
                    totalPages: dailyData.meta.totalPages
                  } : undefined}
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
                      className: "w-10 px-6 print:px-2"
                    },
                    {
                      header: 'Jam KBM',
                      accessor: (row: DailyReportDetail) => (
                        <div>
                          <p className="font-bold text-xs text-slate-400 uppercase tracking-widest">{row.timeSlotLabel}</p>
                          <p className="font-bold text-sm text-slate-700 mt-0.5">{row.timeRange}</p>
                          <p className="font-bold text-[10px] text-primary mt-1 print:hidden">{row.date}</p>
                        </div>
                      )
                    },
                    {
                      header: 'Mata Pelajaran',
                      accessor: (row: DailyReportDetail) => (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg border border-slate-200/30">
                          <BookOpen size={12} className="text-slate-400" />
                          {row.lessonName}
                        </span>
                      )
                    },
                    {
                      header: 'Kelas',
                      accessor: (row: DailyReportDetail) => <span className="font-black text-slate-800 text-sm">{row.className}</span>
                    },
                    {
                      header: 'Guru Pengajar',
                      accessor: (row: DailyReportDetail) => <span className="font-bold text-slate-800 text-sm">{row.teacherName}</span>
                    },
                    {
                      header: 'Jam Absen',
                      accessor: (row: DailyReportDetail) => row.checkInTime ? (
                        <span className="font-mono font-black text-slate-600 text-sm">
                          {new Date(row.checkInTime).toLocaleString('id-ID', {
                            timeZone: 'Asia/Jakarta',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })} WIB
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold text-xs">—</span>
                      )
                    },
                    {
                      header: 'Status',
                      accessor: (row: DailyReportDetail) => renderStatusBadge(row.status)
                    },
                    {
                      header: 'Bukti Foto',
                      className: 'print:hidden',
                      accessor: (row: DailyReportDetail) => row.checkInTime && (row.photoSelfie || row.photoClass) ? (
                        <div className="flex gap-2">
                          {row.photoSelfie && (
                            <button 
                              onClick={() => {
                                setViewPhotoUrl(getFullPhotoUrl(row.photoSelfie!));
                                setViewPhotoTitle(`Foto Selfie - ${row.teacherName}`);
                              }}
                              className="flex items-center gap-1 text-[11px] font-black text-primary hover:text-cyan-700 bg-primary/5 hover:bg-primary/10 border border-primary/10 px-2 py-1.5 rounded-lg active:scale-95 transition-all"
                            >
                              <Eye size={12} />
                              Selfie
                            </button>
                          )}
                          {row.photoClass && (
                            <button 
                              onClick={() => {
                                setViewPhotoUrl(getFullPhotoUrl(row.photoClass!));
                                setViewPhotoTitle(`Foto Kelas - ${row.className} (${row.teacherName})`);
                              }}
                              className="flex items-center gap-1 text-[11px] font-black text-cyan-600 hover:text-cyan-800 bg-cyan-50/50 hover:bg-cyan-100/50 border border-cyan-100 px-2 py-1.5 rounded-lg active:scale-95 transition-all"
                            >
                              <Eye size={12} />
                              Kelas
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-bold text-xs">No Photos</span>
                      )
                    }
                  ]}
                />
              </div>

              {/* Print Footer Checklist */}
              <div className="hidden print:flex justify-between mt-16 text-slate-800 text-xs font-bold leading-relaxed px-12">
                <div className="flex flex-col items-center">
                  <p>Mengetahui,</p>
                  <p className="mt-16">_______________________</p>
                  <p className="text-[10px] font-medium text-slate-500 mt-1">Kepala Sekolah SMP Tunas Baru</p>
                </div>
                <div className="flex flex-col items-center">
                  <p>Ciparay, {todayStr}</p>
                  <p className="mt-16">_______________________</p>
                  <p className="text-[10px] font-medium text-slate-500 mt-1">Staf Tata Usaha / Admin</p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: TEACHER SCHEDULE */}
          {activeTab === 'teacher' && (
            <div className="flex-1 flex flex-col min-h-0 print:overflow-visible">
              
              {/* Teacher Selector Bar - Hidden on print */}
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center mb-6 print:hidden">
                <div className="relative w-full sm:w-80 z-30">
                  {/* Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setIsTeacherDropdownOpen(!isTeacherDropdownOpen)}
                    className="flex items-center justify-between gap-2 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/60 focus:border-primary/30 focus:ring-2 focus:ring-primary/10 rounded-xl px-4 py-2.5 w-full text-left font-bold text-sm text-slate-700 transition-all duration-300 active:scale-95"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Users size={18} className="text-slate-400 shrink-0" />
                      <span className="truncate">
                        {teachers.find(t => t.id === selectedTeacherId)?.name || 'Pilih Guru Pengajar...'}
                      </span>
                    </div>
                    <ChevronRight 
                      size={16} 
                      className={`text-slate-400 shrink-0 transition-transform duration-300 ${
                        isTeacherDropdownOpen ? 'rotate-90' : ''
                      }`} 
                    />
                  </button>

                  {/* Dropdown Menu Overlay */}
                  {isTeacherDropdownOpen && (
                    <>
                      {/* Click outside overlay */}
                      <div 
                        className="fixed inset-0 z-20 bg-transparent" 
                        onClick={() => setIsTeacherDropdownOpen(false)}
                      />
                      
                      {/* Menu Card */}
                      <div className="absolute left-0 right-0 mt-2 z-50 bg-white border border-slate-100 shadow-xl rounded-2xl p-1.5 max-h-64 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                        {teachers.length === 0 ? (
                          <div className="px-4 py-3 text-slate-400 text-xs font-bold text-center">
                            Tidak ada data guru
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTeacherId('');
                                setIsTeacherDropdownOpen(false);
                              }}
                              className={`w-full flex items-center px-4 py-2.5 rounded-xl text-left text-xs font-black uppercase tracking-wider transition-colors ${
                                !selectedTeacherId 
                                  ? 'bg-primary/5 text-primary' 
                                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                              }`}
                            >
                              Pilih Guru Pengajar...
                            </button>
                            
                            {teachers.map(teacher => (
                              <button
                                key={teacher.id}
                                type="button"
                                onClick={() => {
                                  setSelectedTeacherId(teacher.id);
                                  setIsTeacherDropdownOpen(false);
                                }}
                                className={`w-full flex items-center px-4 py-2.5 rounded-xl text-left text-sm font-bold transition-all duration-150 ${
                                  selectedTeacherId === teacher.id
                                    ? 'bg-primary/5 text-primary'
                                    : 'text-slate-700 hover:bg-slate-50 hover:pl-5'
                                }`}
                              >
                                {teacher.name}
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {selectedTeacherId && (
                  <div className="flex gap-2 shrink-0 print:hidden">
                    <button 
                      onClick={handleDownloadTeacherExcel}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm active:scale-95 transition-all"
                    >
                      <Download size={16} />
                      Unduh Excel Jadwal
                    </button>
                  </div>
                )}
              </div>


            </div>
          )}

        </div>
      </main>

      {/* Global Image Viewer Modal */}
      {viewPhotoUrl && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative bg-white p-2 rounded-[2rem] shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 text-slate-600">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <span className="text-sm font-black text-slate-800 truncate">{viewPhotoTitle}</span>
              <button 
                onClick={() => setViewPhotoUrl(null)}
                className="p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all active:scale-95 shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Photo Rendering */}
            <div className="flex-1 bg-slate-50 overflow-auto p-4 flex items-center justify-center min-h-[400px]">
              <img 
                src={viewPhotoUrl} 
                alt="Preview Absen" 
                className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-lg border border-slate-200/50"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=1000';
                }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminReports;
