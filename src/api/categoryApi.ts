import { apiClient } from './axios';
import type { Category } from '../types';

export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/categories');
    return response.data;
  },
  
  createCategory: async (data: { name: string }): Promise<Category> => {
    const response = await apiClient.post<Category>('/categories', data);
    return response.data;
  }
};
