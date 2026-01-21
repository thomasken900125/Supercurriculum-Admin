'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface MiniAssessment {
  id: string;
  interventionAssignmentId?: string;
  studentId: string;
  teacherId?: string;
  skillGapId?: string;
  title: string;
  description?: string;
  targetSkillId: string;
  targetSubjectId: string;
  questions: any[];
  totalQuestions: number;
  passingScore: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'PASSED' | 'FAILED';
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  studentAnswers?: any;
  score?: number;
  passed: boolean;
  feedback?: string;
  timeSpent: number;
  attemptsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface MiniAssessmentManagerProps {
  interventionAssignmentId?: string;
  skillGapId?: string;
  studentId?: string;
}

export default function MiniAssessmentManager({
  interventionAssignmentId,
  skillGapId,
  studentId,
}: MiniAssessmentManagerProps) {
  const [assessments, setAssessments] = useState<MiniAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<MiniAssessment | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Form state for creating assessment
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetSkillId: '',
    targetSubjectId: '',
    passingScore: 70,
    questions: [] as any[],
  });

  useEffect(() => {
    fetchAssessments();
  }, [interventionAssignmentId, skillGapId, studentId]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (interventionAssignmentId) filters.interventionAssignmentId = interventionAssignmentId;
      if (skillGapId) filters.skillGapId = skillGapId;
      if (studentId) filters.studentId = studentId;

      const data = await api.getMiniAssessments(filters);
      setAssessments(data);
    } catch (error) {
      console.error('Error fetching mini-assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAssessment = async () => {
    if (!skillGapId) return;
    
    try {
      await api.generateMiniAssessmentFromGap(skillGapId);
      setShowGenerateModal(false);
      fetchAssessments();
    } catch (error) {
      console.error('Error generating assessment:', error);
    }
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createMiniAssessment({
        interventionAssignmentId,
        studentId: studentId || '',
        skillGapId,
        ...formData,
        totalQuestions: formData.questions.length,
      });
      setShowCreateModal(false);
      fetchAssessments();
    } catch (error) {
      console.error('Error creating assessment:', error);
    }
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    if (!confirm('Are you sure you want to delete this assessment?')) return;
    
    try {
      await api.deleteMiniAssessment(assessmentId);
      fetchAssessments();
    } catch (error) {
      console.error('Error deleting assessment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASSED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'PENDING':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASSED':
        return '✅';
      case 'FAILED':
        return '❌';
      case 'IN_PROGRESS':
        return '⏳';
      case 'COMPLETED':
        return '✔️';
      case 'PENDING':
        return '⏸️';
      default:
        return '❓';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">Mini-Assessments</h3>
          <p className="text-sm text-gray-600">
            Verify gap closure with targeted assessments
          </p>
        </div>
        <div className="flex gap-2">
          {skillGapId && (
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              🤖 Auto-Generate
            </button>
          )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Create Assessment
          </button>
        </div>
      </div>

      {/* Assessments List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessments...</p>
        </div>
      ) : assessments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
          <p className="text-gray-500 mb-4">No mini-assessments found</p>
          <p className="text-sm text-gray-400">
            Create an assessment to verify gap closure
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assessments.map((assessment) => (
            <div
              key={assessment.id}
              className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{assessment.title}</h4>
                  {assessment.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {assessment.description}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    assessment.status
                  )}`}
                >
                  {getStatusIcon(assessment.status)} {assessment.status}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Questions:</span>
                  <span className="font-medium">{assessment.totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Passing Score:</span>
                  <span className="font-medium">{assessment.passingScore}%</span>
                </div>
                {assessment.score !== null && assessment.score !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Student Score:</span>
                    <span
                      className={`font-medium ${
                        assessment.passed ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {assessment.score.toFixed(1)}%
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Attempts:</span>
                  <span className="font-medium">{assessment.attemptsCount}</span>
                </div>
              </div>

              {assessment.feedback && (
                <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-gray-700">
                  <p className="font-medium text-blue-800 mb-1">Feedback:</p>
                  <p>{assessment.feedback}</p>
                </div>
              )}

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <button
                  onClick={() => setSelectedAssessment(assessment)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDeleteAssessment(assessment.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Created: {new Date(assessment.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Generate Assessment Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Generate Mini-Assessment</h3>
            <p className="text-gray-600 mb-6">
              Our AI will automatically generate a mini-assessment based on the skill gap
              identified for this student. The assessment will include 4 questions designed
              to verify gap closure.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateAssessment}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Assessment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
            <h3 className="text-xl font-bold mb-4">Create Mini-Assessment</h3>
            <form onSubmit={handleCreateAssessment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Fractions Gap Verification"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the assessment..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passing Score (%) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passingScore}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      passingScore: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> For this demo, you would add questions here.
                  In production, this would integrate with a question builder or use the
                  AI-powered generation feature.
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assessment Details Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{selectedAssessment.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedAssessment.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedAssessment(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      selectedAssessment.status
                    )}`}
                  >
                    {getStatusIcon(selectedAssessment.status)} {selectedAssessment.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Attempts</p>
                  <p className="text-gray-900 mt-1">{selectedAssessment.attemptsCount}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Total Questions</p>
                  <p className="text-gray-900 mt-1">{selectedAssessment.totalQuestions}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Passing Score</p>
                  <p className="text-gray-900 mt-1">{selectedAssessment.passingScore}%</p>
                </div>
              </div>

              {selectedAssessment.score !== null && selectedAssessment.score !== undefined && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Student Score</p>
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className={`text-2xl font-bold ${
                          selectedAssessment.passed ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {selectedAssessment.score.toFixed(1)}%
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedAssessment.passed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {selectedAssessment.passed ? '✅ Passed' : '❌ Failed'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          selectedAssessment.passed ? 'bg-green-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${selectedAssessment.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedAssessment.feedback && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Feedback</p>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-gray-800">{selectedAssessment.feedback}</p>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500 space-y-1 pt-4 border-t">
                <p>Created: {new Date(selectedAssessment.createdAt).toLocaleString()}</p>
                {selectedAssessment.startedAt && (
                  <p>Started: {new Date(selectedAssessment.startedAt).toLocaleString()}</p>
                )}
                {selectedAssessment.completedAt && (
                  <p>Completed: {new Date(selectedAssessment.completedAt).toLocaleString()}</p>
                )}
                {selectedAssessment.timeSpent > 0 && (
                  <p>Time Spent: {selectedAssessment.timeSpent} minutes</p>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedAssessment(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

