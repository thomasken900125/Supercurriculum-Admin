'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';

const ACTIVITY_TYPES = ['READING', 'WRITING', 'LISTENING', 'WATCHING', 'RESEARCHING', 'STUDENT_LED', 'CREATIVE'];
const BANDS = ['NEEDS_SUPPORT', 'DEVELOPING', 'SECURE'];

export default function ActivitiesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [filters, setFilters] = useState({ subjectId: '', difficulty: '' });
  const queryClient = useQueryClient();

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => api.getSubjects(),
  });

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities', filters],
    queryFn: () => api.getActivities(filters.subjectId || filters.difficulty ? filters : undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Activities</h1>
        <button
          onClick={() => {
            setEditingActivity(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col sm:flex-row gap-4">
        <select
          value={filters.subjectId}
          onChange={(e) => setFilters({ ...filters, subjectId: e.target.value })}
          className="block w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
        >
          <option value="">All Subjects</option>
          {subjects?.map((subject: any) => (
            <option key={subject.id} value={subject.id}>{subject.displayName}</option>
          ))}
        </select>
        <select
          value={filters.difficulty}
          onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
          className="block w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
        >
          <option value="">All Levels</option>
          {BANDS.map((band) => (
            <option key={band} value={band}>{band.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {activities?.map((activity: any) => (
            <div key={activity.id} className="bg-white shadow rounded-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{activity.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap ${getBandColor(activity.difficulty)}`}>
                      {activity.difficulty.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 whitespace-nowrap">
                      {activity.activityType}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {activity.subject?.displayName} • {activity.skill?.displayName} • {activity.estimatedMinutes} min
                  </p>
                  <p className="text-sm text-gray-800 line-clamp-2 sm:line-clamp-none">{activity.instructions}</p>
                  {activity.externalUrl && (
                    <a
                      href={activity.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 mt-2"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Resource
                    </a>
                  )}
                </div>
                <div className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 sm:ml-4">
                  <button
                    onClick={() => {
                      setEditingActivity(activity);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded flex-1 sm:flex-none"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this activity?')) {
                        deleteMutation.mutate(activity.id);
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded flex-1 sm:flex-none"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <ActivityModal
          activity={editingActivity}
          subjects={subjects || []}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['activities'] });
          }}
        />
      )}
    </div>
  );
}

function ActivityModal({ activity, subjects, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    subjectId: activity?.subjectId || '',
    skillId: activity?.skillId || '',
    title: activity?.title || '',
    description: activity?.description || '',
    instructions: activity?.instructions || '',
    activityType: activity?.activityType || 'READING',
    difficulty: activity?.difficulty || 'DEVELOPING',
    estimatedMinutes: activity?.estimatedMinutes || 30,
    externalUrl: activity?.externalUrl || '',
  });

  const { data: skills } = useQuery({
    queryKey: ['skills', formData.subjectId],
    queryFn: () => api.getSkills(formData.subjectId),
    enabled: !!formData.subjectId,
  });

  const mutation = useMutation({
    mutationFn: (data: any) =>
      activity ? api.updateActivity(activity.id, data) : api.createActivity(data),
    onSuccess,
  });

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{activity ? 'Edit' : 'Add'} Activity</h2>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value, skillId: '' })}
                className="mt-1 block w-full rounded-md border px-3 py-2"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.displayName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Skill</label>
              <select
                value={formData.skillId}
                onChange={(e) => setFormData({ ...formData, skillId: e.target.value })}
                className="mt-1 block w-full rounded-md border px-3 py-2"
                required
                disabled={!formData.subjectId}
              >
                <option value="">Select Skill</option>
                {skills?.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.displayName}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full rounded-md border px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.activityType}
                onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                className="mt-1 block w-full rounded-md border px-3 py-2"
              >
                {ACTIVITY_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="mt-1 block w-full rounded-md border px-3 py-2"
              >
                {BANDS.map((band) => (
                  <option key={band} value={band}>{band.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Instructions</label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="mt-1 block w-full rounded-md border px-3 py-2"
                rows={4}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Estimated Minutes</label>
              <input
                type="number"
                value={formData.estimatedMinutes}
                onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">External URL (optional)</label>
              <input
                type="url"
                value={formData.externalUrl}
                onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                className="mt-1 block w-full rounded-md border px-3 py-2"
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
              {mutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getBandColor(band: string) {
  switch (band) {
    case 'NEEDS_SUPPORT': return 'bg-red-100 text-red-800';
    case 'DEVELOPING': return 'bg-yellow-100 text-yellow-800';
    case 'SECURE': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

