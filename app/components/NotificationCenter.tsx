'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Bell, X, ChevronRight, TrendingUp, TrendingDown,
    AlertCircle, CheckCircle, Info, Clock, Calendar,
    ExternalLink, RefreshCw, Newspaper, DollarSign,
    Briefcase, Globe, Zap, Award, Star, Download,
    Filter, Bookmark, Share2, ThumbsUp, MessageCircle,
    Maximize2, Minimize2, Settings, Moon, Sun,
    Twitter, Facebook, Linkedin, Mail, Link2,
    ArrowUpRight, ArrowDownRight, PieChart, BarChart3,
    Activity, Users, Target, Rocket, Sparkles
} from 'lucide-react';
import { useTheme } from 'next-themes';

export interface NewsItem {
    id: string;
    title: string;
    description: string;
    source: string;
    author?: string;
    url: string;
    imageUrl?: string;
    publishedAt: string;
    category: 'market' | 'economy' | 'stocks' | 'crypto' | 'world' | 'tech';
    sentiment: 'positive' | 'negative' | 'neutral';
    impact: 'high' | 'medium' | 'low';
    relatedStocks?: string[];
    read: boolean;
    saved: boolean;
}

export interface NotificationItem {
    id: string;
    type: 'price_alert' | 'portfolio' | 'watchlist' | 'system' | 'news' | 'recommendation';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    priority: 'high' | 'medium' | 'low';
    actionUrl?: string;
    data?: any;
}

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
    className?: string;
    position?: 'left' | 'right';
    width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showNews?: boolean;
    showNotifications?: boolean;
    onNotificationClick?: (notification: NotificationItem) => void;
    onNewsClick?: (news: NewsItem) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
    isOpen,
    onClose,
    className = '',
    position = 'right',
    width = 'md',
    showNews = true,
    showNotifications = true,
    onNotificationClick,
    onNewsClick
}) => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<'notifications' | 'news' | 'both'>('both');
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState({
        notifications: false,
        news: false
    });
    const [filter, setFilter] = useState({
        category: 'all',
        sentiment: 'all',
        read: 'all'
    });
    const [autoRefresh, setAutoRefresh] = useState(false); // Changed to false to prevent constant refreshing
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [savedItems, setSavedItems] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [compact, setCompact] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);

    // Add refs for caching
    const newsCacheRef = useRef<NewsItem[]>([]);
    const notificationsCacheRef = useRef<NotificationItem[]>([]);
    const refreshIntervalRef = useRef<NodeJS.Timeout>();

    useEffect(() => setMounted(true), []);

    // Load saved items from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem('savedNews');
            if (saved) {
                setSavedItems(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading saved items:', error);
        }
    }, []);

    // Fetch data when modal opens
    useEffect(() => {
        if (isOpen) {
            if (newsCacheRef.current.length > 0) {
                setNews(newsCacheRef.current);
            } else {
                fetchNews();
            }

            if (notificationsCacheRef.current.length > 0) {
                setNotifications(notificationsCacheRef.current);
            } else {
                fetchNotifications();
            }
        }
    }, [isOpen]);

    // Handle auto-refresh
    useEffect(() => {
        if (autoRefresh && isOpen) {
            refreshIntervalRef.current = setInterval(() => {
                fetchNews();
                fetchNotifications();
            }, 300000); // 5 minutes
        }

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, [autoRefresh, isOpen]);

    const fetchNotifications = useCallback(async () => {
        if (!isOpen) return;

        setLoading(prev => ({ ...prev, notifications: true }));
        try {
            // In production, fetch from API
            const mockNotifications: NotificationItem[] = [
                {
                    id: '1',
                    type: 'price_alert',
                    title: '🚀 RELIANCE Price Alert',
                    message: 'RELIANCE crossed ₹2,500, up 5.2% today',
                    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
                    read: false,
                    priority: 'high',
                    actionUrl: '/dashboard/stock-dashboard/RELIANCE',
                    data: { symbol: 'RELIANCE', price: 2500, change: 5.2 }
                },
                {
                    id: '2',
                    type: 'portfolio',
                    title: '💰 Portfolio Update',
                    message: 'Your portfolio is up 2.3% today, led by TCS',
                    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
                    read: false,
                    priority: 'medium',
                    actionUrl: '/dashboard/portfolio'
                },
                {
                    id: '3',
                    type: 'watchlist',
                    title: '⭐ Watchlist Alert',
                    message: 'HDFC Bank (HDFC) is down 3.1%, near 52-week low',
                    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
                    read: true,
                    priority: 'high',
                    actionUrl: '/dashboard/stock-dashboard/HDFC'
                },
                {
                    id: '4',
                    type: 'news',
                    title: '📰 Market News',
                    message: 'RBI keeps repo rate unchanged at 6.5%',
                    timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
                    read: true,
                    priority: 'medium'
                },
                {
                    id: '5',
                    type: 'recommendation',
                    title: '🎯 Stock Recommendation',
                    message: 'Analysts suggest BUY for Infosys with target ₹1,800',
                    timestamp: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
                    read: false,
                    priority: 'low',
                    actionUrl: '/dashboard/stock-dashboard/INFY'
                },
                {
                    id: '6',
                    type: 'system',
                    title: '⚙️ System Update',
                    message: 'New features added to comparison tool',
                    timestamp: new Date(Date.now() - 5 * 60 * 60000).toISOString(),
                    read: false,
                    priority: 'low'
                }
            ];

            notificationsCacheRef.current = mockNotifications;
            setNotifications(mockNotifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(prev => ({ ...prev, notifications: false }));
            setLastUpdated(new Date());
        }
    }, [isOpen]);

    const fetchNews = useCallback(async () => {
        if (!isOpen) return;
        setLoading(prev => ({ ...prev, news: true }));
        try {
            const newsItems: NewsItem[] = [];

            if (process.env.NEXT_PUBLIC_NEWS_API_KEY) {
                try {
                    const response = await fetch(
                        `https://newsapi.org/v2/everything?q=stock+market+OR+stocks&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}&pageSize=10&sortBy=publishedAt&language=en`
                    );

                    if (response.ok) {
                        const data = await response.json();

                        if (data.articles && data.articles.length > 0) {
                            const apiNews: NewsItem[] = data.articles.map((article: any, index: number) => ({
                                id: `newsapi-${Date.now()}-${index}`,
                                title: article.title || 'No title',
                                description: article.description || article.content || 'No description available',
                                source: article.source?.name || 'Unknown Source',
                                author: article.author,
                                url: article.url,
                                imageUrl: article.urlToImage,
                                publishedAt: article.publishedAt || new Date().toISOString(),
                                category: determineCategory(article.title + ' ' + (article.description || '')),
                                sentiment: determineSentiment(article.title + ' ' + (article.description || '')),
                                impact: determineImpact(article.title + ' ' + (article.description || '')),
                                relatedStocks: extractStockSymbols(article.title + ' ' + (article.description || '')),
                                read: false,
                                saved: false
                            }));
                            newsItems.push(...apiNews);
                        }
                    }
                } catch (error) {
                    console.error('❌ NewsAPI fetch failed:', error);
                }
            }

            if (newsItems.length < 5 && process.env.NEXT_PUBLIC_FINNHUB_API_KEY) {
                try {
                    const response = await fetch(
                        `https://finnhub.io/api/v1/news?category=general&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`
                    );

                    if (response.ok) {
                        const data = await response.json();

                        if (Array.isArray(data) && data.length > 0) {
                            const finnhubNews: NewsItem[] = data.slice(0, 5).map((item: any, index: number) => ({
                                id: `finnhub-${Date.now()}-${index}`,
                                title: item.headline || 'No title',
                                description: item.summary || item.headline || 'No description available',
                                source: item.source || 'Finnhub',
                                url: item.url || '#',
                                imageUrl: item.image,
                                publishedAt: new Date(item.datetime * 1000).toISOString(),
                                category: determineCategory(item.headline || ''),
                                sentiment: determineSentiment(item.headline || ''),
                                impact: determineImpact(item.headline || ''),
                                relatedStocks: item.related ? item.related.split(',') : [],
                                read: false,
                                saved: false
                            }));
                            newsItems.push(...finnhubNews);
                        }
                    }
                } catch (error) {
                    console.error('❌ Finnhub fetch failed:', error);
                }
            }

            if (newsItems.length === 0) {
                const mockNews = generateMockNews();
                newsItems.push(...mockNews);
            }

            const uniqueNews = Array.from(
                new Map(newsItems.map(item => [item.title, item])).values()
            ).sort((a, b) =>
                new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
            );

            newsCacheRef.current = uniqueNews;
            setNews(uniqueNews);

        } catch (error) {
            console.error('❌ Error in fetchNews:', error);
            const mockNews = generateMockNews();
            newsCacheRef.current = mockNews;
            setNews(mockNews);
        } finally {
            setLoading(prev => ({ ...prev, news: false }));
            setLastUpdated(new Date());
        }
    }, [isOpen]);

    const determineCategory = (text: string): 'market' | 'economy' | 'stocks' | 'crypto' | 'world' | 'tech' => {
        const lowerText = text.toLowerCase();

        if (lowerText.includes('crypto') || lowerText.includes('bitcoin') || lowerText.includes('ethereum')) {
            return 'crypto';
        }
        if (lowerText.includes('economy') || lowerText.includes('gdp') || lowerText.includes('inflation') || lowerText.includes('rbi') || lowerText.includes('fed')) {
            return 'economy';
        }
        if (lowerText.includes('stock') || lowerText.includes('share') || lowerText.includes('reliance') || lowerText.includes('tcs') || lowerText.includes('hdfc')) {
            return 'stocks';
        }
        if (lowerText.includes('tech') || lowerText.includes('technology') || lowerText.includes('ai') || lowerText.includes('software')) {
            return 'tech';
        }
        if (lowerText.includes('world') || lowerText.includes('global') || lowerText.includes('international')) {
            return 'world';
        }

        return 'market';
    };

    const extractStockSymbols = (text: string): string[] => {
        const commonSymbols = ['RELIANCE', 'TCS', 'HDFC', 'INFY', 'ICICIBANK', 'SBIN', 'BHARTIARTL', 'ITC', 'KOTAKBANK', 'LT', 'WIPRO', 'HCLTECH', 'ASIANPAINT', 'MARUTI', 'TATAMOTORS'];
        const found: string[] = [];
        const upperText = text.toUpperCase();

        for (const symbol of commonSymbols) {
            if (upperText.includes(symbol)) {
                found.push(symbol);
            }
        }

        return found;
    };

    const generateMockNews = (): NewsItem[] => {
        const sources = ['Economic Times', 'Bloomberg', 'Reuters', 'CNBC', 'Financial Times', 'Mint', 'Business Standard'];
        const categories: Array<'market' | 'economy' | 'stocks' | 'crypto' | 'world' | 'tech'> = ['market', 'economy', 'stocks', 'world', 'tech'];
        const sentiments: Array<'positive' | 'negative' | 'neutral'> = ['positive', 'neutral', 'negative'];

        const templates = [
            {
                title: 'Sensex hits all-time high, crosses 75,000 for first time',
                description: 'Indian stock market benchmarks Sensex and Nifty hit record highs today driven by strong foreign inflows and positive economic data.',
                category: 'market' as const,
                sentiment: 'positive' as const
            },
            {
                title: 'RBI keeps repo rate unchanged at 6.5% for 6th time',
                description: 'Reserve Bank of India maintains status quo on interest rates, hints at policy pivot in coming months.',
                category: 'economy' as const,
                sentiment: 'neutral' as const
            },
            {
                title: 'Reliance Industries announces ₹20,000 crore investment in green energy',
                description: 'Reliance Industries Ltd unveils massive investment plan for renewable energy projects over next 3 years.',
                category: 'stocks' as const,
                sentiment: 'positive' as const,
                symbols: ['RELIANCE']
            },
            {
                title: 'TCS wins $2.5 billion deal from UK pension fund',
                description: 'Tata Consultancy Services secures largest deal in company history for digital transformation project.',
                category: 'stocks' as const,
                sentiment: 'positive' as const,
                symbols: ['TCS']
            },
            {
                title: 'Global markets rally on Fed rate cut expectations',
                description: 'Asian and European markets surge as investors bet on US rate cuts later this year.',
                category: 'world' as const,
                sentiment: 'positive' as const
            }
        ];

        const now = new Date();
        const mockNews: NewsItem[] = [];

        for (let i = 0; i < templates.length; i++) {
            const template = templates[i];
            const date = new Date(now);
            date.setHours(date.getHours() - i * 2);

            mockNews.push({
                id: `mock-${Date.now()}-${i}`,
                title: template.title,
                description: template.description,
                source: sources[Math.floor(Math.random() * sources.length)],
                url: '#',
                imageUrl: `https://picsum.photos/800/400?random=${i}`,
                publishedAt: date.toISOString(),
                category: template.category,
                sentiment: template.sentiment,
                impact: Math.random() > 0.5 ? 'high' : 'medium',
                relatedStocks: template.symbols || [],
                read: false,
                saved: false
            });
        }

        for (let i = 0; i < 3; i++) {
            const date = new Date(now);
            date.setHours(date.getHours() - (i + 5));

            mockNews.push({
                id: `mock-${Date.now()}-${i + 5}`,
                title: `Market Update: ${sentiments[Math.floor(Math.random() * sentiments.length)] === 'positive' ? 'Gainers' : 'Losers'} lead the session`,
                description: `Markets are ${sentiments[Math.floor(Math.random() * sentiments.length)]} today with notable movements in banking and IT sectors.`,
                source: sources[Math.floor(Math.random() * sources.length)],
                url: '#',
                imageUrl: `https://picsum.photos/800/400?random=${i + 10}`,
                publishedAt: date.toISOString(),
                category: categories[Math.floor(Math.random() * categories.length)],
                sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
                impact: Math.random() > 0.7 ? 'high' : 'medium',
                relatedStocks: [],
                read: false,
                saved: false
            });
        }

        return mockNews;
    };

    const determineSentiment = (text: string): 'positive' | 'negative' | 'neutral' => {
        const positiveWords = ['surge', 'gain', 'rally', 'high', 'up', 'positive', 'growth', 'profit'];
        const negativeWords = ['drop', 'fall', 'low', 'down', 'negative', 'loss', 'decline', 'crash'];

        const lowerText = text.toLowerCase();
        const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
        const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    };

    const determineImpact = (text: string): 'high' | 'medium' | 'low' => {
        const highImpact = ['historic', 'massive', 'major', 'critical', 'emergency', 'crisis'];
        const lowerText = text.toLowerCase();

        if (highImpact.some(word => lowerText.includes(word))) return 'high';
        return 'medium';
    };

    const markAsRead = (id: string, type: 'notification' | 'news') => {
        if (type === 'notification') {
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
            notificationsCacheRef.current = notificationsCacheRef.current.map(n =>
                n.id === id ? { ...n, read: true } : n
            );
        } else {
            setNews(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
            newsCacheRef.current = newsCacheRef.current.map(n =>
                n.id === id ? { ...n, read: true } : n
            );
        }
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setNews(prev => prev.map(n => ({ ...n, read: true })));
        notificationsCacheRef.current = notificationsCacheRef.current.map(n => ({ ...n, read: true }));
        newsCacheRef.current = newsCacheRef.current.map(n => ({ ...n, read: true }));
    };

    const toggleSave = (id: string) => {
        setSavedItems(prev => {
            const updated = prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id];
            localStorage.setItem('savedNews', JSON.stringify(updated));
            return updated;
        });
    };

    const formatRelativeTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'price_alert':
                return <TrendingUp className="w-4 h-4 text-blue-500" />;
            case 'portfolio':
                return <Briefcase className="w-4 h-4 text-green-500" />;
            case 'watchlist':
                return <Star className="w-4 h-4 text-yellow-500" />;
            case 'system':
                return <Settings className="w-4 h-4 text-purple-500" />;
            case 'news':
                return <Newspaper className="w-4 h-4 text-indigo-500" />;
            case 'recommendation':
                return <Target className="w-4 h-4 text-orange-500" />;
            default:
                return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
            case 'medium':
                return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
            case 'low':
                return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
            default:
                return 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400';
        }
    };

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive':
                return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-l-4 border-green-500';
            case 'negative':
                return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-l-4 border-red-500';
            default:
                return 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-l-4 border-gray-500';
        }
    };

    const filteredNews = news.filter(item => {
        if (filter.category !== 'all' && item.category !== filter.category) return false;
        if (filter.sentiment !== 'all' && item.sentiment !== filter.sentiment) return false;
        if (filter.read === 'read' && !item.read) return false;
        if (filter.read === 'unread' && item.read) return false;
        return true;
    });

    const filteredNotifications = notifications.filter(item => {
        if (filter.read === 'read' && !item.read) return false;
        if (filter.read === 'unread' && item.read) return false;
        return true;
    });

    const widthClasses = {
        sm: 'w-80',
        md: 'w-96',
        lg: 'w-[480px]',
        xl: 'w-[600px]',
        full: 'w-screen'
    };

    const handleRefresh = () => {
        fetchNews();
        fetchNotifications();
    };

    if (!mounted) return null;

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                onClick={onClose}
            />

            <div
                className={`fixed top-0 bottom-0 ${position === 'right' ? 'right-0' : 'left-0'} 
                    ${fullscreen ? 'w-screen' : widthClasses[width]}
                    bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col transition-all duration-300 ${className}`}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            {activeTab === 'notifications' ? 'Notifications' :
                                activeTab === 'news' ? 'Market News' : 'Activity Center'}
                        </h2>
                        {(notifications.filter(n => !n.read).length > 0 ||
                            news.filter(n => !n.read).length > 0) && (
                                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                    {notifications.filter(n => !n.read).length +
                                        news.filter(n => !n.read).length}
                                </span>
                            )}
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>

                        <button
                            onClick={() => setFullscreen(!fullscreen)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>

                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex border-b border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('both')}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === 'both'
                            ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === 'notifications'
                            ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        Notifications
                        {notifications.filter(n => !n.read).length > 0 && (
                            <span className="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('news')}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === 'news'
                            ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        News
                        {news.filter(n => !n.read).length > 0 && (
                            <span className="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                    </button>
                </div>

                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <Filter className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setCompact(!compact)}
                                className={`p-2 rounded-lg transition-colors ${compact ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <Activity className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleRefresh}
                                disabled={loading.notifications || loading.news}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading.notifications || loading.news ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {formatRelativeTime(lastUpdated.toISOString())}
                        </div>
                    </div>

                    {showFilters && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <div className="grid grid-cols-2 gap-3">
                                <select
                                    value={filter.category}
                                    onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
                                    className="px-2 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="market">Market</option>
                                    <option value="economy">Economy</option>
                                    <option value="stocks">Stocks</option>
                                    <option value="crypto">Crypto</option>
                                    <option value="world">World</option>
                                    <option value="tech">Tech</option>
                                </select>

                                <select
                                    value={filter.sentiment}
                                    onChange={(e) => setFilter(prev => ({ ...prev, sentiment: e.target.value }))}
                                    className="px-2 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
                                >
                                    <option value="all">All Sentiment</option>
                                    <option value="positive">Positive</option>
                                    <option value="neutral">Neutral</option>
                                    <option value="negative">Negative</option>
                                </select>

                                <select
                                    value={filter.read}
                                    onChange={(e) => setFilter(prev => ({ ...prev, read: e.target.value }))}
                                    className="px-2 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
                                >
                                    <option value="all">All Items</option>
                                    <option value="read">Read</option>
                                    <option value="unread">Unread</option>
                                </select>

                                <button
                                    onClick={markAllAsRead}
                                    className="px-2 py-1.5 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                >
                                    Mark All Read
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading.notifications || loading.news ? (
                        <div className="flex items-center justify-center h-32">
                            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {(activeTab === 'notifications' || activeTab === 'both') &&
                                filteredNotifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        onClick={() => {
                                            markAsRead(notification.id, 'notification');
                                            onNotificationClick?.(notification);
                                            if (notification.actionUrl) {
                                                window.location.href = notification.actionUrl;
                                            }
                                        }}
                                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-1">
                                                    <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                                                        }`}>
                                                        {notification.title}
                                                    </p>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getPriorityColor(notification.priority)}`}>
                                                        {notification.priority}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                                    <Clock className="w-3 h-3" />
                                                    {formatRelativeTime(notification.timestamp)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            {(activeTab === 'news' || activeTab === 'both') &&
                                filteredNews.map(item => (
                                    <div
                                        key={item.id}
                                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!item.read ? 'bg-green-50/50 dark:bg-green-900/10' : ''
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            {item.imageUrl && !compact && (
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.title}
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <div className="flex-1">
                                                        <p className={`text-sm font-medium ${!item.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                                                            }`}>
                                                            {item.title}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleSave(item.id);
                                                        }}
                                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                                    >
                                                        <Star className={`w-3 h-3 ${savedItems.includes(item.id) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'
                                                            }`} />
                                                    </button>
                                                </div>

                                                {!compact && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-2 line-clamp-2">
                                                        {item.description}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getSentimentColor(item.sentiment)}`}>
                                                        {item.sentiment}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500">{item.source}</span>
                                                    <span className="text-[10px] text-gray-400">•</span>
                                                    <span className="text-[10px] text-gray-400">
                                                        {formatRelativeTime(item.publishedAt)}
                                                    </span>
                                                </div>

                                                {item.relatedStocks && item.relatedStocks.length > 0 && (
                                                    <div className="flex items-center gap-1 mt-2">
                                                        {item.relatedStocks.map(symbol => (
                                                            <a
                                                                key={symbol}
                                                                href={`/dashboard/stock-dashboard/${symbol}`}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                                                            >
                                                                {symbol}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 mt-2">
                                                    <a
                                                        href={item.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="flex items-center gap-1 text-[10px] text-indigo-600 hover:underline"
                                                    >
                                                        Read more
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAsRead(item.id, 'news');
                                                        }}
                                                        className="text-[10px] text-gray-400 hover:text-gray-600"
                                                    >
                                                        Mark as read
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            {((activeTab === 'notifications' && filteredNotifications.length === 0) ||
                                (activeTab === 'news' && filteredNews.length === 0) ||
                                (activeTab === 'both' && filteredNotifications.length === 0 && filteredNews.length === 0)) && (
                                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                        <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                                        <p className="text-gray-500 dark:text-gray-400 mb-2">No items to show</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                            {activeTab === 'notifications' ? 'You have no notifications' :
                                                activeTab === 'news' ? 'No news available' :
                                                    'Your feed is empty'}
                                        </p>
                                        {activeTab === 'news' && (
                                            <button
                                                onClick={fetchNews}
                                                className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                                            >
                                                Refresh News
                                            </button>
                                        )}
                                    </div>
                                )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="autoRefresh"
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                                className="rounded border-gray-300 text-indigo-600"
                            />
                            <label htmlFor="autoRefresh">Auto-refresh</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <a href="#" className="hover:text-indigo-600">Settings</a>
                            <span>•</span>
                            <a href="#" className="hover:text-indigo-600">Help</a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export const useNotificationCenter = () => {
    const [isOpen, setIsOpen] = useState(false);

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);
    const toggle = () => setIsOpen(prev => !prev);

    return {
        isOpen,
        open,
        close,
        toggle,
        NotificationCenter: (props: Omit<NotificationCenterProps, 'isOpen' | 'onClose'>) => (
            <NotificationCenter
                isOpen={isOpen}
                onClose={close}
                {...props}
            />
        )
    };
};