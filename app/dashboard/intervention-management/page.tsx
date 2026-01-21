'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  AlertTriangle,
  TrendingUp,
  Users,
  Target,
  Bell,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import GapIdentificationDashboard from './components/GapIdentificationDashboard';
import InterventionAssignments from './components/InterventionAssignments';
import AlertsPanel from './components/AlertsPanel';
import TeacherNotes from './components/TeacherNotes';
import { FileText } from 'lucide-react';

type TabType = 'dashboard' | 'assignments' | 'alerts' | 'notes';

export default function InterventionManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [filters, setFilters] = useState({
    classId: '',
    subjectId: '',
    yearGroupId: '',
  });

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.getClasses(),
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => api.getSubjects(),
  });

  const { data: yearGroups } = useQuery({
    queryKey: ['yearGroups'],
    queryFn: () => api.getYearGroups(),
  });

  const tabs = [
    { id: 'dashboard' as TabType, name: 'Gap Dashboard', icon: TrendingUp },
    { id: 'assignments' as TabType, name: 'Interventions', icon: Target },
    { id: 'alerts' as TabType, name: 'Alerts', icon: Bell },
    { id: 'notes' as TabType, name: 'Teacher Notes', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Intervention Management</h1>
        <p className="text-gray-600 mt-1">
          Identify gaps, assign interventions, and track student progress
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              value={filters.classId}
              onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">All Classes</option>
              {classes?.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              value={filters.subjectId}
              onChange={(e) => setFilters({ ...filters, subjectId: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">All Subjects</option>
              {subjects?.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.displayName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year Group
            </label>
            <select
              value={filters.yearGroupId}
              onChange={(e) => setFilters({ ...filters, yearGroupId: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">All Year Groups</option>
              {yearGroups?.map((y: any) => (
                <option key={y.id} value={y.id}>
                  {y.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'dashboard' && <GapIdentificationDashboard filters={filters} />}
        {activeTab === 'assignments' && <InterventionAssignments filters={filters} />}
        {activeTab === 'alerts' && <AlertsPanel />}
        {activeTab === 'notes' && <TeacherNotes />}
      </div>
    </div>
  );
}

