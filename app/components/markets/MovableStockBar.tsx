'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
    TrendingUp, TrendingDown, Star, StarHalf,
    ChevronLeft, ChevronRight, RefreshCw,
    AlertCircle, GripHorizontal, Eye, EyeOff,
    Volume2, DollarSign, BarChart3, Briefcase
} from 'lucide-react';

interface StockData {
    Symbol: string;
    "Company Name": string;
    "Current Price": string;
    Change?: number;
    ChangePercent?: number;
    Volume?: string;
    "Market Cap"?: string;
    Sector?: string;
    [key: string]: any;
}

interface MovableStockBarProps {
    stocks: StockData[];
    selectedStock: string;
    onSelectStock: (symbol: string) => void;
    watchlist?: string[];
    onToggleWatchlist?: (symbol: string) => void;
    isLoading?: boolean;
    error?: string | null;
    onRetry?: () => void;
    title?: string;
    showVolume?: boolean;
    showMarketCap?: boolean;
    showSector?: boolean;
    showExtendedInfo?: boolean;
    variant?: 'default' | 'compact' | 'expanded';
    maxItems?: number;
    autoScroll?: boolean;
    scrollSpeed?: number;
}

export default function MovableStockBar({
    stocks,
    selectedStock,
    onSelectStock,
    watchlist = [],
    onToggleWatchlist,
    isLoading = false,
    error = null,
    onRetry,
    title = "🔥 Hot Stocks",
    showVolume = true,
    showMarketCap = false,
    showSector = true,
    showExtendedInfo = false,
    variant = 'default',
    maxItems = 50,
    autoScroll = false,
    scrollSpeed = 0.5
}: MovableStockBarProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [hoveredStock, setHoveredStock] = useState<string | null>(null);
    const animationRef = useRef<number>();
    const [displayStocks, setDisplayStocks] = useState<StockData[]>([]);

    // Filter and prepare stocks for display
    useEffect(() => {
        // Filter out stocks with invalid data and sort by activity/change
        const validStocks = stocks
            .filter(stock => stock.Symbol && parseFloat(stock["Current Price"] || '0') > 0)
            .sort((a, b) => {
                // Sort by absolute change percentage (most active first)
                const changeA = Math.abs(a.ChangePercent || 0);
                const changeB = Math.abs(b.ChangePercent || 0);
                return changeB - changeA;
            })
            .slice(0, maxItems);

        setDisplayStocks(validStocks);
    }, [stocks, maxItems]);

    // Auto-scroll functionality
    useEffect(() => {
        if (!autoScroll || isPaused || isDragging || !scrollContainerRef.current) return;

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
    }, [autoScroll, isPaused, isDragging, scrollSpeed, displayStocks]);

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
    }, [checkScrollPosition, displayStocks]);

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
            const scrollAmount = 300;
            const currentScroll = scrollContainerRef.current.scrollLeft;
            scrollContainerRef.current.scrollTo({
                left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Format functions
    const formatPrice = (price: string | number) => {
        const num = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    };

    const formatLargeNumber = (num: number) => {
        if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
        return num.toString();
    };

    const formatVolume = (volume: string) => {
        const num = parseInt(volume || '0');
        if (num >= 1e7) return `${(num / 1e7).toFixed(2)}Cr`;
        if (num >= 1e5) return `${(num / 1e5).toFixed(2)}L`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
        return num.toString();
    };

    const getChangeColor = (change: number = 0) => {
        if (change > 0) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
        if (change < 0) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
    };

    // Loading state
    if (isLoading && displayStocks.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-indigo-500" />
                        {title}
                    </h3>
                </div>
                <div className="flex gap-3 overflow-hidden">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 w-48 bg-gray-100 dark:bg-gray-800 rounded-lg p-3 animate-pulse"
                        >
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1"></div>
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (error && displayStocks.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-col items-center justify-center text-center">
                    <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">Failed to load stocks</h3>
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

    // No stocks state
    if (displayStocks.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-col items-center justify-center text-center">
                    <Briefcase className="w-8 h-8 text-gray-400 mb-2" />
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">No stocks available</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Check back later for market data</p>
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
                        <BarChart3 className="w-4 h-4 text-indigo-500" />
                        {title}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {displayStocks.length} stocks
                    </span>
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

            {/* Scrollable stock bar */}
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
                <div className="flex gap-2 p-3 min-w-min">
                    {displayStocks.map((stock) => {
                        const isSelected = selectedStock === stock.Symbol;
                        const isWatched = watchlist.includes(stock.Symbol);
                        const isHovered = hoveredStock === stock.Symbol;
                        const price = parseFloat(stock["Current Price"] || '0');
                        const change = stock.Change || 0;
                        const changePercent = stock.ChangePercent || 0;
                        const volume = stock.Volume || '0';
                        const marketCap = parseFloat(stock["Market Cap"] || '0');

                        return (
                            <div
                                key={stock.Symbol}
                                className={`flex-shrink-0 w-56 rounded-xl transition-all duration-200 ${isSelected
                                    ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                    : isHovered
                                        ? 'bg-gray-50 dark:bg-gray-800 shadow-md'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                    }`}
                                onMouseEnter={() => setHoveredStock(stock.Symbol)}
                                onMouseLeave={() => setHoveredStock(null)}
                            >
                                <div
                                    className="p-3 cursor-pointer"
                                    onClick={() => onSelectStock(stock.Symbol)}
                                >
                                    {/* Symbol and Watchlist */}
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900 dark:text-white">
                                                {stock.Symbol}
                                            </span>
                                            {showSector && stock.Sector && (
                                                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                                    {stock.Sector}
                                                </span>
                                            )}
                                        </div>
                                        {onToggleWatchlist && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleWatchlist(stock.Symbol);
                                                }}
                                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                                            >
                                                <Star
                                                    className={`w-3 h-3 ${isWatched
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                                        }`}
                                                />
                                            </button>
                                        )}
                                    </div>

                                    {/* Company Name (truncated) */}
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
                                        {stock["Company Name"] || stock.Symbol}
                                    </p>

                                    {/* Price and Change */}
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                                            {formatPrice(price)}
                                        </span>
                                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${getChangeColor(change)}`}>
                                            {change > 0 ? (
                                                <TrendingUp className="w-3 h-3" />
                                            ) : change < 0 ? (
                                                <TrendingDown className="w-3 h-3" />
                                            ) : null}
                                            <span className="text-xs font-medium">
                                                {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Additional Info - conditionally shown */}
                                    {(showVolume || showMarketCap || showExtendedInfo) && (
                                        <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                                            {showVolume && (
                                                <div className="flex items-center gap-1">
                                                    <Volume2 className="w-3 h-3" />
                                                    <span>{formatVolume(volume)}</span>
                                                </div>
                                            )}
                                            {showMarketCap && marketCap > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <Briefcase className="w-3 h-3" />
                                                    <span>{formatLargeNumber(marketCap)}</span>
                                                </div>
                                            )}
                                            {showExtendedInfo && (
                                                <>
                                                    <div className="flex items-center gap-1">
                                                        <DollarSign className="w-3 h-3" />
                                                        <span>${formatLargeNumber(price)}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom gradient indicators for smooth edges */}
            <div className="relative h-1 bg-gradient-to-r from-transparent via-indigo-200 dark:via-indigo-800 to-transparent"></div>
        </div>
    );
}