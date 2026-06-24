export interface User {
  id?: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Expense {
  id: number;
  amount: number;
  description: string;
  date: string;
  userName: string;
  categoryName: string;
  categoryId?: number;
  recurring: boolean;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | null;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface BudgetStatus {
  budget: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
}

export interface Budget {
  id?: number;
  amount: number;
  month: number;
  year: number;
}

export interface DashboardSummary {
  totalExpense: number;
  expenseCount: number;
  highestExpense: number;
  averageExpense: number;
}

export interface CategorySummary {
  categoryName: string;
  totalAmount: number;
}

export interface MonthlySummary {
  month: number;
  totalAmount: number;
}

export interface ExpenseRequest {
  amount: number;
  description: string;
  date: string;
  categoryId: number;
  recurring: boolean;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | null;
}
