'use client';

import '../globals.css';
import {
  Search, Sun, Moon, Bell, Menu, X, ChevronDown, Layout,
  Home, Settings, Users, FileText, Sparkles, Zap, Activity
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import ProfileDropdown from './ProfileDrop';
import { getUserProfile } from '../../app/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AnimatedLogo from './AnimatedLogo';
import { useSearch } from '../contexts/SearchContext';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import SearchModal from './SearchModal';

interface UserData {
  _id?: string;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  bio?: string;
  photo: string;
  role: string;
}

interface HeaderProps {
  user?: UserData | null;
}

export default function Header({ user: propUser }: HeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(propUser || null);
  const [loading, setLoading] = useState(!propUser);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationPulse, setNotificationPulse] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const { setShowSearchModal } = useSearch();
  const { unreadCount, showDropdown, setShowDropdown } = useNotifications();

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [setShowSearchModal]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNotificationPulse(prev => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!propUser) {
      const fetchUser = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            router.push('/Authentication/signin');
            return;
          }
          const data = await getUserProfile(token);
          setUser({
            username: data.username || '',
            email: data.email || '',
            fullName: data.fullName || '',
            phone: data.phone || '',
            bio: data.bio || '',
            photo: data.photo || '',
            role: data.role || '',
            _id: data._id || ''
          });
        } catch (error) {
          console.error("Error fetching user", error);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [propUser, router]);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === 'dark';

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'moderator':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'premium':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-50">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x"></div>

      <div className="px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 lg:gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              onMouseEnter={() => setHoveredItem('mobile')}
              onMouseLeave={() => setHoveredItem(null)}
              className={clsx(
                "lg:hidden p-2 rounded-lg transition-all duration-300",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                hoveredItem === 'mobile' && "scale-110 rotate-12"
              )}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300 animate-spin-once" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300 animate-bounce-subtle" />
              )}
            </button>

            <div className="relative group">
              <AnimatedLogo />
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            <div className="hidden lg:flex items-center gap-2 ml-2">
              <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 animate-fade-in">
                {greeting}, <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                  {user?.fullName?.split(' ')[0] || user?.username || 'User'}
                </span>
              </span>
            </div>

            {isAdmin && (
              <nav className="hidden lg:flex items-center ml-6 space-x-1">
                {[
                  { href: '/dashboard/stock-dashboard', icon: Home, label: 'Home' },
                  { href: '/dashboard/admin/users', icon: Users, label: 'Users' },
                  { href: '/dashboard/settings', icon: Settings, label: 'Settings' }
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onMouseEnter={() => setHoveredItem(item.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={clsx(
                      "relative px-3 py-2 text-sm font-medium rounded-lg",
                      "transition-all duration-300 group",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      hoveredItem === item.label && "scale-105"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className={clsx(
                        "w-4 h-4 transition-all duration-300",
                        hoveredItem === item.label && "rotate-12 text-indigo-500"
                      )} />
                      <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                    </div>
                    {hoveredItem === item.label && (
                      <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full animate-ping"></span>
                    )}
                  </Link>
                ))}
              </nav>
            )}
          </div>
          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className={clsx(
              "relative transition-all duration-500 ease-out",
              searchFocused ? "scale-105 translate-y-0" : "scale-100",
              searchFocused && "shadow-2xl shadow-indigo-500/30"
            )}>
              <input
                type="text"
                placeholder="Search dashboard, reports, users..."
                onFocus={() => {
                  setSearchFocused(true);
                  setShowSearchModal(true);
                }}
                onClick={() => setShowSearchModal(true)}
                onBlur={() => setSearchFocused(false)}
                readOnly
                className={clsx(
                  "w-full h-11 pl-11 pr-4 rounded-2xl text-sm cursor-pointer",
                  "bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm",
                  "text-gray-900 dark:text-white",
                  "placeholder-gray-500 dark:placeholder-gray-400",
                  "border-2 transition-all duration-300",
                  "focus:outline-none focus:ring-4",
                  searchFocused
                    ? "border-indigo-500 dark:border-indigo-400 shadow-lg shadow-indigo-500/30 scale-102"
                    : "border-transparent hover:border-gray-300 dark:hover:border-gray-700"
                )}
              />

              <Search className={clsx(
                "absolute left-3.5 top-3 w-5 h-5 transition-all duration-300",
                searchFocused
                  ? "text-indigo-500 dark:text-indigo-400 animate-pulse"
                  : "text-gray-400 dark:text-gray-500"
              )} />

              <div className="absolute right-3.5 top-3 hidden sm:block group">
                <span className="text-xs bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm px-2 py-1 rounded-md text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 transition-all duration-300 group-hover:bg-indigo-500 group-hover:text-white">
                  ⌘K
                </span>
              </div>

              {searchFocused && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x rounded-b-2xl"></div>
              )}
            </div>
          </div>

          <SearchModal />

          <div className="flex items-center gap-2 sm:gap-3">

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-gray-200 dark:border-gray-700">
              <Activity className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 tabular-nums">
                {formattedTime}
              </span>
            </div>

            {isAdmin && user?.role && !loading && (
              <div className={clsx(
                "hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border",
                "text-xs font-medium transition-all duration-300",
                "hover:scale-105 hover:shadow-lg",
                getRoleBadgeColor(user.role),
                "relative overflow-hidden group"
              )}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                </span>
                <span className="relative z-10">{user.role}</span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
              </div>
            )}

            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              onMouseEnter={() => setHoveredItem('theme')}
              onMouseLeave={() => setHoveredItem(null)}
              className={clsx(
                'relative flex items-center justify-between w-16 h-8 sm:w-20 sm:h-10 px-2 rounded-full',
                'transition-all duration-500 hover:scale-110',
                'hover:shadow-lg hover:shadow-indigo-500/30',
                isDark ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-amber-100 to-amber-200',
                hoveredItem === 'theme' && 'animate-wiggle'
              )}
              aria-label="Toggle theme"
            >
              <Sun
                size={18}
                className={clsx(
                  'z-10 transition-all duration-500',
                  isDark ? 'opacity-0 scale-75 rotate-180' : 'opacity-100 scale-100 rotate-0 text-yellow-600'
                )}
              />
              <Moon
                size={18}
                className={clsx(
                  'z-10 transition-all duration-500',
                  isDark ? 'opacity-100 scale-100 rotate-0 text-indigo-300' : 'opacity-0 scale-75 rotate-180'
                )}
              />
              <span
                className={clsx(
                  'absolute top-0.5 w-7 h-7 sm:w-9 sm:h-9 rounded-full',
                  'shadow-lg transition-all duration-500',
                  'bg-white dark:bg-gray-900',
                  'border-2 border-transparent hover:border-indigo-500',
                  isDark ? 'translate-x-8 sm:translate-x-10' : 'translate-x-0'
                )}
              />
            </button>

            <NotificationDropdown />
            <div className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-700">
              {!loading && user && (
                <div className="hidden sm:block text-right group">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white transition-all duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {user.fullName || user.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    {user.role || 'User'}
                  </p>
                </div>
              )}
              <div className="transition-all duration-300 hover:scale-110">
                <ProfileDropdown />
              </div>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 animate-slide-down">
            <div className="relative mb-4 group">
              <input
                type="text"
                placeholder="Search..."
                onClick={() => setShowSearchModal(true)}
                onFocus={() => {
                  setMobileMenuOpen(false);
                  setShowSearchModal(true);
                }}
                readOnly
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm transition-all duration-300 focus:ring-4 focus:ring-indigo-500/30 focus:scale-105"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 dark:text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>

            {user?.role && (
              <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm rounded-xl animate-fade-in">
                <span className="text-sm text-gray-600 dark:text-gray-400">Your Role</span>
                <span className={clsx(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 hover:scale-105",
                  getRoleBadgeColor(user.role)
                )}>
                  {user.role}
                </span>
              </div>
            )}

            <nav className="space-y-1">
              {(isAdmin ? [
                { href: '/dashboard', icon: Home, label: 'Dashboard' },
                { href: '/dashboard/analytics', icon: FileText, label: 'Analytics' },
                { href: '/dashboard/admin/users', icon: Users, label: 'Users' },
                { href: '/dashboard/settings', icon: Settings, label: 'Settings' }
              ] : [
                { href: '/dashboard', icon: Home, label: 'Dashboard' },
                { href: '/dashboard/settings', icon: Settings, label: 'Settings' }
              ]).map((item, index) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 rounded-xl transition-all duration-300 hover:scale-105 hover:translate-x-2 group animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <item.icon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12 group-hover:text-indigo-500" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        @keyframes spin-once {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(180deg); }
        }
        .animate-spin-once {
          animation: spin-once 0.3s ease-out;
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        .animate-wiggle {
          animation: wiggle 0.3s ease;
        }
        @keyframes slow-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-slow-pulse {
          animation: slow-pulse 3s ease infinite;
        }
        .scale-102 {
          transform: scale(1.02);
        }
      `}</style>
    </header>
  );
}