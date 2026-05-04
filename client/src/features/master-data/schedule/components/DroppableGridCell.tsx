import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus, Trash2 } from 'lucide-react';

interface DroppableGridCellProps {
  id: string; 
  schedule?: any;
  onDelete: (id: string) => void;
  onClick?: () => void;
}

const DroppableGridCell: React.FC<DroppableGridCellProps> = ({ id, schedule, onDelete, onClick }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <td 
      ref={setNodeRef}
      onClick={onClick}
      className={`p-4 border-r border-b border-slate-100 group/cell relative transition-all min-w-[200px] h-32 cursor-pointer ${
        isOver ? 'bg-primary/5 ring-2 ring-primary/20 ring-inset' : ''
      }`}
    >
      {schedule ? (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group/item relative animate-in fade-in zoom-in duration-300">
          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{schedule.Lesson?.name}</p>
          <p className="text-xs font-bold text-slate-700 truncate">{schedule.teacher?.name}</p>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(schedule.id); }}
            className="absolute -top-2 -right-2 p-1.5 bg-white text-slate-300 hover:text-red-500 rounded-lg shadow-md border border-slate-50 opacity-0 group-hover/item:opacity-100 transition-all"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ) : (
        <div className={`h-full border-2 border-dashed rounded-3xl flex items-center justify-center transition-all ${
          isOver ? 'border-primary/40 bg-primary/5' : 'border-slate-50 group-hover/cell:border-slate-200'
        }`}>
          <Plus size={20} className={`transition-all ${isOver ? 'text-primary scale-125' : 'text-slate-100 group-hover/cell:text-slate-300'}`} />
        </div>
      )}
    </td>
  );
};

export default DroppableGridCell;
