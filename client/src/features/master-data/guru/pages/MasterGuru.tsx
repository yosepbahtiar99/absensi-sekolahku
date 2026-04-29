import { useState } from 'react';
import { useGurus, useCreateGuru, useUpdateGuru, useDeleteGuru } from '../hooks/useGuruData';
import AdminSidebar from '../../../admin/components/AdminSidebar';
import { Plus, Edit2, Trash2, Search, X, UserPlus } from 'lucide-react';
import { Button } from '../../../../shared/components/Button';
import { Pagination } from '../../../../shared/components/Pagination';
import GuruForm from '../forms/GuruForm';
import type { IGuru } from '../interfaces/guru.interface';

import { DataTable, type Column } from '../../../../shared/components/DataTable';

const MasterGuru = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGuru, setSelectedGuru] = useState<IGuru | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: response, isLoading } = useGurus({ page, limit, search: searchTerm });
  const gurus = response?.data || [];
  const meta = response?.meta;
  const createMutation = useCreateGuru();
  const updateMutation = useUpdateGuru();
  const deleteMutation = useDeleteGuru();

  const handleOpenModal = (guru?: IGuru) => {
    setSelectedGuru(guru);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedGuru(undefined);
    setIsModalOpen(false);
  };

  const handleSubmit = (values: any) => {
    if (selectedGuru) {
      updateMutation.mutate({ id: selectedGuru.id, data: values }, {
        onSuccess: handleCloseModal
      });
    } else {
      createMutation.mutate(values, {
        onSuccess: handleCloseModal
      });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus guru ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns: Column<IGuru>[] = [
    {
      header: 'Data Guru',
      accessor: (guru) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-primary/10 to-cyan-500/5 text-primary flex items-center justify-center font-black text-sm border border-primary/5">
            {guru.name.charAt(0)}
          </div>
          <div>
            <p className="font-black text-slate-800 text-sm leading-tight">{guru.name}</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">ID: GUR-{guru.id + 1000}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Username',
      accessor: (guru) => (
        <div className="bg-slate-50 px-4 py-2 rounded-xl inline-block border border-slate-100 font-mono text-xs font-bold text-slate-600">
          @{guru.username}
        </div>
      )
    },
    {
      header: 'Aksi',
      headerClassName: 'text-right',
      accessor: (guru) => (
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-10 h-10 p-0 rounded-xl"
            onClick={() => handleOpenModal(guru)}
          >
            <Edit2 size={16} className="text-slate-600" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-10 h-10 p-0 rounded-xl hover:bg-red-50 hover:border-red-100 hover:text-red-500"
            onClick={() => handleDelete(guru.id)}
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
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Manajemen Guru</h2>
            <p className="text-slate-500 font-medium">Kelola data guru yang dapat mengakses aplikasi.</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="shadow-lg shadow-primary/20">
            <Plus size={20} className="mr-2" />
            Tambah Guru Baru
          </Button>
        </header>

        <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari guru... (Tekan Enter)" 
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
              data={gurus} 
              isLoading={isLoading}
              emptyMessage="Tidak ada data guru."
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
                  {selectedGuru ? 'Edit Data Guru' : 'Tambah Guru Baru'}
                </h3>
                <p className="text-slate-400 text-sm font-medium">Lengkapi formulir di bawah ini.</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <GuruForm 
              initialValues={selectedGuru} 
              onSubmit={handleSubmit} 
              onCancel={handleCloseModal}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />

            {!selectedGuru && (
              <div className="mt-10 p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex gap-4">
                <div className="bg-white p-3 rounded-2xl shadow-sm text-primary h-fit"><UserPlus size={24} /></div>
                <div>
                  <h4 className="text-sm font-black text-primary uppercase tracking-widest mb-1">Tips</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Pastikan username unik dan mudah diingat oleh guru untuk mempermudah proses login.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterGuru;
