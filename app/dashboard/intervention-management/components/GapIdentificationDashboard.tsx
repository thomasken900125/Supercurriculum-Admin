'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  AlertTriangle,
  TrendingDown,
  Users,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Plus,
  Search,
} from 'lucide-react';

interface GapDashboardProps {
  filters: {
    classId?: string;
    subjectId?: string;
    yearGroupId?: string;
  };
}

export default function GapIdentificationDashboard({ filters }: GapDashboardProps) {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch dashboard data
  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['intervention-dashboard', filters],
    queryFn: async () => {
      return await api.getSkillGapDashboard({
        classId: filters.classId || undefined,
        subjectId: filters.subjectId || undefined,
        yearGroupId: filters.yearGroupId || undefined,
      });
    },
  });

  // Scan for new gaps
  const scanMutation = useMutation({
    mutationFn: async () => {
      return await api.scanForSkillGaps();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intervention-dashboard'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">Error loading dashboard. Please try again.</p>
        <p className="text-sm text-red-500 mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Skill Gap Overview</h2>
        <button
          onClick={() => scanMutation.mutate()}
          disabled={scanMutation.isPending}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          <Search className="h-4 w-4 mr-2" />
          {scanMutation.isPending ? 'Scanning...' : 'Scan for Gaps'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Gaps"
          value={dashboard?.totalGaps || 0}
          icon={AlertTriangle}
          color="blue"
        />
        <SummaryCard
          title="Critical"
          value={dashboard?.gapsBySeverity?.critical || 0}
          icon={XCircle}
          color="red"
        />
        <SummaryCard
          title="Severe"
          value={dashboard?.gapsBySeverity?.severe || 0}
          icon={AlertCircle}
          color="orange"
        />
        <SummaryCard
          title="Urgent Students"
          value={dashboard?.urgentStudents || 0}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Severity Breakdown */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Gaps by Severity</h3>
        <div className="space-y-3">
          <SeverityBar
            label="Critical"
            count={dashboard?.gapsBySeverity?.critical || 0}
            total={dashboard?.totalGaps || 1}
            color="red"
          />
          <SeverityBar
            label="Severe"
            count={dashboard?.gapsBySeverity?.severe || 0}
            total={dashboard?.totalGaps || 1}
            color="orange"
          />
          <SeverityBar
            label="Moderate"
            count={dashboard?.gapsBySeverity?.moderate || 0}
            total={dashboard?.totalGaps || 1}
            color="yellow"
          />
          <SeverityBar
            label="Minor"
            count={dashboard?.gapsBySeverity?.minor || 0}
            total={dashboard?.totalGaps || 1}
            color="blue"
          />
        </div>
      </div>

      {/* Most Common Gaps */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Most Common Skill Gaps</h3>
        <div className="space-y-3">
          {dashboard?.mostCommonGaps?.map((gap: any, index: number) => (
            <div
              key={`${gap.subjectId}-${gap.skillId}`}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
              onClick={() => setSelectedSkill(gap.skillId)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full font-semibold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Skill: {gap.skillId}</p>
                  <p className="text-sm text-gray-500">
                    {gap.count} student{gap.count !== 1 ? 's' : ''} • Avg Score: {gap.averageScore.toFixed(1)}%
                  </p>
                </div>
              </div>
              <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                View Students →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Intervention Progress */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Active Interventions Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Active</p>
            <p className="text-2xl font-bold text-blue-600">
              {dashboard?.interventionProgress?.total || 0}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-2xl font-bold text-green-600">
              {dashboard?.interventionProgress?.inProgress || 0}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {dashboard?.interventionProgress?.pending || 0}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Average Completion</span>
            <span className="font-medium">
              {dashboard?.interventionProgress?.averageCompletion?.toFixed(1) || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{
                width: `${dashboard?.interventionProgress?.averageCompletion || 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Urgent Students */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          Students Needing Urgent Intervention
        </h3>
        <div className="space-y-2">
          {dashboard?.urgentStudentDetails?.slice(0, 10).map((gap: any) => (
            <div
              key={gap.id}
              className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
            >
              <div>
                <p className="font-medium text-gray-900">Student ID: {gap.studentId}</p>
                <p className="text-sm text-gray-600">
                  Score: {gap.percentageScore}% • Severity: {gap.severity}
                </p>
              </div>
              <button className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">
                Assign Intervention
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  }[color];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function SeverityBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = (count / total) * 100;
  const colorClasses = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
  }[color];

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-600">
          {count} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colorClasses} h-2 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

