import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleService } from '../services/schedule.service';

export const useSchedules = () => {
  return useQuery({
    queryKey: ['master-schedules'],
    queryFn: scheduleService.getAll,
  });
};

export const useUpsertSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: scheduleService.createOrUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-schedules'] });
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: scheduleService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-schedules'] });
    },
  });
};
