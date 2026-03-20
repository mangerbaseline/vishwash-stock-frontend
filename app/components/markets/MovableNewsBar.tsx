'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
    Newspaper, TrendingUp, TrendingDown, ExternalLink,
    ChevronLeft, ChevronRight, RefreshCw,
    AlertCircle, GripHorizontal, Eye, EyeOff,
    Clock, Globe, ThumbsUp, ThumbsDown,
    Minus, AlertTriangle, CheckCircle, XCircle,
    Sparkles, Flame, Zap, Award
} from 'lucide-react';

interface NewsItem {
    id: string;
    title: string;
    source: string;
    time: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    url: string;
    image?: string;
    description?: string;
    publishedAt: string;
    category?: string;
    impact?: 'high' | 'medium' | 'low';
    relatedStocks?: string[];
}

interface MovableNewsBarProps {
    news: NewsItem[];
    isLoading?: boolean;
    error?: string | null;
    onRetry?: () => void;
    onNewsClick?: (news: NewsItem) => void;
    title?: string;
    showSentiment?: boolean;
    showSource?: boolean;
    showTime?: boolean;
    autoScroll?: boolean;
    scrollSpeed?: number;
    filterBySentiment?: 'all' | 'positive' | 'negative' | 'neutral';
    maxItems?: number;
    variant?: 'default' | 'compact' | 'expanded';
}

export default function MovableNewsBar({
    news,
    isLoading = false,
    error = null,
    onRetry,
    onNewsClick,
    title = "🔥 Hot Market News",
    showSentiment = true,
    showSource = true,
    showTime = true,
    autoScroll = false,
    scrollSpeed = 0.5,
    filterBySentiment = 'all',
    maxItems = 30,
    variant = 'default'
}: MovableNewsBarProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [hoveredNews, setHoveredNews] = useState<string | null>(null);
    const animationRef = useRef<number>();
    const [displayNews, setDisplayNews] = useState<NewsItem[]>([]);

    // Filter news based on sentiment and prepare for display
    useEffect(() => {
        let filtered = [...news];

        // Apply sentiment filter
        if (filterBySentiment !== 'all') {
            filtered = filtered.filter(item => item.sentiment === filterBySentiment);
        }

        // Sort by published date (newest first) and impact
        filtered = filtered
            .sort((a, b) => {
                // First sort by impact (high impact first)
                const impactWeight = { 'high': 3, 'medium': 2, 'low': 1 };
                const impactA = impactWeight[a.impact || 'medium'];
                const impactB = impactWeight[b.impact || 'medium'];

                if (impactA !== impactB) {
                    return impactB - impactA;
                }

                // Then by date
                return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
            })
            .slice(0, maxItems);

        setDisplayNews(filtered);
    }, [news, filterBySentiment, maxItems]);

    // Auto-scroll functionality
    useEffect(() => {
        if (!autoScroll || isPaused || isDragging || !scrollContainerRef.current || displayNews.length === 0) return;

        const scroll = () => {
            if (scrollContainerRef.current && !isPaused && !isDragging) {
                const container = scrollContainerRef.current;
                const maxScrollLeft = container.scrollWidth - container.clientWidth;

                if (container.scrollLeft >= maxScrollLeft - 10) {
                    // Reset to start when reaching the end
                    container.scrollLeft = 0;
                } else {
                    container.scrollLeft += scrollSpeed;
                }
            }
            animationRef.current = requestAnimationFrame(scroll);
        };

        animationRef.current = requestAnimationFrame(scroll);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [autoScroll, isPaused, isDragging, scrollSpeed, displayNews]);

    // Check scroll position for arrows
    const checkScrollPosition = useCallback(() => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftArrow(scrollLeft > 20);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
        }
    }, []);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollPosition);
            checkScrollPosition();
            return () => container.removeEventListener('scroll', checkScrollPosition);
        }
    }, [checkScrollPosition, displayNews]);

    // Drag to scroll handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0));
        setScrollLeft(scrollContainerRef.current?.scrollLeft || 0);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();

        const x = e.pageX - (scrollContainerRef.current.offsetLeft || 0);
        const walk = (x - startX) * 2; // Scroll speed multiplier
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUpOrLeave = () => {
        setIsDragging(false);
    };

    // Manual scroll controls
    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 400;
            const currentScroll = scrollContainerRef.current.scrollLeft;
            scrollContainerRef.current.scrollTo({
                left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Format time
    const formatTime = (timeStr: string) => {
        const date = new Date(timeStr);
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

    // Get sentiment icon and color
    const getSentimentBadge = (sentiment: string) => {
        switch (sentiment) {
            case 'positive':
                return {
                    icon: TrendingUp,
                    color: 'text-green-600 dark:text-green-400',
                    bg: 'bg-green-50 dark:bg-green-900/20',
                    border: 'border-green-200 dark:border-green-800'
                };
            case 'negative':
                return {
                    icon: TrendingDown,
                    color: 'text-red-600 dark:text-red-400',
                    bg: 'bg-red-50 dark:bg-red-900/20',
                    border: 'border-red-200 dark:border-red-800'
                };
            default:
                return {
                    icon: Minus,
                    color: 'text-gray-600 dark:text-gray-400',
                    bg: 'bg-gray-50 dark:bg-gray-800',
                    border: 'border-gray-200 dark:border-gray-700'
                };
        }
    };

    // Get impact indicator
    const getImpactBadge = (impact?: string) => {
        switch (impact) {
            case 'high':
                return {
                    icon: Zap,
                    color: 'text-purple-600 dark:text-purple-400',
                    bg: 'bg-purple-50 dark:bg-purple-900/20',
                    label: 'High Impact'
                };
            case 'medium':
                return {
                    icon: Award,
                    color: 'text-blue-600 dark:text-blue-400',
                    bg: 'bg-blue-50 dark:bg-blue-900/20',
                    label: 'Medium Impact'
                };
            default:
                return {
                    icon: Sparkles,
                    color: 'text-gray-600 dark:text-gray-400',
                    bg: 'bg-gray-50 dark:bg-gray-800',
                    label: 'Low Impact'
                };
        }
    };

    // Loading state
    if (isLoading && displayNews.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        {title}
                    </h3>
                </div>
                <div className="flex gap-3 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 w-72 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 animate-pulse"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                                </div>
                            </div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (error && displayNews.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-col items-center justify-center text-center">
                    <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">Failed to load news</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{error}</p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className="w-3 h-3" />
                            Retry
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // No news state
    if (displayNews.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-col items-center justify-center text-center">
                    <Newspaper className="w-8 h-8 text-gray-400 mb-2" />
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">No news available</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Check back later for market updates</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        {title}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {displayNews.length} stories
                    </span>

                    {/* Sentiment filter indicators */}
                    {filterBySentiment !== 'all' && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${filterBySentiment === 'positive'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : filterBySentiment === 'negative'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                            {filterBySentiment}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Pause/Play for auto-scroll */}
                    {autoScroll && (
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title={isPaused ? 'Resume scrolling' : 'Pause scrolling'}
                        >
                            {isPaused ? (
                                <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            ) : (
                                <EyeOff className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            )}
                        </button>
                    )}

                    {/* Navigation arrows */}
                    <div className="flex gap-1">
                        <button
                            onClick={() => scroll('left')}
                            className={`p-1.5 rounded-lg transition-colors ${showLeftArrow
                                    ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                                    : 'opacity-30 cursor-not-allowed text-gray-300 dark:text-gray-600'
                                }`}
                            disabled={!showLeftArrow}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className={`p-1.5 rounded-lg transition-colors ${showRightArrow
                                    ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                                    : 'opacity-30 cursor-not-allowed text-gray-300 dark:text-gray-600'
                                }`}
                            disabled={!showRightArrow}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Drag handle indicator */}
                    <GripHorizontal className="w-4 h-4 text-gray-400 hidden sm:block" />
                </div>
            </div>

            {/* Scrollable news bar */}
            <div
                ref={scrollContainerRef}
                className={`overflow-x-auto scrollbar-hide select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
                    }`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <div className="flex gap-3 p-3 min-w-min">
                    {displayNews.map((item) => {
                        const isHovered = hoveredNews === item.id;
                        const sentiment = getSentimentBadge(item.sentiment);
                        const SentimentIcon = sentiment.icon;
                        const impact = getImpactBadge(item.impact);
                        const ImpactIcon = impact.icon;

                        return (
                            <div
                                key={item.id}
                                className={`flex-shrink-0 w-80 rounded-xl transition-all duration-200 ${isHovered
                                        ? 'bg-gray-50 dark:bg-gray-800 shadow-lg scale-[1.02]'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                    } ${sentiment.bg} border ${sentiment.border}`}
                                onMouseEnter={() => setHoveredNews(item.id)}
                                onMouseLeave={() => setHoveredNews(null)}
                            >
                                <div
                                    className="p-4 cursor-pointer"
                                    onClick={() => onNewsClick?.(item)}
                                >
                                    {/* Header with source and time */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.source}
                                                    className="w-5 h-5 rounded-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <Globe className="w-4 h-4 text-gray-400" />
                                            )}
                                            {showSource && (
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                    {item.source}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {showSentiment && (
                                                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full ${sentiment.bg}`}>
                                                    <SentimentIcon className={`w-3 h-3 ${sentiment.color}`} />
                                                </div>
                                            )}
                                            {showTime && (
                                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{formatTime(item.publishedAt)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                                        {item.title}
                                    </h4>

                                    {/* Description (if available) */}
                                    {item.description && variant === 'expanded' && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                            {item.description}
                                        </p>
                                    )}

                                    {/* Footer with impact and related stocks */}
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-2">
                                            {item.impact && (
                                                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] ${impact.bg} ${impact.color}`}>
                                                    <ImpactIcon className="w-3 h-3" />
                                                    <span className="font-medium">{impact.label}</span>
                                                </div>
                                            )}
                                            {item.relatedStocks && item.relatedStocks.length > 0 && (
                                                <div className="flex items-center gap-1">
                                                    {item.relatedStocks.slice(0, 2).map(stock => (
                                                        <span
                                                            key={stock}
                                                            className="text-[10px] px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full"
                                                        >
                                                            {stock}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* External link indicator on hover */}
                                        <ExternalLink className={`w-3 h-3 text-gray-400 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'
                                            }`} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom gradient indicator */}
            <div className="relative h-1 bg-gradient-to-r from-transparent via-orange-200 dark:via-orange-800 to-transparent"></div>
        </div>
    );
}