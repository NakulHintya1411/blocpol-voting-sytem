import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, 
  Users, 
  Vote, 
  FileText, 
  Settings,
  ArrowLeft
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const router = useRouter();

  const adminNavItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview and statistics'
    },
    {
      href: '/admin/elections',
      label: 'Elections',
      icon: Vote,
      description: 'Manage voting sessions'
    },
    {
      href: '/admin/candidates',
      label: 'Candidates',
      icon: Users,
      description: 'Manage candidates'
    },
    {
      href: '/admin/audit',
      label: 'Audit Trail',
      icon: FileText,
      description: 'View system logs'
    },
    {
      href: '/admin/settings',
      label: 'Settings',
      icon: Settings,
      description: 'System configuration'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Admin Navigation */}
      <div className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back to Main Site */}
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Main Site</span>
            </Link>

            {/* Admin Title */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
            </div>

            {/* Admin Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    title={item.description}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Mobile Admin Navigation */}
          <div className="md:hidden pb-4">
            <div className="grid grid-cols-2 gap-2">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;


