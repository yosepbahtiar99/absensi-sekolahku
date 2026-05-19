import { useState } from 'react';
import { useAcademicYears, useCreateAcademicYear, useUpdateAcademicYear, useDeleteAcademicYear } from '../hooks/useAcademicYearData';
import { useConfirmStore } from '../../../../shared/store/confirmStore';
import { useNotificationStore } from '../../../../shared/store/notificationStore';
import AdminSidebar from '../../../admin/components/AdminSidebar';
import { Plus, Edit2, Trash2, CalendarDays, X, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '../../../../shared/components/Button';
import AcademicYearForm from '../forms/AcademicYearForm';
import type { IAcademicYear } from '../../../admin/interfaces/admin.interface';
import { DataTable, type Column } from '../../../../shared/components/DataTable';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const MasterAcademicYear = () => {
  const { showNotification } = useNotificationStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<IAcademicYear | undefined>(undefined);

  const { data: years = [], isLoading } = useAcademicYears();
  const createMutation = useCreateAcademicYear();
  const updateMutation = useUpdateAcademicYear();
  const deleteMutation = useDeleteAcademicYear();
  const confirm = useConfirmStore(state => state.confirm);

  const handleOpenModal = (year?: IAcademicYear) => {
    setSelectedYear(year);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedYear(undefined);
    setIsModalOpen(false);
  };

  const handleSubmit = (values: any) => {
    if (selectedYear) {
      updateMutation.mutate({ id: selectedYear.id, data: values }, {
        onSuccess: () => {
          showNotification('Tahun ajaran berhasil diperbarui', 'success');
          handleCloseModal();
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || 'Gagal memperbarui tahun ajaran';
          showNotification(msg, 'error');
        }
      });
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          showNotification('Tahun ajaran baru berhasil ditambahkan', 'success');
          handleCloseModal();
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || 'Gagal menambahkan tahun ajaran';
          showNotification(msg, 'error');
        }
      });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Hapus Tahun Ajaran',
      message: 'Apakah Anda yakin ingin menghapus tahun ajaran ini? Semua data terkait (jadwal, kurikulum, dsb) akan hilang.',
      variant: 'danger',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal'
    });
    
    if (confirmed) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          showNotification('Tahun ajaran berhasil dihapus', 'success');
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || 'Gagal menghapus tahun ajaran';
          showNotification(msg, 'error');
        }
      });
    }
  };

  const columns: Column<IAcademicYear>[] = [
    {
      header: 'Tahun Ajaran',
      accessor: (year) => (
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${year.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
            <CalendarDays size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-black text-slate-800 text-sm leading-tight">{year.name}</p>
              {year.isActive && (
                <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest">Active</span>
              )}
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              {year.startDate ? format(new Date(year.startDate), 'dd MMM yyyy', { locale: id }) : '-'} — {year.endDate ? format(new Date(year.endDate), 'dd MMM yyyy', { locale: id }) : '-'}
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (year) => (
        <div className="flex items-center gap-2">
          {year.isActive ? (
            <div className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 size={16} />
              <span className="text-[10px] font-black uppercase tracking-wider">Aktif Digunakan</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Circle size={16} />
              <span className="text-[10px] font-black uppercase tracking-wider">Arsip</span>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Aksi',
      headerClassName: 'text-right',
      accessor: (year) => (
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-10 h-10 p-0 rounded-xl"
            onClick={() => handleOpenModal(year)}
          >
            <Edit2 size={16} className="text-slate-600" />
          </Button>
          {!year.isActive && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-10 h-10 p-0 rounded-xl hover:bg-red-50 hover:border-red-100 hover:text-red-500"
              onClick={() => handleDelete(year.id)}
            >
              <Trash2 size={16} />
            </Button>
          )}
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
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <CalendarDays className="text-primary" size={32} />
              Master Tahun Ajaran
            </h2>
            <p className="text-slate-500 font-medium">Kelola periode akademik untuk memisahkan data history tiap tahun.</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="shadow-lg shadow-primary/20">
            <Plus size={20} className="mr-2" />
            Tambah Tahun Ajaran
          </Button>
        </header>

        <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex-1 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden flex flex-col">
            <DataTable 
              columns={columns} 
              data={years} 
              isLoading={isLoading}
              emptyMessage="Belum ada data tahun ajaran."
              className="border-none shadow-none rounded-none flex-1 min-h-0"
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
                  {selectedYear ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran'}
                </h3>
                <p className="text-slate-400 text-sm font-medium">Atur periode awal dan akhir tahun ajaran.</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <AcademicYearForm 
              initialValues={selectedYear} 
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

export default MasterAcademicYear;
