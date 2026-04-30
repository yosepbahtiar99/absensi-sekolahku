import api from '../../../../shared/lib/axios';
import type { ILesson, IPelajaranPayload } from '../interfaces/lesson.interface';
import type { IPaginatedResponse } from '../../../admin/services/admin.service';

export const lessonService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<IPaginatedResponse<ILesson>> => {
    const response = await api.get<IPaginatedResponse<ILesson>>('/admin/lessons', { params });
    return response.data;
  },

  create: async (data: IPelajaranPayload): Promise<ILesson> => {
    const response = await api.post<ILesson>('/admin/lessons', data);
    return response.data;
  },

  update: async (id: string, data: IPelajaranPayload): Promise<ILesson> => {
    const response = await api.put<ILesson>(`/admin/lessons/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/lessons/${id}`);
  },
};
