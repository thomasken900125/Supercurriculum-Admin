'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Users as UsersIcon, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Mail,
  Phone,
  Building,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function TeachersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const queryClient = useQueryClient();

  // Check current user role
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('admin_user');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    }
  }, []);

  const { data: teachers, isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => api.getTeachers(),
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => api.getSubjects(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteTeacher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setShowDeleteConfirm(false);
      setTeacherToDelete(null);
    },
  });

  const filteredTeachers = teachers?.filter((teacher: any) =>
    `${teacher.firstName} ${teacher.lastName} ${teacher.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleEdit = (teacher: any) => {
    setSelectedTeacher(teacher);
    setShowModal(true);
  };

  const handleDelete = (teacher: any) => {
    setTeacherToDelete(teacher);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (teacherToDelete) {
      deleteMutation.mutate(teacherToDelete.id);
    }
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div>
      {/* Admin Warning */}
      {!isAdmin && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
              <div className="shrink-0">
                <XCircle className="h-5 w-5 text-yellow-400" />
              </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>View Only Mode:</strong> You're logged in as <strong>{currentUser?.role}</strong>. 
                Only ADMIN users can add, edit, or delete teachers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UsersIcon className="h-7 w-7 text-indigo-600" />
            Teacher Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage teachers, permissions, and class assignments
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setSelectedTeacher(null);
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Teacher
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search teachers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Teachers List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="divide-y divide-gray-200">
            {filteredTeachers?.map((teacher: any) => (
              <div key={teacher.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Teacher Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <UsersIcon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {teacher.firstName} {teacher.lastName}
                          </h3>
                          {teacher.isActive ? (
                            <span title="Active">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            </span>
                          ) : (
                            <span title="Inactive">
                              <XCircle className="h-5 w-5 text-red-500" />
                            </span>
                          )}
                        </div>
                        
                        {/* Contact Info */}
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="h-4 w-4 mr-2" />
                            {teacher.email}
                          </div>
                          {teacher.teacherProfile?.phoneNumber && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="h-4 w-4 mr-2" />
                              {teacher.teacherProfile.phoneNumber}
                            </div>
                          )}
                          {teacher.teacherProfile?.department && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Building className="h-4 w-4 mr-2" />
                              {teacher.teacherProfile.department}
                              {teacher.teacherProfile.jobTitle && ` - ${teacher.teacherProfile.jobTitle}`}
                            </div>
                          )}
                        </div>

                        {/* Permissions */}
                        {teacher.teacherProfile && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {teacher.teacherProfile.canEditContent && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Edit Content
                              </span>
                            )}
                            {teacher.teacherProfile.canManageUsers && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                Manage Users
                              </span>
                            )}
                            {teacher.teacherProfile.canViewAllClasses && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                View All Classes
                              </span>
                            )}
                            {teacher.teacherProfile.canAssignTasks && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                Assign Tasks
                              </span>
                            )}
                            {teacher.teacherProfile.canGradeWork && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-pink-100 text-pink-800">
                                Grade Work
                              </span>
                            )}
                          </div>
                        )}

                        {/* Subjects */}
                        {teacher.teacherProfile?.subjects && teacher.teacherProfile.subjects.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">Subjects: </span>
                            <span className="text-xs text-gray-700">
                              {teacher.teacherProfile.subjects
                                .map((subId: string) => {
                                  const subject = subjects?.find((s: any) => s.id === subId);
                                  return subject 
                                    ? `${subject.displayName} - ${subject.yearGroup?.displayName || 'N/A'}`
                                    : subId;
                                })
                                .join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {isAdmin && (
                    <div className="flex items-center gap-2 lg:flex-col">
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(teacher)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredTeachers?.length === 0 && (
              <div className="p-12 text-center">
                <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No teachers found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search' : 'Get started by adding a new teacher'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Teacher Form Modal */}
      {showModal && (
        <TeacherFormModal
          teacher={selectedTeacher}
          subjects={subjects || []}
          onClose={() => {
            setShowModal(false);
            setSelectedTeacher(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
            setShowModal(false);
            setSelectedTeacher(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && teacherToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{' '}
              <span className="font-semibold">
                {teacherToDelete.firstName} {teacherToDelete.lastName}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setTeacherToDelete(null);
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

// Teacher Form Modal Component
function TeacherFormModal({ teacher, subjects, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    email: teacher?.email || '',
    password: '',
    firstName: teacher?.firstName || '',
    lastName: teacher?.lastName || '',
    phoneNumber: teacher?.teacherProfile?.phoneNumber || '',
    officeLocation: teacher?.teacherProfile?.officeLocation || '',
    department: teacher?.teacherProfile?.department || '',
    jobTitle: teacher?.teacherProfile?.jobTitle || '',
    bio: teacher?.teacherProfile?.bio || '',
    canEditContent: teacher?.teacherProfile?.canEditContent || false,
    canManageUsers: teacher?.teacherProfile?.canManageUsers || false,
    canViewAllClasses: teacher?.teacherProfile?.canViewAllClasses || false,
    canAssignTasks: teacher?.teacherProfile?.canAssignTasks ?? true,
    canGradeWork: teacher?.teacherProfile?.canGradeWork ?? true,
    subjects: teacher?.teacherProfile?.subjects || [],
  });

  const mutation = useMutation({
    mutationFn: (data: any) =>
      teacher ? api.updateTeacher(teacher.id, data) : api.createTeacher(data),
    onSuccess,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // When updating, exclude password field (not allowed in UpdateTeacherDto)
    const submitData = teacher 
      ? { ...formData, password: undefined } 
      : formData;
    
    mutation.mutate(submitData);
  };

  const handleSubjectToggle = (subjectId: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter((id: string) => id !== subjectId)
        : [...prev.subjects, subjectId],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {teacher ? 'Edit Teacher' : 'Add New Teacher'}
          </h2>
        </div>

        {/* Scrollable Form Content */}
        <form id="teacher-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {!teacher && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                required={!teacher}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                minLength={8}
              />
            </div>
          )}

          {/* Contact Information */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Office Location
                </label>
                <input
                  type="text"
                  value={formData.officeLocation}
                  onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Permissions</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.canEditContent}
                  onChange={(e) => setFormData({ ...formData, canEditContent: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Can edit content (activities, subjects)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.canManageUsers}
                  onChange={(e) => setFormData({ ...formData, canManageUsers: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Can manage users (add/edit students)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.canViewAllClasses}
                  onChange={(e) => setFormData({ ...formData, canViewAllClasses: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Can view all classes (not just assigned)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.canAssignTasks}
                  onChange={(e) => setFormData({ ...formData, canAssignTasks: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Can assign tasks to students</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.canGradeWork}
                  onChange={(e) => setFormData({ ...formData, canGradeWork: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Can grade student work</span>
              </label>
            </div>
          </div>

          {/* Subjects */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Teaching Subjects</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {subjects?.map((subject: any) => (
                <label key={subject.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.subjects.includes(subject.id)}
                    onChange={() => handleSubjectToggle(subject.id)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {subject.displayName} - {subject.yearGroup?.displayName || 'N/A'}
                  </span>
                </label>
              ))}
            </div>
          </div>

        </form>

        {/* Fixed Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          {mutation.isError && (
            <div className="text-sm text-red-600 mb-3">
              Error: {(mutation.error as any)?.response?.data?.message || 'Failed to save teacher'}
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
              form="teacher-form"
              disabled={mutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {mutation.isPending ? 'Saving...' : teacher ? 'Update Teacher' : 'Create Teacher'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

