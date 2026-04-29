import React, { useState } from 'react';
import { useClasses, useCreateClass, useUpdateClass, useDeleteClass } from '../hooks/useKelasData';
import AdminSidebar from '../../../admin/components/AdminSidebar';
import { Plus, Edit2, Trash2, X, Loader2, GraduationCap } from 'lucide-react';
import { Card } from '../../../../shared/components/Card';
import { Button } from '../../../../shared/components/Button';
import KelasForm from '../forms/KelasForm';
import type { IKelas } from '../interfaces/kelas.interface';

const MasterKelas = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKelas, setSelectedKelas] = useState<IKelas | undefined>(undefined);

  const { data: classes, isLoading } = useClasses();
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

  const handleDelete = (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kelas ini?')) {
      deleteMutation.mutate(id);
    }
  };

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 size={40} className="text-primary animate-spin" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Memuat data kelas...</p>
            </div>
          ) : classes?.length === 0 ? (
            <div className="col-span-full bg-white p-20 rounded-[3rem] text-center border border-slate-100">
              <p className="text-slate-400 font-medium">Belum ada data kelas.</p>
            </div>
          ) : (
            classes?.map((kelas) => (
              <Card key={kelas.id} className="group p-8 rounded-[2.5rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(8,145,178,0.05)] transition-all hover:-translate-y-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-primary/10 text-primary p-4 rounded-[1.5rem] group-hover:scale-110 transition-transform">
                    <GraduationCap size={28} />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenModal(kelas)}
                      className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(kelas.id)}
                      className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Nama Kelas</p>
                  <h3 className="text-2xl font-black text-slate-800">{kelas.name}</h3>
                </div>
              </Card>
            ))
          )}
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
