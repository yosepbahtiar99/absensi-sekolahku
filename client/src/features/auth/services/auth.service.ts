import api from '../../../shared/lib/axios';
import type { IAuthResponse } from '../interfaces/auth.interface';

export const authService = {
  login: async (data: any): Promise<IAuthResponse> => {
    const response = await api.post<IAuthResponse>('/auth/login', data);
    return response.data;
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
  changePassword: async (data: any): Promise<void> => {
    await api.put('/auth/change-password', data);
  },
  uploadPhoto: async (formData: FormData): Promise<{ message: string; photoId: string }> => {
    const response = await api.post('/auth/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
