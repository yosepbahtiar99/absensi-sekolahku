import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateRequest, useMyActivities } from '../hooks/useAttendanceData';
import { ArrowLeft, Send, AlertCircle, Calendar, Clock, Briefcase, UserCheck } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { useNotificationStore } from '../../../shared/store/notificationStore';

const CreateRequestPage = () => {
  const navigate = useNavigate();
  const [type, setType] = useState<'custom_pembelajaran' | 'koreksi' | 'perizinan' | 'lembur'>('perizinan');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotificationStore();
  const createMutation = useCreateRequest();

  // Form States
  const [absenceType, setAbsenceType] = useState('sakit');
  const [reason, setReason] = useState('');
  const [taskNote, setTaskNote] = useState('');
  const [absenceScope, setAbsenceScope] = useState('seharian');
  const [activityId, setActivityId] = useState('');
  const [requestedTime, setRequestedTime] = useState('');

  const { data: activitiesRes } = useMyActivities({ limit: 50 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: any = { type, data: {} };

    if (type === 'perizinan') {
      payload.data = { absenceType, reason, taskNote, absenceScope };
    } else if (type === 'koreksi') {
      if (!activityId) {
        showNotification('Pilih aktivitas yang ingin dikoreksi', 'error');
        setLoading(false);
        return;
      }
      payload.activityId = activityId;
      payload.data = { requestedTimestamp: requestedTime, reason };
    } else if (type === 'lembur') {
      payload.data = { reason };
    } else if (type === 'custom_pembelajaran') {
      payload.data = { reason, taskNote }; // Simplified for now
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        showNotification('Pengajuan berhasil dikirim!', 'success');
        navigate('/approvals');
      },
      onError: () => {
        showNotification('Gagal mengirim pengajuan', 'error');
        setLoading(false);
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold text-sm mb-8 group"
      >
        <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
          <ArrowLeft size={16} />
        </div>
        Kembali
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="p-10 border-b border-slate-50 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Buat Pengajuan Baru</h2>
          <p className="text-slate-500 font-medium mt-2">Pilih tipe pengajuan dan lengkapi datanya.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {/* Type Selection */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'perizinan', label: 'Izin/Sakit', icon: UserCheck },
              { id: 'koreksi', label: 'Koreksi', icon: Clock },
              { id: 'custom_pembelajaran', label: 'Custom', icon: Calendar },
              { id: 'lembur', label: 'Lembur', icon: Briefcase },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setType(item.id as any)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-3 ${
                  type === item.id 
                    ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5' 
                    : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                }`}
              >
                <item.icon size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Dynamic Fields */}
          <div className="space-y-6 pt-4 border-t border-slate-50">
            {type === 'perizinan' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tipe Izin</label>
                    <select 
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                      value={absenceType}
                      onChange={(e) => setAbsenceType(e.target.value)}
                    >
                      <option value="sakit">Sakit</option>
                      <option value="izin tidak hadir">Izin Tidak Hadir</option>
                      <option value="cuti">Cuti</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Cakupan</label>
                    <select 
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                      value={absenceScope}
                      onChange={(e) => setAbsenceScope(e.target.value)}
                    >
                      <option value="seharian">Seharian Penuh</option>
                      <option value="schedule">Hanya Jam Tertentu</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Catatan Tugas Untuk Siswa (Wajib)</label>
                  <textarea 
                    required
                    placeholder="Berikan instruksi tugas agar siswa tetap belajar..."
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px]"
                    value={taskNote}
                    onChange={(e) => setTaskNote(e.target.value)}
                  />
                </div>
              </>
            )}

            {type === 'koreksi' && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pilih Aktivitas Yang Ingin Dikoreksi</label>
                  <select 
                    required
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                    value={activityId}
                    onChange={(e) => setActivityId(e.target.value)}
                  >
                    <option value="">-- Pilih Absensi --</option>
                    {activitiesRes?.data?.map((act: any) => (
                      <option key={act.id} value={act.id}>
                        {new Date(act.timestamp).toLocaleDateString('id-ID')} - {act.Schedule?.Lesson?.name} ({act.status})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Waktu Yang Seharusnya</label>
                  <input 
                    type="datetime-local" 
                    required
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                    value={requestedTime}
                    onChange={(e) => setRequestedTime(e.target.value)}
                  />
                </div>
              </>
            )}

            {(type === 'perizinan' || type === 'koreksi' || type === 'lembur' || type === 'custom_pembelajaran') && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Alasan / Keterangan</label>
                <textarea 
                  required
                  placeholder="Berikan alasan yang jelas kepada admin..."
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px]"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="pt-6">
            <Button 
              type="submit" 
              className="w-full py-8 rounded-2xl shadow-xl shadow-primary/20 font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3"
              isLoading={loading}
            >
              <Send size={20} />
              Kirim Pengajuan
            </Button>
            <p className="text-center text-[11px] text-slate-400 font-bold mt-4 flex items-center justify-center gap-2">
              <AlertCircle size={14} />
              Pengajuan akan ditinjau oleh Admin terlebih dahulu.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequestPage;
