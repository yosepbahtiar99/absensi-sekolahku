import { useQuery } from '@tanstack/react-query';
import { attendanceService } from '../services/attendance.service';

export const useTodaySchedules = () => {
  return useQuery({
    queryKey: ['today-schedules'],
    queryFn: attendanceService.getTodaySchedules,
  });
};

export const useScheduleDetail = (id: string) => {
  return useQuery({
    queryKey: ['schedule', id],
    queryFn: () => attendanceService.getScheduleById(id),
    enabled: !!id,
  });
};
