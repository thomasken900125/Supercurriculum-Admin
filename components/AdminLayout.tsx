'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  BookOpen,
  List,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  School,
  UserPlus,
  // Server, // Commented out - system info page disabled
  Target,
  Clock,
  Upload,
  FileText,
  Sparkles,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Year Groups', href: '/dashboard/years', icon: BookOpen },
  { name: 'Subjects', href: '/dashboard/subjects', icon: List },
  { name: 'Activities', href: '/dashboard/activities', icon: ClipboardList },
  { name: 'Feedback Tests', href: '/dashboard/tests', icon: ClipboardList },
  { name: 'Diagnostic Tests', href: '/dashboard/diagnostic-tests', icon: FileText },
  { name: 'Custom Assignments', href: '/dashboard/custom-assignments', icon: Sparkles },
  { name: 'Intervention Frameworks', href: '/dashboard/interventions', icon: Settings },
  { name: 'Intervention Management', href: '/dashboard/intervention-management', icon: AlertTriangle },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Teachers', href: '/dashboard/teachers', icon: GraduationCap },
  { name: 'Classes', href: '/dashboard/classes', icon: School },
  { name: 'Students', href: '/dashboard/students', icon: UserPlus },
  { name: 'Users', href: '/dashboard/users', icon: Users },
];

const curriculumNav = [
  { name: 'Curriculum Coverage', href: '/dashboard/curriculum', icon: Target },
  { name: 'PDF Parser', href: '/dashboard/curriculum/pdf-parser', icon: FileText },
  { name: 'Review Queue', href: '/dashboard/curriculum/review', icon: Clock },
  { name: 'Activity Library', href: '/dashboard/curriculum/library', icon: BookOpen },
  { name: 'Topics', href: '/dashboard/curriculum/topics', icon: List },
  { name: 'Import Data', href: '/dashboard/curriculum/import', icon: Upload },
];

// Commented out - backend endpoint disabled on VPS
// const systemNav = [
//   { name: 'Server Resources', href: '/dashboard/system', icon: Server },
// ];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');

    if (!token || !userData) {
      // Use window.location for hard redirect to avoid loops
      window.location.href = '/login';
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    // Use window.location for full page refresh
    window.location.href = '/login';
  };

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  // Show loading after mounted but before user data loaded
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white">
            <div className="flex items-center justify-between h-16 px-4 border-b">
              <span className="text-xl font-semibold text-indigo-600">Admin Panel</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <SidebarContent pathname={pathname} handleLogout={handleLogout} user={user} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow border-r border-gray-200 bg-white overflow-y-auto">
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b">
            <span className="text-xl font-semibold text-indigo-600">Admin Panel</span>
          </div>
          <SidebarContent pathname={pathname} handleLogout={handleLogout} user={user} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow lg:hidden">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between items-center">
            <span className="text-lg font-semibold text-indigo-600">Supercurriculum</span>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ pathname, handleLogout, user }: any) {
  return (
    <>
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-indigo-100 text-indigo-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
              {item.name}
            </Link>
          );
        })}
        
        {/* Curriculum Section */}
        <div className="pt-4 mt-4 border-t border-gray-200">
          <div className="px-2 mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              AI Agent Curriculum
            </h3>
          </div>
          {curriculumNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard/curriculum' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-purple-100 text-purple-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-purple-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* System Section - Commented out, backend endpoint disabled on VPS */}
        {/* <div className="pt-4 mt-4 border-t border-gray-200">
          <div className="px-2 mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              System
            </h3>
          </div>
          {systemNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-indigo-100 text-indigo-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </div> */}
      </nav>
      
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex-shrink-0 w-full group block">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs font-medium text-gray-500">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-3 p-2 rounded-md hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

