import api from '../../../shared/lib/axios';
import type { IAdminSummary, IActivity } from '../interfaces/admin.interface';

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
  getSummary: async (): Promise<IAdminSummary> => {
    const response = await api.get<IAdminSummary>('/admin/summary');
    return response.data;
  },

  getActivities: async (params?: { page?: number; limit?: number; search?: string; teacherId?: string; classId?: string; lessonId?: string; startDate?: string; endDate?: string; status?: string }): Promise<IPaginatedResponse<IActivity>> => {
    const response = await api.get<IPaginatedResponse<IActivity>>('/admin/activities', { params });
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
    link.setAttribute('download', `Laporan_Absensi_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
