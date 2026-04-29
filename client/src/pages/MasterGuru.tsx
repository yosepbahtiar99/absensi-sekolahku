import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

interface Guru {
  id: number;
  name: string;
  username: string;
}

const MasterGuru = () => {
  const { token } = useAuthStore();
  const [gurus, setGurus] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuru, setEditingGuru] = useState<Guru | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const fetchGurus = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/admin/gurus', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGurus(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGurus();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGuru) {
        await axios.put(`http://localhost:3001/api/admin/gurus/${editingGuru.id}`, 
          { name, username, password }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post('http://localhost:3001/api/admin/gurus', 
          { name, username, password }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      closeModal();
      fetchGurus();
    } catch (err) {
      alert('Gagal simpan data');
    }
  };

  const deleteGuru = async (id: number) => {
    if (!confirm('Yakin ingin menghapus guru ini?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/admin/gurus/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGurus();
    } catch (err) {
      alert('Gagal hapus data');
    }
  };

  const openModal = (guru: Guru | null = null) => {
    if (guru) {
      setEditingGuru(guru);
      setName(guru.name);
      setUsername(guru.username);
    } else {
      setEditingGuru(null);
      setName('');
      setUsername('');
    }
    setPassword('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGuru(null);
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Master Guru</h2>
            <p className="text-slate-500">Kelola data guru pengajar di sekolah.</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            <Plus size={18} />
            Tambah Guru
          </button>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-500">Memuat data...</td></tr>
              ) : gurus.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-500">Belum ada data guru.</td></tr>
              ) : (
                gurus.map((guru) => (
                  <tr key={guru.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{guru.name}</td>
                    <td className="px-6 py-4 text-slate-600">{guru.username}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openModal(guru)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => deleteGuru(guru.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingGuru ? 'Edit Data Guru' : 'Tambah Guru Baru'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Password {editingGuru && <span className="text-[10px] text-slate-400 font-normal ml-1">(Kosongkan jika tidak ganti)</span>}
                </label>
                <input 
                  type="password" 
                  required={!editingGuru}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterGuru;
