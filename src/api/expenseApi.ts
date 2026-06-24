import { apiClient } from './axios';
import type { Expense, PageResponse } from '../types';

export const expenseApi = {
  getExpenses: async (page = 0, size = 5, sortBy = 'date', direction = 'desc'): Promise<PageResponse<Expense>> => {
    const response = await apiClient.get<PageResponse<Expense>>(`/expenses`, {
      params: { page, size, sortBy, direction }
    });
    return response.data;
  },
  
  createExpense: async (data: Omit<Expense, 'id'>): Promise<Expense> => {
    const response = await apiClient.post<Expense>('/expenses', data);
    return response.data;
  },
  
  // Note: Add update and delete as needed based on exact backend endpoints
  deleteExpense: async (id: number): Promise<void> => {
    await apiClient.delete(`/expenses/${id}`);
  }
};
