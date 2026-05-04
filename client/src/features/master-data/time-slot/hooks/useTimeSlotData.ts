import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeSlotService } from '../services/timeSlot.service';
import type { ITimeSlot } from '../../../admin/interfaces/admin.interface';

export const useTimeSlots = (params?: { academicYearId?: string, day?: string }) => {
  return useQuery({
    queryKey: ['time-slots', params],
    queryFn: () => timeSlotService.getAll(params)
  });
};

export const useCreateTimeSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ITimeSlot, 'id'>) => timeSlotService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots'] });
    }
  });
};

export const useUpdateTimeSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ITimeSlot> }) => timeSlotService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots'] });
    }
  });
};

export const useDeleteTimeSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => timeSlotService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots'] });
    }
  });
};
