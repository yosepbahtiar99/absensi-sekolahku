import { useQuery } from '@tanstack/react-query';
import { attendanceService } from '../services/attendance.service';

export const useTodaySchedules = (day?: string) => {
  return useQuery({
    queryKey: ['today-schedules', day],
    queryFn: () => attendanceService.getTodaySchedules(day),
  });
};

export const useScheduleDetail = (id: string) => {
  return useQuery({
    queryKey: ['schedule', id],
    queryFn: () => attendanceService.getScheduleById(id),
    enabled: !!id,
  });
};
