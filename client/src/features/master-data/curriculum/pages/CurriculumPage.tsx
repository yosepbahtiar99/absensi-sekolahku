import { useState } from 'react';
import { Plus, Trash2, BookOpen, GraduationCap, Info, Loader2 } from 'lucide-react';
import AdminSidebar from '../../../admin/components/AdminSidebar';
import AdminHeader from '../../../admin/components/AdminHeader';
import { Button } from '../../../../shared/components/Button';
import { Card } from '../../../../shared/components/Card';
import { useAcademicYearStore } from '../../../../shared/store/academicYearStore';
import { useCurriculums, useCreateCurriculum, useDeleteCurriculum } from '../hooks/useCurriculumData';
import { useLessons } from '../../lesson/hooks/useLessonData';
import { useNotificationStore } from '../../../../shared/store/notificationStore';

const CurriculumPage = () => {
  const { selectedYearId } = useAcademicYearStore();
  const { showNotification } = useNotificationStore();
  const [selectedGrade, setSelectedGrade] = useState('7');
  const [newLessonId, setNewLessonId] = useState('');
  const [requiredHours, setRequiredHours] = useState(2);

  const { data: curriculums = [], isLoading } = useCurriculums({ 
    academicYearId: selectedYearId || undefined,
    gradeLevel: selectedGrade
  });

  const { data: lessonRes } = useLessons({ limit: 100 });
  const lessons = lessonRes?.data || [];

  const createMutation = useCreateCurriculum();
  const deleteMutation = useDeleteCurriculum();

  const handleAdd = () => {
    if (!selectedYearId || !newLessonId) return;
    
    createMutation.mutate({
      academicYearId: selectedYearId,
      gradeLevel: selectedGrade,
      lessonId: newLessonId,
      requiredHours
    }, {
      onSuccess: () => {
        showNotification('Kurikulum berhasil ditambahkan', 'success');
        setNewLessonId('');
      },
      onError: (err: any) => {
        showNotification(err.response?.data?.message || 'Gagal tambah kurikulum', 'error');
      }
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus mapel ini dari kurikulum?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => showNotification('Kurikulum dihapus', 'success')
      });
    }
  };

  const grades = ['7', '8', '9', '10', '11', '12'];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <AdminSidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader 
          title="Manajemen Kurikulum" 
          subtitle="Atur standar jam pelajaran per tingkat kelas." 
          icon={<BookOpen className="text-primary" size={28} />}
        />

        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Side: Configuration */}
            <div className="w-full md:w-80 space-y-6">
              <section>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">Pilih Tingkat</h5>
                <div className="grid grid-cols-3 gap-2">
                  {grades.map(g => (
                    <button
                      key={g}
                      onClick={() => setSelectedGrade(g)}
                      className={`py-3 rounded-2xl text-xs font-black transition-all ${
                        selectedGrade === g 
                          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                          : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </section>

              <Card className="p-6 border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] rounded-[2rem]">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Tambah Standar Mapel</h5>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 px-1">Mata Pelajaran</label>
                    <select
                      value={newLessonId}
                      onChange={(e) => setNewLessonId(e.target.value)}
                      className="w-full p-3 bg-slate-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="">-- Pilih Mapel --</option>
                      {lessons.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 px-1">Target Jam (JP)</label>
                    <input
                      type="number"
                      value={requiredHours}
                      onChange={(e) => setRequiredHours(parseInt(e.target.value))}
                      className="w-full p-3 bg-slate-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <Button 
                    className="w-full rounded-xl py-6" 
                    onClick={handleAdd}
                    disabled={!newLessonId || createMutation.isPending}
                  >
                    {createMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} className="mr-2" />}
                    Tambahkan
                  </Button>
                </div>
              </Card>

              <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100/50">
                <div className="flex gap-3 text-blue-600 mb-2">
                  <Info size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Pro Tip</span>
                </div>
                <p className="text-[11px] text-blue-600/80 font-medium leading-relaxed">
                  Data kurikulum ini akan menjadi acuan "Tracker" di halaman Master Schedule untuk memastikan plotting jam sudah sesuai standar.
                </p>
              </div>
            </div>

            {/* Right Side: List */}
            <div className="flex-1">
              <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <GraduationCap size={18} className="text-primary" />
                      Kurikulum Tingkat {selectedGrade}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Daftar mapel wajib dan target alokasi jam.</p>
                  </div>
                  <div className="bg-white px-4 py-1.5 rounded-full border border-slate-100 text-[10px] font-black text-primary">
                    {curriculums.length} MAPEL
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                        <th className="px-8 py-4 text-left">Nama Mata Pelajaran</th>
                        <th className="px-8 py-4 text-center">Target JP</th>
                        <th className="px-8 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {isLoading ? (
                        <tr>
                          <td colSpan={3} className="px-8 py-20 text-center">
                            <Loader2 className="animate-spin mx-auto text-primary mb-2" />
                            <p className="text-xs font-bold text-slate-400">Memuat data kurikulum...</p>
                          </td>
                        </tr>
                      ) : curriculums.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-8 py-20 text-center">
                            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                              <BookOpen className="text-slate-300" size={32} />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Belum ada kurikulum di-set</p>
                          </td>
                        </tr>
                      ) : (
                        curriculums.map(c => (
                          <tr key={c.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-5">
                              <p className="text-sm font-bold text-slate-700">{c.Lesson?.name}</p>
                            </td>
                            <td className="px-8 py-5 text-center">
                              <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-xs font-black">
                                {c.requiredHours} JP
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <button 
                                onClick={() => handleDelete(c.id)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CurriculumPage;
