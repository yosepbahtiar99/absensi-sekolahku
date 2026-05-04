import React from 'react';
import { CalendarDays, Bell, User as UserIcon } from 'lucide-react';
import { useAcademicYears } from '../../master-data/academic-year/hooks/useAcademicYearData';
import { useAcademicYearStore } from '../../../shared/store/academicYearStore';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle, icon }) => {
  const { data: academicYears = [] } = useAcademicYears();
  const { selectedYearId, setSelectedYearId } = useAcademicYearStore();
  
  // Set default active year if nothing is selected
  React.useEffect(() => {
    if (!selectedYearId && academicYears.length > 0) {
      const activeYear = academicYears.find(y => y.isActive) || academicYears[0];
      setSelectedYearId(activeYear.id);
    }
  }, [academicYears, selectedYearId, setSelectedYearId]);

  return (
    <header className="p-8 pb-4 flex justify-between items-center border-b border-slate-100 bg-white/50 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {icon && <div className="text-primary">{icon}</div>}
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
          {subtitle && <p className="text-slate-500 font-medium text-xs">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Global Academic Year Selector */}
        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-primary/30">
          <CalendarDays size={18} className="text-primary" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Periode Aktif</span>
            <select 
              value={selectedYearId || ''} 
              onChange={(e) => setSelectedYearId(e.target.value)}
              className="bg-transparent border-none text-xs font-black uppercase tracking-wider text-slate-800 outline-none p-0 h-auto cursor-pointer"
            >
              <option value="" disabled>Pilih Tahun Ajaran</option>
              {academicYears.map(y => (
                <option key={y.id} value={y.id}>{y.name} {y.isActive ? '(Aktif)' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
          <button className="p-2.5 bg-white text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all border border-slate-100 shadow-sm relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="flex items-center gap-3 p-1.5 pr-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <UserIcon size={20} />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-[11px] font-black text-slate-800 uppercase leading-none">Admin Sekolah</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Super Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
