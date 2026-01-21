'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Plus,
  Sparkles,
  Calendar,
  BookTemplate,
  Users,
  Search,
  Filter,
  Star,
  Share2,
  Edit,
  Trash2,
  Copy,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';

type AssignmentDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED';
type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export default function CustomAssignmentsPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<AssignmentStatus | ''>('');
  const [filterDifficulty, setFilterDifficulty] = useState<AssignmentDifficulty | ''>('');

  // Get current user
  const currentUser = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('admin_user') || '{}')
    : {};

  // Fetch assignments
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['custom-assignments', currentUser.id, filterStatus, searchTerm],
    queryFn: () => api.getCustomAssignments({
      createdById: currentUser.id,
      status: filterStatus || undefined,
      search: searchTerm || undefined,
    }),
  });

  // Fetch shared assignments
  const { data: sharedAssignments = [] } = useQuery({
    queryKey: ['shared-custom-assignments'],
    queryFn: () => api.getSharedCustomAssignments(),
  });

  const stats = {
    total: assignments.length,
    published: assignments.filter((a: any) => a.status === 'PUBLISHED').length,
    drafts: assignments.filter((a: any) => a.status === 'DRAFT').length,
    templates: assignments.filter((a: any) => a.isTemplate).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Custom Assignments</h1>
          <p className="text-gray-600 mt-1">
            Create AI-generated assignments with custom prompts
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/custom-assignments/calendar"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="h-5 w-5" />
            Calendar View
          </Link>
          <Link
            href="/dashboard/custom-assignments/templates"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BookTemplate className="h-5 w-5" />
            Templates
          </Link>
          <Link
            href="/dashboard/custom-assignments/builder"
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Assignment
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Assignments" value={stats.total} icon={Sparkles} color="blue" />
        <StatCard title="Published" value={stats.published} icon={BarChart3} color="green" />
        <StatCard title="Drafts" value={stats.drafts} icon={Edit} color="yellow" />
        <StatCard title="Templates" value={stats.templates} icon={BookTemplate} color="purple" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/custom-assignments/builder"
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">AI Assignment Builder</h3>
              <p className="text-sm text-blue-100">Drag & drop builder with AI</p>
            </div>
            <Sparkles className="h-8 w-8" />
          </div>
        </Link>

        <Link
          href="/dashboard/custom-assignments/batch"
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Batch Assignment</h3>
              <p className="text-sm text-purple-100">Assign to multiple classes</p>
            </div>
            <Users className="h-8 w-8" />
          </div>
        </Link>

        <Link
          href="/dashboard/custom-assignments/templates"
          className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Template Library</h3>
              <p className="text-sm text-green-100">Browse & reuse templates</p>
            </div>
            <BookTemplate className="h-8 w-8" />
          </div>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search assignments..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as AssignmentStatus | '')}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Assignments</h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4">Loading assignments...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No assignments created yet.</p>
            <Link
              href="/dashboard/custom-assignments/builder"
              className="mt-4 inline-block text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Create your first assignment
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {assignments.map((assignment: any) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        )}
      </div>

      {/* Shared Assignments */}
      {sharedAssignments.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Shared With Me
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {sharedAssignments.map((assignment: any) => (
              <AssignmentCard key={assignment.id} assignment={assignment} isShared />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
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

function AssignmentCard({ assignment, isShared = false }: any) {
  const difficultyColors = {
    EASY: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HARD: 'bg-red-100 text-red-800',
    MIXED: 'bg-blue-100 text-blue-800',
  };

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    PUBLISHED: 'bg-green-100 text-green-800',
    ARCHIVED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
            {assignment.isTemplate && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium flex items-center gap-1">
                <Star className="h-3 w-3" />
                Template
              </span>
            )}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[assignment.status as keyof typeof statusColors]}`}>
              {assignment.status}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[assignment.difficulty as keyof typeof difficultyColors]}`}>
              {assignment.difficulty}
            </span>
          </div>

          {assignment.description && (
            <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
          )}

          <div className="flex items-center gap-6 text-sm text-gray-500">
            {assignment.topic && (
              <span>📚 {assignment.topic}</span>
            )}
            {assignment.questionCount && (
              <span>{assignment.questionCount} questions</span>
            )}
            {assignment.duration && (
              <span>⏱️ {assignment.duration} min</span>
            )}
            {assignment._count && (
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {assignment._count.assignedTo} assigned
              </span>
            )}
            {assignment.usageCount > 0 && (
              <span>Used {assignment.usageCount}x</span>
            )}
          </div>

          {assignment.tags && assignment.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {assignment.tags.map((tag: any) => (
                <span
                  key={tag.id}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  #{tag.tag}
                </span>
              ))}
            </div>
          )}

          {isShared && assignment.sharedBy && (
            <div className="mt-2 text-sm text-gray-500">
              Shared by {assignment.sharedBy.firstName} {assignment.sharedBy.lastName}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Link
            href={`/dashboard/custom-assignments/${assignment.id}/stats`}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="View stats"
          >
            <BarChart3 className="h-5 w-5 text-gray-600" />
          </Link>
          <Link
            href={`/dashboard/custom-assignments/${assignment.id}/edit`}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="h-5 w-5 text-gray-600" />
          </Link>
          <button
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Duplicate"
          >
            <Copy className="h-5 w-5 text-gray-600" />
          </button>
          <button
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Share"
          >
            <Share2 className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

