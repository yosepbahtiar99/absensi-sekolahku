import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

interface Kelas {
  id: number;
  name: string;
}

const MasterKelas = () => {
  const { token } = useAuthStore();
  const [classes, setClasses] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  const [name, setName] = useState('');

  const fetchClasses = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/admin/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingKelas) {
        await axios.put(`http://localhost:3001/api/admin/classes/${editingKelas.id}`, { name }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('http://localhost:3001/api/admin/classes', { name }, { headers: { Authorization: `Bearer ${token}` } });
      }
      closeModal();
      fetchClasses();
    } catch (err) {
      alert('Gagal simpan data');
    }
  };

  const deleteClass = async (id: number) => {
    if (!confirm('Yakin ingin menghapus kelas ini?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/admin/classes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchClasses();
    } catch (err) {
      alert('Gagal hapus data');
    }
  };

  const openModal = (cls: Kelas | null = null) => {
    if (cls) {
      setEditingKelas(cls);
      setName(cls.name);
    } else {
      setEditingKelas(null);
      setName('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingKelas(null);
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Master Kelas</h2>
            <p className="text-slate-500">Kelola daftar kelas di sekolah.</p>
          </div>
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg">
            <Plus size={18} /> Tambah Kelas
          </button>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden max-w-2xl">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Kelas</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (<tr><td colSpan={2} className="px-6 py-10 text-center">Memuat...</td></tr>) : classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{cls.name}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(cls)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"><Edit2 size={18} /></button>
                      <button onClick={() => deleteClass(cls.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">{editingKelas ? 'Edit Kelas' : 'Tambah Kelas'}</h3>
              <button onClick={closeModal} className="text-slate-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nama Kelas</label>
                <input type="text" required className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Kelas VII A" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Batal</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterKelas;
