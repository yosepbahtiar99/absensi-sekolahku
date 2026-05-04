import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AcademicYearState {
  selectedYearId: string | null;
  setSelectedYearId: (id: string | null) => void;
}

export const useAcademicYearStore = create<AcademicYearState>()(
  persist(
    (set) => ({
      selectedYearId: null,
      setSelectedYearId: (id) => set({ selectedYearId: id }),
    }),
    {
      name: 'academic-year-storage',
    }
  )
);
