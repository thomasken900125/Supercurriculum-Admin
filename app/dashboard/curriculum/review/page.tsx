'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Target, BookOpen, Award, CheckSquare, Square, Loader2 } from 'lucide-react';

export default function ActivityReviewPage() {
  const queryClient = useQueryClient();
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: activities, isLoading } = useQuery({
    queryKey: ['pending-activities'],
    queryFn: () => api.getPendingActivities(),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.approveActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-activities'] });
      queryClient.invalidateQueries({ queryKey: ['curriculum-coverage'] });
      setSelectedActivity(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.rejectActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-activities'] });
      queryClient.invalidateQueries({ queryKey: ['curriculum-coverage'] });
      setSelectedActivity(null);
    },
  });

  const bulkApproveMutation = useMutation({
    mutationFn: (ids: string[]) => api.bulkApproveActivities(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-activities'] });
      queryClient.invalidateQueries({ queryKey: ['curriculum-coverage'] });
      setSelectedIds(new Set());
      setSelectedActivity(null);
    },
  });

  const bulkRejectMutation = useMutation({
    mutationFn: (ids: string[]) => api.bulkRejectActivities(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-activities'] });
      queryClient.invalidateQueries({ queryKey: ['curriculum-coverage'] });
      setSelectedIds(new Set());
      setSelectedActivity(null);
    },
  });

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const selectAll = () => {
    if (activities) {
      setSelectedIds(new Set(activities.map((a: any) => a.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBulkApprove = () => {
    if (selectedIds.size > 0) {
      bulkApproveMutation.mutate(Array.from(selectedIds));
    }
  };

  const handleBulkReject = () => {
    if (selectedIds.size > 0 && confirm(`Are you sure you want to reject ${selectedIds.size} activities? This cannot be undone.`)) {
      bulkRejectMutation.mutate(Array.from(selectedIds));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading activities...</div>
      </div>
    );
  }

  const isBulkLoading = bulkApproveMutation.isPending || bulkRejectMutation.isPending;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Activity Review Queue</h1>
        <p className="text-gray-500 mt-1">Review and approve AI-generated supercurriculum activities</p>
      </div>

      {/* Summary */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-yellow-800">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-semibold">{activities?.length || 0} activities pending review</span>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {activities && activities.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={selectedIds.size === activities.length ? clearSelection : selectAll}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                {selectedIds.size === activities.length ? (
                  <CheckSquare className="h-4 w-4 text-indigo-600" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                {selectedIds.size === activities.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedIds.size > 0 && (
                <span className="text-sm text-gray-600 bg-indigo-100 px-2 py-1 rounded-full">
                  {selectedIds.size} selected
                </span>
              )}
            </div>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleBulkApprove}
                disabled={isBulkLoading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors text-sm"
              >
                {bulkApproveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Approve Selected ({selectedIds.size})
              </button>
              <button
                onClick={handleBulkReject}
                disabled={isBulkLoading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors text-sm"
              >
                {bulkRejectMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Reject Selected ({selectedIds.size})
              </button>
              <button
                onClick={clearSelection}
                disabled={isBulkLoading}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {activities && activities.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of Activities */}
          <div className="lg:col-span-1 space-y-3 max-h-[800px] overflow-y-auto">
            {activities.map((activity: any) => (
              <div
                key={activity.id}
                className={`relative border rounded-lg p-4 transition-all ${
                  selectedActivity?.id === activity.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : selectedIds.has(activity.id)
                    ? 'border-indigo-300 bg-indigo-25'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelection(activity.id);
                  }}
                  className="absolute top-3 left-3 p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  {selectedIds.has(activity.id) ? (
                    <CheckSquare className="h-5 w-5 text-indigo-600" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                {/* Activity Content */}
                <button
                  onClick={() => setSelectedActivity(activity)}
                  className="w-full text-left pl-8"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-gray-900 flex-1 pr-2">{activity.title}</div>
                    <AlignmentBadge score={activity.curriculumAlignment} />
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    {activity.curriculumTopic.subject.displayName} • {activity.curriculumTopic.yearGroup.displayName}
                  </div>
                  <div className="text-xs text-gray-400">
                    {activity.curriculumTopic.topicName}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className={`px-2 py-1 rounded ${
                      activity.extensionLevel === 'BEYOND_CURRICULUM'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {activity.extensionLevel === 'BEYOND_CURRICULUM' ? 'Advanced' : 'Enrichment'}
                    </span>
                    <span className="text-gray-500">by {activity.generatedBy.replace('_', ' ')}</span>
                  </div>
                </button>
              </div>
            ))}
          </div>

          {/* Activity Detail */}
          <div className="lg:col-span-2">
            {selectedActivity ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedActivity.title}</h2>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{selectedActivity.curriculumTopic.subject.displayName}</span>
                        <span>•</span>
                        <span>{selectedActivity.curriculumTopic.yearGroup.displayName}</span>
                        <span>•</span>
                        <span>{selectedActivity.curriculumTopic.keyStage}</span>
                      </div>
                    </div>
                    <AlignmentBadge score={selectedActivity.curriculumAlignment} large />
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                      <BookOpen className="h-4 w-4" />
                      <span className="font-semibold">Curriculum Topic:</span>
                    </div>
                    <div className="text-gray-900">{selectedActivity.curriculumTopic.topicName}</div>
                  </div>
                </div>

                {/* Description */}
                {selectedActivity.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedActivity.description}</p>
                  </div>
                )}

                {/* Instructions */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedActivity.instructions}</p>
                  </div>
                </div>

                {/* Success Criteria */}
                {selectedActivity.successCriteria && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Success Criteria
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedActivity.successCriteria}</p>
                  </div>
                )}

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Extension Level</div>
                    <div className="font-medium text-gray-900">
                      {selectedActivity.extensionLevel === 'BEYOND_CURRICULUM' ? 'Beyond Curriculum' : 'Enrichment'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Generated By</div>
                    <div className="font-medium text-gray-900">
                      {selectedActivity.generatedBy.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => approveMutation.mutate(selectedActivity.id)}
                    disabled={approveMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle className="h-5 w-5" />
                    {approveMutation.isPending ? 'Approving...' : 'Approve Activity'}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to reject this activity? This cannot be undone.')) {
                        rejectMutation.mutate(selectedActivity.id);
                      }
                    }}
                    disabled={rejectMutation.isPending}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <XCircle className="h-5 w-5" />
                    {rejectMutation.isPending ? 'Rejecting...' : 'Reject Activity'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Select an activity to review</p>
                <p className="text-gray-400 text-sm">Or use the checkboxes to select multiple activities for bulk approval</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-500">No activities pending review at this time.</p>
        </div>
      )}
    </div>
  );
}

function AlignmentBadge({ score, large }: { score: number; large?: boolean }) {
  const getColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 75) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className={`${getColor(score)} ${large ? 'px-4 py-2 text-lg' : 'px-2 py-1 text-xs'} rounded-full border font-semibold whitespace-nowrap`}>
      {score}% aligned
    </div>
  );
}
