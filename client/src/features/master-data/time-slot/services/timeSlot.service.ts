import api from '../../../../shared/lib/axios';
import type { ITimeSlot } from '../../../admin/interfaces/admin.interface';

export const timeSlotService = {
  getAll: async (params?: { academicYearId?: string, day?: string }): Promise<ITimeSlot[]> => {
    const response = await api.get<ITimeSlot[]>('/admin/time-slots', { params });
    return response.data;
  },
  create: async (data: Omit<ITimeSlot, 'id'>): Promise<ITimeSlot> => {
    const response = await api.post<ITimeSlot>('/admin/time-slots', data);
    return response.data;
  },
  update: async (id: string, data: Partial<ITimeSlot>): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>(`/admin/time-slots/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/admin/time-slots/${id}`);
    return response.data;
  }
};
