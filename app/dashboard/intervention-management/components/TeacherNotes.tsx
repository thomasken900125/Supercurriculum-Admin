'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface TeacherNote {
  id: string;
  studentId: string;
  teacherId: string;
  subjectId?: string;
  skillId?: string;
  noteCategory: 'BEHAVIORAL' | 'ACADEMIC' | 'GENERAL';
  noteType: string;
  content: string;
  isVisibleToStudent: boolean;
  isVisibleToParent: boolean;
  flaggedForFollowUp: boolean;
  followUpDate?: string;
  followUpCompleted: boolean;
  attachments?: Array<{
    url: string;
    filename: string;
    fileType: string;
    uploadedAt: string;
  }>;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface TeacherNotesProps {
  studentId?: string;
}

export default function TeacherNotes({ studentId }: TeacherNotesProps) {
  const [notes, setNotes] = useState<TeacherNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<TeacherNote | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterFollowUp, setFilterFollowUp] = useState<boolean | undefined>(
    undefined
  );

  // Form state
  const [formData, setFormData] = useState({
    studentId: studentId || '',
    teacherId: '',
    subjectId: '',
    skillId: '',
    noteCategory: 'GENERAL' as 'BEHAVIORAL' | 'ACADEMIC' | 'GENERAL',
    noteType: 'observation',
    content: '',
    isVisibleToStudent: false,
    isVisibleToParent: false,
    flaggedForFollowUp: false,
    followUpDate: '',
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [studentId, filterCategory, filterFollowUp]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (studentId) filters.studentId = studentId;
      if (filterCategory !== 'ALL') filters.noteCategory = filterCategory;
      if (filterFollowUp !== undefined)
        filters.flaggedForFollowUp = filterFollowUp;

      const data = await api.getTeacherNotes(filters);
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTeacherNote(formData);
      setShowCreateModal(false);
      resetForm();
      fetchNotes();
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleUpdateNote = async (noteId: string, updates: Partial<TeacherNote>) => {
    try {
      await api.updateTeacherNote(noteId, updates);
      fetchNotes();
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await api.deleteTeacherNote(noteId);
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleCompleteFollowUp = async (noteId: string) => {
    try {
      await api.completeFollowUp(noteId);
      fetchNotes();
    } catch (error) {
      console.error('Error completing follow-up:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: studentId || '',
      teacherId: '',
      subjectId: '',
      skillId: '',
      noteCategory: 'GENERAL',
      noteType: 'observation',
      content: '',
      isVisibleToStudent: false,
      isVisibleToParent: false,
      flaggedForFollowUp: false,
      followUpDate: '',
      tags: [],
    });
    setTagInput('');
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'BEHAVIORAL':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'ACADEMIC':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'GENERAL':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Teacher Notes</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Note
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            <option value="BEHAVIORAL">Behavioral</option>
            <option value="ACADEMIC">Academic</option>
            <option value="GENERAL">General</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Follow-Up Status
          </label>
          <select
            value={
              filterFollowUp === undefined
                ? 'ALL'
                : filterFollowUp
                ? 'FLAGGED'
                : 'NOT_FLAGGED'
            }
            onChange={(e) =>
              setFilterFollowUp(
                e.target.value === 'ALL'
                  ? undefined
                  : e.target.value === 'FLAGGED'
              )
            }
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Notes</option>
            <option value="FLAGGED">Flagged for Follow-Up</option>
            <option value="NOT_FLAGGED">Not Flagged</option>
          </select>
        </div>
      </div>

      {/* Notes List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
          <p className="text-gray-500">No notes found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(
                      note.noteCategory
                    )}`}
                  >
                    {note.noteCategory}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                    {note.noteType}
                  </span>
                  {note.flaggedForFollowUp && !note.followUpCompleted && (
                    <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800 border border-yellow-300">
                      ⚠️ Follow-Up Needed
                    </span>
                  )}
                  {note.isVisibleToStudent && (
                    <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      👁️ Visible to Student
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedNote(note)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <p className="text-gray-800 mb-3">{note.content}</p>

              {note.tags && note.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {note.attachments && note.attachments.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Attachments:
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {note.attachments.map((attachment, idx) => (
                      <a
                        key={idx}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100"
                      >
                        📎 {attachment.filename}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {note.flaggedForFollowUp && note.followUpDate && !note.followUpCompleted && (
                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                  <p className="text-sm text-gray-600">
                    Follow-up by:{' '}
                    <span className="font-medium">
                      {new Date(note.followUpDate).toLocaleDateString()}
                    </span>
                  </p>
                  <button
                    onClick={() => handleCompleteFollowUp(note.id)}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Complete Follow-Up
                  </button>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-3">
                Created: {new Date(note.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create Note Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Create Teacher Note</h3>

            <form onSubmit={handleCreateNote} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.noteCategory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        noteCategory: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="GENERAL">General</option>
                    <option value="ACADEMIC">Academic</option>
                    <option value="BEHAVIORAL">Behavioral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={formData.noteType}
                    onChange={(e) =>
                      setFormData({ ...formData, noteType: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="observation">Observation</option>
                    <option value="intervention_needed">Intervention Needed</option>
                    <option value="praise">Praise</option>
                    <option value="concern">Concern</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={5}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter note content..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Add
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded flex items-center gap-1"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isVisibleToStudent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isVisibleToStudent: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Visible to student
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isVisibleToParent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isVisibleToParent: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Visible to parent
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.flaggedForFollowUp}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        flaggedForFollowUp: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Flag for follow-up
                  </span>
                </label>
              </div>

              {formData.flaggedForFollowUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) =>
                      setFormData({ ...formData, followUpDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Note Details Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Note Details</h3>
              <button
                onClick={() => setSelectedNote(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Category</p>
                <p className="text-gray-900">{selectedNote.noteCategory}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Type</p>
                <p className="text-gray-900">{selectedNote.noteType}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Content</p>
                <p className="text-gray-900">{selectedNote.content}</p>
              </div>

              {selectedNote.tags && selectedNote.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedNote.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-sm bg-gray-100 text-gray-600 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Visible to Student
                  </p>
                  <p className="text-gray-900">
                    {selectedNote.isVisibleToStudent ? 'Yes' : 'No'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Visible to Parent
                  </p>
                  <p className="text-gray-900">
                    {selectedNote.isVisibleToParent ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              {selectedNote.flaggedForFollowUp && (
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Follow-Up Status
                  </p>
                  <p className="text-gray-900">
                    {selectedNote.followUpCompleted
                      ? '✅ Completed'
                      : `⚠️ Pending (Due: ${
                          selectedNote.followUpDate
                            ? new Date(
                                selectedNote.followUpDate
                              ).toLocaleDateString()
                            : 'No date set'
                        })`}
                  </p>
                </div>
              )}

              <div className="text-sm text-gray-500">
                <p>Created: {new Date(selectedNote.createdAt).toLocaleString()}</p>
                <p>Updated: {new Date(selectedNote.updatedAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedNote(null)}
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

