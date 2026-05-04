import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';

interface DroppableGridCellProps {
  id: string; // e.g., "classId:slotId"
  children?: React.ReactNode;
  onAdd: () => void;
  isEmpty: boolean;
}

const DroppableGridCell: React.FC<DroppableGridCellProps> = ({ id, children, onAdd, isEmpty }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <td 
      ref={setNodeRef}
      className={`p-3 border-r border-b border-slate-100 group/cell relative transition-colors ${
        isOver ? 'bg-primary/5 ring-2 ring-primary/20 ring-inset' : ''
      }`}
    >
      {children}
      {isEmpty && (
        <div 
          className="h-24 border-2 border-dashed border-slate-50 rounded-[1.5rem] flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-all cursor-pointer hover:bg-primary/5 hover:border-primary/20"
          onClick={onAdd}
        >
          <Plus size={20} className="text-primary/40" />
        </div>
      )}
    </td>
  );
};

export default DroppableGridCell;
