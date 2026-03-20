// app/components/NotificationDropdown.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import {
    Bell, X, Check, AlertCircle, Info, Zap,
    Award, TrendingUp, UserPlus, Shield,
    Clock, ExternalLink, Trash2, CheckCheck,
    Camera, Sparkles, Gift, Target, Rocket,
    Wallet, TrendingDown, BarChart3, Lock
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import clsx from 'clsx';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import router from 'next/router';

const NotificationDropdown = () => {
    const {
        notifications,
        unreadCount,
        loading,
        showDropdown,
        setShowDropdown,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll
    } = useNotifications();

    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setShowDropdown]);

    const getNotificationIcon = (type: string) => {
        const iconProps = { className: "w-5 h-5" };

        switch (type) {
            case 'success':
                return <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400"><Check {...iconProps} /></div>;
            case 'warning':
                return <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600 dark:text-yellow-400"><AlertCircle {...iconProps} /></div>;
            case 'error':
                return <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400"><X {...iconProps} /></div>;
            case 'info':
                return <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400"><Info {...iconProps} /></div>;
            case 'upgrade':
                return <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400"><Zap {...iconProps} /></div>;
            case 'achievement':
                return <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400"><Award {...iconProps} /></div>;
            case 'market':
                return <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400"><TrendingUp {...iconProps} /></div>;
            case 'user':
                return <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-full text-cyan-600 dark:text-cyan-400"><UserPlus {...iconProps} /></div>;
            case 'security':
                return <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-400"><Shield {...iconProps} /></div>;
            case 'camera':
                return <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-full text-pink-600 dark:text-pink-400"><Camera {...iconProps} /></div>;
            case 'gift':
                return <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-full text-rose-600 dark:text-rose-400"><Gift {...iconProps} /></div>;
            case 'target':
                return <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400"><Target {...iconProps} /></div>;
            default:
                return <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400"><Bell {...iconProps} /></div>;
        }
    };

    const handleNotificationClick = (notification: any) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }

        if (notification.link) {
            router.push(notification.link);
        }

        setShowDropdown(false);
    };

    // Dynamic notifications based on user state
    const getDynamicNotifications = () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return [];

        try {
            const user = JSON.parse(userStr);
            const dynamicNotifs = [];

            // Check if profile photo is missing
            if (!user.photo) {
                dynamicNotifs.push({
                    id: 'photo-reminder',
                    type: 'camera',
                    title: '📸 Complete Your Profile',
                    message: 'Add a profile photo to personalize your account and get better recognition',
                    link: '/dashboard/settings',
                    read: false,
                    createdAt: new Date().toISOString(),
                    priority: 'medium'
                });
            }

            // Check if user is on free plan
            if (user.plan === 'free') {
                dynamicNotifs.push({
                    id: 'upgrade-suggestion',
                    type: 'upgrade',
                    title: '⚡ Unlock Premium Features',
                    message: 'Upgrade to Premium for real-time alerts, advanced charts, and unlimited watchlists',
                    link: '/dashboard/upgrade',
                    read: false,
                    createdAt: new Date().toISOString(),
                    priority: 'medium'
                });
            }

            return dynamicNotifs;
        } catch (error) {
            return [];
        }
    };

    // Merge notifications with dynamic ones
    const allNotifications = [...getDynamicNotifications(), ...notifications]
        .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) // Remove duplicates
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <>
            <button
                ref={buttonRef}
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 sm:p-2.5 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110 group"
            >
                <Bell className="text-gray-700 dark:text-gray-300" size={20} />

                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-white text-xs font-bold animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}

                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    Notifications
                </div>
            </button>

            {showDropdown && (
                <div
                    ref={dropdownRef}
                    className="absolute top-16 right-4 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-slide-down"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-indigo-500" />
                            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                                    title="Mark all as read"
                                >
                                    <CheckCheck className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-indigo-500" />
                                </button>
                            )}

                            {allNotifications.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                                    title="Clear all"
                                >
                                    <Trash2 className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-red-500" />
                                </button>
                            )}

                            <button
                                onClick={() => setShowDropdown(false)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
                            >
                                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {loading ? (
                            // Loading Skeleton
                            <div className="p-4 space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-start gap-3 animate-pulse">
                                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : allNotifications.length === 0 ? (
                            // Empty State
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                    <Bell className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 font-medium">No notifications yet</p>
                                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                    We'll notify you when something important happens
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {allNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={clsx(
                                            "relative group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer",
                                            !notification.read && "bg-indigo-50/50 dark:bg-indigo-900/10"
                                        )}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-start gap-3 p-4">
                                            {/* Icon */}
                                            {getNotificationIcon(notification.type)}

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <h4 className={clsx(
                                                            "text-sm font-medium",
                                                            !notification.read
                                                                ? "text-gray-900 dark:text-white"
                                                                : "text-gray-600 dark:text-gray-400"
                                                        )}>
                                                            {notification.title}
                                                        </h4>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 line-clamp-2">
                                                            {notification.message}
                                                        </p>
                                                    </div>

                                                    {/* Delete button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteNotification(notification.id);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all"
                                                    >
                                                        <X className="w-3 h-3 text-gray-400" />
                                                    </button>
                                                </div>

                                                {/* Metadata */}
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-xs text-gray-400 dark:text-gray-600 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                    </span>

                                                    {notification.link && (
                                                        <span className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                                            View <ExternalLink className="w-3 h-3" />
                                                        </span>
                                                    )}

                                                    {!notification.read && (
                                                        <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                                                            New
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {allNotifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <Link
                                href="/notifications"
                                onClick={() => setShowDropdown(false)}
                                className="block w-full text-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                            >
                                View all notifications
                            </Link>
                        </div>
                    )}
                </div>
            )}

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
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
        </>
    );
};

export default NotificationDropdown;