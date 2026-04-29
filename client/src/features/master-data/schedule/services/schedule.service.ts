import api from '../../../../shared/lib/axios';
import type { ISchedule, ISchedulePayload } from '../interfaces/schedule.interface';

export const scheduleService = {
  getAll: async (): Promise<ISchedule[]> => {
    const response = await api.get<ISchedule[]>('/admin/schedules');
    return response.data;
  },

  createOrUpdate: async (data: ISchedulePayload): Promise<ISchedule> => {
    const response = await api.post<ISchedule>('/admin/schedules', data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/schedules/${id}`);
  },
};
