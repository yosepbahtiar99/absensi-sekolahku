import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, X, Calendar, Clock, Info, Loader2, GraduationCap } from 'lucide-react';
import AdminSidebar from '../../../admin/components/AdminSidebar';
import { Button } from '../../../../shared/components/Button';
import { Card } from '../../../../shared/components/Card';
import { useSchedules, useUpsertSchedule, useDeleteSchedule } from '../hooks/useScheduleData';
import { useGurus } from '../../guru/hooks/useGuruData';
import { useClasses } from '../../kelas/hooks/useKelasData';
import { useLessons } from '../../lesson/hooks/useLessonData';
import { useAcademicYears } from '../../academic-year/hooks/useAcademicYearData';
import { useTimeSlots } from '../../time-slot/hooks/useTimeSlotData';
import SortableScheduleItem from '../components/SortableScheduleItem';
import DroppableGridCell from '../components/DroppableGridCell';
import ScheduleForm from '../forms/ScheduleForm';
import type { ISchedulePayload } from '../interfaces/schedule.interface';
import type { ITimeSlot, IAcademicYear } from '../../../admin/interfaces/admin.interface';
import { useNotificationStore } from '../../../../shared/store/notificationStore';

const MasterSchedule = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Partial<ISchedulePayload> | undefined>(undefined);
  const [activeDay, setActiveDay] = useState('senin');

  const { data: academicYears = [] } = useAcademicYears();
  const activeYear = academicYears.find(y => y.isActive);
  const [selectedYearId, setSelectedYearId] = useState<string>('');

  const currentYearId = selectedYearId || activeYear?.id;

  const { data: schedData, isLoading: isSchedLoading } = useSchedules(currentYearId);
  const { data: guruRes } = useGurus({ limit: 100 });
  const { data: kelasRes } = useClasses({ limit: 100 });
  const { data: lessonRes } = useLessons({ limit: 100 });
  const { data: timeSlots = [] } = useTimeSlots({ academicYearId: currentYearId });

  const schedules = schedData; // Schedules is not paginated yet in server, but hook was updated? Wait.
  const gurus = guruRes?.data || [];
  const classes = kelasRes?.data || [];
  const lessons = lessonRes?.data || [];

  const upsertMutation = useUpsertSchedule();
  const deleteMutation = useDeleteSchedule();

  const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- Logic Features ---
  
  // 1. Calculate Teacher Hours Allocation
  const teacherStats = useMemo(() => {
    if (!gurus || !schedules) return [];
    return gurus.map(guru => {
      const teacherSchedules = schedules.filter(s => s.teacherId === guru.id);
      const totalHours = teacherSchedules.reduce((acc, curr) => acc + (curr.Lesson?.hours || 0), 0);
      return { ...guru, totalHours };
    }).sort((a, b) => b.totalHours - a.totalHours);
  }, [gurus, schedules]);

  // 2. Class Coverage for Active Day
  const classStatus = useMemo(() => {
    if (!classes || !schedules) return [];
    return classes.map(cls => {
      const hasSchedule = schedules.some(s => s.classId === cls.id && s.day === activeDay);
      return { ...cls, hasSchedule };
    });
  }, [classes, schedules, activeDay]);

  // --- Handlers ---
  const { showNotification } = useNotificationStore();

  const handleOpenModal = (sched?: Partial<ISchedulePayload>, dayHint?: string) => {
    setSelectedSchedule(sched || { day: dayHint || activeDay });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedSchedule(undefined);
    setIsModalOpen(false);
  };

  const handleSave = (values: ISchedulePayload) => {
    upsertMutation.mutate(values, {
      onSuccess: () => {
        showNotification(values.id ? 'Jadwal berhasil diperbarui!' : 'Jadwal baru berhasil ditambahkan!', 'success');
        handleCloseModal();
      },
      onError: (error: any) => {
        const msg = error.response?.data?.message || 'Gagal menyimpan jadwal.';
        showNotification(msg, 'error');
      }
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus jadwal ini?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => showNotification('Jadwal berhasil dihapus!', 'success'),
        onError: () => showNotification('Gagal menghapus jadwal.', 'error')
      });
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const scheduleId = active.id;
    const [classId, timeSlotId] = over.id.split(':');

    const schedule = schedules?.find(s => s.id === scheduleId);
    if (!schedule) return;

    // If dropped on the same cell, do nothing
    if (schedule.classId === classId && schedule.timeSlotId === timeSlotId) return;

    // Update via upsert
    const payload: ISchedulePayload = {
      id: schedule.id,
      day: activeDay,
      academicYearId: currentYearId || '',
      classId,
      timeSlotId,
      teacherId: schedule.teacherId,
      lessonId: schedule.lessonId
    };

    upsertMutation.mutate(payload, {
      onSuccess: () => showNotification('Jadwal dipindahkan!', 'success'),
      onError: (error: any) => {
        const msg = error.response?.data?.message || 'Gagal memindahkan jadwal.';
        showNotification(msg, 'error');
      }
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <AdminSidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="p-8 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Calendar className="text-primary" size={32} />
              Matrix Scheduling
            </h2>
            <p className="text-slate-500 font-medium text-sm">Visualisasi pemetaan jadwal Kelas vs Jam Pelajaran.</p>
          </div>
          <div className="flex gap-3">
             <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm mr-2">
                <Calendar size={16} className="text-slate-400" />
                <select 
                  value={currentYearId} 
                  onChange={(e) => setSelectedYearId(e.target.value)}
                  className="bg-transparent border-none text-xs font-black uppercase tracking-wider text-slate-600 outline-none"
                >
                  {academicYears.map(y => (
                    <option key={y.id} value={y.id}>{y.name} {y.isActive ? '(Aktif)' : ''}</option>
                  ))}
                </select>
              </div>
             <Button onClick={() => handleOpenModal()} className="shadow-lg shadow-primary/20" disabled={!currentYearId}>
                <Plus size={20} className="mr-2" />
                Tambah Jadwal
              </Button>
          </div>
        </header>

        <div className="px-8 mb-6">
          <div className="flex gap-2 p-1.5 bg-slate-100/80 backdrop-blur-md rounded-[2rem] w-fit border border-slate-200/50 shadow-inner">
            {days.map(d => (
              <button
                key={d}
                onClick={() => setActiveDay(d)}
                className={`px-8 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
                  activeDay === d 
                    ? 'bg-white text-primary shadow-xl shadow-primary/10 ring-1 ring-primary/5' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="flex-1 overflow-auto p-8 pt-0 bg-[#F8FAFC] custom-scrollbar">
              <div className="inline-block min-w-full align-middle">
                <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="sticky left-0 z-20 bg-slate-50/80 backdrop-blur-md p-6 text-left border-r border-b border-slate-100 min-w-[200px]">
                          <div className="flex items-center gap-3">
                            <GraduationCap className="text-slate-400" size={20} />
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Kelas \ Jam</span>
                          </div>
                        </th>
                        {timeSlots.filter(ts => ts.day === activeDay).sort((a,b) => (a.periodNumber || 0) - (b.periodNumber || 0)).map(slot => (
                          <th key={slot.id} className="p-6 border-b border-r border-slate-100 min-w-[240px]">
                            <div className="flex flex-col items-center">
                              <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1">{slot.label}</span>
                              <span className="text-[10px] font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-full">{slot.startTime} - {slot.endTime}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {classes.map(cls => (
                        <tr key={cls.id} className="group hover:bg-slate-50/30 transition-colors">
                          <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/50 backdrop-blur-md p-6 border-r border-b border-slate-100">
                            <p className="font-black text-slate-800 text-sm">{cls.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID: {cls.id.slice(0, 8)}</p>
                          </td>
                          {timeSlots.filter(ts => ts.day === activeDay).sort((a,b) => (a.periodNumber || 0) - (b.periodNumber || 0)).map(slot => {
                            const schedule = schedules?.find(s => s.classId === cls.id && s.timeSlotId === slot.id && s.day === activeDay);
                            
                            const isTeacherConflict = schedule && schedules?.some(s => 
                              s.teacherId === schedule.teacherId && 
                              s.timeSlotId === slot.id && 
                              s.day === activeDay && 
                              s.id !== schedule.id
                            );

                            return (
                              <DroppableGridCell 
                                key={slot.id} 
                                id={`${cls.id}:${slot.id}`}
                                isEmpty={!schedule}
                                onAdd={() => handleOpenModal({ day: activeDay, classId: cls.id, timeSlotId: slot.id })}
                              >
                                {schedule && (
                                  <SortableScheduleItem
                                    schedule={schedule}
                                    onDelete={handleDelete}
                                    isConflict={isTeacherConflict}
                                    onEdit={(s) => handleOpenModal({
                                      id: s.id,
                                      day: s.day,
                                      timeSlotId: s.timeSlotId,
                                      teacherId: s.teacherId,
                                      classId: s.classId,
                                      lessonId: s.lessonId,
                                      academicYearId: s.academicYearId
                                    })}
                                  />
                                )}
                              </DroppableGridCell>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </DndContext>

          <aside className="w-80 bg-white border-l border-slate-100 flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Info size={16} className="text-primary" />
                Live Insights
              </h4>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {/* Teacher Allocation Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Alokasi Jam Guru</h5>
                  <div className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500">Global</div>
                </div>
                <div className="space-y-5">
                  {teacherStats.slice(0, 5).map((stat, i) => (
                    <div key={i} className="group">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[140px]">{stat.name}</span>
                        <span className="text-[10px] font-black text-primary">{stat.totalHours} JP</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.min((stat.totalHours / 40) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Class Status Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status Kelas ({activeDay})</h5>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {classStatus.map((cls, i) => (
                    <div 
                      key={i} 
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        cls.hasSchedule 
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm' 
                          : 'bg-white border-slate-100 text-slate-400 grayscale opacity-60'
                      }`}
                    >
                      <GraduationCap size={16} className="mx-auto mb-1.5 opacity-40" />
                      <p className="text-[10px] font-black uppercase tracking-tighter">{cls.name}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Legend Card */}
              <Card className="bg-primary/5 border-primary/10 p-5 rounded-[2rem]">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Pro Tip</p>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Gunakan insight di atas untuk memastikan beban mengajar guru merata dan semua kelas sudah terisi jadwalnya.
                </p>
              </Card>
            </div>
          </aside>
        </div>
      </main>

      {/* Modal / Sidebar Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={handleCloseModal}></div>
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl p-8 flex flex-col animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {selectedSchedule?.id ? 'Edit Jadwal' : 'Tambah Jadwal'}
                </h3>
                <p className="text-slate-400 text-sm font-medium">Lengkapi rincian jadwal mengajar.</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <ScheduleForm 
              initialValues={selectedSchedule}
              gurus={gurus || []}
              classes={classes || []}
              lessons={lessons || []}
              timeSlots={timeSlots || []}
              academicYearId={currentYearId || ''}
              onSubmit={handleSave} 
              onCancel={handleCloseModal}
              isLoading={upsertMutation.isPending}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterSchedule;
