'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import { Plus, Edit, Trash2, BookOpen, Target, X } from 'lucide-react';

export default function CurriculumTopicsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState<any>(null);
  const [filters, setFilters] = useState({
    yearGroupId: '',
    subjectId: '',
    keyStage: '',
  });

  const { data: topics, isLoading } = useQuery({
    queryKey: ['curriculum-topics', filters],
    queryFn: () => api.getCurriculumTopics(filters),
  });

  const { data: years } = useQuery({
    queryKey: ['years'],
    queryFn: () => api.getYears(),
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => api.getSubjects(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteCurriculumTopic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculum-topics'] });
      queryClient.invalidateQueries({ queryKey: ['curriculum-coverage'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading curriculum topics...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Curriculum Topics</h1>
          <p className="text-gray-500 mt-1">Manage curriculum content and learning objectives</p>
        </div>
        <button
          onClick={() => {
            setEditingTopic(null);
            setShowForm(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Topic
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year Group</label>
            <select
              value={filters.yearGroupId}
              onChange={(e) => setFilters({ ...filters, yearGroupId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Year Groups</option>
              {years?.map((year: any) => (
                <option key={year.id} value={year.id}>{year.displayName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={filters.subjectId}
              onChange={(e) => setFilters({ ...filters, subjectId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Subjects</option>
              {subjects?.map((subject: any) => (
                <option key={subject.id} value={subject.id}>
                  {subject.displayName} - {subject.yearGroup?.displayName || 'N/A'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Key Stage</label>
            <select
              value={filters.keyStage}
              onChange={(e) => setFilters({ ...filters, keyStage: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Key Stages</option>
              <option value="KS2">KS2</option>
              <option value="KS3">KS3</option>
              <option value="KS4">KS4</option>
              <option value="KS5">KS5</option>
            </select>
          </div>
        </div>
      </div>

      {/* Topics List */}
      {topics && topics.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {topics.map((topic: any) => (
            <div key={topic.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{topic.topicName}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                    <span>{topic.subject.displayName}</span>
                    <span>•</span>
                    <span>{topic.yearGroup.displayName}</span>
                    <span>•</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">{topic.keyStage}</span>
                  </div>
                  {topic.nationalCurriculumRef && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">NC Ref:</span> {topic.nationalCurriculumRef}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingTopic(topic);
                      setShowForm(true);
                    }}
                    className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this topic?')) {
                        deleteMutation.mutate(topic.id);
                      }
                    }}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Activities Count */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-indigo-500" />
                  <span className="text-gray-700">
                    {topic.supercurriculumActivities.length} activities
                  </span>
                  <span className="text-gray-500">
                    ({topic.supercurriculumActivities.filter((a: any) => a.teacherApproved).length} approved)
                  </span>
                </div>
                {topic.keySkills && topic.keySkills.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>{topic.keySkills.length} key skills</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No topics found</h3>
          <p className="text-gray-500">Start by adding your first curriculum topic</p>
        </div>
      )}

      {/* Topic Form Modal */}
      {showForm && (
        <TopicFormModal
          topic={editingTopic}
          years={years || []}
          subjects={subjects || []}
          onClose={() => {
            setShowForm(false);
            setEditingTopic(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['curriculum-topics'] });
            queryClient.invalidateQueries({ queryKey: ['curriculum-coverage'] });
            setShowForm(false);
            setEditingTopic(null);
          }}
        />
      )}
    </div>
  );
}

// Topic Form Modal Component
function TopicFormModal({ topic, years, subjects, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    topicName: topic?.topicName || '',
    yearGroupId: topic?.yearGroupId || '',
    subjectId: topic?.subjectId || '',
    keyStage: topic?.keyStage || 'KS3',
    nationalCurriculumRef: topic?.nationalCurriculumRef || '',
    coreContent: topic?.coreContent || '',
    extendedContent: topic?.extendedContent || '',
    learningObjectives: topic?.learningObjectives || [],
    keySkills: topic?.keySkills || [],
    priorKnowledge: topic?.priorKnowledge || [],
  });

  const [newObjective, setNewObjective] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newKnowledge, setNewKnowledge] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createCurriculumTopic(data),
    onSuccess: () => onSuccess(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.updateCurriculumTopic(topic.id, data),
    onSuccess: () => onSuccess(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.topicName || !formData.yearGroupId || !formData.subjectId) {
      alert('Please fill in all required fields');
      return;
    }

    if (topic) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      setFormData({
        ...formData,
        learningObjectives: [...formData.learningObjectives, newObjective.trim()],
      });
      setNewObjective('');
    }
  };

  const removeObjective = (index: number) => {
    setFormData({
      ...formData,
      learningObjectives: formData.learningObjectives.filter((_: any, i: number) => i !== index),
    });
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData({
        ...formData,
        keySkills: [...formData.keySkills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData({
      ...formData,
      keySkills: formData.keySkills.filter((_: any, i: number) => i !== index),
    });
  };

  const addKnowledge = () => {
    if (newKnowledge.trim()) {
      setFormData({
        ...formData,
        priorKnowledge: [...formData.priorKnowledge, newKnowledge.trim()],
      });
      setNewKnowledge('');
    }
  };

  const removeKnowledge = (index: number) => {
    setFormData({
      ...formData,
      priorKnowledge: formData.priorKnowledge.filter((_: any, i: number) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {topic ? 'Edit Curriculum Topic' : 'Add New Curriculum Topic'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.topicName}
                onChange={(e) => setFormData({ ...formData, topicName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Photosynthesis"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                National Curriculum Reference
              </label>
              <input
                type="text"
                value={formData.nationalCurriculumRef}
                onChange={(e) => setFormData({ ...formData, nationalCurriculumRef: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., NC-KS3-SCI-02"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year Group <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.yearGroupId}
                onChange={(e) => setFormData({ ...formData, yearGroupId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select Year Group</option>
                {years.map((year: any) => (
                  <option key={year.id} value={year.id}>
                    {year.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((subject: any) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.displayName} - {subject.yearGroup?.displayName || 'N/A'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Stage <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.keyStage}
                onChange={(e) => setFormData({ ...formData, keyStage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="KS2">KS2</option>
                <option value="KS3">KS3</option>
                <option value="KS4">KS4</option>
                <option value="KS5">KS5</option>
              </select>
            </div>
          </div>

          {/* Content Areas */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Core Content
              </label>
              <textarea
                value={formData.coreContent}
                onChange={(e) => setFormData({ ...formData, coreContent: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Essential content that all students must learn..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Extended Content
              </label>
              <textarea
                value={formData.extendedContent}
                onChange={(e) => setFormData({ ...formData, extendedContent: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Additional content for more advanced students..."
              />
            </div>
          </div>

          {/* Learning Objectives */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Learning Objectives
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter a learning objective..."
              />
              <button
                type="button"
                onClick={addObjective}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.learningObjectives.map((objective: string, index: number) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                  <span className="flex-1 text-sm text-gray-700">{objective}</span>
                  <button
                    type="button"
                    onClick={() => removeObjective(index)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Key Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Skills
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter a key skill..."
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.keySkills.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Prior Knowledge */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prior Knowledge Required
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newKnowledge}
                onChange={(e) => setNewKnowledge(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKnowledge())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter prior knowledge requirement..."
              />
              <button
                type="button"
                onClick={addKnowledge}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.priorKnowledge.map((knowledge: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                >
                  {knowledge}
                  <button
                    type="button"
                    onClick={() => removeKnowledge(index)}
                    className="hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            {createMutation.isPending || updateMutation.isPending
              ? 'Saving...'
              : topic
              ? 'Update Topic'
              : 'Create Topic'}
          </button>
        </div>
      </div>
    </div>
  );
}

