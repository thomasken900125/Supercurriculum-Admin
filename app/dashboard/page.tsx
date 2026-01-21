'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  BookOpen, 
  Users, 
  ClipboardList, 
  Target, 
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Calendar,
  Clock,
  BarChart3,
  UserPlus,
  FileText,
  ArrowRight
} from 'lucide-react';
import { useMemo } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  // Get current user from localStorage
  const currentUser = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('admin_user') || '{}')
    : {};
  
  const isAdmin = currentUser.role === 'ADMIN';
  const isTeacher = currentUser.role === 'TEACHER';
  
  // Fetch dashboard data
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({ 
    queryKey: ['dashboard-stats'], 
    queryFn: () => api.getDashboardStats() 
  });
  
  const { data: recentActivity } = useQuery({ 
    queryKey: ['recent-activity'], 
    queryFn: () => api.getRecentActivity(10) 
  });
  
  const { data: studentsAtRisk } = useQuery({ 
    queryKey: ['students-at-risk'], 
    queryFn: () => api.getStudentsAtRisk() 
  });
  
  const { data: subjectPerformance } = useQuery({ 
    queryKey: ['subject-performance'], 
    queryFn: () => api.getSubjectPerformance() 
  });

  // Calculate dashboard statistics from API data
  const stats = useMemo(() => {
    if (!dashboardStats) {
      return {
        totalStudents: 0,
        studentsAtRisk: 0,
        recentCompletions: 0,
        totalClasses: 0,
        weeklyCompletionRate: 0,
      };
    }
    
    return {
      totalStudents: dashboardStats.totalStudents || 0,
      studentsAtRisk: dashboardStats.studentsAtRisk || 0,
      recentCompletions: dashboardStats.recentCompletions || 0,
      totalClasses: dashboardStats.totalClasses || 0,
      weeklyCompletionRate: dashboardStats.weeklyActivity?.completionRate || 0,
    };
  }, [dashboardStats]);

  if (statsLoading) {
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
        <h1 className="text-3xl font-bold text-gray-900">
          {isAdmin ? 'Admin Dashboard' : isTeacher ? 'Teacher Dashboard' : 'Dashboard'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isAdmin 
            ? 'System-wide overview and management' 
            : isTeacher 
            ? 'Overview of your assigned students and classes'
            : 'Overview of all assigned students and recent activity'
          }
        </p>
        {isTeacher && currentUser.firstName && (
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, {currentUser.firstName}!
          </p>
        )}
      </div>

      {/* Quick Stats - 4 Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          name={isAdmin ? "Total Students" : "My Students"}
          value={stats.totalStudents}
          icon={Users}
          color="bg-blue-500"
          textColor="text-blue-600"
          bgColor="bg-blue-50"
          subtitle={isTeacher ? "Assigned to you" : undefined}
          href="/dashboard/students"
        />
        <StatCard
          name="Students at Risk"
          value={stats.studentsAtRisk}
          icon={AlertCircle}
          color="bg-red-500"
          textColor="text-red-600"
          bgColor="bg-red-50"
          badge={stats.studentsAtRisk > 0 ? "Needs Attention" : undefined}
          href="/dashboard/students?filter=at-risk"
        />
        <StatCard
          name="Recent Completions"
          value={stats.recentCompletions}
          icon={CheckCircle}
          color="bg-green-500"
          textColor="text-green-600"
          bgColor="bg-green-50"
          subtitle="This week"
        />
        <StatCard
          name={isAdmin ? "Total Classes" : "My Classes"}
          value={stats.totalClasses}
          icon={BookOpen}
          color="bg-purple-500"
          textColor="text-purple-600"
          bgColor="bg-purple-50"
          subtitle={isTeacher ? "You're teaching" : undefined}
          href="/dashboard/classes"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Average Progress by Subject */}
          <SubjectPerformanceCard />

          {/* Recent Activity Feed */}
          <RecentActivityCard />

          {/* Quick Link to Advanced Analytics */}
          <Link
            href="/dashboard/progress"
            className="block bg-linear-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-6 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Advanced Analytics</h3>
                <p className="text-sm text-indigo-100">
                  View heat maps, trends, and detailed visualizations
                </p>
              </div>
              <BarChart3 className="h-8 w-8" />
            </div>
          </Link>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActionsCard isAdmin={isAdmin} isTeacher={isTeacher} />

          {/* Weekly Summary */}
          <WeeklySummaryCard stats={stats} isAdmin={isAdmin} />

          {/* System Quick Links */}
          <QuickLinksCard isAdmin={isAdmin} />
        </div>
      </div>
      
      {/* Admin-specific Section */}
      {isAdmin && (
        <div className="mt-6">
          <AdminSystemOverview />
        </div>
      )}
    </div>
  );
}

function StatCard({ 
  name, 
  value, 
  icon: Icon, 
  color, 
  textColor,
  bgColor,
  badge,
  subtitle,
  href
}: { 
  name: string; 
  value: number; 
  icon: any; 
  color: string;
  textColor: string;
  bgColor: string;
  badge?: string;
  subtitle?: string;
  href?: string;
}) {
  const content = (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
                <div className={`shrink-0 ${color} rounded-md p-3`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 truncate">{name}</dt>
              <dd className={`text-3xl font-semibold ${textColor}`}>{value}</dd>
              {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            </div>
          </div>
        </div>
        {badge && (
          <div className="mt-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
              {badge}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

function SubjectPerformanceCard() {
  const { data: subjectPerformance, isLoading } = useQuery({ 
    queryKey: ['subject-performance'], 
    queryFn: () => api.getSubjectPerformance() 
  });

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Average Progress by Subject</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const subjectData = subjectPerformance?.map((subject: { subjectName: string; average: number; yearGroup: string; studentCount: number }, index: number) => ({
    name: subject.subjectName,
    average: subject.average,
    yearGroup: subject.yearGroup,
    studentCount: subject.studentCount,
    color: ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500'][index % 5],
  })) || [];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          Average Progress by Subject
        </h2>
        <Link href="/dashboard/progress" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
          View Details
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="space-y-4">
        {subjectData.map((subject: { name: string; average: number; color: string; yearGroup?: string }, index: number) => (
          <div key={`${subject.name}-${subject.yearGroup || index}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{subject.name}</span>
              <span className={`text-sm font-semibold ${
                subject.average >= 80 ? 'text-green-600' :
                subject.average >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {subject.average}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`${subject.color} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${subject.average}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActivityCard() {
  const { data: activityData, isLoading } = useQuery({ 
    queryKey: ['recent-activity'], 
    queryFn: () => api.getRecentActivity(10) 
  });

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completion': return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' };
      case 'submission': return { icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50' };
      case 'at-risk': return { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50' };
      default: return { icon: Clock, color: 'text-gray-600', bgColor: 'bg-gray-50' };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activities = activityData?.map((activity: { id?: string; type: string; student: string; action: string; time: string }, index: number) => {
    const iconConfig = getActivityIcon(activity.type);
    return {
      id: activity.id || index,
      type: activity.type,
      student: activity.student,
      action: activity.action,
      time: formatTimeAgo(activity.time),
      icon: iconConfig.icon,
      color: iconConfig.color,
      bgColor: iconConfig.bgColor,
    };
  }) || [];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-600" />
          Recent Activity
        </h2>
        <Link href="/dashboard/activity" className="text-sm text-indigo-600 hover:text-indigo-700">
          View All
        </Link>
      </div>
      <div className="flow-root">
        <ul className="-mb-8">
          {activities.map((activity: { id: string | number; type: string; student: string; action: string; time: string; icon: any; color: string; bgColor: string }, index: number) => (
            <li key={activity.id}>
              <div className="relative pb-8">
                {index !== activities.length - 1 && (
                  <span
                    className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  <div>
                    <div className={`relative px-1 ${activity.bgColor} rounded-full`}>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${activity.bgColor}`}>
                        <activity.icon className={`h-5 w-5 ${activity.color}`} />
                      </div>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.student}</span> {activity.action}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function QuickActionsCard({ isAdmin, isTeacher }: { isAdmin: boolean; isTeacher: boolean }) {
  const teacherActions = [
    {
      name: 'Assign Activity',
      icon: ClipboardList,
      href: '/dashboard/activity-library',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Browse & assign activities',
    },
    {
      name: 'View Reports',
      icon: FileText,
      href: '/dashboard/progress',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Generate student reports',
    },
    {
      name: 'My Students',
      icon: Users,
      href: '/dashboard/students',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'View your students',
    },
  ];

  const adminActions = [
    {
      name: 'Manage Users',
      icon: Users,
      href: '/dashboard/users',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Manage teachers & students',
    },
    {
      name: 'System Config',
      icon: Target,
      href: '/dashboard/system',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'System settings',
    },
    {
      name: 'Add Student',
      icon: UserPlus,
      href: '/dashboard/students',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Add new student',
    },
  ];

  const actions = isAdmin ? adminActions : teacherActions;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Target className="h-5 w-5 text-indigo-600" />
        Quick Actions
      </h2>
      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="block p-3 border border-gray-200 rounded-lg hover:border-indigo-500 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className={`${action.bgColor} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                <action.icon className={`h-5 w-5 ${action.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">{action.name}</h3>
                <p className="text-xs text-gray-500">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function WeeklySummaryCard({ stats, isAdmin }: { stats: any; isAdmin: boolean }) {
  return (
    <div className="bg-linear-to-br from-indigo-500 to-purple-600 shadow rounded-lg p-6 text-white">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        This Week's Summary
      </h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm opacity-90">Completions</span>
          <span className="text-xl font-bold">{stats.recentCompletions}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm opacity-90">At Risk</span>
          <span className="text-xl font-bold">{stats.studentsAtRisk}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm opacity-90">Active Classes</span>
          <span className="text-xl font-bold">{stats.totalClasses}</span>
        </div>
        <div className="pt-3 border-t border-white/20">
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-90">Engagement Rate</span>
            <span className="font-semibold">
              {stats.totalStudents > 0 
                ? Math.round((stats.recentCompletions / stats.totalStudents) * 100) 
                : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickLinksCard({ isAdmin }: { isAdmin: boolean }) {
  const adminLinks = [
    { href: '/dashboard/teachers', title: 'Manage Teachers', icon: Users },
    { href: '/dashboard/classes', title: 'Manage Classes', icon: BookOpen },
    { href: '/dashboard/curriculum', title: 'Curriculum Dashboard', icon: Target },
    { href: '/dashboard/system', title: 'System Status', icon: BarChart3 },
  ];

  const teacherLinks = [
    { href: '/dashboard/curriculum', title: 'Curriculum Dashboard', icon: Target },
    { href: '/dashboard/interventions', title: 'Manage Interventions', icon: AlertCircle },
    { href: '/dashboard/tests', title: 'Feedback Tests', icon: ClipboardList },
    { href: '/dashboard/classes', title: 'My Classes', icon: BookOpen },
  ];

  const links = isAdmin ? adminLinks : teacherLinks;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {isAdmin ? 'System Management' : 'Quick Links'}
      </h2>
      <div className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600 hover:bg-gray-50 p-2 rounded transition-colors"
          >
            <link.icon className="h-4 w-4" />
            {link.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

function AdminSystemOverview() {
  const { data: years } = useQuery({ queryKey: ['years'], queryFn: () => api.getYears() });
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: () => api.getSubjects() });
  const { data: activities } = useQuery({ queryKey: ['activities'], queryFn: () => api.getActivities() });
  const { data: teachers } = useQuery({ queryKey: ['teachers'], queryFn: () => api.getTeachers() });

  const systemStats = [
    { name: 'Year Groups', value: years?.length || 0, href: '/dashboard/years', icon: BookOpen },
    { name: 'Subjects', value: subjects?.length || 0, href: '/dashboard/subjects', icon: Target },
    { name: 'Activities', value: activities?.length || 0, href: '/dashboard/activities', icon: ClipboardList },
    { name: 'Teachers', value: teachers?.length || 0, href: '/dashboard/teachers', icon: Users },
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemStats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 p-2 rounded-lg">
                <stat.icon className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.name}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


