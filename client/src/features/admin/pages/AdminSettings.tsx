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
  Info,
  ChevronDown,
  ChevronUp,
  Briefcase
} from 'lucide-react';

const AdminSettings: React.FC = () => {
  const { data: settings, isLoading, isError } = useSystemSettings();
  const updateSettingsMutation = useUpdateSystemSettings();

  const [selectedFlow, setSelectedFlow] = useState<'disabled' | 'strict' | 'block' | 'full_day'>('disabled');
  const [lateTolerance, setLateTolerance] = useState<number>(15);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Accordion toggle states
  const [isFlowOpen, setIsFlowOpen] = useState(false);
  const [isToleranceOpen, setIsToleranceOpen] = useState(false);

  // Sync state with query data when loaded
  useEffect(() => {
    if (settings) {
      if (settings.attendance_flow) {
        setSelectedFlow(settings.attendance_flow);
      }
      if (settings.late_tolerance !== undefined) {
        setLateTolerance(settings.late_tolerance);
      }
    }
  }, [settings]);

  const handleSave = () => {
    setSuccessMessage(null);
    updateSettingsMutation.mutate(
      { 
        attendance_flow: selectedFlow,
        late_tolerance: lateTolerance
      },
      {
        onSuccess: () => {
          setSuccessMessage('Pengaturan sistem berhasil disimpan!');
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
    },
    {
      id: 'full_day',
      title: 'Corporate / Full Day',
      badge: 'Gaya Kantoran',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Guru absen 1 kali saat datang. Semua jadwal ke depannya hari itu otomatis hadir. Jadwal yang terlewat sebelum jam absen tidak akan ikut hadir.',
      details: 'Kepulangan (Clock Out) di-approve sentral oleh Admin melalui tab Approval Kehadiran.',
      icon: Briefcase,
      iconBg: 'bg-blue-50 text-blue-600',
      iconSelectedBg: 'bg-blue-100 text-blue-700'
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
                  <h2 className="text-xl font-bold text-slate-800">Konfigurasi Absensi</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Kelola alur kehadiran dan batas keterlambatan sekolah</p>
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

              {/* ACCORDION 1: TOLERANSI KETERLAMBATAN */}
              <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all">
                {/* Accordion Header */}
                <div 
                  onClick={() => setIsToleranceOpen(!isToleranceOpen)}
                  className="p-8 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors select-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Toleransi Keterlambatan</h3>
                      <p className="text-slate-400 text-xs mt-0.5">Atur durasi toleransi keterlambatan check-in guru.</p>
                    </div>
                  </div>
                  <div className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                    {isToleranceOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>

                {/* Accordion Content Wrapper */}
                <div className={`grid transition-all duration-300 ease-in-out ${isToleranceOpen ? 'grid-rows-[1fr] opacity-100 border-t border-slate-100 p-8 pt-6' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
                  <div className="overflow-hidden space-y-6 pt-2">
                    <div className="flex items-center gap-4 max-w-xs">
                      <button
                        type="button"
                        onClick={() => setLateTolerance(prev => Math.max(0, prev - 1))}
                        className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all text-slate-600 font-bold text-lg select-none"
                      >
                        -
                      </button>
                      
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min={0}
                          max={120}
                          value={lateTolerance}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setLateTolerance(isNaN(val) ? 0 : Math.min(120, Math.max(0, val)));
                          }}
                          className="h-12 w-full text-center font-bold text-slate-800 border border-slate-200 rounded-xl focus:border-cyan-600 focus:ring-4 focus:ring-cyan-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none select-none">
                          Menit
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setLateTolerance(prev => Math.min(120, prev + 1))}
                        className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all text-slate-600 font-bold text-lg select-none"
                      >
                        +
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      * Batas waktu keterlambatan dihitung dari waktu KBM jam pelajaran dimulai. Nilai toleransi dapat diatur antara 0 s.d 120 menit. Jika diset 0, maka keterlambatan sekecil apapun akan langsung dicatat sebagai status "Telat".
                    </p>
                  </div>
                </div>
              </div>

              {/* ACCORDION 2: ALIRAN ABSENSI GURU */}
              <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all">
                {/* Accordion Header */}
                <div 
                  onClick={() => setIsFlowOpen(!isFlowOpen)}
                  className="p-8 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors select-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl">
                      <Layers className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Aliran Absensi Guru (Auto-Inherit)</h3>
                      <p className="text-slate-400 text-xs mt-0.5">Atur apakah guru otomatis diabsenkan untuk jam pelajaran berurutan.</p>
                    </div>
                  </div>
                  <div className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                    {isFlowOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>

                {/* Accordion Content Wrapper */}
                <div className={`grid transition-all duration-300 ease-in-out ${isFlowOpen ? 'grid-rows-[1fr] opacity-100 border-t border-slate-100 p-8 pt-6' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
                  <div className="overflow-hidden space-y-8">
                    {/* Main Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pt-2">
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
                            <div className="absolute top-6 right-6 flex items-center justify-center h-6 w-6 rounded-full border border-slate-200">
                              {isSelected && (
                                <div className="h-3 w-3 rounded-full bg-cyan-600" />
                              )}
                            </div>

                            <div>
                              <div className={`p-3.5 rounded-2xl w-fit ${isSelected ? opt.iconSelectedBg : opt.iconBg}`}>
                                <Icon className="h-6 w-6" />
                              </div>

                              <div className="mt-6 space-y-1">
                                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${opt.badgeColor}`}>
                                  {opt.badge}
                                </span>
                                <h3 className="text-lg font-bold text-slate-800">{opt.title}</h3>
                              </div>

                              <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                                {opt.description}
                              </p>
                            </div>

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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-2">
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
                          <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                            <span className="font-bold text-slate-700 block mb-1">Jika memilih Corporate / Full Day:</span>
                            Pak Budi cukup absen 1 kali hari itu. Semua jadwal ke depan di hari tersebut lintas kelas & mapel akan otomatis hadir. Jika Pak Budi baru absen di Jam ke-3, maka Jam ke-2 tetap merah (bolong/alpa). Jam pulang di-approve Admin.
                          </div>
                        </div>
                      </div>
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
