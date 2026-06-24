import { apiClient } from './axios';
import type { AuthResponse } from '../types';

export const authApi = {
  login: async (credentials: Record<string, string>): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },
  
  register: async (data: Record<string, string>): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  }
};
