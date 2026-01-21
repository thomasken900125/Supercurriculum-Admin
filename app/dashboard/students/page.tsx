'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  FileUp,
  UserPlus,
  School,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Download,
  Eye,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [filterYearGroup, setFilterYearGroup] = useState('');
  const [filterClass, setFilterClass] = useState('');

  const queryClient = useQueryClient();

  const { data: students, isLoading } = useQuery({
    queryKey: ['students', filterYearGroup, filterClass, searchTerm],
    queryFn: () => api.getStudents({ 
      yearGroupId: filterYearGroup || undefined, 
      classId: filterClass || undefined,
      search: searchTerm || undefined 
    }),
  });

  const { data: yearGroups } = useQuery({
    queryKey: ['years'],
    queryFn: () => api.getYears(),
  });

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.getClasses(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowDeleteConfirm(false);
      setStudentToDelete(null);
    },
  });

  const handleEdit = (student: any) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleViewProfile = (student: any) => {
    setSelectedStudent(student);
    setShowProfileModal(true);
  };

  const handleDelete = (student: any) => {
    setStudentToDelete(student);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      deleteMutation.mutate(studentToDelete.id);
    }
  };

  const downloadCSVTemplate = () => {
    const headers = ['email', 'password', 'firstName', 'lastName', 'yearGroupName', 'className', 'nickname', 'age', 'homeLanguages', 'englishProficiency'];
    const exampleRow = ['student@school.com', 'SecurePass123!', 'John', 'Doe', 'Year 7', 'Year 7A', 'Johnny', '13', 'English,Spanish', 'B1'];
    const csvContent = [headers.join(','), exampleRow.join(',')].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-7 w-7 text-indigo-600" />
            Student Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage students, bulk import, assign to classes
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadCSVTemplate}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            CSV Template
          </button>
          <button
            onClick={() => setShowBulkImport(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload className="h-5 w-5 mr-2" />
            Bulk Import
          </button>
          <button
            onClick={() => {
              setSelectedStudent(null);
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Student
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{students?.length || 0}</p>
            </div>
            <Users className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {students?.filter((s: any) => s.isActive).length || 0}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-red-600">
                {students?.filter((s: any) => !s.isActive).length || 0}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">With Avatar</p>
              <p className="text-2xl font-bold text-blue-600">
                {students?.filter((s: any) => s.studentProfile?.avatarUrl).length || 0}
              </p>
            </div>
            <ImageIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
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
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Classes</option>
          {classes?.map((cls: any) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {/* Students Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year Group
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students?.map((student: any) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {student.studentProfile?.avatarUrl ? (
                          <img
                            src={student.studentProfile.avatarUrl}
                            alt={`${student.firstName} ${student.lastName}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Users className="h-6 w-6 text-indigo-600" />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                            {student.studentProfile?.nickname && (
                              <span className="text-gray-500 ml-1">({student.studentProfile.nickname})</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {student.studentProfile?.yearGroup?.displayName || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {student.studentProfile?.classStudents?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {student.studentProfile.classStudents.slice(0, 2).map((cs: any) => (
                              <span key={cs.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                {cs.class.name}
                              </span>
                            ))}
                            {student.studentProfile.classStudents.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{student.studentProfile.classStudents.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">No classes</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/students/${student.id}`}
                        className="text-green-600 hover:text-green-900 mr-3"
                        title="View Performance"
                      >
                        <BarChart3 className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleViewProfile(student)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        title="View Profile"
                      >
                        <Users className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(student)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {students?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-sm font-medium text-gray-900">No students found</h3>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm ? 'Try adjusting your search' : 'Get started by adding a new student'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Student Form Modal */}
      {showModal && (
        <StudentFormModal
          student={selectedStudent}
          yearGroups={yearGroups || []}
          classes={classes || []}
          onClose={() => {
            setShowModal(false);
            setSelectedStudent(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            setShowModal(false);
            setSelectedStudent(null);
          }}
        />
      )}

      {/* Student Profile Modal */}
      {showProfileModal && selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedStudent(null);
          }}
          onRefresh={() => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
          }}
        />
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <BulkImportModal
          onClose={() => setShowBulkImport(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            setShowBulkImport(false);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && studentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{studentToDelete.firstName} {studentToDelete.lastName}</span>? 
              This will deactivate the student account.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setStudentToDelete(null);
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

// Student Form Modal Component
function StudentFormModal({ student, yearGroups, classes, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    email: student?.email || '',
    password: '',
    firstName: student?.firstName || '',
    lastName: student?.lastName || '',
    yearGroupId: student?.studentProfile?.yearGroupId || '',
    nickname: student?.studentProfile?.nickname || '',
    age: student?.studentProfile?.age || '',
    homeLanguages: student?.studentProfile?.homeLanguages?.join(', ') || '',
    englishProficiency: student?.studentProfile?.englishProficiency || '',
    isActive: student?.isActive ?? true,
  });

  const [selectedClasses, setSelectedClasses] = useState<string[]>(
    student?.studentProfile?.classStudents?.map((cs: any) => cs.class.id) || []
  );

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const studentData = {
        ...data,
        homeLanguages: data.homeLanguages ? data.homeLanguages.split(',').map((l: string) => l.trim()) : [],
        age: data.age ? parseInt(data.age) : undefined,
      };
      
      if (student) {
        // For updates, include isActive
        return api.updateStudent(student.id, studentData);
      } else {
        // For creation, remove isActive (it has a default value in the database)
        const { isActive, ...createData } = studentData;
        const created = await api.createStudent(createData);
        // Assign to classes
        if (selectedClasses.length > 0 && created.id) {
          await api.assignStudentToClasses(created.id, selectedClasses);
        }
        return created;
      }
    },
    onSuccess: async (createdStudent) => {
      // If editing and classes changed, update assignments
      if (student && student.studentProfile) {
        const currentClassIds = student.studentProfile.classStudents?.map((cs: any) => cs.class.id) || [];
        const toAdd = selectedClasses.filter(id => !currentClassIds.includes(id));
        const toRemove = currentClassIds.filter((id: string) => !selectedClasses.includes(id));
        
        if (toAdd.length > 0) {
          await api.assignStudentToClasses(student.id, toAdd);
        }
        
        for (const classId of toRemove) {
          await api.unassignStudentFromClass(student.id, classId);
        }
      }
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {student ? 'Edit Student' : 'Add New Student'}
          </h2>
        </div>

        {/* Scrollable Form Content */}
        <form id="student-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {!student && '*'}
              </label>
              <input
                type="password"
                required={!student}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={student ? 'Leave blank to keep current' : ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nickname
              </label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="number"
                min="5"
                max="19"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Group *
              </label>
              <select
                required
                value={formData.yearGroupId}
                onChange={(e) => setFormData({ ...formData, yearGroupId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Year Group</option>
                {yearGroups.map((year: any) => (
                  <option key={year.id} value={year.id}>
                    {year.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Home Languages (comma-separated)
              </label>
              <input
                type="text"
                value={formData.homeLanguages}
                onChange={(e) => setFormData({ ...formData, homeLanguages: e.target.value })}
                placeholder="English, Spanish"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                English Proficiency
              </label>
              <select
                value={formData.englishProficiency}
                onChange={(e) => setFormData({ ...formData, englishProficiency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Not specified</option>
                <option value="A1">A1 - Beginner</option>
                <option value="A2">A2 - Elementary</option>
                <option value="B1">B1 - Intermediate</option>
                <option value="B2">B2 - Upper Intermediate</option>
                <option value="C1">C1 - Advanced</option>
                <option value="C2">C2 - Proficient</option>
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

          {/* Class Assignment */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Assign to Classes</h3>
            <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3">
              {classes.length === 0 ? (
                <p className="text-sm text-gray-500">No classes available</p>
              ) : (
                classes.map((cls: any) => (
                  <label key={cls.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedClasses.includes(cls.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClasses([...selectedClasses, cls.id]);
                        } else {
                          setSelectedClasses(selectedClasses.filter(id => id !== cls.id));
                        }
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {cls.name}
                      {cls.yearGroup && ` (${cls.yearGroup.displayName})`}
                    </span>
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {selectedClasses.length} class(es) selected
            </p>
          </div>

        </form>

        {/* Fixed Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          {mutation.isError && (
            <div className="text-sm text-red-600 mb-3">
              Error: {(mutation.error as any)?.response?.data?.message || 'Failed to save student'}
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
              form="student-form"
              disabled={mutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {mutation.isPending ? 'Saving...' : student ? 'Update Student' : 'Create Student'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Student Profile Modal Component
function StudentProfileModal({ student, onClose, onRefresh }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await api.uploadStudentAvatar(student.id, file);
      onRefresh();
      alert('Avatar uploaded successfully!');
    } catch (error) {
      alert('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Student Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 pb-6 border-b">
            {student.studentProfile?.avatarUrl ? (
              <img
                src={student.studentProfile.avatarUrl}
                alt={`${student.firstName} ${student.lastName}`}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center">
                <Users className="h-12 w-12 text-indigo-600" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">
                {student.firstName} {student.lastName}
                {student.studentProfile?.nickname && (
                  <span className="text-gray-500 text-lg ml-2">({student.studentProfile.nickname})</span>
                )}
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <Mail className="h-4 w-4" />
                {student.email}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-2 inline-flex items-center px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                <Upload className="h-4 w-4 mr-1" />
                {uploading ? 'Uploading...' : 'Upload Avatar'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Year Group</h4>
              <p className="text-base text-gray-900">
                {student.studentProfile?.yearGroup?.displayName || '-'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Age</h4>
              <p className="text-base text-gray-900">
                {student.studentProfile?.age || '-'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Home Languages</h4>
              <p className="text-base text-gray-900">
                {student.studentProfile?.homeLanguages?.join(', ') || '-'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">English Proficiency</h4>
              <p className="text-base text-gray-900">
                {student.studentProfile?.englishProficiency || '-'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
              {student.isActive ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <XCircle className="h-3 w-3 mr-1" />
                  Inactive
                </span>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Last Login</h4>
              <p className="text-base text-gray-900">
                {student.lastLogin ? new Date(student.lastLogin).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>

          {/* Classes */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
              <School className="h-4 w-4" />
              Enrolled Classes
            </h4>
            {student.studentProfile?.classStudents?.length > 0 ? (
              <div className="space-y-3">
                {student.studentProfile.classStudents.map((cs: any) => (
                  <div key={cs.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{cs.class.name}</p>
                      <div className="text-sm text-gray-600 flex items-center gap-3 mt-1">
                        {cs.class.yearGroup && (
                          <span>{cs.class.yearGroup.displayName}</span>
                        )}
                        {cs.class.subject && (
                          <span>• {cs.class.subject.displayName}</span>
                        )}
                      </div>
                      {cs.class.classTeachers?.length > 0 && (
                        <div className="text-sm text-gray-500 mt-1">
                          Teachers: {cs.class.classTeachers.map((ct: any) => 
                            `${ct.teacherProfile.user.firstName} ${ct.teacherProfile.user.lastName}`
                          ).join(', ')}
                        </div>
                      )}
                    </div>
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Not enrolled in any classes</p>
            )}
          </div>

          {/* Learning Preferences */}
          {student.studentProfile && (
            <div className="border-t pt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-3">Learning Preferences</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Learning Mode</p>
                  <p className="text-base text-gray-900">{student.studentProfile.preferredLearningMode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Challenge Level</p>
                  <p className="text-base text-gray-900">{student.studentProfile.preferredChallengeLevel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Task Duration</p>
                  <p className="text-base text-gray-900">{student.studentProfile.preferredTaskDuration} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Weekly Study Time</p>
                  <p className="text-base text-gray-900">{student.studentProfile.weeklyStudyTime} minutes</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Bulk Import Modal Component
function BulkImportModal({ onClose, onSuccess }: any) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setResult(null);
      const response = await api.bulkImportStudentsCSV(file);
      setResult(response);
      if (response.failed.length === 0) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to import students');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Bulk Import Students</h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">CSV Format Requirements:</h3>
            <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
              <li><strong>Required columns:</strong> email, password, firstName, lastName</li>
              <li><strong>Optional columns:</strong> yearGroupName, className, nickname, age, homeLanguages, englishProficiency</li>
              <li>Use comma-separated values for multiple home languages</li>
              <li>Download the template to see an example</li>
            </ul>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FileUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-3">
              Click to upload or drag and drop your CSV file
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              <Upload className="h-5 w-5 mr-2" />
              {uploading ? 'Uploading...' : 'Select CSV File'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {result && (
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Import Results:</h3>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{result.total}</p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-sm text-green-600">Successful</p>
                  <p className="text-2xl font-bold text-green-900">{result.successful.length}</p>
                </div>
              </div>

              {result.failed.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm font-medium text-red-900 mb-2">Failed ({result.failed.length}):</p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {result.failed.map((item: any, idx: number) => (
                      <p key={idx} className="text-sm text-red-800">
                        {item.email}: {item.error}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

