'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, User, Settings, Sparkles, Shield, Mail, Award } from 'lucide-react';
import { getUserProfile, type UserData } from '../lib/api';
import LogoutButton from '@/app/components/LogoutButton'

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [avatarHover, setAvatarHover] = useState(false);
  const [greeting, setGreeting] = useState('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const tryDecodeToken = () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return false;
        const parts = token.split(".");
        if (parts.length !== 3) return false;
        const payload = JSON.parse(atob(parts[1]));
        const decodedUser: UserData = {
          _id: payload.id || payload._id || "",
          username: payload.username || "",
          email: payload.email || "",
          role: payload.role || "",
          photo: payload.photo || "",
          location: '',
          website: '',
          skills: [],
          joinDate: ''
        };
        if (decodedUser.username) {
          setUser(decodedUser);
          return true;
        }
      } catch (err) {
      }
      return false;
    };

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const data = await getUserProfile(token);
        setUser(data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    tryDecodeToken();
    fetchUser();
  }, []);

  const getRoleBadgeStyle = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
      case 'moderator':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case 'premium':
        return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <Shield className="w-3 h-3" />;
      case 'moderator':
        return <Award className="w-3 h-3" />;
      case 'premium':
        return <Sparkles className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setAvatarHover(true)}
        onMouseLeave={() => setAvatarHover(false)}
        className="relative flex items-center gap-2 text-gray-700 dark:text-white text-base sm:text-lg font-medium px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-all duration-300 group"
      >
        <div className="relative">
          <div className={clsx(
            "absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-0 transition-opacity duration-500",
            (isOpen || avatarHover) && "opacity-75 animate-pulse"
          )} />
          <div className="relative">
            {user?.photo ? (
              <img
                src={user.photo}
                alt="User"
                className={clsx(
                  "w-9 h-9 rounded-full object-cover border-2 transition-all duration-500",
                  "border-transparent group-hover:border-indigo-500",
                  isOpen ? "scale-110 border-indigo-500" : "scale-100",
                  avatarHover && "rotate-12 scale-110"
                )}
              />
            ) : (
              <div className={clsx(
                "w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center transition-all duration-500",
                "border-2 border-transparent group-hover:border-white",
                isOpen ? "scale-110 rotate-12" : "scale-100",
                avatarHover && "rotate-12 scale-110"
              )}>
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          <span className="absolute -bottom-0.5 -right-0.5 block h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-900"></span>
          </span>
        </div>

        <span className="hidden sm:inline text-nowrap relative overflow-hidden">
          <span className={clsx(
            "block transition-transform duration-300",
            avatarHover ? "translate-y-0" : "translate-y-0"
          )}>
            {user ? user.username : "Loading..."}
          </span>
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
        </span>

        <ChevronDown
          className={clsx(
            "w-4 h-4 transition-all duration-500",
            isOpen ? "rotate-180 translate-y-1" : "rotate-0",
            avatarHover && "translate-y-0.5"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-slide-down">
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x" />

          <ul className="text-sm sm:text-base">
            <li className="border-b border-gray-200 dark:border-gray-700">
              <div className="relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative px-5 py-4 flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-0 group-hover:opacity-75 transition-opacity duration-500 animate-pulse" />
                    <img
                      src={user?.photo || 'https://via.placeholder.com/48'}
                      alt="Profile"
                      className="relative w-14 h-14 rounded-full border-3 border-white dark:border-gray-800 object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                    />
                    <span className={clsx(
                      "absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white",
                      getRoleBadgeStyle(user?.role || 'user'),
                      "animate-bounce-subtle"
                    )}>
                      {user?.role?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {user ? user.username : "Guest"}
                      </span>
                      {user?.role === 'admin' && (
                        <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                      <Mail className="w-3 h-3" />
                      <span className="truncate max-w-[140px]">{user ? user.email : ""}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={clsx(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                        getRoleBadgeStyle(user?.role || 'user'),
                        "animate-pulse-subtle"
                      )}>
                        {getRoleIcon(user?.role || 'user')}
                        {user?.role || 'User'}
                      </span>

                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <span className="w-1 h-1 bg-gray-400 rounded-full" />
                        {greeting}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </li>

            <li className="pt-2 px-2">
              <Link
                href="/dashboard/profile"
                onMouseEnter={() => setHoveredItem('profile')}
                onMouseLeave={() => setHoveredItem(null)}
                className={clsx(
                  "relative block px-3 py-2.5 flex items-center gap-3 text-gray-700 dark:text-gray-300 rounded-xl",
                  "transition-all duration-300 overflow-hidden group",
                  hoveredItem === 'profile'
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 translate-x-1"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
                )}
              >
                <div className="relative">
                  <User className={clsx(
                    "w-4 h-4 transition-all duration-300",
                    hoveredItem === 'profile' && "rotate-12 scale-110 text-indigo-500"
                  )} />
                </div>

                <span className="font-medium flex-1">View Profile</span>

                <ChevronDown className={clsx(
                  "w-4 h-4 -rotate-90 transition-all duration-300",
                  hoveredItem === 'profile' ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                )} />
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Link>
            </li>

            <li className="px-2 pb-2">
              <Link
                href="/dashboard/settings"
                onMouseEnter={() => setHoveredItem('settings')}
                onMouseLeave={() => setHoveredItem(null)}
                className={clsx(
                  "relative block px-3 py-2.5 flex items-center gap-3 text-gray-700 dark:text-gray-300 rounded-xl",
                  "transition-all duration-300 overflow-hidden group",
                  hoveredItem === 'settings'
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 translate-x-1"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
                )}
              >
                <div className="relative">
                  <Settings className={clsx(
                    "w-4 h-4 transition-all duration-500",
                    hoveredItem === 'settings' && "rotate-180 scale-110 text-indigo-500"
                  )} />
                </div>

                <span className="font-medium flex-1">Settings</span>

                <ChevronDown className={clsx(
                  "w-4 h-4 -rotate-90 transition-all duration-300",
                  hoveredItem === 'settings' ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                )} />

                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Link>
            </li>

            <hr className="my-1 border-gray-200 dark:border-gray-700" />

            <li className="p-2">
              <div className={clsx(
                "transform transition-all duration-300",
                hoveredItem === 'logout' && "scale-105"
              )}>
                <LogoutButton
                  onLogout={() => {
                    setUser(null);
                    setIsOpen(false);
                  }}
                />
              </div>
            </li>
          </ul>

          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 text-center">
            <p className="text-[10px] text-gray-400">
              Signed in as <span className="font-medium text-gray-600 dark:text-gray-300">{user?.username || 'user'}</span>
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease infinite;
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease infinite;
        }
        
        .border-3 {
          border-width: 3px;
        }
      `}</style>
    </div>
  );
}

const clsx = (...classes: any[]) => {
  return classes.filter(Boolean).join(' ');
};
