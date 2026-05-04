import React, { useState } from 'react';
import { X, Copy, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '../../../../shared/components/Button';
import { SelectField } from '../../../../shared/components/SelectField';

interface CloneScheduleModalProps {
  academicYears: any[];
  currentYearId: string;
  onClone: (fromYearId: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const CloneScheduleModal: React.FC<CloneScheduleModalProps> = ({ 
  academicYears, currentYearId, onClone, onClose, isLoading 
}) => {
  const [fromYearId, setFromYearId] = useState('');

  const sourceYears = academicYears.filter(y => y.id !== currentYearId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md min-h-[450px] rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 relative">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-primary text-white rounded-t-[2.5rem]">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">Clone Jadwal</h3>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">Copy jadwal dari periode sebelumnya</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-4">
            <AlertTriangle className="text-amber-500 shrink-0" size={20} />
            <p className="text-[11px] font-bold text-amber-700 leading-relaxed uppercase tracking-tight">
              PERHATIAN: Proses ini akan meng-copy semua jadwal dari tahun asal ke tahun ajaran yang sedang aktif.
            </p>
          </div>

          <SelectField
            label="Tahun Ajaran Asal (Source)"
            placeholder="-- Pilih Tahun Ajaran Asal --"
            value={fromYearId}
            options={sourceYears.map(y => ({ value: y.id, label: y.name }))}
            onChange={(val) => setFromYearId(val)}
          />

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Batal</Button>
            <Button 
              className="flex-[2] rounded-xl shadow-lg shadow-primary/20" 
              disabled={!fromYearId || isLoading}
              onClick={() => onClone(fromYearId)}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <><Copy size={18} className="mr-2" /> Mulai Clone</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloneScheduleModal;
