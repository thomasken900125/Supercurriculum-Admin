'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Plus,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  ArrowLeft,
  Calendar,
  User,
} from 'lucide-react';

interface AssignmentsProps {
  filters: {
    classId?: string;
    subjectId?: string;
    yearGroupId?: string;
  };
}

const PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'bg-blue-100 text-blue-800' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

const STATUSES = [
  { value: 'PENDING', label: 'Pending', icon: Clock, color: 'text-gray-600' },
  { value: 'IN_PROGRESS', label: 'In Progress', icon: TrendingUp, color: 'text-blue-600' },
  { value: 'COMPLETED', label: 'Completed', icon: CheckCircle, color: 'text-green-600' },
  { value: 'FAILED', label: 'Failed', icon: XCircle, color: 'text-red-600' },
  { value: 'ESCALATED', label: 'Escalated', icon: AlertCircle, color: 'text-orange-600' },
];

export default function InterventionAssignments({ filters }: AssignmentsProps) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showBackfillModal, setShowBackfillModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const queryClient = useQueryClient();

  // Fetch assignments
  const { data: assignments, isLoading, error } = useQuery({
    queryKey: ['intervention-assignments', filters, statusFilter, priorityFilter],
    queryFn: async () => {
      const response = await api.getInterventionAssignments({
        status: statusFilter ? (statusFilter as any) : undefined,
        priority: priorityFilter ? (priorityFilter as any) : undefined,
      });
      return response;
    },
  });

  // Ensure assignments is always an array
  const assignmentsList = Array.isArray(assignments) ? assignments : [];

  if (selectedAssignment) {
    return (
      <AssignmentDetail
        assignment={selectedAssignment}
        onBack={() => setSelectedAssignment(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">Error loading assignments. Please try again.</p>
        <p className="text-sm text-red-500 mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowBackfillModal(true)}
            className="inline-flex items-center px-4 py-2 border border-indigo-600 rounded-md text-sm font-medium text-indigo-600 hover:bg-indigo-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Assign Backfill
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Intervention
          </button>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignmentsList.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No intervention assignments found. Create one to get started!
                </td>
              </tr>
            ) : null}
            {assignmentsList.map((assignment: any) => {
              const status = STATUSES.find((s) => s.value === assignment.status);
              const priority = PRIORITIES.find((p) => p.value === assignment.priority);
              const StatusIcon = status?.icon || Clock;

              return (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {assignment.studentId}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{assignment.title}</div>
                    {assignment.targetYearGroupId && (
                      <div className="text-xs text-blue-600">
                        Backfill from earlier year
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${priority?.color}`}>
                      {priority?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center ${status?.color}`}>
                      <StatusIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm">{status?.label}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {assignment.progressLogs?.length || 0} /{' '}
                      {assignment.microLessons?.length || 5} lessons
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-green-600 h-1.5 rounded-full"
                        style={{
                          width: `${
                            ((assignment.progressLogs?.length || 0) /
                              (assignment.microLessons?.length || 5)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.dueDate
                      ? new Date(assignment.dueDate).toLocaleDateString()
                      : 'No deadline'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedAssignment(assignment)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAssignModal && (
        <AssignInterventionModal
          onClose={() => setShowAssignModal(false)}
          onSuccess={() => {
            setShowAssignModal(false);
            queryClient.invalidateQueries({ queryKey: ['intervention-assignments'] });
          }}
        />
      )}

      {showBackfillModal && (
        <BackfillModal
          onClose={() => setShowBackfillModal(false)}
          onSuccess={() => {
            setShowBackfillModal(false);
            queryClient.invalidateQueries({ queryKey: ['intervention-assignments'] });
          }}
        />
      )}
    </div>
  );
}

function AssignmentDetail({ assignment, onBack }: any) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/interventions/management/assignments/${assignment.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(data),
        }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intervention-assignments'] });
    },
  });

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center text-indigo-600 hover:text-indigo-700"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Assignments
      </button>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{assignment.title}</h2>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-lg font-medium">{assignment.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Priority</p>
            <p className="text-lg font-medium">{assignment.priority}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Assigned Date</p>
            <p className="text-lg">
              {new Date(assignment.assignedAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Due Date</p>
            <p className="text-lg">
              {assignment.dueDate
                ? new Date(assignment.dueDate).toLocaleDateString()
                : 'No deadline'}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-2">Description</h3>
          <p className="text-gray-700">{assignment.description}</p>
        </div>

        {assignment.preScore !== null && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Pre-Score</p>
              <p className="text-2xl font-bold">{assignment.preScore}%</p>
            </div>
            {assignment.postScore !== null && (
              <>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Post-Score</p>
                  <p className="text-2xl font-bold text-green-600">
                    {assignment.postScore}%
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Improvement</p>
                  <p className="text-2xl font-bold text-blue-600">
                    +{assignment.improvementPercentage?.toFixed(1)}%
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-medium mb-3">Progress Logs</h3>
          <div className="space-y-2">
            {assignment.progressLogs?.map((log: any) => (
              <div key={log.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{log.activityCompleted || 'Activity'}</p>
                    {log.notes && <p className="text-sm text-gray-600 mt-1">{log.notes}</p>}
                  </div>
                  <div className="text-right">
                    {log.score && (
                      <p className="font-medium text-lg">{log.score}%</p>
                    )}
                    <p className="text-sm text-gray-500">{log.timeSpent} min</p>
                  </div>
                </div>
                <div className="mt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      log.wasSuccessful
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {log.wasSuccessful ? 'Successful' : 'Needs Improvement'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() =>
              updateMutation.mutate({ status: 'IN_PROGRESS' })
            }
            disabled={assignment.status === 'IN_PROGRESS'}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Start Intervention
          </button>
          <button
            onClick={() =>
              updateMutation.mutate({ status: 'COMPLETED' })
            }
            disabled={assignment.status === 'COMPLETED'}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Mark Complete
          </button>
        </div>
      </div>
    </div>
  );
}

function AssignInterventionModal({ onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    studentId: '',
    teacherId: '',
    title: '',
    description: '',
    targetSubjectId: '',
    targetSkillId: '',
    priority: 'MEDIUM',
    dueDate: '',
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/interventions/management/assignments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(data),
        }
      );
      return response.json();
    },
    onSuccess,
  });

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Assign New Intervention</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(formData);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              rows={3}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BackfillModal({ onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    studentId: '',
    teacherId: '',
    targetYearGroupId: '',
    subjectId: '',
    skillId: '',
    reason: '',
    priority: 'HIGH',
    dueDate: '',
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/interventions/management/assignments/backfill`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(data),
        }
      );
      return response.json();
    },
    onSuccess,
  });

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4">
        <h2 className="text-xl font-bold mb-4">Assign Backfill Intervention</h2>
        <p className="text-sm text-gray-600 mb-4">
          Assign content from an earlier year group to address foundational gaps
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(formData);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Target Year Group (earlier year)
            </label>
            <select
              value={formData.targetYearGroupId}
              onChange={(e) =>
                setFormData({ ...formData, targetYearGroupId: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            >
              <option value="">Select Year Group</option>
              {/* Add year group options */}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Reason for Backfill</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              rows={3}
              placeholder="e.g., Student struggles with fractions, need to reinforce Year 6 concepts"
              required
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'Assigning...' : 'Assign Backfill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

