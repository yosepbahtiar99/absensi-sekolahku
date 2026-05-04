import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { curriculumService } from '../services/curriculum.service';
import type { ICurriculumPayload } from '../interfaces/curriculum.interface';

export const useCurriculums = (params?: { academicYearId?: string; gradeLevel?: string }) => {
  return useQuery({
    queryKey: ['curriculums', params],
    queryFn: () => curriculumService.getAll(params),
  });
};

export const useCreateCurriculum = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: curriculumService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculums'] });
    },
  });
};

export const useUpdateCurriculum = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ICurriculumPayload> }) => 
      curriculumService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculums'] });
    },
  });
};

export const useDeleteCurriculum = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: curriculumService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculums'] });
    },
  });
};
