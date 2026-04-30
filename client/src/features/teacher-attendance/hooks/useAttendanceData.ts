import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../services/attendance.service';

export const useTodaySchedules = (day?: string) => {
  return useQuery({
    queryKey: ['today-schedules', day],
    queryFn: () => attendanceService.getTodaySchedules(day),
  });
};

export const useScheduleById = (id: string) => {
  return useQuery({
    queryKey: ['schedule', id],
    queryFn: () => attendanceService.getScheduleById(id),
    enabled: !!id,
  });
};

export const useMyActivities = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['my-activities', params],
    queryFn: () => attendanceService.getMyActivities(params),
  });
};

export const useMyRequests = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['my-requests', params],
    queryFn: () => attendanceService.getMyRequests(params),
  });
};

export const useCreateRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: attendanceService.createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
    },
  });
};
