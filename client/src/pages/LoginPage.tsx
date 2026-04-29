import React, { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Lock, Loader2, School } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        username,
        password,
      });

      const { user, token } = response.data;
      setUser(user, token);
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal login. Periksa koneksi atau kredensial.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F9FA] relative overflow-hidden px-4">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-accent/10 rounded-full blur-[80px]"></div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-xl shadow-cyan-900/10 border border-white p-4 mb-2">
            <School size={40} className="text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Absensi<span className="text-primary">Sekolahku</span>
            </h1>
            <p className="mt-2 text-slate-500 font-medium">Digital Attendance Ecosystem</p>
          </div>
        </div>
        
        {/* Card */}
        <div className="bg-white/70 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Selamat Datang</h2>
            <p className="text-slate-500 text-sm">Masuk dengan akun yang sudah terdaftar</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-2xl text-sm border border-red-100 flex items-center gap-3 animate-shake">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan username"
                    className="block w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm px-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-500">
                <input type="checkbox" className="w-4 h-4 rounded-md border-slate-300 text-primary focus:ring-primary" />
                <span>Ingat saya</span>
              </label>
              <a href="#" className="text-primary font-bold hover:underline">Lupa password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-2xl shadow-lg shadow-primary/25 text-sm font-bold text-white bg-primary hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-300 disabled:shadow-none transition-all active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Masuk Sekarang</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-sm">
          Belum punya akun? <a href="#" className="text-primary font-bold hover:underline">Hubungi Admin</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
