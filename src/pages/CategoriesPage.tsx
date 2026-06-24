import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { categoryApi } from '../api/categoryApi';
import type { Category } from '../types';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Plus, Edit2, Trash2, Tags } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(2, 'Name is required').max(50, 'Name is too long'),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await categoryApi.getAllCategories();
      setCategories(res);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    reset({ name: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    reset({ name: category.name });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category? Note: You cannot delete categories that are currently linked to expenses.')) {
      try {
        await categoryApi.deleteCategory(id);
        fetchData();
      } catch (err) {
        console.error("Failed to delete", err);
        alert('Failed to delete category. It might be in use.');
      }
    }
  };

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      if (editingCategory) {
        await categoryApi.updateCategory(editingCategory.id, data);
      } else {
        await categoryApi.createCategory(data);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Failed to save category", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">Categories</h1>
          <p className="text-text-muted text-sm mt-1">Organize your expenses with custom tags</p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2">
          <Plus size={18} /> Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
           <div className="col-span-full p-8 text-center text-text-muted">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="col-span-full p-12 text-center flex flex-col items-center bg-white rounded-2xl border border-border border-dashed">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
              <Tags size={32} />
            </div>
            <h3 className="text-lg font-medium text-text-main">No categories found</h3>
            <p className="text-text-muted mt-1 mb-6">Create categories like "Food", "Transport", or "Bills" to start organizing.</p>
            <Button onClick={openAddModal}>Create a category</Button>
          </div>
        ) : (
          categories.map((category) => (
            <Card key={category.id} className="group hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex items-center justify-between h-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold uppercase">
                    {category.name.substring(0, 2)}
                  </div>
                  <span className="font-semibold text-text-main">{category.name}</span>
                </div>
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => openEditModal(category)} className="text-primary hover:text-primary-hover transition-colors p-1 bg-primary/5 rounded">
                     <Edit2 size={14} />
                   </button>
                   <button onClick={() => handleDelete(category.id)} className="text-danger hover:text-red-700 transition-colors p-1 bg-danger/5 rounded">
                     <Trash2 size={14} />
                   </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "Edit Category" : "Add Category"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Entertainment"
            {...register('name')}
            error={errors.name?.message}
          />
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
