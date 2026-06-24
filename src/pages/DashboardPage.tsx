import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { expenseApi } from '../api/expenseApi';
import { budgetApi } from '../api/budgetApi';
import type { Expense, BudgetStatus, DashboardSummary, CategorySummary, MonthlySummary } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, subDays } from 'date-fns';
import { TrendingUp, CreditCard, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/formatCurrency';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function DashboardPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Note: For a real app, these would come from specific summary endpoints.
  // We're mocking the chart data based on recent expenses or static data since the backend API for summary wasn't fully defined.
  
  const mockCategoryData = [
    { name: 'Food', value: 400 },
    { name: 'Travel', value: 300 },
    { name: 'Shopping', value: 300 },
    { name: 'Bills', value: 200 },
  ];

  const mockTrendData = Array.from({ length: 6 }).map((_, i) => ({
    name: format(subDays(new Date(), 5 - i), 'MMM dd'),
    amount: Math.floor(Math.random() * 500) + 50,
  }));

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch recent expenses
        const [expRes, budRes, dashSum, catSum, monthSum] = await Promise.all([
          expenseApi.getExpenses(0, 5, 'date', 'desc').catch(() => ({ content: [] as Expense[] })),
          budgetApi.getBudgetStatus().catch(() => null),
          expenseApi.getDashboardSummary().catch(() => null),
          expenseApi.getCategorySummary().catch(() => [] as CategorySummary[]),
          expenseApi.getMonthlySummary(new Date().getFullYear()).catch(() => [] as MonthlySummary[])
        ]);
        
        setExpenses((expRes as any).content || []);
        setBudgetStatus(budRes as BudgetStatus | null);
        setDashboardSummary(dashSum as DashboardSummary | null);
        setCategorySummary(catSum as CategorySummary[]);
        setMonthlySummary(monthSum as MonthlySummary[]);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, delay }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted mb-1">{title}</p>
              <h4 className="text-2xl font-bold text-text-main">{value}</h4>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Icon size={24} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">Here's your financial overview</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Spending" value={formatCurrency(dashboardSummary?.totalSpending || 0)} icon={CreditCard} delay={0.1} />
        <StatCard title="Expense Count" value={dashboardSummary?.expenseCount || 0} icon={Activity} delay={0.2} />
        <StatCard title="Average Expense" value={formatCurrency(dashboardSummary?.averageExpense || 0)} icon={PieChartIcon} delay={0.3} />
        <StatCard title="Highest Expense" value={formatCurrency(dashboardSummary?.highestExpense || 0)} icon={TrendingUp} delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-6 pb-2">
            <CardTitle>Spending Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={(monthlySummary.length > 0 ? monthlySummary : mockTrendData) as any}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey={monthlySummary.length > 0 ? 'month' : 'name'} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(value) => `₹${value}`} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: any) => formatCurrency(Number(value))}
                  />
                  <Line type="monotone" dataKey={monthlySummary.length > 0 ? 'totalAmount' : 'amount'} stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Pie Chart */}
        <Card>
          <CardHeader className="p-6 pb-2">
            <CardTitle>By Category</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-72 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={categorySummary.length > 0 ? categorySummary : mockCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey={categorySummary.length > 0 ? 'totalAmount' : 'value'}
                    nameKey={categorySummary.length > 0 ? 'categoryName' : 'name'}
                  >
                    {(categorySummary.length > 0 ? categorySummary : mockCategoryData).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: any) => formatCurrency(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full mt-4 flex flex-wrap gap-2 justify-center">
                {(categorySummary.length > 0 ? categorySummary : mockCategoryData).map((entry: any, index: number) => (
                  <div key={entry.categoryName || entry.name} className="flex items-center text-xs text-text-muted">
                    <span className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    {entry.categoryName || entry.name}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses & Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="p-6 pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Recent Expenses</CardTitle>
              <button className="text-sm text-primary hover:underline font-medium">View All</button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
               <div className="p-6 flex justify-center"><div className="animate-pulse bg-slate-200 h-8 w-32 rounded"></div></div>
            ) : expenses.length === 0 ? (
              <div className="p-6 text-center text-text-muted">No expenses recorded yet.</div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-slate-50/50">
                      <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-main">{expense.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">{expense.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {expense.category?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-text-main text-right">
                          {formatCurrency(expense.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-6 pb-2">
            <CardTitle>Budget Status</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-muted">Total Budget</span>
                  <span className="font-medium text-text-main">{formatCurrency(budgetStatus?.totalBudget || 0)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-muted">Spent</span>
                  <span className="font-medium text-text-main">{formatCurrency(budgetStatus?.totalSpent || 0)}</span>
                </div>
              </div>
              
              <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4 dark:bg-gray-700">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${budgetStatus?.utilizationPercentage || 0}%` }}></div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted font-medium">Remaining</span>
                <span className="font-bold text-success text-lg">{formatCurrency(budgetStatus?.remaining || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
