'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function TestsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: tests, isLoading } = useQuery({
    queryKey: ['feedback-tests'],
    queryFn: () => api.getFeedbackTests(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteFeedbackTest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-tests'] });
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feedback Tests</h1>
          <p className="text-gray-600 mt-1">Manage self-assessment tests for students</p>
        </div>
        <button
          onClick={() => {
            setEditingTest(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Test
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : tests?.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No feedback tests yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tests?.map((test: any) => (
            <div key={test.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{test.title}</h3>
                  <p className="text-sm text-gray-600">
                    {test.subject?.displayName} • {test.skill?.displayName}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingTest(test);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this test?')) {
                        deleteMutation.mutate(test.id);
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-2">{test.questions?.length} Questions:</p>
                <ul className="list-disc list-inside space-y-1">
                  {test.questions?.slice(0, 2).map((q: any, idx: number) => (
                    <li key={idx} className="text-xs text-gray-600">{q.statement}</li>
                  ))}
                  {test.questions?.length > 2 && (
                    <li className="text-xs text-gray-400">+ {test.questions.length - 2} more...</li>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4">
            <h2 className="text-xl font-bold mb-4">Create Feedback Test</h2>
            <p className="text-gray-600 mb-4">
              For full test creation, use the Swagger API or Prisma Studio.
              This feature requires a more complex form with dynamic question management.
            </p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

