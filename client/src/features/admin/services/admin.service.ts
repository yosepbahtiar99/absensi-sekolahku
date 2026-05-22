import api from '../../../shared/lib/axios';
import type { IAdminSummary, IActivity } from '../interfaces/admin.interface';

export interface IApprovalRequest {
  id: string;
  type: 'custom_pembelajaran' | 'koreksi' | 'perizinan' | 'lembur';
  status: 'pending' | 'approved' | 'rejected';
  data: any;
  adminNote?: string;
  userId: string;
  activityId?: string;
  createdAt: string;
  User: { name: string };
  Activity?: IActivity;
}

export interface IPaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const adminService = {
  getSummary: async (academicYearId?: string): Promise<IAdminSummary> => {
    const response = await api.get<IAdminSummary>('/admin/summary', { params: { academicYearId } });
    return response.data;
  },

  getActivities: async (params?: { page?: number; limit?: number; search?: string; teacherId?: string; classId?: string; lessonId?: string; startDate?: string; endDate?: string; status?: string }): Promise<IPaginatedResponse<IActivity>> => {
    const response = await api.get<IPaginatedResponse<IActivity>>('/admin/activities', { params });
    return response.data;
  },

  getApprovalRequests: async (params?: { page?: number; limit?: number; status?: string; type?: string }): Promise<IPaginatedResponse<IApprovalRequest>> => {
    const response = await api.get<IPaginatedResponse<IApprovalRequest>>('/admin/requests', { params });
    return response.data;
  },

  approveRequest: async (id: string, data: { status: 'approved' | 'rejected'; adminNote?: string }): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>(`/admin/requests/${id}/approve`, data);
    return response.data;
  },

  exportReport: async (params?: { teacherId?: string; classId?: string; lessonId?: string; startDate?: string; endDate?: string; status?: string }): Promise<void> => {
    const response = await api.get('/admin/export-report', { 
      params,
      responseType: 'blob' 
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    link.setAttribute('download', `Laporan_Absensi_${dateStr}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  getDailyMatrixData: async (date?: string): Promise<IWallboardData> => {
    const response = await api.get<IWallboardData>('/admin/reports/daily/matrix-data', { params: { date } });
    return response.data;
  },

  getSettings: async (): Promise<ISystemSettings> => {
    const response = await api.get<ISystemSettings>('/admin/settings');
    return response.data;
  },

  updateSettings: async (settings: ISystemSettings): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>('/admin/settings', settings);
    return response.data;
  },

  getDailyPresence: async (): Promise<{ data: IDailyPresence[] }> => {
    const response = await api.get<{ data: IDailyPresence[] }>('/admin/attendance/daily-presence');
    return response.data;
  },

  approveClockOut: async (userId: string): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>(`/admin/attendance/clock-out/${userId}`);
    return response.data;
  },

  setManualActivity: async (data: IManualActivityPayload): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/admin/activities/manual', data);
    return response.data;
  },
};

export interface IManualActivityPayload {
  scheduleId: string;
  teacherId: string;
  status: 'masuk' | 'telat' | 'tidak_hadir' | 'alpa';
  description?: string;
  date: string;
}

export interface IDailyPresence {
  userId: string;
  name: string;
  firstCheckIn: string;
  activityIds: string[];
}

export interface ISystemSettings {
  attendance_flow: 'disabled' | 'strict' | 'block' | 'full_day';
  late_tolerance: number;
}

export interface IWallboardTimeSlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  periodNumber: number;
}

export interface IWallboardMatrixCell {
  scheduleId: string;
  classId: string;
  className: string;
  lessonId: string;
  lessonName: string;
  status: 'hadir' | 'telat' | 'izin' | 'alpa' | 'belum_absen' | 'belum_mulai';
  checkInTime: string | null;
}

export interface IWallboardTeacherRow {
  teacherId: string;
  teacherName: string;
  slots: Record<string, IWallboardMatrixCell | null>;
}

export interface IWallboardData {
  date: string;
  dayName: string;
  academicYearName: string;
  timeSlots: IWallboardTimeSlot[];
  matrix: IWallboardTeacherRow[];
}
