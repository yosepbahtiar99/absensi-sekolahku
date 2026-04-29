import api from '../../../shared/lib/axios';
import type { IAdminSummary, IActivity } from '../interfaces/admin.interface';

export const adminService = {
  getSummary: async (): Promise<IAdminSummary> => {
    const response = await api.get<IAdminSummary>('/admin/summary');
    return response.data;
  },

  getActivities: async (params?: { page?: number; limit?: number; search?: string }): Promise<IActivity[]> => {
    const response = await api.get<IActivity[]>('/admin/activities', { params });
    return response.data;
  },
};
