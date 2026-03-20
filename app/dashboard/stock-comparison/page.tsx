'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Search, Plus, X, TrendingUp, TrendingDown,
    BarChart3, LineChart, PieChart, Activity,
    ArrowUpRight, ArrowDownRight, Star, StarOff,
    Download, Share2, Info, RefreshCw,
    Calendar, Clock, Filter, SortAsc, SortDesc,
    ChevronLeft, ChevronRight, Maximize2, Minimize2,
    Eye, EyeOff, Download as DownloadIcon,
    Printer, Mail, Facebook, Twitter, Linkedin,
    CheckCircle, AlertCircle, AlertTriangle,
    DollarSign, Percent, Award, Target,
    Zap, Shield, Users, Briefcase,
    Globe, MapPin, Building2, Hash,
    Scale, Gauge, LineChart as LineChartIcon,
    BarChart4, PieChart as PieChartIcon,
    Grid3x3, LayoutGrid, Table, Crown, Lock
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, Brush,
    ComposedChart, Line, Bar, Radar, RadarChart,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    Radar as RadarIcon, Scatter, ScatterChart,
    ZAxis, Cell, Pie, PieChart as RePieChart
} from 'recharts';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ============== TYPES ==============
interface StockData {
    roe: any;
    Symbol: string;
    "Company Name": string;
    "Current Price": number;
    "Market Cap": number;
    "Stock P/E": number;
    "Dividend Yield": number;
    ROCE: number;
    ROE: number;
    Volume: number;
    Change: number;
    ChangePercent: number;
    Sector: string;
    Industry: string;
    "52WeekHigh": number;
    "52WeekLow": number;
    beta: number;
    analystRating: 'Buy' | 'Hold' | 'Sell';
    targetPrice: number;
    eps: number;
    pbRatio: number;
    debtToEquity: number;
    currentRatio: number;
    quickRatio: number;
    grossMargin: number;
    operatingMargin: number;
    profitMargin: number;
    revenueGrowth: number;
    earningsGrowth: number;
    insiderHolding: number;
    promoterHolding: number;
    institutionalHolding: number;
    lastUpdated: string;
    description?: string;
    founded?: string;
    headquarters?: string;
    website?: string;
    employees?: number;
}

interface ComparisonMetric {
    name: string;
    key: keyof StockData;
    format: 'number' | 'currency' | 'percentage' | 'ratio' | 'string';
    category: 'valuation' | 'financial' | 'performance' | 'technical' | 'fundamental' | 'company';
    description: string;
    higherIsBetter: boolean;
}

interface ChartDataPoint {
    date: string;
    [key: string]: number | string;
}

interface CorrelationData {
    stock1: string;
    stock2: string;
    correlation: number;
}

// ============== MAIN COMPONENT ==============
export default function StockComparisonPage() {
    const { theme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    // Plan states
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [trialExpired, setTrialExpired] = useState(false);
    const [isPaidUser, setIsPaidUser] = useState(false);
    const [comparisonCount, setComparisonCount] = useState(0);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [userPlan, setUserPlan] = useState<'free' | 'basic' | 'premium' | 'enterprise'>('free');
    const [trialDaysLeft, setTrialDaysLeft] = useState(3);

    // Core states
    const [stocks, setStocks] = useState<StockData[]>([]);
    const [selectedStocks, setSelectedStocks] = useState<StockData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<StockData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y'>('1Y');
    const [chartType, setChartType] = useState<'line' | 'area' | 'radar'>('line');
    const [comparisonMode, setComparisonMode] = useState<'metrics' | 'charts' | 'radar' | 'correlation'>('metrics');
    const [sortBy, setSortBy] = useState<string>('Market Cap');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [showDifferences, setShowDifferences] = useState(false);
    const [normalizeData, setNormalizeData] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [correlationData, setCorrelationData] = useState<CorrelationData[]>([]);
    const [hoveredLockedStock, setHoveredLockedStock] = useState<number | null>(null);

    const isDark = theme === 'dark';

    // Check authentication and plan status on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);

        // Simulate checking user plan - replace with actual API call
        const checkUserPlan = async () => {
            // This should be replaced with actual API call to get user subscription status
            const mockUserPlan = localStorage.getItem('userPlan') || 'free';
            const mockTrialExpired = localStorage.getItem('trialExpired') === 'true';
            const mockComparisonCount = parseInt(localStorage.getItem('comparisonCount') || '0');

            setUserPlan(mockUserPlan as any);
            setTrialExpired(mockTrialExpired);
            setIsPaidUser(['basic', 'premium', 'enterprise'].includes(mockUserPlan));
            setComparisonCount(mockComparisonCount);

            // Calculate trial days left (if within trial period)
            if (!mockTrialExpired && mockUserPlan === 'free') {
                const signupDate = localStorage.getItem('signupDate');
                if (signupDate) {
                    const daysSinceSignup = Math.floor((Date.now() - new Date(signupDate).getTime()) / (1000 * 60 * 60 * 24));
                    setTrialDaysLeft(Math.max(0, 3 - daysSinceSignup));
                }
            }
        };

        if (token) {
            checkUserPlan();
        }
    }, []);

    // Update comparison count
    useEffect(() => {
        if (selectedStocks.length >= 2 && isAuthenticated && !isPaidUser) {
            // Increment comparison count when user adds stocks and performs comparison
            const newCount = comparisonCount + 1;
            setComparisonCount(newCount);
            localStorage.setItem('comparisonCount', newCount.toString());

            // Check if trial has expired (after 3 days)
            const signupDate = localStorage.getItem('signupDate');
            if (signupDate) {
                const daysSinceSignup = Math.floor((Date.now() - new Date(signupDate).getTime()) / (1000 * 60 * 60 * 24));
                if (daysSinceSignup >= 3) {
                    setTrialExpired(true);
                    localStorage.setItem('trialExpired', 'true');
                }
            }
        }
    }, [selectedStocks.length]);

    const isStockLocked = (index: number) => {
        // For free users (including trial period)
        if (!isPaidUser) {
            // First 3 stocks are free
            if (index < 3) return false;
            // 4th and 5th stocks are locked for free users
            return true;
        }
        // Paid users can access all 5 stocks
        return false;
    };

    const getLockedStockMessage = () => {
        if (!isAuthenticated) return "Please log in to compare stocks";
        if (trialExpired) return "Your free trial has expired. Upgrade to compare all 5 stocks!";
        if (!isPaidUser) return "Upgrade to Premium to compare 5 stocks!";
        return "This feature requires a premium plan";
    };

    const handleAddStock = (stock: StockData) => {
        if (!isAuthenticated) {
            router.push('/signin');
            return;
        }

        const newIndex = selectedStocks.length;

        // Check if this slot is locked
        if (isStockLocked(newIndex)) {
            setShowUpgradeModal(true);
            return;
        }

        // Check daily limit for free users (5 comparisons per day after trial)
        if (!isPaidUser && trialExpired && comparisonCount >= 5) {
            alert('You have reached your daily limit of 5 comparisons. Please upgrade to continue.');
            setShowUpgradeModal(true);
            return;
        }

        if (selectedStocks.length < 5 && !selectedStocks.find(s => s.Symbol === stock.Symbol)) {
            setSelectedStocks([...selectedStocks, stock]);
            setSearchTerm('');
            setSearchResults([]);
        }
    };

    const handleRemoveStock = (symbol: string) => {
        setSelectedStocks(selectedStocks.filter(s => s.Symbol !== symbol));
    };

    const handleClearAll = () => {
        setSelectedStocks([]);
    };

    const handleUpgradeClick = () => {
        router.push('/pricing');
    };

    // Color palette for charts
    const COLORS = [
        '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#EC4899', '#06B6D4', '#14B8A6', '#F97316', '#6B7280'
    ];

    // Available metrics for comparison
    const metrics: ComparisonMetric[] = [
        // Valuation Metrics
        { name: 'Market Cap', key: 'Market Cap', format: 'number', category: 'valuation', description: 'Total market value of company', higherIsBetter: false },
        { name: 'P/E Ratio', key: 'Stock P/E', format: 'ratio', category: 'valuation', description: 'Price to Earnings ratio', higherIsBetter: false },
        { name: 'P/B Ratio', key: 'pbRatio', format: 'ratio', category: 'valuation', description: 'Price to Book ratio', higherIsBetter: false },
        { name: 'Dividend Yield', key: 'Dividend Yield', format: 'percentage', category: 'valuation', description: 'Annual dividend percentage', higherIsBetter: true },

        // Financial Metrics
        { name: 'ROE', key: 'ROE', format: 'percentage', category: 'financial', description: 'Return on Equity', higherIsBetter: true },
        { name: 'ROCE', key: 'ROCE', format: 'percentage', category: 'financial', description: 'Return on Capital Employed', higherIsBetter: true },
        { name: 'EPS', key: 'eps', format: 'currency', category: 'financial', description: 'Earnings Per Share', higherIsBetter: true },
        { name: 'Debt/Equity', key: 'debtToEquity', format: 'ratio', category: 'financial', description: 'Debt to Equity ratio', higherIsBetter: false },
        { name: 'Current Ratio', key: 'currentRatio', format: 'ratio', category: 'financial', description: 'Current assets to liabilities', higherIsBetter: true },
        { name: 'Quick Ratio', key: 'quickRatio', format: 'ratio', category: 'financial', description: 'Quick assets to liabilities', higherIsBetter: true },

        // Performance Metrics
        { name: 'Revenue Growth', key: 'revenueGrowth', format: 'percentage', category: 'performance', description: 'Year-over-year revenue growth', higherIsBetter: true },
        { name: 'Earnings Growth', key: 'earningsGrowth', format: 'percentage', category: 'performance', description: 'Year-over-year earnings growth', higherIsBetter: true },
        { name: 'Gross Margin', key: 'grossMargin', format: 'percentage', category: 'performance', description: 'Gross profit margin', higherIsBetter: true },
        { name: 'Operating Margin', key: 'operatingMargin', format: 'percentage', category: 'performance', description: 'Operating profit margin', higherIsBetter: true },
        { name: 'Profit Margin', key: 'profitMargin', format: 'percentage', category: 'performance', description: 'Net profit margin', higherIsBetter: true },

        // Technical Metrics
        { name: 'Beta', key: 'beta', format: 'ratio', category: 'technical', description: 'Volatility compared to market', higherIsBetter: false },
        { name: '52W High %', key: '52WeekHigh', format: 'percentage', category: 'technical', description: 'Distance from 52-week high', higherIsBetter: true },
        { name: '52W Low %', key: '52WeekLow', format: 'percentage', category: 'technical', description: 'Distance from 52-week low', higherIsBetter: false },
        { name: 'Volume', key: 'Volume', format: 'number', category: 'technical', description: 'Trading volume', higherIsBetter: true },

        // Holdings
        { name: 'Promoter Holding', key: 'promoterHolding', format: 'percentage', category: 'fundamental', description: 'Promoter shareholding', higherIsBetter: true },
        { name: 'Institutional Holding', key: 'institutionalHolding', format: 'percentage', category: 'fundamental', description: 'Institutional investor holding', higherIsBetter: true },
        { name: 'Insider Holding', key: 'insiderHolding', format: 'percentage', category: 'fundamental', description: 'Insider shareholding', higherIsBetter: true },
    ];

    // Group metrics by category
    const metricsByCategory = useMemo(() => {
        const grouped: { [key: string]: ComparisonMetric[] } = {};
        metrics.forEach(metric => {
            if (!grouped[metric.category]) {
                grouped[metric.category] = [];
            }
            grouped[metric.category].push(metric);
        });
        return grouped;
    }, []);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => setMounted(true), []);

    // Fetch stocks data
    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/apify-stocks/all`);
            const result = await response.json();

            if (result.success) {
                const transformedData = result.data.map((item: any) => ({
                    Symbol: item.symbol,
                    "Company Name": item.companyName,
                    "Current Price": parseFloat(item.currentPrice || 0),
                    "Market Cap": parseFloat(item.marketCap || 0),
                    "Stock P/E": parseFloat(item.stockPE || 0),
                    "Dividend Yield": parseFloat(item.dividendYield || 0),
                    ROCE: parseFloat(item.roce || 0),
                    ROE: parseFloat(item.roe || 0),
                    Volume: parseInt(item.volume || 0),
                    Change: item.change || 0,
                    ChangePercent: item.changePercent || 0,
                    Sector: item.sector || 'Unknown',
                    Industry: item.industry || 'Unknown',
                    "52WeekHigh": item["52WeekHigh"] || 0,
                    "52WeekLow": item["52WeekLow"] || 0,
                    beta: item.beta || 1,
                    analystRating: item.analystRating || 'Hold',
                    targetPrice: item.targetPrice || 0,
                    eps: item.eps || 0,
                    pbRatio: item.pbRatio || 0,
                    debtToEquity: item.debtToEquity || 0,
                    currentRatio: item.currentRatio || 0,
                    quickRatio: item.quickRatio || 0,
                    grossMargin: item.grossMargin || 0,
                    operatingMargin: item.operatingMargin || 0,
                    profitMargin: item.profitMargin || 0,
                    revenueGrowth: item.revenueGrowth || 0,
                    earningsGrowth: item.earningsGrowth || 0,
                    insiderHolding: item.insiderHolding || 0,
                    promoterHolding: item.promoterHolding || 0,
                    institutionalHolding: item.institutionalHolding || 0,
                    lastUpdated: item.lastApifySync || item.updatedAt
                }));
                setStocks(transformedData);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Search stocks
    useEffect(() => {
        if (searchTerm.length > 1) {
            const results = stocks
                .filter(stock =>
                    stock.Symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    stock["Company Name"].toLowerCase().includes(searchTerm.toLowerCase())
                )
                .slice(0, 10);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, [searchTerm, stocks]);

    // Generate historical data for charts
    const generateHistoricalData = useMemo(() => {
        if (selectedStocks.length === 0) return [];

        const data: ChartDataPoint[] = [];
        const now = new Date();
        let days = 365;

        switch (timeframe) {
            case '1M': days = 30; break;
            case '3M': days = 90; break;
            case '6M': days = 180; break;
            case '1Y': days = 365; break;
            case '3Y': days = 1095; break;
            case '5Y': days = 1825; break;
        }

        for (let i = days; i >= 0; i -= 5) { // 5-day intervals for cleaner chart
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const point: ChartDataPoint = { date: dateStr };

            selectedStocks.forEach((stock, index) => {
                const basePrice = stock["Current Price"];
                // Generate realistic price movements
                const trend = Math.sin(i / 30) * 0.1;
                const randomWalk = (Math.random() - 0.5) * 0.2;
                const price = basePrice * (1 + trend + randomWalk * (i / days));
                point[stock.Symbol] = Number(price.toFixed(2));
            });

            data.push(point);
        }

        return data;
    }, [selectedStocks, timeframe]);

    // Calculate correlation matrix
    const calculateCorrelation = useMemo(() => {
        if (selectedStocks.length < 2) return [];

        const correlations: CorrelationData[] = [];

        for (let i = 0; i < selectedStocks.length; i++) {
            for (let j = i + 1; j < selectedStocks.length; j++) {
                // Simulate correlation coefficient (-1 to 1)
                // In real app, this would be calculated from historical data
                const correlation = (Math.random() * 2 - 1).toFixed(2);
                correlations.push({
                    stock1: selectedStocks[i].Symbol,
                    stock2: selectedStocks[j].Symbol,
                    correlation: parseFloat(correlation)
                });
            }
        }

        return correlations;
    }, [selectedStocks]);

    // Format value based on metric type
    const formatValue = (value: number, format: string): string => {
        if (value === undefined || value === null) return 'N/A';

        switch (format) {
            case 'currency':
                return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
            case 'percentage':
                return `${value.toFixed(2)}%`;
            case 'number':
                if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
                if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
                if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
                if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
                return value.toLocaleString('en-IN');
            case 'ratio':
                return value.toFixed(2);
            default:
                return value.toString();
        }
    };

    // Get color based on value comparison
    const getComparisonColor = (value: number, metric: ComparisonMetric, allValues: number[]) => {
        if (allValues.length === 0) return 'text-gray-900 dark:text-white';

        const max = Math.max(...allValues);
        const min = Math.min(...allValues);
        const isHighest = value === max;
        const isLowest = value === min;

        if (metric.higherIsBetter) {
            if (isHighest) return 'text-green-600 dark:text-green-400 font-bold';
            if (isLowest) return 'text-red-600 dark:text-red-400';
        } else {
            if (isLowest) return 'text-green-600 dark:text-green-400 font-bold';
            if (isHighest) return 'text-red-600 dark:text-red-400';
        }
        return 'text-gray-900 dark:text-white';
    };

    // Get background color for correlation
    const getCorrelationColor = (correlation: number) => {
        if (correlation > 0.7) return 'bg-green-500/20 text-green-700 dark:text-green-400';
        if (correlation > 0.3) return 'bg-green-500/10 text-green-600 dark:text-green-500';
        if (correlation > -0.3) return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
        if (correlation > -0.7) return 'bg-red-500/10 text-red-600 dark:text-red-500';
        return 'bg-red-500/20 text-red-700 dark:text-red-400';
    };

    if (!mounted) return null;

    if (loading && stocks.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Loading Stocks Data</h3>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${fullscreen ? 'fixed inset-0 z-50 overflow-auto' : ''}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header with Plan Info */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                            <BarChart3 className="w-8 h-8 text-indigo-500" />
                            Stock Comparison Tool
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Compare stocks side-by-side with detailed metrics and charts
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Plan Status Badge */}
                        {isAuthenticated && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                                {isPaidUser ? (
                                    <>
                                        <Crown className="w-5 h-5 text-yellow-500" />
                                        <span className="font-medium text-gray-900 dark:text-white capitalize">{userPlan} Plan</span>
                                    </>
                                ) : trialExpired ? (
                                    <>
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                        <span className="text-red-600 dark:text-red-400 font-medium">Trial Expired</span>
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5 text-amber-500" />
                                        <span className="text-amber-600 dark:text-amber-400 font-medium">{trialDaysLeft} days trial left</span>
                                    </>
                                )}
                            </div>
                        )}

                        <button
                            onClick={() => setFullscreen(!fullscreen)}
                            className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        >
                            {fullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={handleClearAll}
                            disabled={selectedStocks.length === 0}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Clear All
                        </button>
                    </div>
                </div>

                {/* Daily Limit Info for Free Users */}
                {isAuthenticated && !isPaidUser && trialExpired && (
                    <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            <span className="text-amber-800 dark:text-amber-400">
                                Free plan: {comparisonCount}/5 comparisons used today
                            </span>
                        </div>
                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium"
                        >
                            Upgrade
                        </button>
                    </div>
                )}

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder={isAuthenticated ? "Search stocks by symbol or company name..." : "Please log in to search stocks"}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={!isAuthenticated}
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    />

                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-xl max-h-96 overflow-y-auto">
                            {searchResults.map(stock => (
                                <button
                                    key={stock.Symbol}
                                    onClick={() => handleAddStock(stock)}
                                    disabled={selectedStocks.length >= 5 || selectedStocks.some(s => s.Symbol === stock.Symbol)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div>
                                        <span className="font-medium text-gray-900 dark:text-white">{stock.Symbol}</span>
                                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{stock["Company Name"]}</span>
                                    </div>
                                    <Plus className="w-5 h-5 text-indigo-600" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Selected Stocks with Lock Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    {Array.from({ length: 5 }).map((_, index) => {
                        const stock = selectedStocks[index];
                        const isLocked = isStockLocked(index);
                        const isFreeSlot = index < 3;

                        return (
                            <div
                                key={index}
                                className={`relative rounded-xl p-4 min-h-[120px] flex flex-col transition-all ${stock
                                        ? 'bg-white dark:bg-gray-800 border-2 border-indigo-500'
                                        : isLocked && !stock
                                            ? 'bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-400 dark:border-gray-600 opacity-60'
                                            : 'bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700'
                                    }`}
                                onMouseEnter={() => isLocked && !stock && setHoveredLockedStock(index)}
                                onMouseLeave={() => setHoveredLockedStock(null)}
                            >
                                {stock ? (
                                    <>
                                        <button
                                            onClick={() => handleRemoveStock(stock.Symbol)}
                                            className="absolute top-2 right-2 text-gray-400 hover:text-red-600 z-10"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{stock.Symbol}</h3>
                                                <span className={`text-sm ${stock.ChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {stock.ChangePercent >= 0 ? '+' : ''}{stock.ChangePercent?.toFixed(2)}%
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{stock["Company Name"]}</p>
                                            <p className="text-xl font-bold text-gray-900 dark:text-white mt-2">
                                                ₹{stock["Current Price"]?.toFixed(2)}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {stock.Sector}
                                            </p>
                                        </div>
                                        {isLocked && (
                                            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                                <div className="text-center">
                                                    <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                                                    <p className="text-white font-medium text-sm">Premium Feature</p>
                                                    <button
                                                        onClick={() => setShowUpgradeModal(true)}
                                                        className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded-lg text-xs font-medium hover:bg-yellow-600"
                                                    >
                                                        Upgrade
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                                        {isLocked ? (
                                            <>
                                                <Lock className="w-8 h-8 text-gray-400 dark:text-gray-600 mb-2" />
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    {isFreeSlot ? 'Free Slot' : 'Premium Slot'}
                                                </p>
                                                {!isFreeSlot && (
                                                    <button
                                                        onClick={() => setShowUpgradeModal(true)}
                                                        className="mt-2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-xs font-medium hover:from-amber-600 hover:to-orange-600"
                                                    >
                                                        Unlock with Premium
                                                    </button>
                                                )}
                                                {hoveredLockedStock === index && (
                                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-2 px-3 rounded whitespace-nowrap z-20">
                                                        {getLockedStockMessage()}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-gray-400 dark:text-gray-600">
                                                    {index === 0 ? 'Add stocks to compare' : 'Empty slot'}
                                                </p>
                                                {index >= 3 && (
                                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                                        Premium feature
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Comparison Controls - Only show if user has at least 2 stocks and is not restricted */}
                {selectedStocks.length >= 2 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            {/* Mode Selection */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setComparisonMode('metrics')}
                                    className={`px-4 py-2 rounded-lg font-medium ${comparisonMode === 'metrics'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    <Table className="w-4 h-4 inline mr-2" />
                                    Metrics
                                </button>
                                <button
                                    onClick={() => setComparisonMode('charts')}
                                    className={`px-4 py-2 rounded-lg font-medium ${comparisonMode === 'charts'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    <LineChart className="w-4 h-4 inline mr-2" />
                                    Charts
                                </button>
                                <button
                                    onClick={() => setComparisonMode('radar')}
                                    className={`px-4 py-2 rounded-lg font-medium ${comparisonMode === 'radar'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    <RadarIcon className="w-4 h-4 inline mr-2" />
                                    Radar
                                </button>
                                <button
                                    onClick={() => setComparisonMode('correlation')}
                                    className={`px-4 py-2 rounded-lg font-medium ${comparisonMode === 'correlation'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    <Activity className="w-4 h-4 inline mr-2" />
                                    Correlation
                                </button>
                            </div>

                            {/* Chart Controls (for charts mode) */}
                            {comparisonMode === 'charts' && (
                                <div className="flex items-center gap-2">
                                    <select
                                        value={timeframe}
                                        onChange={(e) => setTimeframe(e.target.value as any)}
                                        className="px-3 py-2 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
                                    >
                                        <option value="1M">1 Month</option>
                                        <option value="3M">3 Months</option>
                                        <option value="6M">6 Months</option>
                                        <option value="1Y">1 Year</option>
                                        <option value="3Y">3 Years</option>
                                        <option value="5Y">5 Years</option>
                                    </select>
                                    <button
                                        onClick={() => setChartType('line')}
                                        className={`p-2 rounded-lg ${chartType === 'line'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        <LineChart className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setChartType('area')}
                                        className={`p-2 rounded-lg ${chartType === 'area'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        <AreaChart className="w-4 h-4" />
                                    </button>
                                    <label className="flex items-center gap-2 ml-2">
                                        <input
                                            type="checkbox"
                                            checked={normalizeData}
                                            onChange={(e) => setNormalizeData(e.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Normalize</span>
                                    </label>
                                </div>
                            )}

                            {/* Sort Controls (for metrics mode) */}
                            {comparisonMode === 'metrics' && (
                                <div className="flex items-center gap-2">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-3 py-2 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
                                    >
                                        <option value="Market Cap">Market Cap</option>
                                        <option value="Current Price">Price</option>
                                        <option value="ChangePercent">Change %</option>
                                        <option value="Stock P/E">P/E Ratio</option>
                                        <option value="ROE">ROE</option>
                                        <option value="Dividend Yield">Dividend Yield</option>
                                    </select>
                                    <button
                                        onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                                        className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                                    >
                                        {sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                                    </button>
                                    <label className="flex items-center gap-2 ml-2">
                                        <input
                                            type="checkbox"
                                            checked={showDifferences}
                                            onChange={(e) => setShowDifferences(e.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Show Differences</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Comparison Display */}
                {selectedStocks.length >= 2 ? (
                    <>
                        {comparisonMode === 'metrics' && (
                            <div className="space-y-6">
                                {Object.entries(metricsByCategory).map(([category, categoryMetrics]) => (
                                    <div key={category} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 capitalize">
                                            {category} Metrics
                                        </h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                                        <th className="text-left py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Metric</th>
                                                        {selectedStocks
                                                            .sort((a, b) => {
                                                                const aVal = a[sortBy as keyof StockData] as number;
                                                                const bVal = b[sortBy as keyof StockData] as number;
                                                                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                                                            })
                                                            .map(stock => (
                                                                <th key={stock.Symbol} className="text-center py-3">
                                                                    <div className="font-medium text-gray-900 dark:text-white">{stock.Symbol}</div>
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{stock["Company Name"].substring(0, 20)}</div>
                                                                </th>
                                                            ))}
                                                        {showDifferences && (
                                                            <th className="text-center py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                                                                Difference
                                                            </th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                    {categoryMetrics.map(metric => {
                                                        const values = selectedStocks.map(s => s[metric.key] as number);
                                                        const max = Math.max(...values);
                                                        const min = Math.min(...values);

                                                        return (
                                                            <tr key={metric.name}>
                                                                <td className="py-3 text-sm">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-medium text-gray-900 dark:text-white">{metric.name}</span>
                                                                        <div className="relative group">
                                                                            <Info className="w-4 h-4 text-gray-400 cursor-help" />
                                                                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                                                                                {metric.description}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                {selectedStocks
                                                                    .sort((a, b) => {
                                                                        const aVal = a[sortBy as keyof StockData] as number;
                                                                        const bVal = b[sortBy as keyof StockData] as number;
                                                                        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                                                                    })
                                                                    .map(stock => {
                                                                        const value = stock[metric.key] as number;
                                                                        return (
                                                                            <td key={stock.Symbol} className="text-center py-3">
                                                                                <span className={getComparisonColor(value, metric, values)}>
                                                                                    {formatValue(value, metric.format)}
                                                                                </span>
                                                                            </td>
                                                                        );
                                                                    })}
                                                                {showDifferences && (
                                                                    <td className="text-center py-3">
                                                                        <span className="text-indigo-600 font-medium">
                                                                            {formatValue(max - min, metric.format)}
                                                                        </span>
                                                                    </td>
                                                                )}
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {comparisonMode === 'charts' && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Price Performance Comparison</h3>
                                <ResponsiveContainer width="100%" height={500}>
                                    {chartType === 'line' ? (
                                        <ComposedChart data={generateHistoricalData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis dataKey="date" stroke="#6B7280" />
                                            <YAxis stroke="#6B7280" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                                                    borderColor: isDark ? '#374151' : '#E5E7EB',
                                                    color: isDark ? '#F3F4F6' : '#111827'
                                                }}
                                            />
                                            <Legend />
                                            {selectedStocks.map((stock, index) => (
                                                <Line
                                                    key={stock.Symbol}
                                                    type="monotone"
                                                    dataKey={stock.Symbol}
                                                    stroke={COLORS[index % COLORS.length]}
                                                    strokeWidth={2}
                                                    dot={false}
                                                />
                                            ))}
                                        </ComposedChart>
                                    ) : (
                                        <AreaChart data={generateHistoricalData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis dataKey="date" stroke="#6B7280" />
                                            <YAxis stroke="#6B7280" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                                                    borderColor: isDark ? '#374151' : '#E5E7EB',
                                                    color: isDark ? '#F3F4F6' : '#111827'
                                                }}
                                            />
                                            <Legend />
                                            {selectedStocks.map((stock, index) => (
                                                <Area
                                                    key={stock.Symbol}
                                                    type="monotone"
                                                    dataKey={stock.Symbol}
                                                    stroke={COLORS[index % COLORS.length]}
                                                    fill={`${COLORS[index % COLORS.length]}33`}
                                                />
                                            ))}
                                        </AreaChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        )}

                        {comparisonMode === 'radar' && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Multi-Dimensional Comparison</h3>
                                <ResponsiveContainer width="100%" height={500}>
                                    <RadarChart outerRadius={300} data={[
                                        { subject: 'Valuation', ...selectedStocks.reduce((acc, stock, i) => ({ ...acc, [stock.Symbol]: stock["Stock P/E"] ? Math.min(100, 100 / stock["Stock P/E"]) : 50 }), {}) },
                                        { subject: 'Growth', ...selectedStocks.reduce((acc, stock, i) => ({ ...acc, [stock.Symbol]: stock.revenueGrowth ? Math.min(100, stock.revenueGrowth * 10) : 50 }), {}) },
                                        { subject: 'Profitability', ...selectedStocks.reduce((acc, stock, i) => ({ ...acc, [stock.Symbol]: stock.roe ? Math.min(100, stock.roe) : 50 }), {}) },
                                        { subject: 'Financial Health', ...selectedStocks.reduce((acc, stock, i) => ({ ...acc, [stock.Symbol]: stock.currentRatio ? Math.min(100, stock.currentRatio * 20) : 50 }), {}) },
                                        { subject: 'Dividend', ...selectedStocks.reduce((acc, stock, i) => ({ ...acc, [stock.Symbol]: stock["Dividend Yield"] ? Math.min(100, stock["Dividend Yield"] * 10) : 0 }), {}) },
                                        { subject: 'Momentum', ...selectedStocks.reduce((acc, stock, i) => ({ ...acc, [stock.Symbol]: stock.ChangePercent ? 50 + stock.ChangePercent : 50 }), {}) },
                                    ]}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                        {selectedStocks.map((stock, index) => (
                                            <Radar
                                                key={stock.Symbol}
                                                name={stock.Symbol}
                                                dataKey={stock.Symbol}
                                                stroke={COLORS[index % COLORS.length]}
                                                fill={COLORS[index % COLORS.length]}
                                                fillOpacity={0.3}
                                            />
                                        ))}
                                        <Legend />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {comparisonMode === 'correlation' && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Correlation Matrix</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {calculateCorrelation.map((corr, index) => (
                                        <div key={index} className={`p-4 rounded-lg ${getCorrelationColor(corr.correlation)}`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="font-medium">{corr.stock1}</span>
                                                    <span className="mx-2">↔</span>
                                                    <span className="font-medium">{corr.stock2}</span>
                                                </div>
                                                <span className="text-lg font-bold">
                                                    {corr.correlation > 0 ? '+' : ''}{corr.correlation.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="mt-2 text-sm">
                                                {corr.correlation > 0.7 ? 'Strong positive correlation' :
                                                    corr.correlation > 0.3 ? 'Moderate positive correlation' :
                                                        corr.correlation > -0.3 ? 'No significant correlation' :
                                                            corr.correlation > -0.7 ? 'Moderate negative correlation' :
                                                                'Strong negative correlation'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                        <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Stocks Selected</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            {isAuthenticated
                                ? "Add at least 2 stocks using the search bar above to start comparing"
                                : "Please log in to compare stocks"}
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            {isPaidUser
                                ? "You can compare up to 5 stocks at once"
                                : "Free users can compare up to 3 stocks"}
                        </p>
                        {!isAuthenticated && (
                            <button
                                onClick={() => router.push('/signin')}
                                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Log In to Continue
                            </button>
                        )}
                    </div>
                )}

                {/* Upgrade Modal */}
                {showUpgradeModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowUpgradeModal(false)}>
                        <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                            <div className="text-center mb-6">
                                <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Unlock Premium Features
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {trialExpired
                                        ? "Your free trial has ended. Upgrade to continue using all features!"
                                        : "Upgrade to compare up to 5 stocks and get unlimited daily comparisons!"}
                                </p>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="text-gray-700 dark:text-gray-300">Compare up to 5 stocks</span>
                                </div>
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="text-gray-700 dark:text-gray-300">Unlimited daily comparisons</span>
                                </div>
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="text-gray-700 dark:text-gray-300">Advanced technical indicators</span>
                                </div>
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="text-gray-700 dark:text-gray-300">Priority support</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowUpgradeModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Later
                                </button>
                                <button
                                    onClick={handleUpgradeClick}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-bold transition-all shadow-md"
                                >
                                    Upgrade Now
                                </button>
                            </div>

                            <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-4">
                                Plans start at just $29.99/month
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}