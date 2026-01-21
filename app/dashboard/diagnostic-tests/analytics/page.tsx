'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  ArrowLeft,
  Download,
  Filter
} from 'lucide-react';
import Link from 'next/link';

export default function DiagnosticTestAnalyticsPage() {
  const [filterSchedule, setFilterSchedule] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterYearGroup, setFilterYearGroup] = useState('');

  // Fetch year groups and schedules
  const { data: yearGroups = [] } = useQuery({
    queryKey: ['years'],
    queryFn: () => api.getYears(),
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ['diagnostic-test-schedules'],
    queryFn: () => api.getDiagnosticTestSchedules({}),
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes', filterYearGroup],
    queryFn: () => api.getClasses({ yearGroupId: filterYearGroup || undefined }),
    enabled: !!filterYearGroup,
  });

  // Fetch test results
  const { data: results = [], isLoading } = useQuery({
    queryKey: ['diagnostic-test-results', filterSchedule, filterClass, filterYearGroup],
    queryFn: () => api.getDiagnosticTestResults({
      scheduleId: filterSchedule || undefined,
      classId: filterClass || undefined,
      yearGroupId: filterYearGroup || undefined,
    }),
  });

  // Calculate statistics
  const stats = {
    totalTests: results.length,
    averageScore: results.length > 0
      ? Math.round(results.reduce((sum: number, r: any) => sum + r.totalScore, 0) / results.length)
      : 0,
    studentsAtRisk: results.filter((r: any) => r.totalScore < 60).length,
    highPerformers: results.filter((r: any) => r.totalScore >= 80).length,
  };

  // Group results by subject
  const subjectStats = results.reduce((acc: any, result: any) => {
    const subject = result.test?.subject || 'Unknown';
    if (!acc[subject]) {
      acc[subject] = { subject, scores: [], count: 0, total: 0 };
    }
    acc[subject].scores.push(result.totalScore);
    acc[subject].count += 1;
    acc[subject].total += result.totalScore;
    return acc;
  }, {});

  const subjectAverages = Object.values(subjectStats).map((stat: any) => ({
    subject: stat.subject,
    average: Math.round(stat.total / stat.count),
    count: stat.count,
    min: Math.min(...stat.scores),
    max: Math.max(...stat.scores),
  }));

  // Group by band
  const bandDistribution = results.reduce((acc: any, result: any) => {
    const band = result.band || 'Unknown';
    acc[band] = (acc[band] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/diagnostic-tests"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Test Results & Analytics</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive analysis of diagnostic test performance
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          <Download className="h-5 w-5" />
          Export Report
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Tests Completed"
          value={stats.totalTests}
          icon={BarChart3}
          color="blue"
        />
        <StatCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          icon={Target}
          color="green"
        />
        <StatCard
          title="Students At Risk"
          value={stats.studentsAtRisk}
          subtitle="< 60% score"
          icon={Users}
          color="orange"
        />
        <StatCard
          title="High Performers"
          value={stats.highPerformers}
          subtitle="≥ 80% score"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filterYearGroup}
              onChange={(e) => {
                setFilterYearGroup(e.target.value);
                setFilterClass('');
              }}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">All Year Groups</option>
              {yearGroups.map((year: any) => (
                <option key={year.id} value={year.id}>
                  {year.displayName}
                </option>
              ))}
            </select>

            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
              disabled={!filterYearGroup}
            >
              <option value="">All Classes</option>
              {classes.map((cls: any) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>

            <select
              value={filterSchedule}
              onChange={(e) => setFilterSchedule(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">All Test Schedules</option>
              {schedules.map((schedule: any) => (
                <option key={schedule.id} value={schedule.id}>
                  {schedule.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Band Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Band Distribution</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium mb-1">SECURE</p>
            <p className="text-3xl font-bold text-green-700">{bandDistribution.SECURE || 0}</p>
            <p className="text-sm text-green-600 mt-1">
              {stats.totalTests > 0 ? Math.round(((bandDistribution.SECURE || 0) / stats.totalTests) * 100) : 0}%
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-600 font-medium mb-1">DEVELOPING</p>
            <p className="text-3xl font-bold text-yellow-700">{bandDistribution.DEVELOPING || 0}</p>
            <p className="text-sm text-yellow-600 mt-1">
              {stats.totalTests > 0 ? Math.round(((bandDistribution.DEVELOPING || 0) / stats.totalTests) * 100) : 0}%
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600 font-medium mb-1">NEEDS SUPPORT</p>
            <p className="text-3xl font-bold text-red-700">{bandDistribution.NEEDS_SUPPORT || 0}</p>
            <p className="text-sm text-red-600 mt-1">
              {stats.totalTests > 0 ? Math.round(((bandDistribution.NEEDS_SUPPORT || 0) / stats.totalTests) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Subject Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Subject Performance Breakdown</h2>
        {subjectAverages.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No data available</p>
        ) : (
          <div className="space-y-4">
            {subjectAverages.map((stat: any) => (
              <div key={stat.subject}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">{stat.subject}</span>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">{stat.average}%</span>
                    <span className="text-gray-400 ml-2">
                      ({stat.min}% - {stat.max}%)
                    </span>
                    <span className="text-gray-400 ml-2">
                      {stat.count} test{stat.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      stat.average >= 80 ? 'bg-green-500' :
                      stat.average >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${stat.average}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Individual Results */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Individual Student Results</h2>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4">Loading results...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No test results found with current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Band
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result: any) => (
                  <tr key={result.assignmentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {result.student.firstName} {result.student.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{result.student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{result.test.subject}</div>
                      <div className="text-sm text-gray-500">{result.test.skill}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{result.schedule?.title}</div>
                      <div className="text-sm text-gray-500">{result.schedule?.testType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-lg font-bold ${
                        result.totalScore >= 80 ? 'text-green-600' :
                        result.totalScore >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {result.totalScore}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        result.band === 'SECURE' ? 'bg-green-100 text-green-800' :
                        result.band === 'DEVELOPING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.band}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(result.completedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

