import api from '../../../../shared/lib/axios';
import type { IGradeLevel, IGradeLevelPayload } from '../interfaces/grade-level.interface';

export const gradeLevelService = {
  getAll: async (): Promise<IGradeLevel[]> => {
    const response = await api.get<IGradeLevel[]>('/admin/grade-levels');
    return response.data;
  },

  create: async (data: IGradeLevelPayload): Promise<IGradeLevel> => {
    const response = await api.post<IGradeLevel>('/admin/grade-levels', data);
    return response.data;
  },

  update: async (id: string, data: Partial<IGradeLevelPayload>): Promise<void> => {
    await api.put(`/admin/grade-levels/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/grade-levels/${id}`);
  }
};
