import api from '../../../../shared/lib/axios';
import type { IAcademicYear } from '../../../admin/interfaces/admin.interface';

export const academicYearService = {
  getAll: async (): Promise<IAcademicYear[]> => {
    const response = await api.get<IAcademicYear[]>('/admin/academic-years');
    return response.data;
  },
  create: async (data: Omit<IAcademicYear, 'id'>): Promise<IAcademicYear> => {
    const response = await api.post<IAcademicYear>('/admin/academic-years', data);
    return response.data;
  },
  update: async (id: string, data: Partial<IAcademicYear>): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>(`/admin/academic-years/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/admin/academic-years/${id}`);
    return response.data;
  },
  toggleLock: async (id: string): Promise<{ message: string; isLocked: boolean }> => {
    const response = await api.put<{ message: string; isLocked: boolean }>(`/admin/academic-years/${id}/toggle-lock`);
    return response.data;
  }
};
