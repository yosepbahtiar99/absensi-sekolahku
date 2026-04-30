import { useState } from 'react';
import { useClasses, useCreateClass, useUpdateClass, useDeleteClass } from '../hooks/useKelasData';
import AdminSidebar from '../../../admin/components/AdminSidebar';
import { Plus, Edit2, Trash2, GraduationCap, Search, X } from 'lucide-react';
import { Button } from '../../../../shared/components/Button';
import KelasForm from '../forms/KelasForm';
import type { IKelas } from '../interfaces/kelas.interface';

import { DataTable, type Column } from '../../../../shared/components/DataTable';

const MasterKelas = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKelas, setSelectedKelas] = useState<IKelas | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data: response, isLoading } = useClasses({ page, limit, search: searchTerm });
  const classes = response?.data || [];
  const meta = response?.meta;
  const createMutation = useCreateClass();
  const updateMutation = useUpdateClass();
  const deleteMutation = useDeleteClass();

  const handleOpenModal = (kelas?: IKelas) => {
    setSelectedKelas(kelas);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedKelas(undefined);
    setIsModalOpen(false);
  };

  const handleSubmit = (values: any) => {
    if (selectedKelas) {
      updateMutation.mutate({ id: selectedKelas.id, data: values }, {
        onSuccess: handleCloseModal
      });
    } else {
      createMutation.mutate(values, {
        onSuccess: handleCloseModal
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kelas ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns: Column<IKelas>[] = [
    {
      header: 'Nama Kelas',
      accessor: (kelas) => (
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary p-3 rounded-xl">
            <GraduationCap size={20} />
          </div>
          <div>
            <p className="font-black text-slate-800 text-sm leading-tight">{kelas.name}</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">ID: KLS-{kelas.id.slice(0, 8)}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Total Siswa',
      accessor: () => (
        <span className="text-sm font-bold text-slate-500">-</span>
      )
    },
    {
      header: 'Aksi',
      headerClassName: 'text-right',
      accessor: (kelas) => (
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-10 h-10 p-0 rounded-xl"
            onClick={() => handleOpenModal(kelas)}
          >
            <Edit2 size={16} className="text-slate-600" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-10 h-10 p-0 rounded-xl hover:bg-red-50 hover:border-red-100 hover:text-red-500"
            onClick={() => handleDelete(kelas.id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Manajemen Kelas</h2>
            <p className="text-slate-500 font-medium">Kelola daftar kelas yang ada di sekolah.</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="shadow-lg shadow-primary/20">
            <Plus size={20} className="mr-2" />
            Tambah Kelas Baru
          </Button>
        </header>

        <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari kelas... (Tekan Enter)" 
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
              data={classes} 
              isLoading={isLoading}
              emptyMessage="Belum ada data kelas."
              className="border-none shadow-none rounded-none"
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
                  {selectedKelas ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
                </h3>
                <p className="text-slate-400 text-sm font-medium">Lengkapi formulir di bawah ini.</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <KelasForm 
              initialValues={selectedKelas} 
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

export default MasterKelas;
