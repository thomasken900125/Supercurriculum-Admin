'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Edit, Trash2 } from 'lucide-react';

const BANDS = ['NEEDS_SUPPORT', 'DEVELOPING', 'SECURE'];

export default function InterventionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIntervention, setEditingIntervention] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: interventions, isLoading } = useQuery({
    queryKey: ['interventions'],
    queryFn: () => api.getInterventions(),
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => api.getSubjects(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteIntervention(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
    },
  });

  // Group interventions by subject
  const groupedInterventions = interventions?.reduce((acc: any, intervention: any) => {
    const key = intervention.subject?.displayName || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(intervention);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Intervention Frameworks</h1>
          <p className="text-gray-600 mt-1">Define expected outcomes for each skill level</p>
        </div>
        <button
          onClick={() => {
            setEditingIntervention(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Intervention
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedInterventions || {}).map(([subject, items]: [string, any]) => (
            <div key={subject} className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">{subject}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(items as any[]).map((intervention: any) => (
                  <div
                    key={intervention.id}
                    className={`border-2 rounded-lg p-4 ${getBandBorder(intervention.band)}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getBandColor(intervention.band)}`}>
                        {intervention.band.replace('_', ' ')}
                      </span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => {
                            setEditingIntervention(intervention);
                            setIsModalOpen(true);
                          }}
                          className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this intervention?')) {
                              deleteMutation.mutate(intervention.id);
                            }
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-gray-500 mb-2">{intervention.skill?.displayName}</p>
                    <p className="text-sm text-gray-800 mb-2">{intervention.description}</p>
                    <p className="text-xs text-gray-600">
                      <strong>Expected:</strong> {intervention.expectedOutcome}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <InterventionModal
          intervention={editingIntervention}
          subjects={subjects || []}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['interventions'] });
          }}
        />
      )}
    </div>
  );
}

function InterventionModal({ intervention, subjects, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    subjectId: intervention?.subjectId || '',
    skillId: intervention?.skillId || '',
    band: intervention?.band || 'DEVELOPING',
    description: intervention?.description || '',
    taskGuidance: intervention?.taskGuidance || '',
    expectedOutcome: intervention?.expectedOutcome || '',
  });

  const { data: skills } = useQuery({
    queryKey: ['skills', formData.subjectId],
    queryFn: () => api.getSkills(formData.subjectId),
    enabled: !!formData.subjectId,
  });

  const mutation = useMutation({
    mutationFn: (data: any) =>
      intervention ? api.updateIntervention(intervention.id, data) : api.createIntervention(data),
    onSuccess,
  });

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4">
        <h2 className="text-xl font-bold mb-4">{intervention ? 'Edit' : 'Add'} Intervention</h2>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Band Level</label>
              <select
                value={formData.band}
                onChange={(e) => setFormData({ ...formData, band: e.target.value })}
                className="mt-1 block w-full rounded-md border px-3 py-2"
              >
                {BANDS.map((band) => (
                  <option key={band} value={band}>{band.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border px-3 py-2"
                rows={2}
                placeholder="What type of task should students do..."
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Task Guidance</label>
              <textarea
                value={formData.taskGuidance}
                onChange={(e) => setFormData({ ...formData, taskGuidance: e.target.value })}
                className="mt-1 block w-full rounded-md border px-3 py-2"
                rows={3}
                placeholder="How students should approach the task..."
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Expected Outcome</label>
              <textarea
                value={formData.expectedOutcome}
                onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
                className="mt-1 block w-full rounded-md border px-3 py-2"
                rows={2}
                placeholder="What we expect students to achieve..."
                required
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

function getBandBorder(band: string) {
  switch (band) {
    case 'NEEDS_SUPPORT': return 'border-red-300';
    case 'DEVELOPING': return 'border-yellow-300';
    case 'SECURE': return 'border-green-300';
    default: return 'border-gray-300';
  }
}

