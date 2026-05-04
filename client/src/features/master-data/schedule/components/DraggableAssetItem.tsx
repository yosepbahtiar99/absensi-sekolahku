import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { User, BookOpen } from 'lucide-react';

interface DraggableAssetItemProps {
  id: string;
  type: 'guru' | 'lesson';
  name: string;
  badge?: string;
  isFulfilled?: boolean;
}

const DraggableAssetItem: React.FC<DraggableAssetItemProps> = ({ id, type, name, badge, isFulfilled }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: isFulfilled && type === 'lesson' // Opsional: matikan drag kalau sudah penuh
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : (isFulfilled ? 0.6 : 1),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 bg-white border border-slate-100 rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/30 hover:shadow-md transition-all flex flex-col gap-2 group ${
        isDragging ? 'z-50 ring-2 ring-primary border-primary' : ''
      } ${isFulfilled ? 'bg-slate-50 grayscale-[0.5]' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg transition-colors ${
          type === 'guru' ? 'bg-blue-50 text-blue-500 group-hover:bg-blue-100' : 'bg-amber-50 text-amber-500 group-hover:bg-amber-100'
        } ${isFulfilled ? 'bg-emerald-50 text-emerald-500' : ''}`}>
          {type === 'guru' ? <User size={14} /> : <BookOpen size={14} />}
        </div>
        <span className="text-xs font-bold text-slate-600 truncate flex-1">{name}</span>
      </div>
      
      {badge && (
        <div className="flex justify-end">
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
            isFulfilled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
          }`}>
            {badge}
          </span>
        </div>
      )}
    </div>
  );
};

export default DraggableAssetItem;
