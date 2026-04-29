import api from '../../../../shared/lib/axios';
import type { IKelas, IKelasPayload } from '../interfaces/kelas.interface';
import type { IPaginatedResponse } from '../../../admin/services/admin.service';

export const kelasService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<IPaginatedResponse<IKelas>> => {
    const response = await api.get<IPaginatedResponse<IKelas>>('/admin/classes', { params });
    return response.data;
  },

  create: async (data: IKelasPayload): Promise<IKelas> => {
    const response = await api.post<IKelas>('/admin/classes', data);
    return response.data;
  },

  update: async (id: number, data: IKelasPayload): Promise<IKelas> => {
    const response = await api.put<IKelas>(`/admin/classes/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/classes/${id}`);
  },
};
