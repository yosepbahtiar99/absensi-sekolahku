import { useState } from 'react';
import { useTimeSlots, useCreateTimeSlot, useUpdateTimeSlot, useDeleteTimeSlot } from '../hooks/useTimeSlotData';
import { useAcademicYears } from '../../academic-year/hooks/useAcademicYearData';
import AdminSidebar from '../../../admin/components/AdminSidebar';
import { Plus, Edit2, Trash2, Clock, X, Filter } from 'lucide-react';
import { Button } from '../../../../shared/components/Button';
import TimeSlotForm from '../forms/TimeSlotForm';
import type { ITimeSlot, ITimeSlotPayload } from '../../../admin/interfaces/admin.interface';
import { DataTable, type Column } from '../../../../shared/components/DataTable';

const MasterTimeSlot = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ITimeSlot | undefined>(undefined);
  
  const { data: academicYears = [] } = useAcademicYears();
  const activeYear = academicYears.find(y => y.isActive);
  
  const [selectedYearId, setSelectedYearId] = useState<string>(activeYear?.id || '');
  const [selectedDay, setSelectedDay] = useState<string>('senin');

  const { data: slots = [], isLoading } = useTimeSlots({ 
    academicYearId: selectedYearId || activeYear?.id, 
    day: selectedDay 
  });

  const createMutation = useCreateTimeSlot();
  const updateMutation = useUpdateTimeSlot();
  const deleteMutation = useDeleteTimeSlot();

  const handleOpenModal = (slot?: ITimeSlot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedSlot(undefined);
    setIsModalOpen(false);
  };

  const handleSubmit = (values: any) => {
    if (selectedSlot) {
      updateMutation.mutate({ id: selectedSlot.id, data: values }, {
        onSuccess: handleCloseModal
      });
    } else {
      createMutation.mutate(values, {
        onSuccess: handleCloseModal
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus slot jam pelajaran ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const days = [
    { value: 'senin', label: 'Senin' },
    { value: 'selasa', label: 'Selasa' },
    { value: 'rabu', label: 'Rabu' },
    { value: 'kamis', label: 'Kamis' },
    { value: 'jumat', label: 'Jumat' },
    { value: 'sabtu', label: 'Sabtu' },
    { value: 'minggu', label: 'Minggu' },
  ];

  const columns: Column<ITimeSlot>[] = [
    {
      header: 'Jam Pelajaran',
      accessor: (slot) => (
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
            <Clock size={20} />
          </div>
          <div>
            <p className="font-black text-slate-800 text-sm leading-tight">{slot.label}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Urutan ke-{slot.periodNumber}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Waktu Pelaksanaan',
      accessor: (slot) => (
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-black text-slate-600">
            {slot.startTime}
          </div>
          <span className="text-slate-300">—</span>
          <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-black text-slate-600">
            {slot.endTime}
          </div>
        </div>
      )
    },
    {
      header: 'Hari',
      accessor: (slot) => (
        <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-full text-slate-500">
          {slot.day}
        </span>
      )
    },
    {
      header: 'Aksi',
      headerClassName: 'text-right',
      accessor: (slot) => (
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-10 h-10 p-0 rounded-xl"
            onClick={() => handleOpenModal(slot)}
          >
            <Edit2 size={16} className="text-slate-600" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-10 h-10 p-0 rounded-xl hover:bg-red-50 hover:border-red-100 hover:text-red-500"
            onClick={() => handleDelete(slot.id)}
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
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Clock className="text-primary" size={32} />
              Master Jam Pelajaran
            </h2>
            <p className="text-slate-500 font-medium">Atur template slot waktu mengajar untuk setiap hari.</p>
          </div>
          <Button 
            onClick={() => handleOpenModal()} 
            className="shadow-lg shadow-primary/20"
            disabled={!selectedYearId && !activeYear?.id}
          >
            <Plus size={20} className="mr-2" />
            Tambah Slot Jam
          </Button>
        </header>

        <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex-1 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-50 flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                <Filter size={16} className="text-slate-400" />
                <select 
                  value={selectedYearId || activeYear?.id} 
                  onChange={(e) => setSelectedYearId(e.target.value)}
                  className="bg-transparent border-none text-xs font-black uppercase tracking-wider text-slate-600 outline-none"
                >
                  {academicYears.map(y => (
                    <option key={y.id} value={y.id}>{y.name} {y.isActive ? '(Aktif)' : ''}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar">
                {days.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setSelectedDay(d.value)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedDay === d.value 
                        ? 'bg-white text-primary shadow-sm' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <DataTable 
              columns={columns} 
              data={slots} 
              isLoading={isLoading}
              emptyMessage="Belum ada slot jam untuk hari dan tahun ajaran ini."
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
                  {selectedSlot ? 'Edit Slot Jam' : 'Tambah Slot Jam Baru'}
                </h3>
                <p className="text-slate-400 text-sm font-medium">Tentukan waktu mulai dan berakhirnya pelajaran.</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <TimeSlotForm 
              initialValues={selectedSlot} 
              academicYearId={selectedYearId || activeYear?.id || ''}
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

export default MasterTimeSlot;
