import api from '../../../shared/lib/axios';
import type { ISchedule } from '../interfaces/attendance.interface';

export const attendanceService = {
  getTodaySchedules: async (day?: string): Promise<ISchedule[]> => {
    const response = await api.get<ISchedule[]>('/teacher/schedule', {
      params: { day }
    });
    return response.data;
  },

  getSettings: async (): Promise<any> => {
    const response = await api.get('/teacher/settings');
    return response.data;
  },

  getDailyAttendanceStatus: async (): Promise<{ data: any }> => {
    const response = await api.get<{ data: any }>('/teacher/attendance/daily-status');
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

  corporateClockIn: async (payload: { photoSelfie: string; photoClass: string }): Promise<any> => {
    const response = await api.post('/teacher/attendance/corporate-clock-in', payload);
    return response.data;
  },

  corporateClockOut: async (payload?: { latitude?: number; longitude?: number }): Promise<any> => {
    const response = await api.post('/teacher/attendance/corporate-clock-out', payload);
    return response.data;
  },

  getScheduleById: async (id: string): Promise<ISchedule> => {
    const response = await api.get<ISchedule>(`/teacher/schedule/${id}`);
    return response.data;
  },

  getMyActivities: async (params?: { page?: number; limit?: number }): Promise<any> => {
    const response = await api.get<any>('/teacher/activities', { params });
    return response.data;
  },

  createRequest: async (data: { type: string; activityId?: string; data: any }): Promise<any> => {
    const response = await api.post('/teacher/requests', data);
    return response.data;
  },

  getMyRequests: async (params?: { page?: number; limit?: number }): Promise<any> => {
    const response = await api.get('/teacher/requests', { params });
    return response.data;
  },
};
