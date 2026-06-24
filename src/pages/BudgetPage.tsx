import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { budgetApi } from '../api/budgetApi';
import type { BudgetStatus } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatCurrency } from '../utils/formatCurrency';
import { cn } from '../utils/cn';
import { Target, TrendingDown, AlertTriangle } from 'lucide-react';

const budgetSchema = z.object({
  amount: z.coerce.number().positive('Budget amount must be positive'),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

export default function BudgetPage() {
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(budgetSchema),
  });

  const fetchBudget = async () => {
    try {
      setLoading(true);
      const res = await budgetApi.getBudgetStatus();
      setBudgetStatus(res);
      reset({ amount: res.totalBudget });
    } catch (err) {
      console.error("Failed to fetch budget status", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      await budgetApi.createOrUpdateBudget(data);
      fetchBudget();
      alert('Budget updated successfully!');
    } catch (err) {
      console.error("Failed to update budget", err);
    }
  };

  const utilization = budgetStatus?.utilizationPercentage || 0;
  const isOverBudget = utilization > 100;
  const progressColor = isOverBudget ? 'bg-danger' : utilization > 80 ? 'bg-f59e0b' : 'bg-success';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">Budget Planner</h1>
          <p className="text-text-muted text-sm mt-1">Set limits and track your overall spending</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target size={20} className="text-primary" />
              Set Monthly Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <p className="text-sm text-text-muted mb-4">
                Define the total amount you want to spend this month. Setting a budget helps you keep track of your financial goals.
              </p>
              
              <Input
                label="Total Budget (₹)"
                type="number"
                step="0.01"
                {...register('amount')}
                error={errors.amount?.message}
                placeholder="e.g. 50000"
              />
              
              <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
                Save Budget
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown size={20} className="text-primary" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-text-muted">Loading status...</div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center py-4">
                  <span className="text-sm font-medium text-text-muted">You have spent</span>
                  <span className="text-4xl font-bold text-text-main mt-1">
                    {formatCurrency(budgetStatus?.totalSpent || 0)}
                  </span>
                  <span className="text-sm text-text-muted mt-1">
                    out of {formatCurrency(budgetStatus?.totalBudget || 0)}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2 font-medium">
                    <span className="text-text-main">Utilization</span>
                    <span className={isOverBudget ? 'text-danger' : 'text-text-main'}>
                      {utilization.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div 
                      className={`${progressColor} h-3 rounded-full transition-all duration-1000 ease-out`} 
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      isOverBudget ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
                    )}>
                      {isOverBudget ? <AlertTriangle size={20} /> : <Target size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-main">
                        {isOverBudget ? 'Over Budget' : 'Remaining Budget'}
                      </p>
                      <p className={cn(
                        "text-lg font-bold",
                        isOverBudget ? 'text-danger' : 'text-success'
                      )}>
                        {isOverBudget 
                          ? `+${formatCurrency(Math.abs(budgetStatus?.remaining || 0))}` 
                          : formatCurrency(budgetStatus?.remaining || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
