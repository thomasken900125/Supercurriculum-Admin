'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function SubjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: years } = useQuery({
    queryKey: ['years'],
    queryFn: () => api.getYears(),
  });

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects', selectedYear],
    queryFn: () => api.getSubjects(selectedYear || undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
        <button
          onClick={() => {
            setEditingSubject(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Year</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
        >
          <option value="">All Years</option>
          {years?.map((year: any) => (
            <option key={year.id} value={year.id}>{year.displayName}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects?.map((subject: any) => (
            <div key={subject.id} className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold mr-3"
                    style={{ backgroundColor: subject.colorCode || '#6366f1' }}
                  >
                    {subject.iconName || '📚'}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{subject.displayName}</h3>
                    <p className="text-sm text-gray-500">{subject.yearGroup?.displayName}</p>
                  </div>
                </div>
              </div>
              {subject.whyMatters && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{subject.whyMatters}</p>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setEditingSubject(subject);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(subject.id, subject.displayName)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <SubjectModal
          subject={editingSubject}
          years={years || []}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['subjects'] });
          }}
        />
      )}
    </div>
  );
}

function SubjectModal({ subject, years, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    yearGroupId: subject?.yearGroupId || '',
    name: subject?.name || '',
    displayName: subject?.displayName || '',
    description: subject?.description || '',
    whyMatters: subject?.whyMatters || '',
    iconName: subject?.iconName || '',
    colorCode: subject?.colorCode || '#6366f1',
    orderIndex: subject?.orderIndex || 1,
  });

  const mutation = useMutation({
    mutationFn: (data: any) =>
      subject ? api.updateSubject(subject.id, data) : api.createSubject(data),
    onSuccess,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4">
        <h2 className="text-xl font-bold mb-4">{subject ? 'Edit' : 'Add'} Subject</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Year Group</label>
              <select
                value={formData.yearGroupId}
                onChange={(e) => setFormData({ ...formData, yearGroupId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                required
              >
                <option value="">Select Year</option>
                {years.map((year: any) => (
                  <option key={year.id} value={year.id}>{year.displayName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name (slug)</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="english"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Display Name</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="English"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Icon (emoji)</label>
              <input
                type="text"
                value={formData.iconName}
                onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="📚"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Color</label>
              <input
                type="color"
                value={formData.colorCode}
                onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                rows={2}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Why Supercurriculum Matters</label>
              <textarea
                value={formData.whyMatters}
                onChange={(e) => setFormData({ ...formData, whyMatters: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                rows={3}
                placeholder="Explain why this subject is important..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Order Index</label>
              <input
                type="number"
                value={formData.orderIndex}
                onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

