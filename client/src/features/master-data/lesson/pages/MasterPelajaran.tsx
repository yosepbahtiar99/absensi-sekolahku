import { useState } from 'react';
import { useLessons, useCreateLesson, useUpdateLesson, useDeleteLesson } from '../hooks/useLessonData';
import AdminSidebar from '../../../admin/components/AdminSidebar';
import { Plus, Edit2, Trash2, BookOpen, Search, X } from 'lucide-react';
import { Button } from '../../../../shared/components/Button';
import LessonForm from '../forms/LessonForm';
import type { IPelajaran } from '../interfaces/lesson.interface';
import { useConfirmStore } from '../../../../shared/store/confirmStore';

import { DataTable, type Column } from '../../../../shared/components/DataTable';

const MasterPelajaran = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<IPelajaran | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data: response, isLoading } = useLessons({ page, limit, search: searchTerm });
  const lessons = response?.data || [];
  const meta = response?.meta;
  const createMutation = useCreateLesson();
  const updateMutation = useUpdateLesson();
  const deleteMutation = useDeleteLesson();
  const confirm = useConfirmStore(state => state.confirm);

  const handleOpenModal = (lesson?: IPelajaran) => {
    setSelectedLesson(lesson);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedLesson(undefined);
    setIsModalOpen(false);
  };

  const handleSubmit = (values: any) => {
    if (selectedLesson) {
      updateMutation.mutate({ id: selectedLesson.id, data: values }, {
        onSuccess: handleCloseModal
      });
    } else {
      createMutation.mutate(values, {
        onSuccess: handleCloseModal
      });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Hapus Mata Pelajaran',
      message: 'Apakah Anda yakin ingin menghapus mata pelajaran ini? Data jadwal yang menggunakan mapel ini akan ikut terhapus.',
      variant: 'danger',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal'
    });
    
    if (confirmed) {
      deleteMutation.mutate(id);
    }
  };

  const columns: Column<IPelajaran>[] = [
    {
      header: 'Mata Pelajaran',
      accessor: (lesson) => (
        <div className="flex items-center gap-4">
          <div className="bg-orange-100 text-orange-600 p-3 rounded-xl">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="font-black text-slate-800 text-sm leading-tight">{lesson.name}</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">ID: PEL-{lesson.id.slice(0, 8)}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Alokasi Waktu',
      accessor: (lesson) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-primary">{lesson.hours}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Jam / Minggu</span>
        </div>
      )
    },
    {
      header: 'Aksi',
      headerClassName: 'text-right',
      accessor: (lesson) => (
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-10 h-10 p-0 rounded-xl"
            onClick={() => handleOpenModal(lesson)}
          >
            <Edit2 size={16} className="text-slate-600" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-10 h-10 p-0 rounded-xl hover:bg-red-50 hover:border-red-100 hover:text-red-500"
            onClick={() => handleDelete(lesson.id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <AdminSidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden p-8">
        <header className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Manajemen Pelajaran</h2>
            <p className="text-slate-500 font-medium">Kelola daftar mata pelajaran yang diajarkan.</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="shadow-lg shadow-primary/20">
            <Plus size={20} className="mr-2" />
            Tambah Pelajaran Baru
          </Button>
        </header>

        <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex-1 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari pelajaran... (Tekan Enter)" 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setSearchTerm(searchInput);
                      setPage(1);
                    }
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <DataTable 
              columns={columns} 
              data={lessons} 
              isLoading={isLoading}
              emptyMessage="Belum ada data mata pelajaran."
              className="border-none shadow-none rounded-none flex-1 min-h-0"
              meta={meta}
              onPageChange={setPage}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          </div>
        </div>
      </main>

      {/* Modal / Sidebar Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={handleCloseModal}></div>
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl p-8 flex flex-col animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {selectedLesson ? 'Edit Data Pelajaran' : 'Tambah Pelajaran Baru'}
                </h3>
                <p className="text-slate-400 text-sm font-medium">Lengkapi formulir di bawah ini.</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <LessonForm 
              initialValues={selectedLesson} 
              onSubmit={handleSubmit} 
              onCancel={handleCloseModal}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterPelajaran;
