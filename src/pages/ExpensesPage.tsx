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
import { Plus, Edit2, Trash2, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const expenseSchema = z.object({
  description: z.string().min(2, 'Description is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  categoryId: z.coerce.number().positive('Category is required'),
  recurring: z.boolean().optional(),
  frequency: z.string().optional(),
});

type FilterType = 'NONE' | 'CATEGORY' | 'MIN_AMOUNT' | 'DATE_RANGE' | 'RECURRING';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Pagination & Sorting State
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('date');
  const [direction, setDirection] = useState('desc');

  // Filtering State
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('NONE');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAmount, setFilterAmount] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(expenseSchema),
  });

  const isRecurring = watch('recurring');

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch categories once if not loaded
      if (categories.length === 0) {
        const catRes = await categoryApi.getAllCategories();
        setCategories(catRes);
      }

      if (filterType === 'NONE') {
        const expRes = await expenseApi.getExpenses(page, 10, sortBy, direction);
        setExpenses(expRes.content);
        setTotalPages(expRes.totalPages || 1);
      } else if (filterType === 'CATEGORY' && filterCategory) {
        const catName = categories.find(c => c.id.toString() === filterCategory)?.name;
        if (catName) {
          const res = await expenseApi.getExpensesByCategory(catName);
          setExpenses(res);
        }
      } else if (filterType === 'MIN_AMOUNT' && filterAmount) {
        const res = await expenseApi.getExpensesByMinAmount(Number(filterAmount));
        setExpenses(res);
      } else if (filterType === 'DATE_RANGE' && filterStartDate && filterEndDate) {
        const res = await expenseApi.getExpensesByDateRange(filterStartDate, filterEndDate);
        setExpenses(res);
      } else if (filterType === 'RECURRING') {
        const res = await expenseApi.getRecurringExpenses();
        setExpenses(res);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, sortBy, direction, filterType, filterCategory, filterAmount, filterStartDate, filterEndDate]);

  const clearFilters = () => {
    setFilterType('NONE');
    setFilterCategory('');
    setFilterAmount('');
    setFilterStartDate('');
    setFilterEndDate('');
    setPage(0);
  };

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
          <p className="text-text-muted text-sm mt-1">Manage, filter, and track your daily spending</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
            <Filter size={18} /> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button onClick={openAddModal} className="flex items-center gap-2">
            <Plus size={18} /> Add Expense
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-4 sm:p-6 space-y-4">
                
                {/* SORTING CONTROLS (Only visible if no filter applied) */}
                {filterType === 'NONE' && (
                  <div className="flex flex-wrap items-end gap-4 pb-4 border-b border-slate-200">
                    <div className="w-48">
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Sort By</label>
                      <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      >
                        <option value="date">Date</option>
                        <option value="amount">Amount</option>
                        <option value="description">Description</option>
                      </select>
                    </div>
                    <div className="w-48">
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Order</label>
                      <select 
                        value={direction} 
                        onChange={(e) => setDirection(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* FILTER CONTROLS */}
                <div className="flex flex-wrap items-end gap-4">
                  <div className="w-48">
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Filter Type</label>
                    <select 
                      value={filterType} 
                      onChange={(e) => {
                        setFilterType(e.target.value as FilterType);
                        setPage(0); // Reset page on filter change
                      }}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    >
                      <option value="NONE">None (Default View)</option>
                      <option value="CATEGORY">By Category</option>
                      <option value="MIN_AMOUNT">Min Amount</option>
                      <option value="DATE_RANGE">Date Range</option>
                      <option value="RECURRING">Recurring Only</option>
                    </select>
                  </div>

                  {filterType === 'CATEGORY' && (
                    <div className="w-48">
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Select Category</label>
                      <select 
                        value={filterCategory} 
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      >
                        <option value="">Choose...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  )}

                  {filterType === 'MIN_AMOUNT' && (
                    <div className="w-48">
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Minimum Amount (₹)</label>
                      <input 
                        type="number"
                        placeholder="e.g. 1000"
                        value={filterAmount}
                        onChange={(e) => setFilterAmount(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  )}

                  {filterType === 'DATE_RANGE' && (
                    <>
                      <div className="w-40">
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
                        <input 
                          type="date"
                          value={filterStartDate}
                          onChange={(e) => setFilterStartDate(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      <div className="w-40">
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">End Date</label>
                        <input 
                          type="date"
                          value={filterEndDate}
                          onChange={(e) => setFilterEndDate(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    </>
                  )}

                  {filterType !== 'NONE' && (
                    <Button variant="outline" onClick={clearFilters} className="h-10 text-danger border-danger hover:bg-red-50">
                      Clear Filter
                    </Button>
                  )}
                </div>

                {filterType !== 'NONE' && (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded inline-block mt-2">
                    Note: Pagination and custom sorting are disabled when a specific filter is applied. All matching results are shown.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <CardContent className="p-0 flex flex-col min-h-[400px]">
          {loading ? (
            <div className="flex-1 flex items-center justify-center p-8 text-text-muted">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                {filterType === 'NONE' ? <Plus size={32} /> : <Filter size={32} />}
              </div>
              <h3 className="text-lg font-medium text-text-main">
                {filterType === 'NONE' ? 'No expenses yet' : 'No matches found'}
              </h3>
              <p className="text-text-muted mt-1 mb-6">
                {filterType === 'NONE' ? 'Create your first expense record to get started.' : 'Try adjusting your filter criteria.'}
              </p>
              {filterType === 'NONE' && <Button onClick={openAddModal}>Add your first expense</Button>}
            </div>
          ) : (
            <>
              <div className="w-full overflow-x-auto flex-1">
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
              
              {/* Pagination Footer */}
              {filterType === 'NONE' && totalPages > 1 && (
                <div className="border-t border-border bg-white px-6 py-3 flex items-center justify-between">
                  <div className="text-sm text-text-muted">
                    Page <span className="font-medium text-text-main">{page + 1}</span> of <span className="font-medium text-text-main">{totalPages}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="px-3 py-1 h-8"
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="px-3 py-1 h-8"
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </>
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
