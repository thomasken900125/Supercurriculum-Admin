'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock,
  CheckCircle,
  Calendar,
  Activity,
  Award,
  Target,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';

export default function ClassAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;

  // Fetch class analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['class-analytics', classId],
    queryFn: () => api.getClassAnalytics(classId),
  });

  // Fetch all classes for comparison
  const { data: allClasses } = useQuery({
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

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Class Not Found</h2>
        <p className="text-gray-600 mt-2">The class you're looking for doesn't exist.</p>
        <Link href="/dashboard/classes" className="mt-4 inline-block text-indigo-600 hover:text-indigo-700">
          ← Back to Classes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{analytics.className}</h1>
          <p className="text-gray-600 mt-1">
            {analytics.yearGroup} • {analytics.studentCount} Students
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            analytics.classAverage >= 80 ? 'bg-green-100 text-green-800' :
            analytics.classAverage >= 60 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            Class Average: {analytics.classAverage}%
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={Users}
          label="Total Students"
          value={analytics.studentCount.toString()}
          color="blue"
        />
        <MetricCard
          icon={Clock}
          label="Avg Session Duration"
          value={analytics.avgSessionDuration || '0 min'}
          color="purple"
        />
        <MetricCard
          icon={CheckCircle}
          label="Task Completion Rate"
          value={`${analytics.taskCompletionRate || 0}%`}
          color="green"
          trend={analytics.taskCompletionRate >= 75 ? 'up' : 'down'}
        />
        <MetricCard
          icon={Calendar}
          label="Login Frequency"
          value={`${analytics.avgLoginFrequency || 0}/week`}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Class Average Per Subject */}
          <SubjectPerformanceCard subjects={analytics.subjectAverages || []} />

          {/* Subject Difficulty Comparison */}
          <SubjectDifficultyCard 
            subjects={analytics.subjectAverages || []} 
            classAverage={analytics.classAverage}
          />

          {/* Engagement Trends */}
          <EngagementTrendsCard engagement={analytics.engagementMetrics || {}} />
        </div>

        {/* Right Column - Insights */}
        <div className="space-y-6">
          {/* Top Performers */}
          <TopPerformersCard students={analytics.topPerformers || []} />

          {/* Students at Risk */}
          <AtRiskStudentsCard students={analytics.atRiskStudents || []} />

          {/* Class Comparison */}
          {allClasses && allClasses.length > 1 && (
            <ClassComparisonCard 
              currentClass={analytics} 
              allClasses={allClasses}
              classId={classId}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color, trend }: {
  icon: any;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  trend?: 'up' | 'down';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`${colorClasses[color]} p-3 rounded-lg`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        {trend && (
          <div className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
            {trend === 'up' ? (
              <TrendingUp className="h-6 w-6" />
            ) : (
              <TrendingDown className="h-6 w-6" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SubjectPerformanceCard({ subjects }: { subjects: any[] }) {
  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 80) return { text: 'Strong', class: 'bg-green-100 text-green-800' };
    if (percentage >= 60) return { text: 'Good', class: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Needs Attention', class: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          Class Average Per Subject
        </h2>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p>No subject data available</p>
        </div>
      ) : (
        <div className="space-y-6">
          {subjects
            .sort((a, b) => b.average - a.average)
            .map((subject) => {
              const badge = getPerformanceBadge(subject.average);
              return (
                <div key={subject.subjectId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">
                        {subject.subjectName}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${badge.class}`}>
                        {badge.text}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {subject.average}%
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className={`${getPerformanceColor(subject.average)} h-3 rounded-full transition-all duration-300`}
                        style={{ width: `${subject.average}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-16 text-right">
                      {subject.studentCount} students
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

function SubjectDifficultyCard({ subjects, classAverage }: { 
  subjects: any[]; 
  classAverage: number;
}) {
  // Sort subjects by difficulty (lowest average = hardest)
  const sortedByDifficulty = [...subjects].sort((a, b) => a.average - b.average);
  
  const hardestSubjects = sortedByDifficulty.slice(0, 3);
  const easiestSubjects = sortedByDifficulty.slice(-3).reverse();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-600" />
          Subject Difficulty Analysis
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hardest Subjects */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-600" />
            Most Challenging
          </h3>
          {hardestSubjects.length === 0 ? (
            <p className="text-sm text-gray-500">No data</p>
          ) : (
            <ul className="space-y-2">
              {hardestSubjects.map((subject, index) => (
                <li key={subject.subjectId} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="text-gray-500">{index + 1}.</span>
                    <span className="text-gray-900">{subject.subjectName}</span>
                  </span>
                  <span className={`font-medium ${
                    subject.average < 50 ? 'text-red-600' :
                    subject.average < 70 ? 'text-orange-600' :
                    'text-yellow-600'
                  }`}>
                    {subject.average}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Easiest Subjects */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            Best Performance
          </h3>
          {easiestSubjects.length === 0 ? (
            <p className="text-sm text-gray-500">No data</p>
          ) : (
            <ul className="space-y-2">
              {easiestSubjects.map((subject, index) => (
                <li key={subject.subjectId} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="text-gray-500">{index + 1}.</span>
                    <span className="text-gray-900">{subject.subjectName}</span>
                  </span>
                  <span className={`font-medium ${
                    subject.average >= 80 ? 'text-green-600' :
                    subject.average >= 70 ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {subject.average}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          <strong>Insight:</strong> Students are finding{' '}
          <span className="text-red-600 font-medium">
            {hardestSubjects[0]?.subjectName || 'N/A'}
          </span>{' '}
          most challenging ({hardestSubjects[0]?.average || 0}% average), while performing best in{' '}
          <span className="text-green-600 font-medium">
            {easiestSubjects[0]?.subjectName || 'N/A'}
          </span>{' '}
          ({easiestSubjects[0]?.average || 0}% average).
        </p>
      </div>
    </div>
  );
}

function EngagementTrendsCard({ engagement }: { engagement: any }) {
  const metrics = [
    {
      label: 'Login Frequency',
      value: `${engagement.avgLoginFrequency || 0} logins/week`,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Task Completion Rate',
      value: `${engagement.taskCompletionRate || 0}%`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Avg Session Duration',
      value: engagement.avgSessionDuration || '0 min',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Active Students',
      value: `${engagement.activeStudents || 0}/${engagement.totalStudents || 0}`,
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-600" />
          Engagement Metrics
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className={`${metric.bgColor} rounded-lg p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
              <p className="text-xs font-medium text-gray-600">{metric.label}</p>
            </div>
            <p className={`text-xl font-bold ${metric.color}`}>{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopPerformersCard({ students }: { students: any[] }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Award className="h-5 w-5 text-yellow-500" />
        Top Performers
      </h2>

      {students.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Award className="h-10 w-10 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No data available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {students.map((student, index) => (
            <Link
              key={student.id}
              href={`/dashboard/students/${student.id}`}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {index + 1}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {student.firstName} {student.lastName}
                </p>
                <p className="text-xs text-gray-500">Overall: {student.average}%</p>
              </div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function AtRiskStudentsCard({ students }: { students: any[] }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-red-500" />
        Students at Risk
      </h2>

      {students.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-20 text-green-500" />
          <p className="text-sm">All students doing well!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {students.map((student) => (
            <Link
              key={student.id}
              href={`/dashboard/students/${student.id}`}
              className="flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
            >
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {student.firstName} {student.lastName}
                </p>
                <p className="text-xs text-red-600">Average: {student.average}%</p>
              </div>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ClassComparisonCard({ currentClass, allClasses, classId }: {
  currentClass: any;
  allClasses: any[];
  classId: string;
}) {
  const otherClasses = allClasses.filter(c => c.id !== classId).slice(0, 3);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-indigo-600" />
        Class Comparison
      </h2>

      <div className="space-y-4">
        {/* Current Class */}
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-indigo-900">
              {currentClass.className} (Current)
            </p>
            <span className="text-sm font-bold text-indigo-700">
              {currentClass.classAverage}%
            </span>
          </div>
          <div className="w-full bg-indigo-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full"
              style={{ width: `${currentClass.classAverage}%` }}
            />
          </div>
        </div>

        {/* Other Classes */}
        {otherClasses.map((cls: any) => (
          <Link
            key={cls.id}
            href={`/dashboard/classes/${cls.id}/analytics`}
            className="block border border-gray-200 rounded-lg p-3 hover:border-indigo-300 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-900">{cls.name}</p>
              <span className="text-sm font-bold text-gray-700">
                {/* Placeholder - would come from API */}
                N/A
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gray-600 h-2 rounded-full"
                style={{ width: '0%' }}
              />
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/dashboard/progress"
        className="mt-4 block text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
      >
        View All Classes →
      </Link>
    </div>
  );
}

