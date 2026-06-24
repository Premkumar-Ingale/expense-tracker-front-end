import { apiClient } from './axios';
import type { BudgetStatus, Budget } from '../types';

export const budgetApi = {
  createOrUpdateBudget: async (budgetData: { amount: number; month: number; year: number }): Promise<Budget> => {
    const response = await apiClient.post<Budget>('/budgets', budgetData);
    return response.data;
  },

  getCurrentBudget: async (): Promise<Budget> => {
    const response = await apiClient.get<Budget>('/budgets/current');
    return response.data;
  },

  getBudgetStatus: async (): Promise<BudgetStatus> => {
    const response = await apiClient.get<BudgetStatus>('/budgets/status');
    return response.data;
  }
};
