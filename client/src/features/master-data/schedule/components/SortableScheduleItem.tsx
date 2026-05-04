import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, User, GraduationCap, Edit2 } from 'lucide-react';
import { Card } from '../../../../shared/components/Card';
import type { ISchedule } from '../interfaces/schedule.interface';

interface SortableScheduleItemProps {
  schedule: ISchedule;
  onDelete: (id: string) => void;
  onEdit: (schedule: ISchedule) => void;
  isConflict?: boolean;
}

const SortableScheduleItem: React.FC<SortableScheduleItemProps> = ({ schedule, onDelete, onEdit, isConflict }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: schedule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-4 touch-none">
      <Card 
        className={`group relative p-4 border-2 transition-all duration-300 ${
          isConflict 
            ? 'border-red-200 bg-red-50/30 shadow-lg shadow-red-100' 
            : 'border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5'
        }`}
      >
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <div className="flex justify-between items-start mb-3">
            <div className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${isConflict ? 'bg-red-500 text-white animate-pulse' : 'bg-primary/10 text-primary'}`}>
              {isConflict ? '⚠ BENTROK GURU' : (schedule.TimeSlot ? `${schedule.TimeSlot.startTime.substring(0, 5)} — ${schedule.TimeSlot.endTime.substring(0, 5)}` : `${schedule.startTime?.substring(0, 5)} — ${schedule.endTime?.substring(0, 5)}`)}
            </div>
            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(schedule); }} 
                className="p-1.5 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                <Edit2 size={14} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(schedule.id); }} 
                className="p-1.5 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          
          <h4 className="font-black text-slate-800 text-sm mb-3 group-hover:text-primary transition-colors leading-tight">
            {schedule.Lesson?.name || 'No Lesson'}
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
              <div className="bg-slate-50 p-1.5 rounded-md group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                <User size={12} />
              </div>
              <span className="truncate">{schedule.teacher?.name}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
              <div className="bg-slate-50 p-1.5 rounded-md group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                <GraduationCap size={12} />
              </div>
              <span>{schedule.Class?.name || 'No Class'}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SortableScheduleItem;
