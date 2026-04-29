import api from '../../../shared/lib/axios';
import type { ISchedule } from '../interfaces/attendance.interface';

export const attendanceService = {
  getTodaySchedules: async (): Promise<ISchedule[]> => {
    const response = await api.get<ISchedule[]>('/teacher/schedule');
    return response.data;
  },

  submitAttendance: async (payload: FormData): Promise<any> => {
    const response = await api.post('/teacher/attendance', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getScheduleById: async (id: string): Promise<ISchedule> => {
    const response = await api.get<ISchedule>(`/teacher/schedule/${id}`);
    return response.data;
  },
};
