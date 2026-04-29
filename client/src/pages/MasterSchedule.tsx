import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, Clock, MapPin, User, BookOpen, X } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

// --- Types ---
interface Schedule {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  teacherId: number;
  classId: number;
  lessonId: number;
  teacher?: { name: string };
  Class?: { name: string };
  Lesson?: { name: string };
}

interface MasterData {
  gurus: { id: number, name: string }[];
  classes: { id: number, name: string }[];
  lessons: { id: number, name: string }[];
}

// --- Components ---

const SortableItem = ({ schedule, onDelete, onEdit }: { schedule: Schedule, onDelete: any, onEdit: any }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: schedule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative mb-3"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <div className="flex justify-between items-start mb-2">
          <div className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
            {schedule.startTime.substring(0, 5)} - {schedule.endTime.substring(0, 5)}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(schedule)} className="p-1 text-slate-400 hover:text-blue-600"><Plus size={14} /></button>
            <button onClick={() => onDelete(schedule.id)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
          </div>
        </div>
        <h4 className="font-bold text-slate-800 text-sm mb-1">{schedule.Lesson?.name}</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <User size={12} />
            <span>{schedule.teacher?.name}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin size={12} />
            <span>{schedule.Class?.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MasterSchedule = () => {
  const { token } = useAuthStore();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [master, setMaster] = useState<MasterData>({ gurus: [], classes: [], lessons: [] });
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    day: 'senin',
    startTime: '07:00',
    endTime: '08:00',
    teacherId: '',
    classId: '',
    lessonId: ''
  });

  const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchData = async () => {
    try {
      const [resSched, resGuru, resClass, resLesson] = await Promise.all([
        axios.get('http://localhost:3001/api/admin/schedules', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:3001/api/admin/gurus', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:3001/api/admin/classes', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:3001/api/admin/lessons', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setSchedules(resSched.data);
      setMaster({ gurus: resGuru.data, classes: resClass.data, lessons: resLesson.data });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      // Logic DND antar hari atau reorder
      // Untuk kesederhanaan, kita implementasikan reorder di hari yang sama
      // Atau pindah hari jika dropped ke container hari
      const activeItem = schedules.find(s => s.id === active.id);
      const overItem = schedules.find(s => s.id === over.id);

      if (activeItem && overItem && activeItem.day !== overItem.day) {
        try {
          await axios.post('http://localhost:3001/api/admin/schedules', {
            ...activeItem,
            day: overItem.day
          }, { headers: { Authorization: `Bearer ${token}` } });
          fetchData();
        } catch (err: any) {
          alert(err.response?.data?.message || 'Gagal pindah jadwal (Conflict)');
        }
      }
    }
  };

  const openModal = (sched: Schedule | null = null, dayHint: string = 'senin') => {
    if (sched) {
      setEditingId(sched.id);
      setFormData({
        day: sched.day,
        startTime: sched.startTime.substring(0, 5),
        endTime: sched.endTime.substring(0, 5),
        teacherId: String(sched.teacherId),
        classId: String(sched.classId),
        lessonId: String(sched.lessonId)
      });
    } else {
      setEditingId(null);
      setFormData({ ...formData, day: dayHint });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/admin/schedules',
        { ...formData, id: editingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal simpan jadwal');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus jadwal ini?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/admin/schedules/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Gagal hapus');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 overflow-x-hidden">
      <AdminSidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="p-8 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Manajemen Jadwal</h2>
            <p className="text-slate-500">Atur pembagian jam mengajar dengan sistem Board.</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 shadow-lg"
          >
            Tambah Jadwal
          </button>
        </header>

        {/* Scrollable Board */}
        <div className="flex-1 overflow-x-auto p-8 pt-0">
          <div className="flex gap-6 min-w-max h-full pb-8">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              {days.map((day) => (
                <div key={day} className="w-72 flex flex-col bg-slate-200/50 rounded-2xl border border-slate-200">
                  <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-2xl">
                    <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">{day}</h3>
                    <button onClick={() => openModal(null, day)} className="p-1 hover:bg-slate-100 rounded text-slate-400">
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                    <SortableContext
                      items={schedules.filter(s => s.day === day).map(s => s.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {schedules.filter(s => s.day === day).map((item) => (
                        <SortableItem
                          key={item.id}
                          schedule={item}
                          onDelete={handleDelete}
                          onEdit={openModal}
                        />
                      ))}
                    </SortableContext>

                    {schedules.filter(s => s.day === day).length === 0 && (
                      <div className="h-20 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                        Belum ada jadwal
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </DndContext>
          </div>
        </div>
      </main>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingId ? 'Edit Jadwal' : 'Tambah Jadwal'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hari</label>
                  <select
                    className="w-full px-3 py-2 border rounded-xl"
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  >
                    {days.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pelajaran</label>
                  <select
                    required
                    className="w-full px-3 py-2 border rounded-xl"
                    value={formData.lessonId}
                    onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })}
                  >
                    <option value="">Pilih Pelajaran</option>
                    {master.lessons.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jam Mulai</label>
                  <input
                    type="time" required
                    className="w-full px-3 py-2 border rounded-xl"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jam Selesai</label>
                  <input
                    type="time" required
                    className="w-full px-3 py-2 border rounded-xl"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Guru Pengajar</label>
                <select
                  required
                  className="w-full px-3 py-2 border rounded-xl"
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                >
                  <option value="">Pilih Guru</option>
                  {master.gurus.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kelas</label>
                <select
                  required
                  className="w-full px-3 py-2 border rounded-xl"
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                >
                  <option value="">Pilih Kelas</option>
                  {master.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border rounded-xl font-bold text-slate-600">Batal</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterSchedule;
