import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { expenseApi } from '../api/expenseApi';
import { categoryApi } from '../api/categoryApi';
import type { Expense, Category } from '../types';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { formatCurrency } from '../utils/formatCurrency';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

const expenseSchema = z.object({
  description: z.string().min(2, 'Description is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  categoryId: z.coerce.number().positive('Category is required'),
  recurring: z.boolean().optional(),
  frequency: z.string().optional(),
});

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(expenseSchema),
  });

  const isRecurring = watch('recurring');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expRes, catRes] = await Promise.all([
        expenseApi.getExpenses(0, 100, 'date', 'desc'),
        categoryApi.getAllCategories()
      ]);
      setExpenses(expRes.content);
      setCategories(catRes);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingExpense(null);
    reset({ 
      description: '', 
      amount: '', 
      date: new Date().toISOString().split('T')[0], 
      categoryId: '',
      recurring: false,
      frequency: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    // Find the category ID from the category name
    const matchedCategory = categories.find(c => c.name === expense.categoryName);
    reset({
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      categoryId: matchedCategory?.id || '',
      recurring: expense.recurring || false,
      frequency: expense.frequency || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseApi.deleteExpense(id);
        fetchData();
      } catch (err) {
        console.error("Failed to delete", err);
      }
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        amount: data.amount,
        description: data.description,
        date: data.date,
        categoryId: Number(data.categoryId),
        recurring: data.recurring || false,
        frequency: data.recurring ? (data.frequency || null) : null,
      };
      if (editingExpense) {
        await expenseApi.updateExpense(editingExpense.id, payload);
      } else {
        await expenseApi.createExpense(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error("Failed to save expense", err);
      alert(err.response?.data?.message || 'Failed to save expense.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">Expenses</h1>
          <p className="text-text-muted text-sm mt-1">Manage and track your daily spending</p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2">
          <Plus size={18} /> Add Expense
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-text-muted">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                <Plus size={32} />
              </div>
              <h3 className="text-lg font-medium text-text-main">No expenses yet</h3>
              <p className="text-text-muted mt-1 mb-6">Create your first expense record to get started.</p>
              <Button onClick={openAddModal}>Add your first expense</Button>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-medium text-text-muted uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-medium text-text-muted uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-xs font-medium text-text-muted uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-xs font-medium text-text-muted uppercase tracking-wider text-right">Amount</th>
                    <th className="px-6 py-4 text-xs font-medium text-text-muted uppercase tracking-wider text-center">Recurring</th>
                    <th className="px-6 py-4 text-xs font-medium text-text-muted uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">{expense.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-main">{expense.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {expense.categoryName || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-text-main text-right">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted text-center">
                        {expense.recurring ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {expense.frequency || 'Yes'}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => openEditModal(expense)} className="text-primary hover:text-primary-hover mx-2 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(expense.id)} className="text-danger hover:text-red-700 mx-2 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? "Edit Expense" : "Add Expense"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Description"
            placeholder="e.g. Grocery shopping"
            {...register('description')}
            error={errors.description?.message as string}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount (₹)"
              type="number"
              step="0.01"
              {...register('amount')}
              error={errors.amount?.message as string}
            />
            <Input
              label="Date"
              type="date"
              {...register('date')}
              error={errors.date?.message as string}
            />
          </div>
          <Select
            label="Category"
            options={categories.map(c => ({ label: c.name, value: c.id }))}
            {...register('categoryId')}
            error={errors.categoryId?.message as string}
            defaultValue=""
          />

          <div className="flex items-center gap-3 pt-2">
            <input type="checkbox" id="recurring" {...register('recurring')} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            <label htmlFor="recurring" className="text-sm font-medium text-text-main">Recurring Expense</label>
          </div>
          
          {isRecurring && (
            <Select
              label="Frequency"
              options={[
                { label: 'Daily', value: 'DAILY' },
                { label: 'Weekly', value: 'WEEKLY' },
                { label: 'Monthly', value: 'MONTHLY' },
              ]}
              {...register('frequency')}
              error={errors.frequency?.message as string}
              defaultValue=""
            />
          )}

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingExpense ? 'Save Changes' : 'Create Expense'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
