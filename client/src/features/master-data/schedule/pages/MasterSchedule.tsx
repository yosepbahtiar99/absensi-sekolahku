import { useState, useMemo } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core';
import { 
  sortableKeyboardCoordinates, 
} from '@dnd-kit/sortable';
import { 
  Calendar, 
  Download, 
  Copy, 
  Users, 
  BookOpen, 
  Info, 
  AlertCircle,
  Loader2,
  ChevronUp,
  ChevronDown,
  Search,
} from 'lucide-react';
import { useSchedules, useUpsertSchedule, useDeleteSchedule, useCloneSchedule } from '../hooks/useScheduleData';
import { scheduleService } from '../services/schedule.service';
import { useGurus } from '../../guru/hooks/useGuruData';
import { useClasses } from '../../kelas/hooks/useKelasData';
import { useLessons } from '../../lesson/hooks/useLessonData';
import { useTimeSlots } from '../../time-slot/hooks/useTimeSlotData';
import { useCurriculums } from '../../curriculum/hooks/useCurriculumData';
import { useAcademicYears } from '../../academic-year/hooks/useAcademicYearData';
import { useAcademicYearStore } from '../../../../shared/store/academicYearStore';
import AdminHeader from '../../../admin/components/AdminHeader';
import DraggableAssetItem from '../components/DraggableAssetItem';
import DroppableGridCell from '../components/DroppableGridCell';
import ScheduleFormModal from '../components/ScheduleFormModal';
import CloneScheduleModal from '../components/CloneScheduleModal';
import AdminSidebar from '../../../admin/components/AdminSidebar';
import { useNotificationStore } from '../../../../shared/store/notificationStore';
import { useConfirmStore } from '../../../../shared/store/confirmStore';
import { Button } from '../../../../shared/components/Button';

const MasterSchedule = () => {
  const [activeDay, setActiveDay] = useState('senin');
  const [activeItem, setActiveItem] = useState<any>(null);
  const [isAssetsOpen, setIsAssetsOpen] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);

  const [guruSearch, setGuruSearch] = useState('');
  const [lessonSearch, setLessonSearch] = useState('');

  const { selectedYearId } = useAcademicYearStore();
  const currentYearId = selectedYearId;

  const { data: schedData } = useSchedules(currentYearId || undefined);
  const { mutate: cloneSchedule, isPending: isCloning } = useCloneSchedule();
  const { data: guruRes } = useGurus({ limit: 100 });
  const { data: kelasRes } = useClasses({ limit: 100 });
  const { data: lessonRes } = useLessons({ limit: 100 });
  const { data: timeSlots = [] } = useTimeSlots({ academicYearId: currentYearId || undefined });
  const { data: curriculumRes = [] } = useCurriculums({ academicYearId: currentYearId || undefined });
  const { data: academicYears = [] } = useAcademicYears();

  const filteredTimeSlots = useMemo(() => {
    return timeSlots.filter(ts => ts.day.toLowerCase() === activeDay.toLowerCase())
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [timeSlots, activeDay]);

  const schedules = schedData || [];
  const gurus = guruRes?.data || [];
  const classes = kelasRes?.data || [];
  const lessons = lessonRes?.data || [];

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const lessonStats = useMemo(() => {
    if (!selectedClassId || !curriculumRes || !classes) return {};
    const targetClass = classes.find(c => c.id === selectedClassId);
    if (!targetClass?.gradeLevelId) return {};
    const classCurriculum = curriculumRes.filter(c => c.gradeLevelId === targetClass.gradeLevelId);
    const stats: Record<string, { assigned: number; required: number; remaining: number }> = {};
    classCurriculum.forEach(curr => {
      const assignedCount = schedules.filter(s => s.classId === selectedClassId && s.lessonId === curr.lessonId).length;
      stats[curr.lessonId] = {
        assigned: assignedCount,
        required: curr.requiredHours,
        remaining: curr.requiredHours - assignedCount
      };
    });
    return stats;
  }, [selectedClassId, curriculumRes, schedules, classes]);

  const complianceStatus = useMemo(() => {
    return Object.entries(lessonStats).map(([lessonId, stat]) => {
      const lesson = lessons.find(l => l.id === lessonId);
      return {
        lessonName: lesson?.name || 'Unknown',
        assigned: stat.assigned,
        required: stat.required,
        isFulfilled: stat.assigned >= stat.required
      };
    });
  }, [lessonStats, lessons]);

  const upsertMutation = useUpsertSchedule();
  const deleteMutation = useDeleteSchedule();
  const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { showNotification } = useNotificationStore();
  const confirm = useConfirmStore(state => state.confirm);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const [type, id] = (active.id as string).split(':');
    if (type === 'guru') setActiveItem({ type: 'guru', ...gurus.find(g => g.id === id) });
    else setActiveItem({ type: 'lesson', ...lessons.find(l => l.id === id) });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { over, active } = event;
    setActiveItem(null);
    if (!over) return;
    const [overType, overId] = (over.id as string).split(':');
    if (overType !== 'cell') return;

    const [classId, timeSlotId] = overId.split('|');
    const [activeType, activeId] = (active.id as string).split(':');
    const existing = schedules?.find(s => s.classId === classId && s.timeSlotId === timeSlotId && s.day === activeDay);

    const payload = {
      id: existing?.id,
      academicYearId: currentYearId!,
      classId,
      timeSlotId,
      day: activeDay,
      teacherId: activeType === 'guru' ? activeId : (existing?.teacherId || ''),
      lessonId: activeType === 'lesson' ? activeId : (existing?.lessonId || '')
    };

    if (activeType === 'lesson' && lessonStats[activeId]) {
      const stat = lessonStats[activeId];
      if (!existing && stat.remaining <= 0) {
        const confirmed = await confirm({
          title: 'Kuota Terpenuhi',
          message: `${activeItem.name} sudah memenuhi kuota (${stat.required} JP) untuk kelas ini. Tetap tambahkan?`,
          variant: 'warning',
          confirmText: 'Tetap Tambah',
          cancelText: 'Batal'
        });
        if (!confirmed) return;
      }
    }

    if (!payload.teacherId || !payload.lessonId) {
      setModalData(payload);
      setIsModalOpen(true);
      return;
    }

    upsertMutation.mutate(payload, {
      onSuccess: () => showNotification('Jadwal diperbarui', 'success'),
      onError: (err: any) => showNotification(err.response?.data?.message || 'Gagal', 'error')
    });
  };

  const handleCellClick = (classId: string, timeSlotId: string) => {
    const existing = schedules?.find(s => s.classId === classId && s.timeSlotId === timeSlotId && s.day === activeDay);
    setModalData({
      id: existing?.id,
      academicYearId: currentYearId!,
      classId,
      timeSlotId,
      day: activeDay,
      teacherId: existing?.teacherId || '',
      lessonId: existing?.lessonId || ''
    });
    setIsModalOpen(true);
    setSelectedClassId(classId);
  };

  const filteredGurus = useMemo(() => 
    gurus.filter(g => g.name.toLowerCase().includes(guruSearch.toLowerCase())), 
  [gurus, guruSearch]);

  const filteredLessons = useMemo(() => 
    lessons.filter(l => l.name.toLowerCase().includes(lessonSearch.toLowerCase())), 
  [lessons, lessonSearch]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <AdminSidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <AdminHeader 
          title="Matrix Scheduling" 
          subtitle="Atur jadwal mingguan dengan pengawasan kuota JP kurikulum."
          icon={<Calendar className="text-primary" size={28} />}
          actions={
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="rounded-xl px-6" 
                onClick={() => setIsCloneModalOpen(true)} 
                disabled={isCloning}
              >
                {isCloning ? <Loader2 className="animate-spin mr-2" /> : <Copy size={18} className="mr-2" />}
                Clone
              </Button>
              <Button 
                onClick={() => currentYearId && scheduleService.exportExcel(currentYearId)}
                className="rounded-xl px-6 shadow-lg shadow-primary/20"
              >
                <Download size={18} className="mr-2" />
                Export
              </Button>
            </div>
          }
        />

        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0">
              <div className="px-8 pt-6 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                {days.map(day => (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeDay === day 
                        ? 'bg-primary text-white shadow-md shadow-primary/30' 
                        : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <div className="flex-1 p-8 pt-4 overflow-auto custom-scrollbar">
                <div className="inline-block min-w-full bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="sticky left-0 top-0 z-20 bg-slate-50 p-6 border-r border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                          Kelas / Jam
                        </th>
                        {filteredTimeSlots.map(slot => (
                          <th key={slot.id} className="sticky top-0 z-10 bg-slate-50 p-6 border-b border-slate-100 text-center min-w-[220px]">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{slot.label}</p>
                            <p className="text-xs font-black text-primary mt-1">{slot.startTime.slice(0,5)} - {slot.endTime.slice(0,5)}</p>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {classes.map(cls => (
                        <tr 
                          key={cls.id} 
                          className={`group hover:bg-slate-50/50 transition-colors ${selectedClassId === cls.id ? 'bg-primary/[0.03]' : ''}`}
                          onClick={() => setSelectedClassId(cls.id)}
                        >
                          <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 backdrop-blur-md p-6 border-r border-b border-slate-100 cursor-pointer">
                            <div>
                              <p className="font-black text-slate-800 text-sm">{cls.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{(cls as any).GradeLevel?.name || '-'}</p>
                            </div>
                          </td>
                          {filteredTimeSlots.map(slot => (
                            <DroppableGridCell 
                              key={`${cls.id}-${slot.id}`}
                              id={`cell:${cls.id}|${slot.id}`}
                              schedule={schedules.find(s => s.classId === cls.id && s.timeSlotId === slot.id && s.day === activeDay)}
                              onDelete={(id) => deleteMutation.mutate(id)}
                              onClick={() => handleCellClick(cls.id, slot.id)}
                            />
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="w-80 bg-white border-l border-slate-100 flex flex-col h-full overflow-hidden">
              <div className="p-8 h-full overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-8">
                  <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Compliance Tracker</h5>
                  {selectedClassId && (
                    <div className="bg-primary/10 px-3 py-1 rounded-full text-[10px] font-black text-primary uppercase">
                      {classes.find(c => c.id === selectedClassId)?.name}
                    </div>
                  )}
                </div>

                {!selectedClassId ? (
                  <div className="h-64 flex flex-col items-center justify-center bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[2rem] p-8 text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                      <Info size={24} className="text-slate-300" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Pilih baris kelas untuk melihat tracker</p>
                  </div>
                ) : complianceStatus.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-8 text-center">
                    <AlertCircle size={24} className="mx-auto text-amber-300 mb-3" />
                    <p className="text-[11px] font-bold text-amber-600 uppercase tracking-widest leading-relaxed">Kurikulum belum di-set untuk tingkat ini</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {complianceStatus.map((status, i) => (
                      <div key={i} className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:border-primary/20 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-black text-slate-700 leading-tight pr-2">{status.lessonName}</span>
                          <span className={`text-[10px] font-black shrink-0 ${status.isFulfilled ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {status.assigned}/{status.required} JP
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${status.isFulfilled ? 'bg-emerald-500' : 'bg-amber-400'}`}
                            style={{ width: `${Math.min((status.assigned / status.required) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`absolute bottom-0 left-64 right-80 bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 transition-all duration-500 rounded-t-[2.5rem] ${isAssetsOpen ? 'h-[20rem]' : 'h-12'}`}>
            <button 
              onClick={() => setIsAssetsOpen(!isAssetsOpen)}
              className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white border border-slate-200 p-2 rounded-full shadow-md text-slate-400 hover:text-primary transition-all"
            >
              {isAssetsOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>

            <div className={`p-6 h-full flex flex-col overflow-hidden ${isAssetsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="flex gap-8 h-full">
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-blue-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daftar Guru</span>
                    </div>
                    <div className="relative">
                      <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="text" 
                        placeholder="Cari guru..." 
                        value={guruSearch}
                        onChange={(e) => setGuruSearch(e.target.value)}
                        className="pl-8 pr-4 py-1.5 bg-slate-50 border-none rounded-full text-[10px] font-bold outline-none ring-1 ring-slate-100 focus:ring-primary/20 w-32 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-x-auto flex gap-3 pb-2 no-scrollbar">
                    {filteredGurus.map(guru => (
                      <div key={guru.id} className="min-w-[160px]">
                        <DraggableAssetItem id={`guru:${guru.id}`} type="guru" name={guru.name} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 flex flex-col min-w-0 border-l border-slate-100 pl-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BookOpen size={14} className="text-amber-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mata Pelajaran</span>
                    </div>
                    <div className="relative">
                      <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="text" 
                        placeholder="Cari mapel..." 
                        value={lessonSearch}
                        onChange={(e) => setLessonSearch(e.target.value)}
                        className="pl-8 pr-4 py-1.5 bg-slate-50 border-none rounded-full text-[10px] font-bold outline-none ring-1 ring-slate-100 focus:ring-primary/20 w-32 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-x-auto flex gap-3 pb-4 no-scrollbar">
                    {filteredLessons.map(lesson => {
                      const stat = lessonStats[lesson.id];
                      return (
                        <div key={lesson.id} className="min-w-[180px]">
                          <DraggableAssetItem 
                            id={`lesson:${lesson.id}`} 
                            type="lesson" 
                            name={lesson.name} 
                            badge={stat ? `${stat.assigned}/${stat.required} JP` : undefined}
                            isFulfilled={stat ? stat.remaining <= 0 : false}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DragOverlay dropAnimation={null}>
            {activeItem ? (
              <div className="p-4 bg-white rounded-2xl shadow-2xl border-2 border-primary ring-8 ring-primary/5 min-w-[180px] rotate-3 scale-110 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${activeItem.type === 'guru' ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'}`}>
                  {activeItem.type === 'guru' ? <Users size={16} /> : <BookOpen size={16} />}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{activeItem.type}</p>
                  <p className="text-xs font-black text-slate-800">{activeItem.name}</p>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {isModalOpen && (
          <ScheduleFormModal 
            initialValues={modalData}
            gurus={gurus}
            lessons={lessons}
            isLoading={upsertMutation.isPending}
            onClose={() => setIsModalOpen(false)}
            onSubmit={async (values) => {
              if (lessonStats[values.lessonId]) {
                const stat = lessonStats[values.lessonId];
                const isChangingToSame = schedules.find(s => s.classId === values.classId && s.timeSlotId === values.timeSlotId && s.day === values.day)?.lessonId === values.lessonId;
                if (!isChangingToSame && stat.remaining <= 0) {
                  const confirmed = await confirm({
                    title: 'Kuota Terpenuhi',
                    message: `Kuota Mapel sudah terpenuhi (${stat.required} JP). Tetap simpan?`,
                    variant: 'warning',
                    confirmText: 'Tetap Simpan',
                    cancelText: 'Batal'
                  });
                  if (!confirmed) return;
                }
              }
              upsertMutation.mutate(values, {
                onSuccess: () => {
                  showNotification('Jadwal disimpan', 'success');
                  setIsModalOpen(false);
                },
                onError: (err: any) => showNotification(err.response?.data?.message || 'Gagal', 'error')
              });
            }}
          />
        )}

        {isCloneModalOpen && (
          <CloneScheduleModal 
            academicYears={academicYears}
            currentYearId={currentYearId!}
            isLoading={isCloning}
            onClose={() => setIsCloneModalOpen(false)}
            onClone={(fromId) => {
              cloneSchedule({ fromYearId: fromId, toYearId: currentYearId! }, {
                onSuccess: () => {
                  showNotification('Jadwal berhasil di-clone', 'success');
                  setIsCloneModalOpen(false);
                },
                onError: (err: any) => showNotification(err.response?.data?.message || 'Gagal clone', 'error')
              });
            }}
          />
        )}
      </main>
    </div>
  );
};

export default MasterSchedule;
