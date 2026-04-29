import api from '../../../../shared/lib/axios';
import type { IPelajaran, IPelajaranPayload } from '../interfaces/lesson.interface';

export const lessonService = {
  getAll: async (): Promise<IPelajaran[]> => {
    const response = await api.get<IPelajaran[]>('/admin/lessons');
    return response.data;
  },

  create: async (data: IPelajaranPayload): Promise<IPelajaran> => {
    const response = await api.post<IPelajaran>('/admin/lessons', data);
    return response.data;
  },

  update: async (id: number, data: IPelajaranPayload): Promise<IPelajaran> => {
    const response = await api.put<IPelajaran>(`/admin/lessons/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/lessons/${id}`);
  },
};
