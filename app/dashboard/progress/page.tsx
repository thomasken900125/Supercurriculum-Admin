'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Users,
  CheckCircle,
  XCircle,
  Activity,
  Calendar,
  Target,
  Award,
  ArrowRight,
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function ProgressPage() {
  const [selectedYearGroup, setSelectedYearGroup] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  const { data: visualizations, isLoading } = useQuery({
    queryKey: ['visualizations', selectedYearGroup, selectedClass, timeRange],
    queryFn: () => api.getVisualizationData({ yearGroupId: selectedYearGroup, classId: selectedClass, timeRange }),
  });

  const { data: yearGroups } = useQuery({
    queryKey: ['years'],
    queryFn: () => api.getYears(),
  });

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.getClasses(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Progress Analytics</h1>
        <p className="text-gray-600 mt-1">Comprehensive visualizations of student progress and engagement</p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year Group</label>
            <select
              value={selectedYearGroup}
              onChange={(e) => setSelectedYearGroup(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Year Groups</option>
              {yearGroups?.map((year: any) => (
                <option key={year.id} value={year.id}>{year.displayName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Classes</option>
              {classes?.map((cls: any) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as 'week' | 'month')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedYearGroup('');
                setSelectedClass('');
              }}
              className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Visualizations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Bars for Each Subject */}
          <SubjectProgressBarsCard data={visualizations?.subjectProgress || []} />

          {/* Heat Map - Class Strengths/Weaknesses */}
          <HeatMapCard data={visualizations?.heatMapData || []} />

          {/* Trend Graphs */}
          <TrendGraphsCard 
            weeklyData={visualizations?.weeklyTrends || []}
            monthlyData={visualizations?.monthlyTrends || []}
            timeRange={timeRange}
          />

          {/* Activity Completion Funnel */}
          <CompletionFunnelCard funnel={visualizations?.completionFunnel || {}} />
        </div>

        {/* Right Column - Alerts & Summary */}
        <div className="space-y-6">
          {/* At-Risk Student Alerts */}
          <AtRiskAlertsCard students={visualizations?.atRiskStudents || []} />

          {/* Quick Stats */}
          <QuickStatsCard stats={visualizations?.quickStats || {}} />
        </div>
      </div>
    </div>
  );
}

function SubjectProgressBarsCard({ data }: { data: any[] }) {
  const getColorForPercentage = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          Progress Bars - All Subjects
        </h2>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <BarChart3 className="h-16 w-16 mx-auto mb-3 opacity-20" />
          <p>No subject data available</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-5">
          {data.map((subject) => (
            <div key={subject.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{subject.name}</span>
                  <span className="text-xs text-gray-500">({subject.yearGroup})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{subject.studentCount} students</span>
                  <span className={`text-sm font-bold ${
                    subject.average >= 80 ? 'text-green-600' :
                    subject.average >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {subject.average}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`${getColorForPercentage(subject.average)} h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                  style={{ width: `${subject.average}%` }}
                >
                  {subject.average >= 15 && (
                    <span className="text-xs font-medium text-white">{subject.average}%</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HeatMapCard({ data }: { data: any[] }) {
  // Heat map shows subjects (rows) vs performance levels (columns)
  // Or students (rows) vs subjects (columns) - simplified version

  const getCellColor = (value: number) => {
    if (value >= 80) return 'bg-green-500 text-white';
    if (value >= 70) return 'bg-green-300 text-gray-900';
    if (value >= 60) return 'bg-yellow-300 text-gray-900';
    if (value >= 50) return 'bg-yellow-500 text-white';
    if (value >= 40) return 'bg-orange-500 text-white';
    if (value > 0) return 'bg-red-500 text-white';
    return 'bg-gray-200 text-gray-500';
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-600" />
          Heat Map - Class Strengths & Weaknesses
        </h2>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Target className="h-16 w-16 mx-auto mb-3 opacity-20" />
          <p>No heat map data available</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Subject
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Average
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Best Skill
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Weak Skill
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((subject) => (
                  <tr key={subject.id}>
                    <td className="px-3 py-3 text-sm font-medium text-gray-900">
                      {subject.name}
                    </td>
                    <td className="px-3 py-3">
                      <div className={`px-3 py-1 rounded text-center text-sm font-bold ${getCellColor(subject.average)}`}>
                        {subject.average}%
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {subject.bestSkill ? (
                        <div className="text-center">
                          <div className="text-xs text-gray-900 font-medium">{subject.bestSkill.name}</div>
                          <div className="text-xs text-green-600 font-bold">{subject.bestSkill.score}%</div>
                        </div>
                      ) : (
                        <div className="text-center text-xs text-gray-400">N/A</div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {subject.weakSkill ? (
                        <div className="text-center">
                          <div className="text-xs text-gray-900 font-medium">{subject.weakSkill.name}</div>
                          <div className="text-xs text-red-600 font-bold">{subject.weakSkill.score}%</div>
                        </div>
                      ) : (
                        <div className="text-center text-xs text-gray-400">N/A</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-2">Color Scale:</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-green-500 text-white rounded">≥80% Strong</span>
              <span className="px-2 py-1 bg-green-300 text-gray-900 rounded">70-79%</span>
              <span className="px-2 py-1 bg-yellow-300 text-gray-900 rounded">60-69%</span>
              <span className="px-2 py-1 bg-yellow-500 text-white rounded">50-59%</span>
              <span className="px-2 py-1 bg-orange-500 text-white rounded">40-49%</span>
              <span className="px-2 py-1 bg-red-500 text-white rounded">&lt;40% At Risk</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TrendGraphsCard({ weeklyData, monthlyData, timeRange }: {
  weeklyData: any[];
  monthlyData: any[];
  timeRange: 'week' | 'month';
}) {
  const data = timeRange === 'week' ? weeklyData : monthlyData;
  
  // Calculate max value for scaling
  const maxValue = Math.max(...data.map(d => d.value || 0), 100);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          Progress Trends - {timeRange === 'week' ? 'Weekly' : 'Monthly'}
        </h2>
        <div className="text-sm text-gray-500">
          {timeRange === 'week' ? 'Last 4 weeks' : 'Last 6 months'}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <TrendingUp className="h-16 w-16 mx-auto mb-3 opacity-20" />
          <p>No trend data available yet</p>
          <p className="text-sm mt-1">Data will appear as students complete activities</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Line Chart Visualization */}
          <div className="relative h-64">
            {/* Y-axis */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
              <span>{maxValue}%</span>
              <span>{Math.round(maxValue * 0.75)}%</span>
              <span>{Math.round(maxValue * 0.5)}%</span>
              <span>{Math.round(maxValue * 0.25)}%</span>
              <span>0%</span>
            </div>

            {/* Chart Area */}
            <div className="ml-10 h-full flex items-end justify-around gap-2">
              {data.map((point, index) => {
                const height = (point.value / maxValue) * 100;
                const isIncrease = index > 0 && point.value > data[index - 1].value;
                const isDecrease = index > 0 && point.value < data[index - 1].value;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    {/* Trend Indicator */}
                    <div className="h-6 mb-1">
                      {isIncrease && <TrendingUp className="h-4 w-4 text-green-600" />}
                      {isDecrease && <TrendingDown className="h-4 w-4 text-red-600" />}
                    </div>

                    {/* Bar */}
                    <div className="w-full relative group">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          point.value >= 80 ? 'bg-green-500' :
                          point.value >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        } hover:opacity-80 cursor-pointer`}
                        style={{ height: `${height}%` }}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {point.value}%
                        </div>
                      </div>

                      {/* Label */}
                      <div className="mt-2 text-xs text-center text-gray-600">
                        {point.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500">Average</p>
              <p className="text-lg font-bold text-gray-900">
                {data.length > 0 
                  ? Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length)
                  : 0}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Highest</p>
              <p className="text-lg font-bold text-green-600">
                {Math.max(...data.map(d => d.value || 0))}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Lowest</p>
              <p className="text-lg font-bold text-red-600">
                {data.length > 0 ? Math.min(...data.map(d => d.value || 0)) : 0}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompletionFunnelCard({ funnel }: { funnel: any }) {
  const stages = [
    { name: 'Tasks Assigned', value: funnel.assigned || 0, color: 'bg-blue-500' },
    { name: 'Tasks Started', value: funnel.started || 0, color: 'bg-purple-500' },
    { name: 'Tasks In Progress', value: funnel.inProgress || 0, color: 'bg-yellow-500' },
    { name: 'Tasks Completed', value: funnel.completed || 0, color: 'bg-green-500' },
  ];

  const maxValue = stages[0].value || 1;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-600" />
          Activity Completion Funnel
        </h2>
      </div>

      {maxValue === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Activity className="h-16 w-16 mx-auto mb-3 opacity-20" />
          <p>No funnel data available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const percentage = (stage.value / maxValue) * 100;
            const dropOff = index > 0 ? stages[index - 1].value - stage.value : 0;
            const dropOffPercentage = index > 0 ? ((dropOff / stages[index - 1].value) * 100) : 0;

            return (
              <div key={stage.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{stage.name}</span>
                  <div className="flex items-center gap-2">
                    {dropOff > 0 && (
                      <span className="text-xs text-red-600">
                        -{dropOff} ({Math.round(dropOffPercentage)}%)
                      </span>
                    )}
                    <span className="font-bold text-gray-900">{stage.value}</span>
                  </div>
                </div>
                <div className="relative">
                  <div
                    className={`${stage.color} h-12 rounded-lg transition-all duration-500 flex items-center justify-center text-white font-medium`}
                    style={{ width: `${percentage}%` }}
                  >
                    {percentage >= 20 && `${Math.round(percentage)}%`}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Completion Rate */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Overall Completion Rate</span>
              <span className={`text-xl font-bold ${
                funnel.completionRate >= 75 ? 'text-green-600' :
                funnel.completionRate >= 50 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {funnel.completionRate || 0}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AtRiskAlertsCard({ students }: { students: any[] }) {
  return (
    <div className="bg-white shadow rounded-lg p-6 border-l-4 border-red-500">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          At-Risk Alerts
        </h2>
        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
          {students.length}
        </span>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-6">
          <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
          <p className="text-sm text-gray-600">All students on track!</p>
          <p className="text-xs text-gray-500 mt-1">No students below 50%</p>
        </div>
      ) : (
        <div className="space-y-3">
          {students.map((student) => (
            <Link
              key={student.id}
              href={`/dashboard/students/${student.id}`}
              className="block p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {student.yearGroup}
                  </p>
                  {student.criticalSubjects && student.criticalSubjects.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {student.criticalSubjects.map((subject: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 bg-red-200 text-red-800 text-xs rounded">
                          {subject}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">
                    {student.average}%
                  </div>
                  <div className="text-xs text-gray-500">avg</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {students.length > 0 && (
        <Link
          href="/dashboard/students?filter=at-risk"
          className="mt-4 block text-center text-sm text-red-600 hover:text-red-700 font-medium"
        >
          View All At-Risk Students →
        </Link>
      )}
    </div>
  );
}

function QuickStatsCard({ stats }: { stats: any }) {
  const metrics = [
    {
      label: 'Total Students',
      value: stats.totalStudents || 0,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      label: 'Active This Week',
      value: stats.activeThisWeek || 0,
      icon: Activity,
      color: 'text-green-600',
    },
    {
      label: 'Tasks Completed',
      value: stats.tasksCompleted || 0,
      icon: CheckCircle,
      color: 'text-purple-600',
    },
    {
      label: 'Avg Class Score',
      value: `${stats.avgScore || 0}%`,
      icon: Award,
      color: 'text-yellow-600',
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
              <span className="text-sm text-gray-600">{metric.label}</span>
            </div>
            <span className={`text-lg font-bold ${metric.color}`}>{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
