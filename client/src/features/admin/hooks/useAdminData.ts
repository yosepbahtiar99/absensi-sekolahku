import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';
import type { ISystemSettings } from '../services/admin.service';

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

export const useSystemSettings = () => {
  return useQuery({
    queryKey: ['system-settings'],
    queryFn: () => adminService.getSettings(),
  });
};

export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: ISystemSettings) => adminService.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
  });
};

export const useDailyPresence = () => {
  return useQuery({
    queryKey: ['admin-daily-presence'],
    queryFn: () => adminService.getDailyPresence(),
  });
};

export const useApproveClockOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminService.approveClockOut(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-daily-presence'] });
      queryClient.invalidateQueries({ queryKey: ['admin-activities'] });
    },
  });
};

export const useManualActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: import('../services/admin.service').IManualActivityPayload) => adminService.setManualActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-matrix'] });
      queryClient.invalidateQueries({ queryKey: ['admin-activities'] });
      queryClient.invalidateQueries({ queryKey: ['admin-daily-presence'] });
    },
  });
};
