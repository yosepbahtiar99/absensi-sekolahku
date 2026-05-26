import { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import api from '../../../shared/lib/axios';
import {
  FileText, Users, Download, ChevronRight, Search
} from 'lucide-react';
import { useGurus } from '../../master-data/guru/hooks/useGuruData';
import { useNotificationStore } from '../../../shared/store/notificationStore';

const AdminTeacherReports = () => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState('');

  const { showNotification } = useNotificationStore();

  const { data: guruRes } = useGurus({ limit: 100 });
  const teachers = guruRes?.data || [];
  const filteredTeachers = teachers.filter((t: any) => 
    t.name.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  const handleDownloadTeacherExcel = async () => {
    if (!selectedTeacherId) return;
    try {
      showNotification('Menyiapkan file Excel, jadwal guru sedang diunduh...', 'info');
      const response = await api.get(`/admin/reports/teacher-schedule/${selectedTeacherId}/excel`, {
        responseType: 'blob'
      });
      const teacherName = teachers.find((t: any) => t.id === selectedTeacherId)?.name || 'guru';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `jadwal_${teacherName.toLowerCase().replace(/\s+/g, '_')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      showNotification(`Jadwal ${teacherName} berhasil diunduh`, 'success');
    } catch (err) {
      console.error('Gagal mengunduh Excel:', err);
      showNotification('Gagal mengunduh jadwal guru', 'error');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <div className="print:hidden">
        <AdminSidebar />
      </div>
      
      <main className="flex-1 flex flex-col overflow-hidden p-8 print:p-0 print:bg-white print:overflow-visible">
        <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 print:hidden">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <FileText size={24} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Eksport Jadwal Per Guru</h2>
            </div>
            <p className="text-slate-500 font-medium mt-1">Unduh laporan jadwal mengajar mingguan untuk guru spesifik.</p>
          </div>
        </header>

        <div className="flex-1 flex flex-col min-h-0 print:overflow-visible">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center mb-6 print:hidden">
            <div className="relative w-full sm:w-80 z-30">
              <button
                type="button"
                onClick={() => {
                  setIsTeacherDropdownOpen(!isTeacherDropdownOpen);
                  if (!isTeacherDropdownOpen) setTeacherSearch('');
                }}
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

              {isTeacherDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-20 bg-transparent" 
                    onClick={() => setIsTeacherDropdownOpen(false)}
                  />
                  <div className="absolute left-0 right-0 mt-2 z-50 bg-white border border-slate-100 shadow-xl rounded-2xl p-1.5 max-h-64 flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 border-b border-slate-100 sticky top-0 bg-white z-10 shrink-0">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                          type="text"
                          placeholder="Cari nama guru..."
                          value={teacherSearch}
                          onChange={(e) => setTeacherSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto custom-scrollbar p-1">
                      {filteredTeachers.length === 0 ? (
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
                          
                          {filteredTeachers.map((teacher: any) => (
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
                  Export Jadwal
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminTeacherReports;
