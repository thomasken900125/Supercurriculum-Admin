'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  School, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  GraduationCap,
  BookOpen,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

export default function ClassesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [classToDelete, setClassToDelete] = useState<any>(null);
  const [filterYearGroup, setFilterYearGroup] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedClassForSchedule, setSelectedClassForSchedule] = useState<any>(null);

  const queryClient = useQueryClient();

  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes', filterYearGroup, filterSubject],
    queryFn: () => api.getClasses({ yearGroupId: filterYearGroup || undefined, subjectId: filterSubject || undefined }),
  });

  const { data: yearGroups } = useQuery({
    queryKey: ['years'],
    queryFn: () => api.getYears(),
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => api.getSubjects(),
  });

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => api.getTeachers(),
  });

  const { data: users } = useQuery({
    queryKey: ['users', 'STUDENT'],
    queryFn: () => api.getUsers('STUDENT'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setShowDeleteConfirm(false);
      setClassToDelete(null);
    },
  });

  const filteredClasses = classes?.filter((cls: any) =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (cls: any) => {
    setSelectedClass(cls);
    setShowModal(true);
  };

  const handleDelete = (cls: any) => {
    setClassToDelete(cls);
    setShowDeleteConfirm(true);
  };

  const handleManageSchedule = (cls: any) => {
    setSelectedClassForSchedule(cls);
    setShowScheduleModal(true);
  };

  const confirmDelete = () => {
    if (classToDelete) {
      deleteMutation.mutate(classToDelete.id);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <School className="h-7 w-7 text-indigo-600" />
            Class Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Create classes and assign teachers and students
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedClass(null);
            setShowModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Class
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterYearGroup}
          onChange={(e) => setFilterYearGroup(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Year Groups</option>
          {yearGroups?.map((year: any) => (
            <option key={year.id} value={year.id}>
              {year.displayName}
            </option>
          ))}
        </select>
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Subjects</option>
          {subjects?.map((subject: any) => (
            <option key={subject.id} value={subject.id}>
              {subject.displayName} - {subject.yearGroup?.displayName || 'N/A'}
            </option>
          ))}
        </select>
      </div>

      {/* Classes Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses?.map((cls: any) => (
            <div key={cls.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
              {/* Class Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{cls.name}</h3>
                  {cls.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{cls.description}</p>
                  )}
                </div>
                {cls.isActive ? (
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 ml-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 shrink-0 ml-2" />
                )}
              </div>

              {/* Class Info */}
              <div className="space-y-2 mb-4">
                {cls.yearGroup && (
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 mr-2" />
                    {cls.yearGroup.displayName}
                  </div>
                )}
                {cls.subject && (
                  <div className="flex items-center text-sm text-gray-600">
                    <School className="h-4 w-4 mr-2" />
                    {cls.subject.displayName}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {cls.classStudents?.length || 0} students
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  {cls.classTeachers?.length || 0} teachers
                </div>
              </div>

              {/* Teachers List */}
              {cls.classTeachers && cls.classTeachers.length > 0 && (
                <div className="border-t pt-3 mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">Teachers:</p>
                  <div className="space-y-1">
                    {cls.classTeachers.slice(0, 2).map((ct: any) => (
                      <div key={ct.id} className="text-sm text-gray-700 flex items-center">
                        <span className="truncate">
                          {ct.teacherProfile.user.firstName} {ct.teacherProfile.user.lastName}
                        </span>
                        {ct.isMainTeacher && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                    {cls.classTeachers.length > 2 && (
                      <p className="text-xs text-gray-500">+{cls.classTeachers.length - 2} more</p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t pt-3">
                <Link
                  href={`/dashboard/classes/${cls.id}/analytics`}
                  className="flex items-center justify-center gap-1 px-2 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title="View Analytics"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </Link>
                <button
                  onClick={() => handleManageSchedule(cls)}
                  className="flex items-center justify-center gap-1 px-2 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Manage Schedule"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Schedule</span>
                </button>
                <button
                  onClick={() => handleEdit(cls)}
                  className="flex items-center justify-center gap-1 px-2 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(cls)}
                  className="flex items-center justify-center gap-1 px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          ))}

          {filteredClasses?.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <School className="h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-sm font-medium text-gray-900">No classes found</h3>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm ? 'Try adjusting your search' : 'Get started by adding a new class'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Class Form Modal */}
      {showModal && (
        <ClassFormModal
          classData={selectedClass}
          yearGroups={yearGroups || []}
          subjects={subjects || []}
          teachers={teachers || []}
          students={users || []}
          onClose={() => {
            setShowModal(false);
            setSelectedClass(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
            setShowModal(false);
            setSelectedClass(null);
          }}
        />
      )}

      {/* Schedule Management Modal */}
      {showScheduleModal && selectedClassForSchedule && (
        <ScheduleModal
          classData={selectedClassForSchedule}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedClassForSchedule(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && classToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{classToDelete.name}</span>? 
              This will remove all student and teacher assignments from this class.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setClassToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Class Form Modal Component
function ClassFormModal({ classData, yearGroups, subjects, teachers, students, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    name: classData?.name || '',
    description: classData?.description || '',
    yearGroupId: classData?.yearGroupId || '',
    subjectId: classData?.subjectId || '',
    isActive: classData?.isActive ?? true,
    teacherIds: classData?.classTeachers?.map((ct: any) => ct.teacherProfile.id) || [],
    studentIds: classData?.classStudents?.map((cs: any) => cs.studentProfile.id) || [],
  });

  const mutation = useMutation({
    mutationFn: (data: any) =>
      classData ? api.updateClass(classData.id, data) : api.createClass(data),
    onSuccess,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleTeacherToggle = (teacherId: string) => {
    setFormData((prev) => ({
      ...prev,
      teacherIds: prev.teacherIds.includes(teacherId)
        ? prev.teacherIds.filter((id: string) => id !== teacherId)
        : [...prev.teacherIds, teacherId],
    }));
  };

  const handleStudentToggle = (studentId: string) => {
    setFormData((prev) => ({
      ...prev,
      studentIds: prev.studentIds.includes(studentId)
        ? prev.studentIds.filter((id: string) => id !== studentId)
        : [...prev.studentIds, studentId],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {classData ? 'Edit Class' : 'Add New Class'}
          </h2>
        </div>

        {/* Scrollable Form Content */}
        <form id="class-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Year 7A, Year 8 Maths Set 1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Group
              </label>
              <select
                value={formData.yearGroupId}
                onChange={(e) => setFormData({ ...formData, yearGroupId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">No specific year group</option>
                {yearGroups.map((year: any) => (
                  <option key={year.id} value={year.id}>
                    {year.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">No specific subject</option>
                {subjects.map((subject: any) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.displayName} - {subject.yearGroup?.displayName || 'N/A'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>

          {/* Teachers */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Assign Teachers</h3>
            <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3">
              {teachers.length === 0 ? (
                <p className="text-sm text-gray-500">No teachers available</p>
              ) : (
                teachers.map((teacher: any) => (
                  <label key={teacher.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.teacherIds.includes(teacher.teacherProfile?.id)}
                      onChange={() => handleTeacherToggle(teacher.teacherProfile?.id)}
                      disabled={!teacher.teacherProfile?.id}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {teacher.firstName} {teacher.lastName}
                      {teacher.teacherProfile?.department && ` (${teacher.teacherProfile.department})`}
                      <span className="text-gray-500 text-xs ml-1">- {teacher.email}</span>
                    </span>
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {formData.teacherIds.length} teacher(s) selected
            </p>
          </div>

          {/* Students */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Assign Students</h3>
            <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3">
              {students.length === 0 ? (
                <p className="text-sm text-gray-500">No students available</p>
              ) : (
                students.map((student: any) => (
                  <label key={student.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.studentIds.includes(student.studentProfile?.id)}
                      onChange={() => handleStudentToggle(student.studentProfile?.id)}
                      disabled={!student.studentProfile?.id}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {student.firstName} {student.lastName}
                      <span className="text-gray-500 text-xs ml-1">- {student.email}</span>
                    </span>
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {formData.studentIds.length} student(s) selected
            </p>
          </div>

          {/* Actions */}
        </form>

        {/* Fixed Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          {mutation.isError && (
            <div className="text-sm text-red-600 mb-3">
              Error: {(mutation.error as any)?.response?.data?.message || 'Failed to save class'}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="class-form"
              disabled={mutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {mutation.isPending ? 'Saving...' : classData ? 'Update Class' : 'Create Class'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Schedule Modal Component
function ScheduleModal({ classData, onClose, onSuccess }: any) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);

  const queryClient = useQueryClient();

  const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Load schedules
  useEffect(() => {
    loadSchedules();
  }, [classData.id]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await api.getClassSchedules(classData.id);
      setSchedules(data);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (scheduleId: string) => api.deleteClassSchedule(scheduleId),
    onSuccess: () => {
      loadSchedules();
      onSuccess();
    },
  });

  const handleDelete = (schedule: any) => {
    if (confirm(`Delete ${schedule.dayOfWeek} ${schedule.startTime}-${schedule.endTime} schedule?`)) {
      deleteMutation.mutate(schedule.id);
    }
  };

  const handleEdit = (schedule: any) => {
    setEditingSchedule(schedule);
    setShowAddForm(true);
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    setEditingSchedule(null);
    loadSchedules();
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-7 w-7 text-indigo-600" />
              Class Schedule - {classData.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage weekly timetable for this class
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
        {!showAddForm ? (
          <>
            <div className="mb-6">
              <button
                onClick={() => {
                  setEditingSchedule(null);
                  setShowAddForm(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Schedule
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-gray-900">No schedules yet</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Add your first schedule entry to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Weekly Timetable View */}
                {DAYS_OF_WEEK.map((day, index) => {
                  const daySchedules = schedules.filter(s => s.dayOfWeek === day);
                  if (daySchedules.length === 0) return null;

                  return (
                    <div key={day} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b">
                        <h3 className="font-medium text-gray-900">{DAY_LABELS[index]}</h3>
                      </div>
                      <div className="divide-y">
                        {daySchedules.map((schedule) => (
                          <div key={schedule.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="flex items-center gap-2 text-indigo-600 font-medium">
                                    <Clock className="h-4 w-4" />
                                    {schedule.startTime} - {schedule.endTime}
                                  </div>
                                  {schedule.room && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                      {schedule.room}
                                    </span>
                                  )}
                                  {!schedule.isActive && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                      Inactive
                                    </span>
                                  )}
                                </div>
                                {schedule.notes && (
                                  <p className="text-sm text-gray-600">{schedule.notes}</p>
                                )}
                              </div>
                              <div className="flex gap-2 ml-4">
                                <button
                                  onClick={() => handleEdit(schedule)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(schedule)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <ScheduleForm
            classId={classData.id}
            schedule={editingSchedule}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowAddForm(false);
              setEditingSchedule(null);
            }}
          />
        )}
        </div>
      </div>
    </div>
  );
}

// Schedule Form Component
function ScheduleForm({ classId, schedule, onSuccess, onCancel }: any) {
  const [formData, setFormData] = useState({
    dayOfWeek: schedule?.dayOfWeek || 'MONDAY',
    startTime: schedule?.startTime || '09:00',
    endTime: schedule?.endTime || '10:00',
    room: schedule?.room || '',
    notes: schedule?.notes || '',
    isActive: schedule?.isActive ?? true,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (schedule) {
        return api.updateClassSchedule(schedule.id, data);
      } else {
        return api.createClassSchedule(classId, data);
      }
    },
    onSuccess,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const DAYS_OF_WEEK = [
    { value: 'MONDAY', label: 'Monday' },
    { value: 'TUESDAY', label: 'Tuesday' },
    { value: 'WEDNESDAY', label: 'Wednesday' },
    { value: 'THURSDAY', label: 'Thursday' },
    { value: 'FRIDAY', label: 'Friday' },
    { value: 'SATURDAY', label: 'Saturday' },
    { value: 'SUNDAY', label: 'Sunday' },
  ];

  // Generate time options (every 15 minutes)
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(time);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Day of Week *
          </label>
          <select
            required
            value={formData.dayOfWeek}
            onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            {DAYS_OF_WEEK.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room/Location
          </label>
          <input
            type="text"
            value={formData.room}
            onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            placeholder="e.g., Room 301, Science Lab"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Time *
          </label>
          <select
            required
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Time *
          </label>
          <select
            required
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          placeholder="e.g., Bring textbooks, Lab coats required"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="ml-2 text-sm text-gray-700">Active</span>
        </label>
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving...' : schedule ? 'Update Schedule' : 'Add Schedule'}
        </button>
      </div>

      {mutation.isError && (
        <div className="text-sm text-red-600">
          Error: {(mutation.error as any)?.response?.data?.message || 'Failed to save schedule'}
        </div>
      )}
    </form>
  );
}

