import { apiClient } from './axios';
import type { Expense, PageResponse, DashboardSummary, CategorySummary, MonthlySummary } from '../types';

export const expenseApi = {
  getExpenses: async (page = 0, size = 50, sortBy = 'date', direction = 'desc'): Promise<PageResponse<Expense>> => {
    const response = await apiClient.get<PageResponse<Expense>>(`/expenses`, {
      params: { page, size, sortBy, direction }
    });
    return response.data;
  },
  
  createExpense: async (data: Omit<Expense, 'id' | 'category'>): Promise<Expense> => {
    const response = await apiClient.post<Expense>('/expenses', data);
    return response.data;
  },

  getExpenseById: async (id: number): Promise<Expense> => {
    const response = await apiClient.get<Expense>(`/expenses/${id}`);
    return response.data;
  },
  
  updateExpense: async (id: number, data: Omit<Expense, 'id' | 'category'>): Promise<Expense> => {
    const response = await apiClient.put<Expense>(`/expenses/${id}`, data);
    return response.data;
  },

  deleteExpense: async (id: number): Promise<void> => {
    await apiClient.delete(`/expenses/${id}`);
  },

  getExpensesByCategory: async (categoryName: string): Promise<Expense[]> => {
    const response = await apiClient.get<Expense[]>(`/expenses/category/${categoryName}`);
    return response.data;
  },

  getExpensesByMinAmount: async (amount: number): Promise<Expense[]> => {
    const response = await apiClient.get<Expense[]>(`/expenses/min-amount/${amount}`);
    return response.data;
  },

  getExpensesByDateRange: async (startDate: string, endDate: string): Promise<Expense[]> => {
    const response = await apiClient.get<Expense[]>('/expenses/date-range', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const response = await apiClient.get<DashboardSummary>('/expenses/dashboard');
    return response.data;
  },

  getCategorySummary: async (): Promise<CategorySummary[]> => {
    const response = await apiClient.get<CategorySummary[]>('/expenses/category-summary');
    return response.data;
  },

  getRecurringExpenses: async (): Promise<Expense[]> => {
    const response = await apiClient.get<Expense[]>('/expenses/recurring');
    return response.data;
  },

  getMonthlySummary: async (year: number): Promise<MonthlySummary[]> => {
    const response = await apiClient.get<MonthlySummary[]>(`/expenses/monthly-summary/${year}`);
    return response.data;
  }
};
