'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Target,
  BarChart3
} from 'lucide-react';

export default function CurriculumDashboardPage() {
  const { data: coverage, isLoading } = useQuery({
    queryKey: ['curriculum-coverage'],
    queryFn: () => api.getCurriculumCoverage(),
  });

  const { data: stats } = useQuery({
    queryKey: ['curriculum-stats'],
    queryFn: () => api.getCurriculumStats(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading curriculum dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Curriculum Coverage Dashboard</h1>
        <p className="text-gray-500 mt-1">Monitor curriculum alignment and activity coverage</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Topics"
          value={coverage?.totalTopics || 0}
          icon={BookOpen}
          color="bg-blue-500"
        />
        <MetricCard
          title="Coverage"
          value={`${coverage?.coveragePercent || 0}%`}
          icon={Target}
          color="bg-green-500"
        />
        <MetricCard
          title="Approved Activities"
          value={coverage?.approvedActivities || 0}
          icon={CheckCircle}
          color="bg-indigo-500"
        />
        <MetricCard
          title="Pending Review"
          value={coverage?.pendingActivities || 0}
          icon={Clock}
          color="bg-yellow-500"
        />
      </div>

      {/* Coverage Progress Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Curriculum Coverage</h2>
          <span className="text-sm text-gray-500">
            {coverage?.topicsWithActivities} of {coverage?.totalTopics} topics covered
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-green-500 h-4 rounded-full transition-all"
            style={{ width: `${coverage?.coveragePercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gaps in Content */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Content Gaps
            </h2>
            <span className="text-sm text-gray-500">{coverage?.gapsInContent?.length || 0} topics</span>
          </div>
          
          {coverage?.gapsInContent && coverage.gapsInContent.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {coverage.gapsInContent.map((topic: any) => (
                <div key={topic.id} className="border-l-4 border-red-500 pl-4 py-2">
                  <div className="font-medium text-gray-900">{topic.topicName}</div>
                  <div className="text-sm text-gray-500">
                    {topic.subject.displayName} • {topic.yearGroup.displayName} • {topic.keyStage}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>All topics have activities!</p>
            </div>
          )}
        </div>

        {/* Activity Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Most Active Topics
            </h2>
          </div>
          
          {coverage?.activityDistribution && coverage.activityDistribution.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {coverage.activityDistribution.map((topic: any) => (
                <div key={topic.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{topic.topicName}</div>
                    <div className="text-sm text-gray-500">
                      {topic.subject.displayName} • {topic.yearGroup.displayName}
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <span className="text-2xl font-bold text-indigo-600">
                      {topic._count.supercurriculumActivities}
                    </span>
                    <span className="text-sm text-gray-500">activities</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
              <p>No activity data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Average Alignment Score */}
      {stats?.alignmentStats && (
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Curriculum Alignment Quality</h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Average Score</div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.alignmentStats._avg.curriculumAlignment?.toFixed(1) || 0}
              </div>
              <div className="text-sm text-gray-500">out of 100</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Lowest Score</div>
              <div className="text-3xl font-bold text-orange-600">
                {stats.alignmentStats._min.curriculumAlignment || 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Highest Score</div>
              <div className="text-3xl font-bold text-green-600">
                {stats.alignmentStats._max.curriculumAlignment || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8 mt-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/curriculum/topics"
            className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg p-4 transition-all"
          >
            <BookOpen className="h-8 w-8 mb-2" />
            <div className="font-semibold">Manage Topics</div>
            <div className="text-sm opacity-90">View and edit curriculum topics</div>
          </Link>
          <Link
            href="/dashboard/curriculum/review"
            className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg p-4 transition-all"
          >
            <Clock className="h-8 w-8 mb-2" />
            <div className="font-semibold">Review Queue</div>
            <div className="text-sm opacity-90">Approve pending activities</div>
          </Link>
          <Link
            href="/dashboard/curriculum/library"
            className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg p-4 transition-all"
          >
            <Target className="h-8 w-8 mb-2" />
            <div className="font-semibold">Activity Library</div>
            <div className="text-sm opacity-90">Browse all activities</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500 mb-1">{title}</div>
          <div className="text-3xl font-bold text-gray-900">{value}</div>
        </div>
        <div className={`${color} rounded-lg p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

