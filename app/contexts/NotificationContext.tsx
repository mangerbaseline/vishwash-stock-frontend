// app/contexts/NotificationContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'upgrade' | 'achievement' | 'market' | 'user' | 'security' | 'camera' | 'gift' | 'target';
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: string;
    metadata?: any;
    priority?: 'low' | 'medium' | 'high';
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    showDropdown: boolean;
    setShowDropdown: (show: boolean) => void;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    clearAll: () => Promise<void>;
    fetchNotifications: () => Promise<void>;
    addNotification: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch unread message count from backend
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                    const response = await fetch(`${apiUrl}/api/messages/notifications/count`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.notifications) {
                            setUnreadCount(data.notifications.messages || 0);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching notification count:', error);
                }
            }

            // Get user data from localStorage for dynamic notifications
            let user = null;
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    user = JSON.parse(userStr);
                } else {
                    // Try to get from token or other storage
                    const token = localStorage.getItem('token');
                    if (token) {
                        // You might want to decode token or fetch user profile here
                        console.log('User token found but no user data');
                    }
                }
            } catch (e) {
                console.error('Error parsing user from localStorage', e);
            }

            // Generate dynamic notifications based on user state
            const dynamicNotifications: Notification[] = [];

            if (user) {
                // Check if profile photo is missing
                if (!user.photo) {
                    dynamicNotifications.push({
                        id: 'photo-reminder-' + Date.now(),
                        type: 'camera',
                        title: '📸 Complete Your Profile',
                        message: 'Add a profile photo to personalize your account and get better recognition',
                        link: '/dashboard/settings',
                        read: false,
                        createdAt: new Date().toISOString(),
                        priority: 'medium'
                    });
                }

                // Check if user is on free plan (you can add a plan field to your user object)
                if (user.plan === 'free' || !user.plan) {
                    dynamicNotifications.push({
                        id: 'upgrade-suggestion-' + Date.now(),
                        type: 'upgrade',
                        title: '⚡ Unlock Premium Features',
                        message: 'Upgrade to Premium for real-time alerts, advanced charts, and unlimited watchlists',
                        link: '/dashboard/upgrade',
                        read: false,
                        createdAt: new Date().toISOString(),
                        priority: 'medium'
                    });
                }
            }

            // Add some default notifications
            const defaultNotifications: Notification[] = [
                {
                    id: 'welcome-' + Date.now(),
                    type: 'success',
                    title: '🎉 Welcome to TradeWith!',
                    message: 'Start exploring the stock market with our advanced tools',
                    link: '/dashboard/stock-dashboard',
                    read: false,
                    createdAt: new Date().toISOString(),
                    priority: 'low'
                },
                {
                    id: 'market-update-' + Date.now(),
                    type: 'market',
                    title: '📈 Market Update',
                    message: 'Sensex hits all-time high! Check out the latest market trends',
                    link: '/dashboard/stock-dashboard',
                    read: false,
                    createdAt: new Date(Date.now() - 3600000).toISOString(),
                    priority: 'medium'
                },
                {
                    id: 'security-tip-' + Date.now(),
                    type: 'security',
                    title: '🔒 Security Tip',
                    message: 'Enable two-factor authentication to secure your account',
                    link: '/dashboard/settings',
                    read: true,
                    createdAt: new Date(Date.now() - 86400000).toISOString(),
                    priority: 'low'
                }
            ];

            // Try to fetch from API if available (but don't fail if it's not)
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await axios.get('/api/notifications', {
                        headers: { Authorization: `Bearer ${token}` },
                        timeout: 3000 // 3 second timeout
                    });

                    if (response.data.success && response.data.data) {
                        // Merge API notifications with dynamic ones
                        const apiNotifications = response.data.data;
                        const allNotifications = [...dynamicNotifications, ...apiNotifications, ...defaultNotifications];

                        // Remove duplicates by id
                        const uniqueNotifications = Array.from(
                            new Map(allNotifications.map(n => [n.id, n])).values()
                        );

                        setNotifications(uniqueNotifications);
                        setUnreadCount(uniqueNotifications.filter(n => !n.read).length);
                        setLoading(false);
                        return;
                    }
                }
            } catch (apiError) {
                // API not available, just use local notifications
                console.log('Using local notifications (API not available)');
            }

            // Use local notifications if API fails
            const allNotifications = [...dynamicNotifications, ...defaultNotifications];

            // Remove duplicates by id
            const uniqueNotifications = Array.from(
                new Map(allNotifications.map(n => [n.id, n])).values()
            );

            setNotifications(uniqueNotifications);
            setUnreadCount(uniqueNotifications.filter(n => !n.read).length);

        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (id: string) => {
        // Optimistic update
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));

        // Try API call but don't wait for it
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await axios.patch(`/api/notifications/${id}/read`, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 3000
                }).catch(() => {
                    // Silently fail - API might not be available
                    console.log('API not available for mark as read');
                });
            }
        } catch (error) {
            // Ignore API errors
            console.log('Failed to sync with server, but notification marked as read locally');
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);

        // Try API call but don't wait for it
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await axios.patch('/api/notifications/read-all', {}, {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 3000
                }).catch(() => {
                    console.log('API not available for mark all as read');
                });
            }
        } catch (error) {
            // Ignore API errors
            console.log('Failed to sync with server, but all notifications marked as read locally');
        }
    }, []);

    const deleteNotification = useCallback(async (id: string) => {
        // Optimistic update
        setNotifications(prev => {
            const filtered = prev.filter(n => n.id !== id);
            return filtered;
        });
        setUnreadCount(prev => {
            const wasUnread = notifications.find(n => n.id === id)?.read === false;
            return wasUnread ? Math.max(0, prev - 1) : prev;
        });

        // Try API call but don't wait for it
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await axios.delete(`/api/notifications/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 3000
                }).catch(() => {
                    console.log('API not available for delete');
                });
            }
        } catch (error) {
            // Ignore API errors
            console.log('Failed to sync with server, but notification deleted locally');
        }
    }, [notifications]);

    const clearAll = useCallback(async () => {
        // Optimistic update
        setNotifications([]);
        setUnreadCount(0);

        // Try API call but don't wait for it
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await axios.delete('/api/notifications/all', {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 3000
                }).catch(() => {
                    console.log('API not available for clear all');
                });
            }
        } catch (error) {
            // Ignore API errors
            console.log('Failed to sync with server, but all notifications cleared locally');
        }
    }, []);

    const addNotification = useCallback((notification: Notification) => {
        setNotifications(prev => {
            // Check if notification with same id already exists
            const exists = prev.some(n => n.id === notification.id);
            if (exists) return prev;
            return [notification, ...prev];
        });
        if (!notification.read) {
            setUnreadCount(prev => prev + 1);
        }
    }, []);

    // Request notification permission
    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchNotifications();

        // WebSocket setup for real-time notifications
        const token = localStorage.getItem('token');
        if (!token) return;

        const wsUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/^http/, 'ws') + '/ws/notifications';
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log('🔔 Connected to notification WebSocket');
            socket.send(JSON.stringify({ type: 'AUTH', token }));
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'INIT') {
                    setUnreadCount(data.unreadCount);
                } else if (data.type === 'NOTIFICATION') {
                    const newNotification = data.notification;
                    // Map backend Notification to frontend Notification interface
                    const mappedNotif: Notification = {
                        id: newNotification._id,
                        type: (newNotification.type || 'INFO').toLowerCase() as any,
                        title: newNotification.title,
                        message: newNotification.message,
                        link: newNotification.link,
                        read: newNotification.isRead,
                        createdAt: newNotification.createdAt
                    };
                    addNotification(mappedNotif);

                    // Show browser notification if permitted
                    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                        new window.Notification(mappedNotif.title, {
                            body: mappedNotif.message,
                        });
                    }
                }
            } catch (err) {
                console.error('Error parsing WS message:', err);
            }
        };

        socket.onclose = () => {
            console.log('🔌 Disconnected from notification WebSocket');
        };

        return () => {
            socket.close();
        };
    }, [fetchNotifications, addNotification]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            showDropdown,
            setShowDropdown,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            clearAll,
            fetchNotifications,
            addNotification
        }}>
            {children}
        </NotificationContext.Provider>
    );
};