import { CheckCircle } from 'lucide-react';

const GuruApproval = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/10">
        <CheckCircle size={48} />
      </div>
      <h3 className="text-xl font-black text-slate-800 mb-2">Riwayat Approval</h3>
      <p className="text-slate-500 text-sm max-w-[250px] font-medium leading-relaxed">Fitur ini bakal nampilin riwayat absensi lu yang udah di-approve admin.</p>
      <div className="mt-10 bg-white px-8 py-4 rounded-3xl border-2 border-dashed border-slate-100 text-slate-300 font-black uppercase tracking-widest text-[10px]">
        Segera Hadir
      </div>
    </div>
  );
};

export default GuruApproval;
