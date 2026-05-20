import React from 'react';
import { CalendarDays, Bell } from 'lucide-react';
import { useAcademicYears } from '../../master-data/academic-year/hooks/useAcademicYearData';
import { useAcademicYearStore } from '../../../shared/store/academicYearStore';
import { SelectField } from '../../../shared/components/SelectField';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle, icon, actions }) => {
  const { data: academicYears = [] } = useAcademicYears();
  const { selectedYearId, setSelectedYearId } = useAcademicYearStore();
  
  // Set default active year if nothing is selected or if selected ID is stale (after DB reset)
  React.useEffect(() => {
    if (academicYears.length > 0) {
      const exists = academicYears.some(y => y.id === selectedYearId);
      if (!selectedYearId || !exists) {
        const activeYear = academicYears.find(y => y.isActive) || academicYears[0];
        setSelectedYearId(activeYear.id);
      }
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
        {actions && <div className="flex gap-3 pr-6 border-r border-slate-100">{actions}</div>}
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-xl text-primary shrink-0">
            <CalendarDays size={20} />
          </div>
          <div className="flex flex-col min-w-[160px]">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5 ml-1">Periode Aktif</span>
            <SelectField
              variant="header"
              value={selectedYearId || ''}
              options={academicYears.map(y => ({ value: y.id, label: `${y.name}${y.isActive ? ' (Aktif)' : ''}` }))}
              onChange={(val) => setSelectedYearId(val)}
              placeholder="Pilih Tahun"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
          <button className="p-2.5 bg-white text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all border border-slate-100 shadow-sm relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
