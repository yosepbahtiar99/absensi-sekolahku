import api from '../../../shared/lib/axios';
import type { IAuthResponse } from '../interfaces/auth.interface';

export const authService = {
  login: async (data: any): Promise<IAuthResponse> => {
    const response = await api.post<IAuthResponse>('/auth/login', data);
    return response.data;
  },
};
