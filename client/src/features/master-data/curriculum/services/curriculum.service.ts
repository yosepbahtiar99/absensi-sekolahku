import api from '../../../../shared/lib/axios';
import type { ICurriculum, ICurriculumPayload } from '../interfaces/curriculum.interface';

export const curriculumService = {
  getAll: async (params?: { academicYearId?: string; gradeLevel?: string }): Promise<ICurriculum[]> => {
    const response = await api.get<ICurriculum[]>('/admin/curriculums', { params });
    return response.data;
  },

  create: async (data: ICurriculumPayload): Promise<ICurriculum> => {
    const response = await api.post<ICurriculum>('/admin/curriculums', data);
    return response.data;
  },

  update: async (id: string, data: Partial<ICurriculumPayload>): Promise<void> => {
    await api.put(`/admin/curriculums/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/curriculums/${id}`);
  }
};
