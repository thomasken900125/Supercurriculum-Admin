'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Award,
  Target,
  BarChart3,
  Calendar,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

export default function StudentPerformancePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  // Fetch student performance data
  const { data: student, isLoading } = useQuery({
    queryKey: ['student-performance', studentId],
    queryFn: () => api.getStudentPerformance(studentId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Student Not Found</h2>
        <p className="text-gray-600 mt-2">The student you're looking for doesn't exist.</p>
        <Link href="/dashboard/students" className="mt-4 inline-block text-indigo-600 hover:text-indigo-700">
          ← Back to Students
        </Link>
      </div>
    );
  }

  const getMasteryColor = (level: number) => {
    if (level >= 80) return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500', icon: '🟢' };
    if (level >= 50) return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500', icon: '🟡' };
    return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500', icon: '🔴' };
  };

  const getMasteryLabel = (level: number) => {
    if (level >= 80) return 'Strong';
    if (level >= 50) return 'OK';
    return 'Needs Support';
  };

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
          <h1 className="text-3xl font-bold text-gray-900">
            {student.firstName} {student.lastName}
          </h1>
          <p className="text-gray-600 mt-1">
            {student.yearGroup?.displayName} • {student.email}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            student.overallMastery >= 80 ? 'bg-green-100 text-green-800' :
            student.overallMastery >= 50 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            Overall: {student.overallMastery}%
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={Clock}
          label="Time on Platform"
          value={student.timeSpent || '0h'}
          color="blue"
        />
        <MetricCard
          icon={CheckCircle}
          label="Completion Rate"
          value={`${student.completionRate || 0}%`}
          color="green"
        />
        <MetricCard
          icon={Activity}
          label="Tasks Completed"
          value={`${student.completedTasks || 0}/${student.totalTasks || 0}`}
          color="purple"
        />
        <MetricCard
          icon={Calendar}
          label="Last Active"
          value={student.lastActive ? formatTimeAgo(student.lastActive) : 'Never'}
          color="gray"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Subject Performance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subject Progress */}
          <SubjectProgressCard subjects={student.subjects || []} />

          {/* Diagnostic Test Results */}
          <DiagnosticTestsCard tests={student.diagnosticTests || []} />
        </div>

        {/* Right Column - Insights */}
        <div className="space-y-6">
          {/* Strengths */}
          <StrengthsWeaknessesCard
            strengths={student.strengths || []}
            weaknesses={student.weaknesses || []}
          />

          {/* Recent Activity */}
          <RecentActivityCard activity={student.recentActivity || []} />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }: {
  icon: any;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'purple' | 'gray';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    gray: 'bg-gray-50 text-gray-600',
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center gap-3">
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function SubjectProgressCard({ subjects }: { subjects: any[] }) {
  const getMasteryColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMasteryBadge = (percentage: number) => {
    if (percentage >= 80) return { icon: '🟢', text: 'Strong', class: 'bg-green-100 text-green-800' };
    if (percentage >= 50) return { icon: '🟡', text: 'OK', class: 'bg-yellow-100 text-yellow-800' };
    return { icon: '🔴', text: 'Needs Support', class: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-600" />
          Subject Progress
        </h2>
        <span className="text-sm text-gray-500">Mastery Levels</span>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p>No subject data available</p>
        </div>
      ) : (
        <div className="space-y-6">
          {subjects.map((subject) => {
            const badge = getMasteryBadge(subject.mastery);
            return (
              <div key={subject.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {subject.name}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${badge.class}`}>
                      {badge.icon} {badge.text}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {subject.mastery}%
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${getMasteryColor(subject.mastery)} h-3 rounded-full transition-all duration-300`}
                    style={{ width: `${subject.mastery}%` }}
                  />
                </div>

                {/* Skills Breakdown */}
                {subject.skills && subject.skills.length > 0 && (
                  <div className="ml-4 mt-2 space-y-1">
                    {subject.skills.map((skill: any) => (
                      <div key={skill.id} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{skill.name}</span>
                        <span className={`font-medium ${
                          skill.mastery >= 80 ? 'text-green-600' :
                          skill.mastery >= 50 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {skill.mastery}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DiagnosticTestsCard({ tests }: { tests: any[] }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          Diagnostic Test Results
        </h2>
      </div>

      {tests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p>No test results available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map((test, index) => (
            <div key={test.id || index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">{test.testName}</h3>
                <span className={`text-lg font-bold ${
                  test.totalScore >= 80 ? 'text-green-600' :
                  test.totalScore >= 50 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {test.totalScore}%
                </span>
              </div>

              {/* Score Breakdown */}
              {test.sections && test.sections.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-600 uppercase">Section Breakdown</p>
                  {test.sections.map((section: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{section.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              section.score >= 80 ? 'bg-green-500' :
                              section.score >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${section.score}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium w-10 text-right">
                          {section.score}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-500 mt-2">
                Completed: {formatDate(test.completedAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StrengthsWeaknessesCard({ strengths, weaknesses }: {
  strengths: string[];
  weaknesses: string[];
}) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Target className="h-5 w-5 text-indigo-600" />
        Insights
      </h2>

      {/* Strengths */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-600" />
          Strengths
        </h3>
        {strengths.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No strengths identified yet</p>
        ) : (
          <ul className="space-y-2">
            {strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-green-600 mt-0.5">✓</span>
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Weaknesses */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-red-600" />
          Areas for Improvement
        </h3>
        {weaknesses.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No weaknesses identified</p>
        ) : (
          <ul className="space-y-2">
            {weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-red-600 mt-0.5">!</span>
                <span className="text-gray-700">{weakness}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function RecentActivityCard({ activity }: { activity: any[] }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-indigo-600" />
        Recent Activity
      </h2>

      {activity.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Activity className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activity.map((item, index) => (
            <div key={index} className="flex items-start gap-3 text-sm">
              <div className={`mt-0.5 p-1 rounded-full ${
                item.type === 'completion' ? 'bg-green-100' :
                item.type === 'submission' ? 'bg-blue-100' :
                'bg-gray-100'
              }`}>
                {item.type === 'completion' && <CheckCircle className="h-4 w-4 text-green-600" />}
                {item.type === 'submission' && <Award className="h-4 w-4 text-blue-600" />}
                {item.type !== 'completion' && item.type !== 'submission' && (
                  <Activity className="h-4 w-4 text-gray-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-gray-900">{item.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTimeAgo(item.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Utility functions
function formatTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return formatDate(date);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

