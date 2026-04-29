import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Calendar, Clock, MapPin, CheckCircle, Camera, Bell, User, LayoutGrid } from 'lucide-react';

interface Schedule {
  id: number;
  startTime: string;
  endTime: string;
  Class: { name: string };
  Lesson: { name: string };
  Activities: any[];
}

const GuruHome = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/teacher/schedule', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSchedules(res.data);
      } catch (err) {
        console.error('Gagal fetch jadwal', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [token]);

  const isWithinTime = (start: string, end: string) => {
    const now = new Date();
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    
    const startTime = new Date();
    startTime.setHours(sH, sM, 0);
    
    const endTime = new Date();
    endTime.setHours(eH, eM, 0);
    
    return now >= startTime && now <= endTime;
  };

  return (
    <div className="min-h-screen bg-[#F0F9FA] pb-32">
      {/* Dynamic Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-cyan-700 text-white pt-10 pb-20 px-6 rounded-b-[3rem] shadow-2xl">
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl"></div>
        
        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-1">
            <p className="text-cyan-100 text-sm font-medium tracking-wide uppercase">Dashboard Guru</p>
            <h1 className="text-3xl font-bold tracking-tight">Halo, {user?.name?.split(' ')[0]}!</h1>
          </div>
          <button className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md border border-white/20 hover:bg-white/30 transition-all active:scale-90">
            <Bell size={22} />
          </button>
        </div>

        <div className="mt-8 relative z-10">
          <div className="bg-white/15 backdrop-blur-xl border border-white/20 p-4 rounded-3xl flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-xl">
                <Calendar size={20} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-cyan-100 font-medium">Hari ini</span>
                <span className="text-sm font-bold">
                  {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
            </div>
            <div className="h-10 w-[1px] bg-white/20"></div>
            <div className="flex items-center gap-3 pr-2">
              <Clock size={18} className="text-cyan-200" />
              <span className="text-sm font-bold tabular-nums">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary - Mini Bento */}
      <div className="px-6 -mt-10 grid grid-cols-2 gap-4 relative z-20">
        <div className="bg-white p-4 rounded-3xl shadow-lg border border-slate-50 flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-xl">
            <LayoutGrid size={20} className="text-orange-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Jadwal</p>
            <p className="text-lg font-bold text-slate-800">{schedules.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-lg border border-slate-50 flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-xl">
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Selesai</p>
            <p className="text-lg font-bold text-slate-800">
              {schedules.filter(s => s.Activities && s.Activities.length > 0).length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Jadwal Mengajar
          </h2>
          <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
            Aktif Sekarang
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium">Menyiapkan jadwal...</p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="bg-white p-10 rounded-[2.5rem] text-center shadow-xl shadow-cyan-900/5 border border-slate-50">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Libur Mengajar</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Nikmati waktu istirahat Anda, tidak ada jadwal mengajar untuk hari ini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((item, index) => {
              const active = isWithinTime(item.startTime, item.endTime);
              const hasAbsen = item.Activities && item.Activities.length > 0;

              return (
                <div 
                  key={item.id} 
                  className={`group relative overflow-hidden transition-all duration-500 cursor-pointer ${
                    active && !hasAbsen 
                      ? 'bg-white ring-2 ring-primary ring-offset-4' 
                      : 'bg-white shadow-sm hover:shadow-xl hover:-translate-y-1'
                  } rounded-[2rem] p-5 border border-slate-100`}
                >
                  {/* Status Indicator */}
                  {active && !hasAbsen && (
                    <div className="absolute top-0 right-0 p-3">
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-5">
                    {/* Time Badge */}
                    <div className={`flex flex-col items-center justify-center min-w-[70px] p-3 rounded-2xl ${
                      hasAbsen ? 'bg-green-50 text-green-600' : active ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'
                    } transition-colors duration-300`}>
                      <span className="text-xs font-black uppercase">{item.startTime.substring(0, 5)}</span>
                      <div className="w-4 h-[2px] bg-current opacity-30 my-1"></div>
                      <span className="text-xs font-black uppercase">{item.endTime.substring(0, 5)}</span>
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold text-lg leading-tight ${hasAbsen ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          {item.Lesson.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="text-primary/60" />
                          <span>{item.Class.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pl-2">
                      {hasAbsen ? (
                        <div className="bg-green-500 text-white p-2.5 rounded-2xl shadow-lg shadow-green-200">
                          <CheckCircle size={20} />
                        </div>
                      ) : active ? (
                        <button 
                          onClick={() => navigate(`/attendance/${item.id}`, { 
                            state: { 
                              scheduleInfo: { 
                                lesson: item.Lesson.name, 
                                class: item.Class.name 
                              } 
                            } 
                          })}
                          className="bg-primary hover:bg-cyan-700 text-white p-3 rounded-2xl shadow-lg shadow-primary/30 active:scale-90 transition-all flex items-center justify-center group-hover:scale-110"
                        >
                          <Camera size={20} />
                        </button>
                      ) : (
                        <div className="bg-slate-100 text-slate-400 p-2.5 rounded-2xl">
                          <Clock size={20} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-6 left-6 right-6 z-50">
        <div className="bg-white/80 backdrop-blur-2xl border border-white/40 p-3 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex justify-between items-center px-8">
          <div className="flex flex-col items-center gap-1 transition-all duration-300">
            <div className="bg-primary p-3 rounded-2xl text-white shadow-lg shadow-primary/40 -mt-8">
              <LayoutGrid size={24} />
            </div>
            <span className="text-[10px] font-bold text-primary">Beranda</span>
          </div>
          
          <div className="flex flex-col items-center gap-1 group cursor-pointer">
            <div className="p-3 rounded-2xl text-slate-400 group-hover:bg-slate-50 group-hover:text-slate-600 transition-all">
              <CheckCircle size={24} />
            </div>
            <span className="text-[10px] font-bold text-slate-400">Approval</span>
          </div>

          <div className="flex flex-col items-center gap-1 group cursor-pointer">
            <div className="p-3 rounded-2xl text-slate-400 group-hover:bg-slate-50 group-hover:text-slate-600 transition-all">
              <User size={24} />
            </div>
            <span className="text-[10px] font-bold text-slate-400">Profil</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuruHome;
