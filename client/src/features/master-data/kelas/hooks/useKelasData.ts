import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kelasService } from '../services/kelas.service';
import type { IKelasPayload } from '../interfaces/kelas.interface';

export const useClasses = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['master-classes', params],
    queryFn: () => kelasService.getAll(params),
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: kelasService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-classes'] });
    },
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IKelasPayload }) => kelasService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-classes'] });
    },
  });
};

export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: kelasService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-classes'] });
    },
  });
};
