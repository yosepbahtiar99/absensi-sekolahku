import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonService } from '../services/lesson.service';
import type { IPelajaranPayload } from '../interfaces/lesson.interface';

export const useLessons = (params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: ['master-lessons', params],
    queryFn: () => lessonService.getAll(params),
  });
};

export const useCreateLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: lessonService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-lessons'] });
    },
  });
};

export const useUpdateLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IPelajaranPayload }) => lessonService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-lessons'] });
    },
  });
};

export const useDeleteLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: lessonService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-lessons'] });
    },
  });
};
