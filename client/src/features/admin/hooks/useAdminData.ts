import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';

export const useAdminSummary = (academicYearId?: string) => {
  return useQuery({
    queryKey: ['admin-summary', academicYearId],
    queryFn: () => adminService.getSummary(academicYearId),
  });
};

export const useAdminActivities = (params?: { page?: number; limit?: number; search?: string; teacherId?: string; classId?: string; lessonId?: string; startDate?: string; endDate?: string; status?: string; academicYearId?: string }) => {
  return useQuery({
    queryKey: ['admin-activities', params],
    queryFn: () => adminService.getActivities(params),
  });
};

export const useApprovalRequests = (params?: { page?: number; limit?: number; status?: string; type?: string }) => {
  return useQuery({
    queryKey: ['approval-requests', params],
    queryFn: () => adminService.getApprovalRequests(params),
  });
};

export const useApproveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: 'approved' | 'rejected'; adminNote?: string } }) => 
      adminService.approveRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-activities'] });
      queryClient.invalidateQueries({ queryKey: ['admin-summary'] });
    },
  });
};

export const useDailyMatrixData = (date?: string) => {
  return useQuery({
    queryKey: ['daily-matrix-data', date],
    queryFn: () => adminService.getDailyMatrixData(date),
  });
};
