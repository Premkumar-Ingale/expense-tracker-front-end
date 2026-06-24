import { apiClient } from './axios';
import type { BudgetStatus } from '../types';

export const budgetApi = {
  createOrUpdateBudget: async (budgetData: { amount: number }): Promise<void> => {
    await apiClient.post('/budgets', budgetData);
  },

  getCurrentBudget: async (): Promise<{ amount: number }> => {
    const response = await apiClient.get<{ amount: number }>('/budgets/current');
    return response.data;
  },

  getBudgetStatus: async (): Promise<BudgetStatus> => {
    const response = await apiClient.get<BudgetStatus>('/budgets/status');
    return response.data;
  }
};
