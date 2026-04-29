import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guruService } from '../services/guru.service';
import type { IGuruPayload } from '../interfaces/guru.interface';

export const useGurus = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['master-gurus', params],
    queryFn: () => guruService.getAll(params),
  });
};

export const useCreateGuru = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: guruService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-gurus'] });
    },
  });
};

export const useUpdateGuru = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IGuruPayload }) => guruService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-gurus'] });
    },
  });
};

export const useDeleteGuru = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: guruService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-gurus'] });
    },
  });
};
