import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gradeLevelService } from '../services/grade-level.service';
import type { IGradeLevelPayload } from '../interfaces/grade-level.interface';

export const useGradeLevels = () => {
  return useQuery({
    queryKey: ['grade-levels'],
    queryFn: () => gradeLevelService.getAll(),
  });
};

export const useCreateGradeLevel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: gradeLevelService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grade-levels'] });
    },
  });
};

export const useUpdateGradeLevel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IGradeLevelPayload> }) => 
      gradeLevelService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grade-levels'] });
    },
  });
};

export const useDeleteGradeLevel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: gradeLevelService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grade-levels'] });
    },
  });
};
