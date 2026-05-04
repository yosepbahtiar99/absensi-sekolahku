import api from '../../../../shared/lib/axios';
import type { ISchedule, ISchedulePayload } from '../interfaces/schedule.interface';

export const scheduleService = {
  getAll: async (academicYearId?: string): Promise<ISchedule[]> => {
    const response = await api.get<ISchedule[]>('/admin/schedules', { params: { academicYearId } });
    return response.data;
  },

  createOrUpdate: async (data: ISchedulePayload): Promise<ISchedule> => {
    const response = await api.post<ISchedule>('/admin/schedules', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/schedules/${id}`);
  },
};
