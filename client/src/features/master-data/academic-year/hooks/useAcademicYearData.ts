import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicYearService } from '../services/academicYear.service';
import { IAcademicYear } from '../../../admin/interfaces/admin.interface';

export const useAcademicYears = () => {
  return useQuery({
    queryKey: ['academic-years'],
    queryFn: () => academicYearService.getAll()
  });
};

export const useCreateAcademicYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<IAcademicYear, 'id'>) => academicYearService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
    }
  });
};

export const useUpdateAcademicYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IAcademicYear> }) => academicYearService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
    }
  });
};

export const useDeleteAcademicYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => academicYearService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
    }
  });
};
