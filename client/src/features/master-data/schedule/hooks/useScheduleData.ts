import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleService } from '../services/schedule.service';

export const useSchedules = (academicYearId?: string) => {
  return useQuery({
    queryKey: ['master-schedules', academicYearId],
    queryFn: () => scheduleService.getAll(academicYearId),
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

export const useCloneSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fromYearId, toYearId }: { fromYearId: string; toYearId: string }) => 
      scheduleService.clone(fromYearId, toYearId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-schedules'] });
    },
  });
};
