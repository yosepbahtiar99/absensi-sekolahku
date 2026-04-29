import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Calendar, Clock, MapPin, CheckCircle, Camera } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 rounded-b-3xl shadow-lg">
        <p className="text-blue-100 text-sm">Selamat Datang,</p>
        <h1 className="text-2xl font-bold">{user?.name}</h1>
        <div className="mt-4 bg-blue-500 bg-opacity-30 p-3 rounded-xl flex items-center gap-3">
          <Calendar size={20} />
          <span className="text-sm font-medium">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mt-2">
          <Clock size={20} className="text-blue-600" />
          Jadwal Anda Hari Ini
        </h2>

        {loading ? (
          <div className="text-center py-10 text-slate-500">Memuat jadwal...</div>
        ) : schedules.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-slate-100">
            <p className="text-slate-500">Tidak ada jadwal mengajar hari ini.</p>
          </div>
        ) : (
          schedules.map((item, index) => {
            const active = isWithinTime(item.startTime, item.endTime);
            const hasAbsen = item.Activities && item.Activities.length > 0;

            return (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative overflow-hidden">
                {active && !hasAbsen && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                )}
                
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
                      <span>{item.startTime.substring(0, 5)} - {item.endTime.substring(0, 5)}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">{item.Lesson.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <MapPin size={14} />
                      <span>{item.Class.name}</span>
                    </div>
                  </div>

                  {hasAbsen ? (
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <CheckCircle size={14} />
                      Selesai
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
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md active:scale-95 transition-transform flex items-center gap-2"
                    >
                      <Camera size={16} />
                      Absen
                    </button>
                  ) : (
                    <div className="text-xs text-slate-400 font-medium italic">Belum waktunya</div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Nav Placeholder */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-3 flex justify-around items-center">
        <div className="text-blue-600 flex flex-col items-center">
          <Clock size={24} />
          <span className="text-[10px] font-bold mt-1">Jadwal</span>
        </div>
        <div className="text-slate-400 flex flex-col items-center">
          <CheckCircle size={24} />
          <span className="text-[10px] font-bold mt-1">Approval</span>
        </div>
      </div>
    </div>
  );
};

export default GuruHome;
