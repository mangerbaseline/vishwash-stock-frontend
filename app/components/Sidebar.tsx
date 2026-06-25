'use client';
import React, { JSX, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getUserProfile } from '../lib/api';
import {
  Home,
  Calendar,
  User,
  ListChecks,
  FileText,
  Table,
  File,
  Mail,
  Inbox,
  Receipt,
  BarChart3,
  LayoutGrid,
  LogIn,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Settings,
  Shield,
  Users,
  Star,
  TrendingUp,
  PieChart,
  Box,
  Layers,
  GitBranch,
  Activity,
  DollarSign,
  ShoppingCart,
  MessageCircle,
  Bell,
  HelpCircle,
  LogOut,
  Award,
  Briefcase,
  Sparkles,
  CreditCard,
  BookOpen,
  Code,
  Globe,
  Lock,
  CheckCircle,
  Zap
} from 'lucide-react';
import AnimatedLogo from './AnimatedLogo';

type MenuItem = {
  label: string;
  href?: string;
  icon?: JSX.Element;
  children?: MenuItem[];
  badge?: string;
  pro?: boolean;
  notifyCount?: number;
  roles?: string[];
  isNew?: boolean;
  isUpdated?: boolean;
};

export default function Sidebar() {
  const dispatch = useDispatch();
  const reduxUser = useSelector((state: any) => state.auth?.user);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [notificationCounts, setNotificationCounts] = useState<{ messages: number }>({ messages: 0 });

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        // Use Redux as initial state if available, but don't return early
        // We want to fetch fresh data from the /me API to get full details
        if (reduxUser && !user) {
          const initialData = {
            ...reduxUser,
            photo: reduxUser.avatar || reduxUser.photo || ''
          };
          setUser(initialData);
        }

        // Always fetch from API to get the most up-to-date and complete profile
        const data = await getUserProfile(token);
        console.log("Sidebar - API Fetched user data:", data);

        if (data) {
          setUser(data);
        }
      } catch (error) {
        console.error("Sidebar - Error fetching user data from API:", error);

        // Fallback to localStorage if API fails
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser && !user) {
            const parsedUser = JSON.parse(storedUser);
            setUser({
              ...parsedUser,
              photo: parsedUser.avatar || parsedUser.photo || ''
            });
          }
        } catch (e) {
          console.error("Sidebar - LocalStorage fallback failed:", e);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [reduxUser]);

  // Fetch notification counts
  useEffect(() => {
    const fetchNotificationCounts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/messages/notifications/count`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.notifications) {
            setNotificationCounts(data.notifications);
          }
        }
      } catch (error) {
        console.error('Error fetching notification counts:', error);
      }
    };

    fetchNotificationCounts();

    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotificationCounts, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const findActiveParent = (items: MenuItem[]) => {
      for (const item of items) {
        if (item.children) {
          for (const child of item.children) {
            if (child.href === pathname) {
              setOpenMenus({ [item.label]: true });
              return;
            }
          }
        }
      }
    };
    findActiveParent([...mainMenu, ...supportMenu, ...othersMenu]);
  }, [pathname]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => {
      const isCurrentlyOpen = !!prev[label];
      return isCurrentlyOpen ? {} : { [label]: true };
    });
  };

  const filterMenuByRole = (items: MenuItem[]): MenuItem[] => {
    if (!user) return items.filter(item => !item.roles);

    return items.filter(item => {
      if (item.roles && !item.roles.includes(user.role)) {
        return false;
      }
      if (item.children) {
        item.children = item.children.filter(child => {
          if (child.roles && !child.roles.includes(user.role)) {
            return false;
          }
          return true;
        });
        return item.children.length > 0;
      }
      return true;
    });
  };

  // Helper function to get user photo (handles both photo and avatar fields)
  const getUserPhoto = () => {
    if (!user) return null;
    // Check for photo first, then avatar
    return user.photo || user.avatar || null;
  };

  // Helper function to get user display name
  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.fullName || user.username || 'User';
  };

  // Helper function to get user initial
  const getUserInitial = () => {
    const displayName = getUserDisplayName();
    return displayName ? displayName.charAt(0).toUpperCase() : 'U';
  };

  const mainMenu: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: <Home size={20} />,
      children: [
        { label: 'Stocks', href: '/dashboard/stock-dashboard', pro: true, icon: <TrendingUp size={16} />, isUpdated: true },
        // { label: 'Crypto Pulse', href: '/dashboard/crypto-dashboard', pro: true, icon: <Zap size={16} />, isNew: true },
        // { label: 'Crypto Analytics', href: '/dashboard/crypto-analytics', pro: true, icon: <Layers size={16} />, isNew: true },
        { label: 'Stock Comparison', href: '/dashboard/stock-comparison', pro: true, icon: <BarChart3 size={16} />, isNew: true },
        { label: 'Marketing', href: '/dashboard/marketing', pro: true, icon: <Activity size={16} /> },
        { label: 'CRM', href: '/dashboard/crm', pro: true, icon: <Users size={16} /> },
        { label: 'Global Markets', href: '/dashboard/global-markets', pro: true, icon: <Globe size={16} />, isNew: true },
      ],
    },
    {
      label: 'Admin',
      icon: <Shield size={20} />,
      children: [
        { label: 'User Management', href: '/dashboard/admin/users', icon: <Users size={16} />, badge: 'Admin' },
        { label: 'Settings', href: '/dashboard/admin/settings', icon: <Settings size={16} /> },
        { label: 'Audit Logs', href: '/dashboard/admin/logs', icon: <FileText size={16} />, pro: true },
      ],
      roles: ['admin'],
    },
    {
      label: 'Profile',
      href: '/dashboard/profile',
      icon: <User size={20} />,
    },
    {
      label: 'Calendar',
      href: '/dashboard/calendar',
      icon: <Calendar size={20} />,
      pro: true,
    },
    {
      label: 'Tasks',
      icon: <ListChecks size={20} />,
      children: [
        { label: 'Task List', href: '/dashboard/tasks/list', icon: <ListChecks size={16} /> },
        { label: 'Kanban Board', href: '/dashboard/tasks/kanban', icon: <LayoutGrid size={16} />, pro: true, isNew: true },
      ],
    },
  ];

  const supportMenu: MenuItem[] = [
    {
      label: 'Messages',
      icon: <MessageCircle size={20} />,
      href: '/dashboard/messages',
      notifyCount: notificationCounts.messages > 0 ? notificationCounts.messages : undefined,
      pro: true,
      isNew: true
    },
    {
      label: 'Inbox',
      icon: <Inbox size={20} />,
      href: '#',
      pro: true
    },
    // {
    //   label: 'Invoices',
    //   icon: <Receipt size={20} />,
    //   href: '#',
    //   pro: true
    // },
    {
      label: 'Help Center',
      icon: <HelpCircle size={20} />,
      href: '#',
      pro: true
    },
  ];

  const othersMenu: MenuItem[] = [

    {
      label: 'Authentication',
      icon: <LogIn size={20} />,
      children: [
        { label: 'Sign In', href: '/Authentication/signin', icon: <LogIn size={16} /> },
        { label: 'Sign Up', href: '/Authentication/signup', icon: <User size={16} />, pro: true },
        { label: 'Forgot Password', href: '/Authentication/forgot-password', icon: <Lock size={16} />, pro: true },
        { label: '2FA', href: '/Authentication/verification', icon: <Shield size={16} />, pro: true, isNew: true },
      ],
    },
  ];

  const filteredMainMenu = filterMenuByRole(mainMenu);
  const filteredSupportMenu = filterMenuByRole(supportMenu);
  const filteredOthersMenu = filterMenuByRole(othersMenu);

  const renderMenuItem = (item: MenuItem) => {
    const isActive = openMenus[item.label];
    const isCurrentRoute = item.href === pathname;
    const hasActiveChild = item.children?.some(child => child.href === pathname);

    return (
      <div key={item.label} className="relative">
        <div
          onClick={() => item.children && toggleMenu(item.label)}
          onMouseEnter={() => setHoveredItem(item.label)}
          onMouseLeave={() => setHoveredItem(null)}
          className={`
            relative flex items-center justify-between px-3 py-2.5 rounded-xl
            transition-all duration-200 cursor-pointer group
            ${isActive || isCurrentRoute || hasActiveChild
              ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 text-indigo-600 dark:text-indigo-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
            }
          `}
        >
          <Link
            href={item.href || '#'}
            onClick={(e) => {
              if (item.children) e.preventDefault();
              if (window.innerWidth < 1120) setIsSidebarOpen(false);
            }}
            className="flex items-center gap-3 flex-1"
          >
            <span className={`
              transition-all duration-200
              ${isActive || isCurrentRoute || hasActiveChild
                ? 'text-indigo-600 dark:text-indigo-400 scale-110'
                : 'text-gray-500 dark:text-gray-500 group-hover:scale-110 group-hover:text-indigo-500'
              }
            `}>
              {item.icon}
            </span>

            <span className={`
              text-sm font-medium transition-all duration-200
              ${isActive || isCurrentRoute || hasActiveChild
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
              }
            `}>
              {item.label}
            </span>

            {item.badge && (
              <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                {item.badge}
              </span>
            )}

            {item.isNew && (
              <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full animate-pulse">
                New
              </span>
            )}
            {item.isUpdated && (
              <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                Updated
              </span>
            )}
          </Link>

          {!item.children && item.notifyCount && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium bg-red-500 text-white rounded-full animate-pulse-subtle">
              {item.notifyCount}
            </span>
          )}

          {!item.children && item.pro && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full">
              <Sparkles className="w-3 h-3" />
              Pro
            </span>
          )}

          {item.children && (
            <span className={`
              ml-2 transition-all duration-300
              ${isActive ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}
            `}>
              <ChevronDown size={16} />
            </span>
          )}
        </div>

        {item.children && isActive && (
          <div className="ml-6 mt-1 space-y-0.5 border-l-2 border-indigo-100 dark:border-indigo-900/30 pl-2 animate-slide-down">
            {item.children.map((child) => {
              const isChildActive = child.href === pathname;

              return (
                <Link
                  key={child.label}
                  href={child.href || '#'}
                  onClick={() => {
                    if (window.innerWidth < 1120) setIsSidebarOpen(false);
                  }}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-lg
                    transition-all duration-200 group
                    ${isChildActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className={`
                      transition-all duration-200
                      ${isChildActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 group-hover:text-indigo-500'}
                    `}>
                      {child.icon || <div className="w-1.5 h-1.5 bg-gray-300 rounded-full group-hover:bg-indigo-500 transition-colors" />}
                    </span>
                    <span className="text-sm">{child.label}</span>

                    {child.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                        {child.badge}
                      </span>
                    )}
                    {child.isNew && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full animate-pulse">
                        New
                      </span>
                    )}
                  </div>

                  {child.pro && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full">
                      <Sparkles className="w-3 h-3" />
                      Pro
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 block lg:hidden hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 block lg:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl
          transform transition-all duration-300 ease-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:block
          overflow-y-auto overflow-x-hidden
          flex flex-col
        `}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 px-4 py-5 border-b border-gray-200 dark:border-gray-800">
          <Link
            href="/dashboard/stock-dashboard"
            className="flex items-center gap-3 group"
            onClick={() => setIsSidebarOpen(false)}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">V</span>
              </div>
            </div>
            <div>
              <h2 className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                ABC
              </h2>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 -mt-0.5">
                Enterprise Dashboard
              </p>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="ml-auto p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </Link>
        </div>

        {/* User Profile Section - Using local state with proper mapping */}
        {user && (
          <div className="mx-4 mt-4 p-3 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
            <div className="flex items-center gap-3">
              {getUserPhoto() ? (
                <img
                  src={getUserPhoto()}
                  alt={getUserDisplayName()}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-800"
                  onError={(e) => {
                    console.error("Image failed to load");
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {getUserInitial()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
              <div className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                <span className="text-[10px] font-medium text-indigo-700 dark:text-indigo-300 uppercase">
                  {user.role || 'user'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center gap-2 px-3 mb-3">
              <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Main Menu
              </span>
            </div>
            <nav className="space-y-1">
              {filteredMainMenu.map(renderMenuItem)}
            </nav>
          </div>

          {filteredSupportMenu.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 px-3 mb-3">
                <div className="w-1 h-4 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Support
                </span>
              </div>
              <nav className="space-y-1">
                {filteredSupportMenu.map(renderMenuItem)}
              </nav>
            </div>
          )}

          {/* {filteredOthersMenu.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 px-3 mb-3">
                <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Resources
                </span>
              </div>
              <nav className="space-y-1">
                {filteredOthersMenu.map(renderMenuItem)}
              </nav>
            </div>
          )} */}
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                System Status: Online
              </span>
            </div>
            <span className="text-[10px] text-gray-400">
              v1.0.0
            </span>
          </div>
        </div>
      </aside>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}