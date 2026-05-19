import { useState } from 'react';
import { Plus, Trash2, Layers, Loader2, Edit2, Check, X } from 'lucide-react';
import AdminSidebar from '../../../admin/components/AdminSidebar';
import AdminHeader from '../../../admin/components/AdminHeader';
import { Button } from '../../../../shared/components/Button';
import { Card } from '../../../../shared/components/Card';
import { Input } from '../../../../shared/components/Input';
import { useGradeLevels, useCreateGradeLevel, useUpdateGradeLevel, useDeleteGradeLevel } from '../hooks/useGradeLevelData';
import { useConfirmStore } from '../../../../shared/store/confirmStore';
import { useNotificationStore } from '../../../../shared/store/notificationStore';

const MasterGradeLevel = () => {
  const { showNotification } = useNotificationStore();
  const [newName, setNewName] = useState('');
  const [newSequence, setNewSequence] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSequence, setEditSequence] = useState(0);

  const { data: grades = [], isLoading } = useGradeLevels();
  const createMutation = useCreateGradeLevel();
  const updateMutation = useUpdateGradeLevel();
  const deleteMutation = useDeleteGradeLevel();
  const confirm = useConfirmStore(state => state.confirm);

  const handleAdd = () => {
    if (!newName) return;
    createMutation.mutate({ name: newName, sequence: newSequence }, {
      onSuccess: () => {
        showNotification('Tingkat berhasil ditambahkan', 'success');
        setNewName('');
        setNewSequence(grades.length + 1);
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || 'Gagal menambahkan tingkat kelas';
        showNotification(msg, 'error');
      }
    });
  };

  const handleUpdate = (id: string) => {
    updateMutation.mutate({ id, data: { name: editName, sequence: editSequence } }, {
      onSuccess: () => {
        showNotification('Tingkat diperbarui', 'success');
        setEditingId(null);
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || 'Gagal memperbarui tingkat kelas';
        showNotification(msg, 'error');
      }
    });
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Hapus Tingkat',
      message: 'Apakah Anda yakin ingin menghapus tingkat ini? Semua kelas yang terhubung mungkin akan bermasalah.',
      variant: 'danger',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal'
    });
    
    if (confirmed) {
      deleteMutation.mutate(id, {
        onSuccess: () => showNotification('Tingkat dihapus', 'success'),
        onError: (err: any) => {
          const msg = err.response?.data?.message || 'Gagal menghapus tingkat kelas';
          showNotification(msg, 'error');
        }
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <AdminSidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader 
          title="Master Tingkat Kelas" 
          subtitle="Atur daftar jenjang/tingkat yang ada di sekolah ini." 
          icon={<Layers className="text-primary" size={28} />}
        />

        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Form */}
            <div className="md:col-span-1">
              <Card className="p-8 border-none shadow-[0_20px_50px_rgba(0,0,0,0.03)] rounded-[2.5rem]">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 px-1">Tambah Tingkat Baru</h5>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 px-1 uppercase tracking-widest">Nama Tingkat</label>
                    <Input 
                      placeholder="Contoh: Kelas 10 atau Tingkat X"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 px-1 uppercase tracking-widest">Urutan (Sequence)</label>
                    <Input 
                      type="number"
                      value={newSequence}
                      onChange={(e) => setNewSequence(parseInt(e.target.value))}
                    />
                  </div>
                  <Button 
                    className="w-full py-7 rounded-2xl shadow-lg shadow-primary/20" 
                    onClick={handleAdd}
                    disabled={!newName || createMutation.isPending}
                  >
                    {createMutation.isPending ? <Loader2 className="animate-spin" /> : <Plus size={18} className="mr-2" />}
                    Simpan Tingkat
                  </Button>
                </div>
              </Card>
            </div>

            {/* List */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-8 py-5 text-left">Urutan</th>
                      <th className="px-8 py-5 text-left">Nama Tingkat</th>
                      <th className="px-8 py-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                      <tr><td colSpan={3} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></td></tr>
                    ) : grades.map((g) => (
                      <tr key={g.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          {editingId === g.id ? (
                            <Input 
                              type="number" 
                              className="w-20"
                              value={editSequence}
                              onChange={(e) => setEditSequence(parseInt(e.target.value))}
                            />
                          ) : (
                            <span className="text-xs font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">{g.sequence}</span>
                          )}
                        </td>
                        <td className="px-8 py-5">
                          {editingId === g.id ? (
                            <Input 
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                            />
                          ) : (
                            <span className="text-sm font-bold text-slate-700">{g.name}</span>
                          )}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            {editingId === g.id ? (
                              <>
                                <button onClick={() => handleUpdate(g.id)} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"><Check size={18} /></button>
                                <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><X size={18} /></button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => {
                                    setEditingId(g.id);
                                    setEditName(g.name);
                                    setEditSequence(g.sequence);
                                  }} 
                                  className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(g.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MasterGradeLevel;
