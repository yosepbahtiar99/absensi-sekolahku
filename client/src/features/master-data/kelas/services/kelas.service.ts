import api from '../../../../shared/lib/axios';
import type { IKelas, IKelasPayload } from '../interfaces/kelas.interface';

export const kelasService = {
  getAll: async (): Promise<IKelas[]> => {
    const response = await api.get<IKelas[]>('/admin/classes');
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
