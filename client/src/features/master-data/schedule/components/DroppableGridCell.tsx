import React from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2 } from 'lucide-react';

interface DroppableGridCellProps {
  id: string; 
  schedule?: any;
  onDelete: (id: string) => void;
  onClick?: () => void;
  isLocked?: boolean;
}

const DroppableGridCell: React.FC<DroppableGridCellProps> = ({ id, schedule, onDelete, onClick, isLocked = false }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
    disabled: isLocked
  });

  return (
    <td 
      ref={setNodeRef}
      onClick={!isLocked ? onClick : undefined}
      className={`p-4 border-r border-b border-slate-100 group/cell relative transition-all min-w-[200px] h-32 ${
        isLocked ? 'cursor-default' : 'cursor-pointer'
      } ${isOver && !isLocked ? 'bg-primary/5 ring-2 ring-primary/20 ring-inset' : ''}`}
    >
      {schedule ? (
        <DraggableScheduleItem 
          schedule={schedule} 
          onDelete={onDelete} 
          isLocked={isLocked}
        />
      ) : (
        <div className={`h-full border-2 border-dashed rounded-3xl flex items-center justify-center transition-all ${
          isOver && !isLocked 
            ? 'border-primary/40 bg-primary/5' 
            : `border-slate-50 ${!isLocked ? 'group-hover/cell:border-slate-200' : ''}`
        }`}>
          {!isLocked && (
            <Plus size={20} className={`transition-all ${isOver ? 'text-primary scale-125' : 'text-slate-100 group-hover/cell:text-slate-300'}`} />
          )}
        </div>
      )}
    </td>
  );
};

// Sub-component for rendering a draggable schedule card inside the cell
interface DraggableScheduleItemProps {
  schedule: any;
  onDelete: (id: string) => void;
  isLocked: boolean;
}

const DraggableScheduleItem: React.FC<DraggableScheduleItemProps> = ({ schedule, onDelete, isLocked }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `schedule:${schedule.id}`,
    disabled: isLocked
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group/item relative select-none transition-shadow ${
        isLocked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing hover:border-primary/30 hover:shadow-md'
      } ${isDragging ? 'z-50 ring-2 ring-primary border-primary' : ''}`}
    >
      <div className="flex justify-between items-start gap-2">
        <div {...(isLocked ? {} : listeners)} {...(isLocked ? {} : attributes)} className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 truncate">{schedule.Lesson?.name}</p>
          <p className="text-xs font-bold text-slate-700 truncate">{schedule.teacher?.name}</p>
        </div>
        {!isLocked && (
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(schedule.id); }}
            className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-slate-50 opacity-0 group-hover/item:opacity-100 transition-all shrink-0 active:scale-90"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

export default DroppableGridCell;
