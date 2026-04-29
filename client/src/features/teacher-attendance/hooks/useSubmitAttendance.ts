import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../services/attendance.service';

export const useSubmitAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attendanceService.submitAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-schedules'] });
    },
  });
};
