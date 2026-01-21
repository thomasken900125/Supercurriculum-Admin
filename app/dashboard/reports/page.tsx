'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  FileText,
  Download,
  Mail,
  Calendar,
  TrendingUp,
  Users,
  User,
  Filter,
} from 'lucide-react';

type ReportType = 'STUDENT' | 'CLASS' | 'PARENT_FRIENDLY' | 'CUSTOM';
type ExportFormat = 'PDF' | 'CSV' | 'EXCEL' | 'JSON';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'builder' | 'scheduled'>('builder');
  
  // Report Builder State
  const [reportType, setReportType] = useState<ReportType>('STUDENT');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'progress',
    'subjects',
    'engagement',
  ]);
  const [teacherCommentary, setTeacherCommentary] = useState('');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('PDF');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');

  // Fetch data for dropdowns
  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => api.getStudents(),
  });

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.getClasses(),
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => api.getSubjects(),
  });

  const availableMetrics = [
    { id: 'progress', label: 'Overall Progress', icon: TrendingUp },
    { id: 'subjects', label: 'Subject Breakdown', icon: FileText },
    { id: 'diagnostics', label: 'Diagnostic Tests', icon: FileText },
    { id: 'engagement', label: 'Engagement Metrics', icon: Users },
    { id: 'comments', label: 'Teacher Comments', icon: FileText },
    { id: 'achievements', label: 'Achievements', icon: TrendingUp },
  ];

  const handleGeneratePreview = async () => {
    setGenerating(true);
    try {
      const reportData = await api.generateReport({
        reportType,
        studentId: selectedStudent,
        classId: selectedClass,
        startDate,
        endDate,
        subjectIds: selectedSubjects,
        metrics: selectedMetrics,
        teacherCommentary,
        format: 'JSON',
        includeCharts,
        includeRecommendations,
      });
      setPreview(reportData);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report preview');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportReport = async () => {
    if (exportFormat === 'JSON') {
      handleGeneratePreview();
      return;
    }

    setGenerating(true);
    try {
      await api.exportReport({
        reportType,
        studentId: selectedStudent,
        classId: selectedClass,
        startDate,
        endDate,
        subjectIds: selectedSubjects,
        metrics: selectedMetrics,
        teacherCommentary,
        format: exportFormat,
        includeCharts,
        includeRecommendations,
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report');
    } finally {
      setGenerating(false);
    }
  };

  const handleEmailReport = async () => {
    const emails = emailRecipients.split(',').map((e) => e.trim()).filter(Boolean);
    if (emails.length === 0) {
      alert('Please enter at least one email address');
      return;
    }

    try {
      await api.emailReport({
        reportId: 'temp-id',
        recipientEmails: emails,
        subject: `${reportType} Report`,
        message: teacherCommentary,
      });
      alert('Report will be emailed to recipients');
      setShowEmailModal(false);
      setEmailRecipients('');
    } catch (error) {
      console.error('Error emailing report:', error);
      alert('Failed to send email');
    }
  };

  const isValidConfig = () => {
    if (reportType === 'STUDENT' || reportType === 'PARENT_FRIENDLY') {
      return selectedStudent !== '';
    }
    if (reportType === 'CLASS') {
      return selectedClass !== '';
    }
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">
          Generate comprehensive reports with multiple export options
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('builder')}
            className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'builder'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-5 w-5 mr-2" />
            Report Builder
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'scheduled'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calendar className="h-5 w-5 mr-2" />
            Scheduled Reports
          </button>
        </nav>
      </div>

      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Report Configuration</h2>

              {/* Report Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'STUDENT', label: 'Student', icon: User },
                    { value: 'CLASS', label: 'Class', icon: Users },
                    { value: 'PARENT_FRIENDLY', label: 'Parent-Friendly', icon: FileText },
                    { value: 'CUSTOM', label: 'Custom', icon: Filter },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setReportType(type.value as ReportType)}
                      className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                        reportType === type.value
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <type.icon className="h-6 w-6 mb-2" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Student/Class Selection */}
              {(reportType === 'STUDENT' || reportType === 'PARENT_FRIENDLY') && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Student *
                  </label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Choose a student...</option>
                    {students?.map((student: any) => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} ({student.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {reportType === 'CLASS' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Class *
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Choose a class...</option>
                    {classes?.map((cls: any) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range (Optional)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank for default range (last 90 days for students, 30 days for classes)
                </p>
              </div>

              {/* Subject Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Subjects (Optional)
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {subjects?.map((subject: any) => (
                    <label key={subject.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSubjects.includes(subject.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSubjects([...selectedSubjects, subject.id]);
                          } else {
                            setSelectedSubjects(selectedSubjects.filter((id) => id !== subject.id));
                          }
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm">{subject.displayName}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Metrics Selection (for Custom reports) */}
              {reportType === 'CUSTOM' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Metrics to Include
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {availableMetrics.map((metric) => (
                      <label
                        key={metric.id}
                        className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedMetrics.includes(metric.id)
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedMetrics.includes(metric.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMetrics([...selectedMetrics, metric.id]);
                            } else {
                              setSelectedMetrics(selectedMetrics.filter((id) => id !== metric.id));
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <metric.icon className="h-4 w-4 ml-2 mr-1" />
                        <span className="text-sm font-medium">{metric.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Teacher Commentary */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teacher Commentary (Optional)
                </label>
                <textarea
                  value={teacherCommentary}
                  onChange={(e) => setTeacherCommentary(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Add your comments about the student's progress..."
                />
              </div>

              {/* Options */}
              <div className="mb-6 space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeCharts}
                    onChange={(e) => setIncludeCharts(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm">Include charts and visualizations</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeRecommendations}
                    onChange={(e) => setIncludeRecommendations(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm">Include recommendations</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions Panel */}
          <div className="space-y-4">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Export Options</h3>

              {/* Export Format */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format
                </label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="PDF">PDF (Formatted)</option>
                  <option value="CSV">CSV (Data Only)</option>
                  <option value="EXCEL">Excel (Spreadsheet)</option>
                  <option value="JSON">JSON (Preview)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleGeneratePreview}
                  disabled={!isValidConfig() || generating}
                  className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  {generating ? 'Generating...' : 'Preview Report'}
                </button>

                <button
                  onClick={handleExportReport}
                  disabled={!isValidConfig() || generating}
                  className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="h-5 w-5 mr-2" />
                  {generating ? 'Exporting...' : `Export as ${exportFormat}`}
                </button>

                <button
                  onClick={() => setShowEmailModal(true)}
                  disabled={!isValidConfig()}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Email Report
                </button>
              </div>

              {!isValidConfig() && (
                <p className="text-sm text-red-600 mt-3">
                  Please select a {reportType === 'CLASS' ? 'class' : 'student'} to continue
                </p>
              )}
            </div>

            {/* Quick Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Report Types:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Student:</strong> Comprehensive individual progress</li>
                <li>• <strong>Class:</strong> Overview of class performance</li>
                <li>• <strong>Parent-Friendly:</strong> Simplified, positive language</li>
                <li>• <strong>Custom:</strong> Select specific metrics</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scheduled' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Scheduled Reports</h2>
          <p className="text-gray-600">
            Automated report scheduling coming soon! You'll be able to schedule weekly or
            monthly reports to be automatically generated and emailed.
          </p>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold">Report Preview</h3>
                <button
                  onClick={() => setPreview(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96">
                  {JSON.stringify(preview, null, 2)}
                </pre>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setPreview(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Close
                </button>
                <button
                  onClick={handleExportReport}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Email Report</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Emails (comma-separated)
              </label>
              <textarea
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="parent@example.com, teacher@example.com"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleEmailReport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

