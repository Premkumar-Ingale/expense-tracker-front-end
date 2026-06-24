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
  categoryId: number;
  category?: Category;
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
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  utilizationPercentage: number;
}
