import { apiClient } from './axios';
import type { BudgetStatus } from '../types';

export const budgetApi = {
  getBudgetStatus: async (): Promise<BudgetStatus> => {
    const response = await apiClient.get<BudgetStatus>('/budgets/status');
    return response.data;
  }
};
