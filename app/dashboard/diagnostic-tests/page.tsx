'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  ClipboardList, 
  Plus, 
  Calendar, 
  Users, 
  TrendingUp,
  FileText,
  Filter,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react';
import Link from 'next/link';

type DiagnosticTestStatus = 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
type DiagnosticTestType = 'PRE_TEST' | 'MID_YEAR' | 'POST_TEST' | 'END_OF_YEAR' | 'CUSTOM';

export default function DiagnosticTestsPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<DiagnosticTestStatus | ''>('');
  const [filterYearGroup, setFilterYearGroup] = useState('');

  // Fetch year groups
  const { data: yearGroups = [] } = useQuery({
    queryKey: ['years'],
    queryFn: () => api.getYears(),
  });

  // Fetch diagnostic test schedules
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['diagnostic-test-schedules', filterYearGroup, filterStatus],
    queryFn: () => api.getDiagnosticTestSchedules({
      yearGroupId: filterYearGroup || undefined,
      status: filterStatus || undefined,
    }),
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Diagnostic Test Management</h1>
          <p className="text-gray-600 mt-1">
            Schedule, manage, and analyze diagnostic tests for students
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Schedule New Test
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Schedules"
          value={schedules.length}
          icon={ClipboardList}
          color="blue"
        />
        <StatCard
          title="Active Tests"
          value={schedules.filter((s: any) => s.status === 'ACTIVE').length}
          icon={Clock}
          color="green"
        />
        <StatCard
          title="Completed"
          value={schedules.filter((s: any) => s.status === 'COMPLETED').length}
          icon={CheckCircle2}
          color="purple"
        />
        <StatCard
          title="Avg Completion"
          value={`${Math.round(
            schedules.reduce((sum: number, s: any) => sum + (s.statistics?.completionRate || 0), 0) / 
            (schedules.length || 1)
          )}%`}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/diagnostic-tests/analytics"
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">View Analytics</h3>
              <p className="text-sm text-blue-100">Detailed test results & insights</p>
            </div>
            <BarChart3 className="h-8 w-8" />
          </div>
        </Link>

        <Link
          href="/dashboard/diagnostic-tests/skill-gaps"
          className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Skill Gap Analysis</h3>
              <p className="text-sm text-orange-100">Identify areas needing support</p>
            </div>
            <AlertCircle className="h-8 w-8" />
          </div>
        </Link>

        <Link
          href="/dashboard/diagnostic-tests/comparisons"
          className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Pre/Post Comparison</h3>
              <p className="text-sm text-green-100">Track student improvements</p>
            </div>
            <TrendingUp className="h-8 w-8" />
          </div>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={filterYearGroup}
              onChange={(e) => setFilterYearGroup(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">All Year Groups</option>
              {yearGroups.map((year: any) => (
                <option key={year.id} value={year.id}>
                  {year.displayName}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as DiagnosticTestStatus | '')}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schedules List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Scheduled Tests</h2>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4">Loading diagnostic tests...</p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No diagnostic tests scheduled yet.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Schedule your first test
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {schedules.map((schedule: any) => (
              <ScheduleCard key={schedule.id} schedule={schedule} />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateScheduleModal
          onClose={() => setShowCreateModal(false)}
          yearGroups={yearGroups}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function ScheduleCard({ schedule }: any) {
  const statusColors = {
    SCHEDULED: 'bg-blue-100 text-blue-800',
    ACTIVE: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  const testTypeLabels = {
    PRE_TEST: 'Pre-Test',
    MID_YEAR: 'Mid-Year',
    POST_TEST: 'Post-Test',
    END_OF_YEAR: 'End of Year',
    CUSTOM: 'Custom',
  };

  return (
    <Link
      href={`/dashboard/diagnostic-tests/${schedule.id}`}
      className="p-6 hover:bg-gray-50 transition-colors block"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{schedule.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[schedule.status as keyof typeof statusColors]}`}>
              {schedule.status}
            </span>
            <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
              {testTypeLabels[schedule.testType as keyof typeof testTypeLabels]}
            </span>
          </div>

          {schedule.description && (
            <p className="text-sm text-gray-600 mb-3">{schedule.description}</p>
          )}

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(schedule.startDate).toLocaleDateString()} - {new Date(schedule.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{schedule.statistics?.uniqueStudents || 0} students</span>
            </div>
            <div className="flex items-center gap-1">
              <ClipboardList className="h-4 w-4" />
              <span>
                {schedule.statistics?.completedAssignments || 0}/{schedule.statistics?.totalAssignments || 0} completed
              </span>
            </div>
          </div>

          {schedule.statistics && (
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${schedule.statistics.completionRate}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {schedule.statistics.completionRate}%
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="text-right">
          <span className="text-sm text-gray-500">
            {schedule.yearGroup?.displayName}
          </span>
        </div>
      </div>
    </Link>
  );
}

function CreateScheduleModal({ onClose, yearGroups }: any) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    testType: 'CUSTOM' as DiagnosticTestType,
    yearGroupId: '',
    classIds: [] as string[],
    startDate: '',
    endDate: '',
  });

  const [selectedYearGroup, setSelectedYearGroup] = useState('');

  // Fetch classes for selected year group
  const { data: classes = [] } = useQuery({
    queryKey: ['classes', selectedYearGroup],
    queryFn: () => api.getClasses({ yearGroupId: selectedYearGroup }),
    enabled: !!selectedYearGroup,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createDiagnosticTestSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnostic-test-schedules'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Schedule Diagnostic Test</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form id="diagnostic-schedule-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="e.g., Year 7 Mid-Year Assessment"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              rows={3}
              placeholder="Optional description..."
            />
          </div>

          {/* Test Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Type *
            </label>
            <select
              value={formData.testType}
              onChange={(e) => setFormData({ ...formData, testType: e.target.value as DiagnosticTestType })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              required
            >
              <option value="PRE_TEST">Pre-Test</option>
              <option value="MID_YEAR">Mid-Year</option>
              <option value="POST_TEST">Post-Test</option>
              <option value="END_OF_YEAR">End of Year</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>

          {/* Year Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year Group *
            </label>
            <select
              value={selectedYearGroup}
              onChange={(e) => {
                setSelectedYearGroup(e.target.value);
                setFormData({ ...formData, yearGroupId: e.target.value, classIds: [] });
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              required
            >
              <option value="">Select year group...</option>
              {yearGroups.map((year: any) => (
                <option key={year.id} value={year.id}>
                  {year.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Classes */}
          {selectedYearGroup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classes *
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                {classes.length === 0 ? (
                  <p className="text-sm text-gray-500">No classes found for this year group</p>
                ) : (
                  <div className="space-y-2">
                    {classes.map((cls: any) => (
                      <label key={cls.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.classIds.includes(cls.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                classIds: [...formData.classIds, cls.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                classIds: formData.classIds.filter(id => id !== cls.id),
                              });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{cls.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                required
              />
            </div>
          </div>

        </form>

        {/* Fixed Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          {createMutation.isError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
              <p className="text-sm text-red-600">
                Error: {(createMutation.error as any)?.response?.data?.message || 'Failed to schedule test'}
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="diagnostic-schedule-form"
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Scheduling...' : 'Schedule Test'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

