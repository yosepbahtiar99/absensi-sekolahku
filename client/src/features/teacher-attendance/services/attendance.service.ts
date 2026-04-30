import api from '../../../shared/lib/axios';
import type { ISchedule } from '../interfaces/attendance.interface';

export const attendanceService = {
  getTodaySchedules: async (): Promise<ISchedule[]> => {
    const response = await api.get<ISchedule[]>('/teacher/schedule');
    return response.data;
  },

  uploadPhoto: async (file: File): Promise<{ filename: string; url: string }> => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  submitAttendance: async (payload: { 
    scheduleId: string; 
    photoSelfie: string; 
    photoClass: string; 
    status: string;
    type?: string;
    isCustom?: boolean;
  }): Promise<any> => {
    const response = await api.post('/teacher/attendance', payload);
    return response.data;
  },

  getScheduleById: async (id: string): Promise<ISchedule> => {
    const response = await api.get<ISchedule>(`/teacher/schedule/${id}`);
    return response.data;
  },
};
