'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Search,
  Filter,
  Eye,
  Send,
  BookOpen,
  Users,
  UserPlus,
  Calendar,
  Clock,
  Tag,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Star,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

export default function ActivityLibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYearGroup, setSelectedYearGroup] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedActivityType, setSelectedActivityType] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const queryClient = useQueryClient();

  // Fetch data
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities', selectedYearGroup, selectedSubject, selectedActivityType, searchTerm],
    queryFn: () => api.getActivities({
      yearGroupId: selectedYearGroup || undefined,
      subjectId: selectedSubject || undefined,
      activityType: selectedActivityType || undefined,
      search: searchTerm || undefined,
    }),
  });

  const { data: yearGroups } = useQuery({
    queryKey: ['years'],
    queryFn: () => api.getYears(),
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => api.getSubjects(),
  });

  const activityTypes = [
    'READING',
    'WRITING',
    'LISTENING',
    'WATCHING',
    'RESEARCHING',
    'STUDENT_LED',
    'CREATIVE',
    'QUICK_QUIZ',
    'SCAFFOLDED_EXERCISE',
    'SUPERCURRICULUM_PROJECT',
    'EXAM_STYLE',
    'RETRIEVAL_PRACTICE',
    'INTERLEAVED_PRACTICE',
  ];

  const handlePreview = (activity: any) => {
    setSelectedActivity(activity);
    setShowPreviewModal(true);
  };

  const handleAssign = (activity: any) => {
    setSelectedActivity(activity);
    setShowAssignModal(true);
  };

  const filteredActivities = activities?.filter((activity: any) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        activity.title?.toLowerCase().includes(search) ||
        activity.description?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Activity Library</h1>
        <p className="text-gray-600 mt-1">
          Browse and assign pre-built supercurriculum activities
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="inline h-4 w-4 mr-1" />
              Search Activities
            </label>
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Year Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year Level
            </label>
            <select
              value={selectedYearGroup}
              onChange={(e) => setSelectedYearGroup(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Years (5-13)</option>
              {yearGroups
                ?.filter((year: any) => {
                  const yearNum = parseInt(year.name.replace('year_', ''));
                  return yearNum >= 5 && yearNum <= 13;
                })
                .map((year: any) => (
                  <option key={year.id} value={year.id}>
                    {year.displayName}
                  </option>
                ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
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

          {/* Activity Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Type
            </label>
            <select
              value={selectedActivityType}
              onChange={(e) => setSelectedActivityType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              {activityTypes.map((type) => (
                <option key={type} value={type}>
                  {formatActivityType(type)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedYearGroup || selectedSubject || selectedActivityType || searchTerm) && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Active Filters:</span>
            {selectedYearGroup && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full flex items-center gap-1">
                Year: {yearGroups?.find((y: any) => y.id === selectedYearGroup)?.displayName}
                <button onClick={() => setSelectedYearGroup('')} className="hover:text-indigo-900">×</button>
              </span>
            )}
            {selectedSubject && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
                Subject: {subjects?.find((s: any) => s.id === selectedSubject)?.displayName}
                <button onClick={() => setSelectedSubject('')} className="hover:text-blue-900">×</button>
              </span>
            )}
            {selectedActivityType && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center gap-1">
                Type: {formatActivityType(selectedActivityType)}
                <button onClick={() => setSelectedActivityType('')} className="hover:text-purple-900">×</button>
              </span>
            )}
            {searchTerm && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="hover:text-green-900">×</button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedYearGroup('');
                setSelectedSubject('');
                setSelectedActivityType('');
                setSearchTerm('');
              }}
              className="text-xs text-gray-600 hover:text-gray-900 underline"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {isLoading ? 'Loading...' : `${filteredActivities?.length || 0} activities found`}
        </p>
      </div>

      {/* Activity Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredActivities && filteredActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity: any) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onPreview={handlePreview}
              onAssign={handleAssign}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
          <p className="text-gray-600">
            Try adjusting your filters or search term
          </p>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedActivity && (
        <PreviewModal
          activity={selectedActivity}
          onClose={() => {
            setShowPreviewModal(false);
            setSelectedActivity(null);
          }}
          onAssign={() => {
            setShowPreviewModal(false);
            setShowAssignModal(true);
          }}
        />
      )}

      {/* Assignment Modal */}
      {showAssignModal && selectedActivity && (
        <AssignmentModal
          activity={selectedActivity}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedActivity(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
            setShowAssignModal(false);
            setSelectedActivity(null);
          }}
        />
      )}
    </div>
  );
}

function ActivityCard({ activity, onPreview, onAssign }: {
  activity: any;
  onPreview: (activity: any) => void;
  onAssign: (activity: any) => void;
}) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'SECURE': return 'bg-green-100 text-green-800';
      case 'DEVELOPING': return 'bg-yellow-100 text-yellow-800';
      case 'NEEDS_SUPPORT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'READING': return '📖';
      case 'WRITING': return '✍️';
      case 'LISTENING': return '🎧';
      case 'WATCHING': return '📺';
      case 'RESEARCHING': return '🔍';
      case 'STUDENT_LED': return '👨‍🎓';
      case 'CREATIVE': return '🎨';
      case 'QUICK_QUIZ': return '❓';
      default: return '📝';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getActivityTypeIcon(activity.activityType)}</span>
          <div>
            <span className="text-xs text-gray-500">
              {activity.subject?.displayName || 'N/A'} • {activity.skill?.displayName || 'N/A'}
            </span>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
          {activity.difficulty?.replace('_', ' ')}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {activity.title}
      </h3>

      {/* Description */}
      {activity.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {activity.description}
        </p>
      )}

      {/* Meta Info */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {activity.estimatedMinutes || 0} min
        </span>
        <span className="flex items-center gap-1">
          <Tag className="h-3 w-3" />
          {formatActivityType(activity.activityType)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onPreview(activity)}
          className="flex-1 px-4 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
        <button
          onClick={() => onAssign(activity)}
          className="flex-1 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          <Send className="h-4 w-4" />
          Assign
        </button>
      </div>
    </div>
  );
}

function PreviewModal({ activity, onClose, onAssign }: {
  activity: any;
  onClose: () => void;
  onAssign: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Activity Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title & Meta */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activity.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                {activity.subject?.displayName || 'N/A'}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                {activity.skill?.displayName || 'N/A'}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {formatActivityType(activity.activityType)}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                <Clock className="inline h-3 w-3 mr-1" />
                {activity.estimatedMinutes || 0} minutes
              </span>
            </div>
          </div>

          {/* Description */}
          {activity.description && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-gray-700">{activity.description}</p>
            </div>
          )}

          {/* Instructions */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Instructions</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">
                {activity.instructions || 'No instructions provided'}
              </p>
            </div>
          </div>

          {/* External Links */}
          {activity.externalUrl && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Resources</h4>
              <a
                href={activity.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
              >
                <ExternalLink className="h-4 w-4" />
                Open External Resource
              </a>
            </div>
          )}

          {/* Difficulty Level */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Target Level</h4>
            <span className={`inline-block px-3 py-1 rounded-full text-sm ${
              activity.difficulty === 'SECURE' ? 'bg-green-100 text-green-800' :
              activity.difficulty === 'DEVELOPING' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {activity.difficulty?.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Close
          </button>
          <button
            onClick={onAssign}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
          >
            <Send className="h-4 w-4" />
            Assign Activity
          </button>
        </div>
      </div>
    </div>
  );
}

function AssignmentModal({ activity, onClose, onSuccess }: {
  activity: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [assignmentType, setAssignmentType] = useState<'individual' | 'class' | 'group'>('individual');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [isRequired, setIsRequired] = useState(true);
  const [notes, setNotes] = useState('');

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => api.getStudents(),
  });

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.getClasses(),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.assignActivity(data),
    onSuccess,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const assignmentData = {
      activityId: activity.id,
      assignmentType,
      studentIds: assignmentType === 'individual' ? selectedStudents : undefined,
      classIds: assignmentType === 'class' ? selectedClasses : undefined,
      dueDate: dueDate || undefined,
      isRequired,
      notes,
    };

    mutation.mutate(assignmentData);
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleClass = (classId: string) => {
    setSelectedClasses(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Assign Activity</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Activity Info */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h3 className="font-semibold text-indigo-900 mb-1">{activity.title}</h3>
            <p className="text-sm text-indigo-700">
              {activity.subject?.displayName} • {activity.skill?.displayName} • {activity.estimatedMinutes} min
            </p>
          </div>

          {/* Assignment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Assign To
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setAssignmentType('individual')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  assignmentType === 'individual'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <UserPlus className={`h-6 w-6 mx-auto mb-2 ${
                  assignmentType === 'individual' ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <p className="text-sm font-medium text-gray-900">Individual</p>
              </button>

              <button
                type="button"
                onClick={() => setAssignmentType('class')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  assignmentType === 'class'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users className={`h-6 w-6 mx-auto mb-2 ${
                  assignmentType === 'class' ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <p className="text-sm font-medium text-gray-900">Whole Class</p>
              </button>

              <button
                type="button"
                onClick={() => setAssignmentType('group')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  assignmentType === 'group'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Layers className={`h-6 w-6 mx-auto mb-2 ${
                  assignmentType === 'group' ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <p className="text-sm font-medium text-gray-900">Custom Group</p>
              </button>
            </div>
          </div>

          {/* Individual Students Selection */}
          {assignmentType === 'individual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Students
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                {students && students.length > 0 ? (
                  students.map((student: any) => (
                    <label key={student.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudent(student.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-900">
                        {student.firstName} {student.lastName}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({student.studentProfile?.yearGroup?.displayName || 'N/A'})
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No students available</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {selectedStudents.length} student(s) selected
              </p>
            </div>
          )}

          {/* Class Selection */}
          {assignmentType === 'class' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Classes
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                {classes && classes.length > 0 ? (
                  classes.map((cls: any) => (
                    <label key={cls.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedClasses.includes(cls.id)}
                        onChange={() => toggleClass(cls.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-900">{cls.name}</span>
                      <span className="text-xs text-gray-500">
                        ({cls.yearGroup?.displayName || 'N/A'})
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No classes available</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {selectedClasses.length} class(es) selected
              </p>
            </div>
          )}

          {/* Custom Group (uses individual student selection for now) */}
          {assignmentType === 'group' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Students for Custom Group
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                {students && students.length > 0 ? (
                  students.map((student: any) => (
                    <label key={student.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudent(student.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-900">
                        {student.firstName} {student.lastName}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({student.studentProfile?.yearGroup?.displayName || 'N/A'})
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No students available</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {selectedStudents.length} student(s) selected
              </p>
            </div>
          )}

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Required/Optional */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Mark as Required
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              {isRequired 
                ? 'Students must complete this activity' 
                : 'Activity is optional for students'}
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes for Students (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add any special instructions or context..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                mutation.isPending ||
                (assignmentType === 'individual' && selectedStudents.length === 0) ||
                (assignmentType === 'class' && selectedClasses.length === 0) ||
                (assignmentType === 'group' && selectedStudents.length === 0)
              }
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {mutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Assign to {
                    assignmentType === 'individual' ? `${selectedStudents.length} Student(s)` :
                    assignmentType === 'class' ? `${selectedClasses.length} Class(es)` :
                    `${selectedStudents.length} Student(s)`
                  }
                </>
              )}
            </button>
          </div>

          {mutation.isError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              Error: {(mutation.error as any)?.response?.data?.message || 'Failed to assign activity'}
            </div>
          )}

          {mutation.isSuccess && (
            <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
              ✓ Activity assigned successfully!
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// Utility function
function formatActivityType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

