import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, CheckCircle, Camera, ArrowRight } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import type { ISchedule } from '../interfaces/attendance.interface';

interface ScheduleCardProps {
  schedule: ISchedule;
  isCurrent: boolean;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ schedule, isCurrent }) => {
  const navigate = useNavigate();

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden p-6 transition-all duration-500",
        isCurrent ? "border-primary/30 shadow-xl shadow-primary/5 ring-1 ring-primary/10" : "hover:border-slate-200"
      )}
    >
      {isCurrent && (
        <div className="absolute top-0 left-0 w-1 h-full bg-primary animate-pulse"></div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              {schedule.Class.name}
            </span>
            {isCurrent && (
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md animate-pulse">
                <div className="w-1 h-1 rounded-full bg-emerald-600"></div>
                Aktif Sekarang
              </span>
            )}
          </div>
          <h3 className="text-xl font-black text-slate-800 group-hover:text-primary transition-colors">
            {schedule.Lesson.name}
          </h3>
        </div>
        <div className="bg-slate-50 p-3 rounded-2xl group-hover:bg-primary/5 transition-colors">
          <Clock size={20} className="text-slate-400 group-hover:text-primary transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mulai</p>
          <p className="text-sm font-black text-slate-700 tabular-nums">{schedule.startTime}</p>
        </div>
        <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Selesai</p>
          <p className="text-sm font-black text-slate-700 tabular-nums">{schedule.endTime}</p>
        </div>
      </div>

      {schedule.Attendance ? (
        <div className="flex items-center justify-between bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-xl">
              <CheckCircle size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Status</p>
              <p className="text-sm font-bold text-emerald-700">Sudah Absensi</p>
            </div>
          </div>
          <p className="text-[10px] font-black text-emerald-400 tabular-nums">
            {new Date(schedule.Attendance.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      ) : (
        <Button 
          onClick={() => navigate(`/attendance/${schedule.id}`)}
          className="w-full"
          variant={isCurrent ? "default" : "secondary"}
        >
          <Camera size={18} className="mr-2" />
          <span>Lakukan Absensi</span>
          <ArrowRight size={16} className="ml-auto opacity-50 group-hover:translate-x-1 transition-transform" />
        </Button>
      )}
    </Card>
  );
};

export default ScheduleCard;
