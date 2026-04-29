import api from '../../../../shared/lib/axios';
import type { IGuru, IGuruPayload } from '../interfaces/guru.interface';
import type { IPaginatedResponse } from '../../../admin/services/admin.service';

export const guruService = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<IPaginatedResponse<IGuru>> => {
    const response = await api.get<IPaginatedResponse<IGuru>>('/admin/gurus', { params });
    return response.data;
  },

  create: async (data: IGuruPayload): Promise<IGuru> => {
    const response = await api.post<IGuru>('/admin/gurus', data);
    return response.data;
  },

  update: async (id: number, data: IGuruPayload): Promise<IGuru> => {
    const response = await api.put<IGuru>(`/admin/gurus/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/gurus/${id}`);
  },
};
