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
  getSummary: async (): Promise<IAdminSummary> => {
    const response = await api.get<IAdminSummary>('/admin/summary');
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
    link.setAttribute('download', `Laporan_Absensi_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
