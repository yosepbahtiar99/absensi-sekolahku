import React, { useState, useEffect } from 'react';
import { useSystemSettings, useUpdateSystemSettings } from '../hooks/useAdminData';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { 
  Settings, 
  Check, 
  Loader2, 
  ShieldAlert, 
  Clock, 
  Layers, 
  Grid, 
  Save, 
  Info 
} from 'lucide-react';

const AdminSettings: React.FC = () => {
  const { data: settings, isLoading, isError } = useSystemSettings();
  const updateSettingsMutation = useUpdateSystemSettings();

  const [selectedFlow, setSelectedFlow] = useState<'disabled' | 'strict' | 'block'>('disabled');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync state with query data when loaded
  useEffect(() => {
    if (settings && settings.attendance_flow) {
      setSelectedFlow(settings.attendance_flow);
    }
  }, [settings]);

  const handleSave = () => {
    setSuccessMessage(null);
    updateSettingsMutation.mutate(
      { attendance_flow: selectedFlow },
      {
        onSuccess: () => {
          setSuccessMessage('Pengaturan aliran absensi berhasil disimpan!');
          setTimeout(() => setSuccessMessage(null), 4000);
        }
      }
    );
  };

  const options = [
    {
      id: 'disabled',
      title: 'Absen Mandiri (Bawaan)',
      badge: 'Disiplin Tinggi',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Setiap guru harus melakukan scan absensi secara manual (upload foto selfie dan kelas) untuk setiap jam pelajaran masing-masing.',
      icon: Grid,
      iconBg: 'bg-slate-100 text-slate-600',
      iconSelectedBg: 'bg-slate-200 text-slate-800'
    },
    {
      id: 'strict',
      title: 'Warisan Berurutan (Strict)',
      badge: 'Sangat Direkomendasikan',
      badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      description: 'Absensi pertama otomatis mewariskan status absen ke jam pelajaran lanjutan berikutnya di kelas & mapel yang sama jika berurutan langsung.',
      details: 'Warisan akan terputus jika terhalang jam istirahat atau jam kosong. Guru harus absen lagi setelah jeda selesai.',
      icon: Clock,
      iconBg: 'bg-cyan-50 text-cyan-600',
      iconSelectedBg: 'bg-cyan-100 text-cyan-700'
    },
    {
      id: 'block',
      title: 'Warisan Satu Harian (Block)',
      badge: 'Paling Praktis',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      description: 'Guru hanya perlu absen 1 kali di pagi hari. Seluruh jam pelajaran yang sama untuk kelas & mapel tersebut hari itu otomatis terisi hadir.',
      details: 'Pengisian otomatis tetap berjalan meskipun terpotong oleh jam istirahat atau jeda KBM lainnya.',
      icon: Layers,
      iconBg: 'bg-purple-50 text-purple-600',
      iconSelectedBg: 'bg-purple-100 text-purple-700'
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <AdminSidebar />
      
      <main className="flex-1 overflow-hidden flex flex-col">
        <AdminHeader 
          title="Pengaturan Sistem" 
          subtitle="Atur cara absensi otomatis untuk mata pelajaran berurutan demi efisiensi dan kenyamanan guru mengajar."
          icon={<Settings size={28} />}
        />

        <div className="flex-1 p-8 overflow-y-auto">
          {isLoading ? (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Memuat Pengaturan...</p>
            </div>
          ) : isError ? (
            <div className="flex h-[60vh] flex-col items-center justify-center text-center p-4">
              <ShieldAlert className="h-12 w-12 text-red-500 mb-2" />
              <h3 className="text-lg font-bold text-slate-800">Gagal Memuat Pengaturan</h3>
              <p className="text-slate-600 mt-1">Terjadi kesalahan saat berkomunikasi dengan server.</p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* Top Bar with Save Button */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Aliran Absensi Guru</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Pilih model otomatisasi pengisian absensi</p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={updateSettingsMutation.isPending}
                  className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all text-sm shrink-0"
                >
                  {updateSettingsMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Simpan Perubahan
                </button>
              </div>

              {/* Alerts */}
              {successMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-sm animate-fade-in shadow-sm">
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="font-medium">{successMessage}</span>
                </div>
              )}

              {/* Main Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {options.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedFlow === opt.id;
                  
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedFlow(opt.id as any)}
                      className={`relative flex flex-col justify-between border-2 rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:shadow-md ${
                        isSelected 
                          ? 'border-cyan-600 bg-white ring-4 ring-cyan-50' 
                          : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      {/* Radio Indicator */}
                      <div className="absolute top-6 right-6 flex items-center justify-center h-6 w-6 rounded-full border border-slate-200">
                        {isSelected && (
                          <div className="h-3 w-3 rounded-full bg-cyan-600" />
                        )}
                      </div>

                      <div>
                        {/* Icon Container */}
                        <div className={`p-3.5 rounded-2xl w-fit ${isSelected ? opt.iconSelectedBg : opt.iconBg}`}>
                          <Icon className="h-6 w-6" />
                        </div>

                        {/* Title and Badge */}
                        <div className="mt-6 space-y-1">
                          <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${opt.badgeColor}`}>
                            {opt.badge}
                          </span>
                          <h3 className="text-lg font-bold text-slate-800">{opt.title}</h3>
                        </div>

                        {/* Description */}
                        <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                          {opt.description}
                        </p>
                      </div>

                      {/* Extra details (optional) */}
                      {opt.details && (
                        <div className="mt-5 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-2 text-xs text-slate-500 leading-normal">
                          <Info className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                          <span>{opt.details}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Recommendation Panel */}
              <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Info className="h-4 w-4 text-cyan-600" />
                  Penjelasan Teknis & Contoh Kasus KBM
                </h4>
                <div className="mt-4 text-xs text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    Misalkan <strong>Pak Budi</strong> mengajar mata pelajaran <strong>Matematika</strong> di kelas <strong>X-A</strong> pada jadwal berikut:
                  </p>
                  <ul className="list-disc list-inside pl-2 space-y-1 font-mono text-slate-700">
                    <li>Jam ke-2 (08:00 - 08:45)</li>
                    <li>Jam ke-3 (08:45 - 09:30)</li>
                    <li>Jam ke-4 (09:30 - 10:15) -- ISTIRAHAT</li>
                    <li>Jam ke-5 (10:15 - 11:00)</li>
                  </ul>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                      <span className="font-bold text-slate-700 block mb-1">Jika memilih Bawaan:</span>
                      Pak Budi harus absen 3x secara mandiri, yaitu pada Jam ke-2, Jam ke-3, dan Jam ke-5.
                    </div>
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                      <span className="font-bold text-slate-700 block mb-1">Jika memilih Strict:</span>
                      Pak Budi absen pada Jam ke-2. Sistem otomatis mengabsenkan Jam ke-3. Pak Budi harus absen lagi secara manual pada Jam ke-5 (setelah istirahat selesai).
                    </div>
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                      <span className="font-bold text-slate-700 block mb-1">Jika memilih Block:</span>
                      Pak Budi cukup absen pada Jam ke-2. Sistem langsung mengabsenkan Jam ke-3 dan Jam ke-5 sekaligus secara otomatis.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
