import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';

export const useAdminSummary = () => {
  return useQuery({
    queryKey: ['admin-summary'],
    queryFn: adminService.getSummary,
  });
};

export const useAdminActivities = (params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: ['admin-activities', params],
    queryFn: () => adminService.getActivities(params),
  });
};
