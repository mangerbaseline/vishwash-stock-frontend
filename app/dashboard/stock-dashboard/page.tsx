'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    TrendingUp, TrendingDown, Search,
    BarChart3, Star, ChevronRight, ArrowUpRight,
    ArrowDownRight, RefreshCw, Grid, List, AlertCircle,
    Database, WifiOff, Clock, Activity,
    Eye, EyeOff, Table, Maximize2, Minimize2,
    Play, Pause, Zap, BarChart2,
    Download, Share2, Info, Settings as SettingsIcon,
    Moon, Sun, Bell, BellOff, Filter, SortAsc,
    SortDesc, PieChart, Gauge, Target, Flag,
    Award, Crown, Rocket, Sparkles, Brain,
    TrendingUp as TrendUp, TrendingDown as TrendDown,
    AlertTriangle, CheckCircle, XCircle,
    Layers, Grid3x3, LayoutGrid, LayoutList,
    Bookmark, BookmarkPlus, BookmarkCheck,
    Phone, Mail, MessageSquare, Globe,
    Github, Twitter, Linkedin, Youtube,
    Facebook, Instagram, DollarSign, Percent,
    Calendar, CalendarClock, CalendarRange,
    MoveHorizontal, MoveVertical, Move,
    ZoomIn, ZoomOut, Focus, Crosshair,
    Palette, Paintbrush, Code, Terminal,
    Cpu, HardDrive, Network, Cloud,
    Lock, Unlock, Shield, ShieldCheck,
    Key, KeyRound, Fingerprint,
    Users, UserPlus, UserCheck, UserX,
    Settings, Sliders, ToggleLeft, ToggleRight,
    Radio, RadioTower, Satellite,
    Waves, Wind, CloudRain, CloudSnow,
    Sun as SunIcon, Moon as MoonIcon,
    CloudSun, CloudMoon, CloudLightning,
    Thermometer, Droplets, Wind as WindIcon,
    Briefcase,
    Link,
    X,
    ExternalLink,
    Newspaper,
    LineChart as LineChartIcon,
    AreaChart as AreaChartIcon
} from 'lucide-react';

import AIChat from '@/app/components/ai/AIChat';
import { Bot, BrainCircuit } from 'lucide-react';


import {
    AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, Brush,
    ComposedChart as RechartsComposedChart, Line as RechartsLine, Bar, Scatter, Pie, Cell,
    Radar, RadarChart, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, RadialBar, RadialBarChart,
    Treemap, Sankey, Funnel, FunnelChart,
    LineChart as RechartsLineChart
} from 'recharts';
import React from 'react';
import { useTheme } from 'next-themes';
import MovableStockBar from '@/app/components/markets/MovableStockBar';
import CosmicCharts from '@/app/components/markets/CosmicCharts';
import AIAgent from '@/app/components/ai/AIAgent';
import MovableNewsBar from '@/app/components/markets/MovableNewsBar';
// WebSocket disabled - causing connection errors
// import { useStockWebSocket } from '@/app/lib/stockWebSocket';

// ============== TYPES ==============
interface StockData {
    Symbol: string;
    "Company Name": string;
    "Market Cap": string;
    "Current Price": string;
    High: string;
    Low: string;
    "Stock P/E": string;
    "Dividend Yield": string;
    ROCE: string;
    ROE: string;
    Volume?: string;
    Change?: number;
    ChangePercent?: number;
    Sector?: string;
    Industry?: string;
    lastUpdated?: string;
    beta?: number;
    "52WeekHigh"?: number;
    "52WeekLow"?: number;
    analystRating?: 'Buy' | 'Hold' | 'Sell';
    targetPrice?: number;
    eps?: number;
    pbRatio?: number;
    debtToEquity?: number;
    currentRatio?: number;
    quickRatio?: number;
    grossMargin?: number;
    operatingMargin?: number;
    profitMargin?: number;
    revenueGrowth?: number;
    earningsGrowth?: number;
    insiderHolding?: number;
    promoterHolding?: number;
    institutionalHolding?: number;
}

interface ChartDataPoint {
    timestamp: number;
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    vwap?: number;
    trades?: number;
    [key: string]: number | string | undefined;
}

interface Indicator {
    name: string;
    value: number;
    color: string;
    description?: string;
}

interface NewsItem {
    id: string;
    title: string;
    source: string;
    time: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    url: string;
    image?: string;
    description?: string;
    fullContent?: string;
    publishedAt: string;
}

interface Alert {
    id: string;
    symbol: string;
    condition: 'above' | 'below';
    price: number;
    active: boolean;
    triggered: boolean;
}

interface Portfolio {
    symbol: string;
    quantity: number;
    buyPrice: number;
    currentPrice: number;
    pnl: number;
    pnlPercent: number;
}

interface SectorPerformance {
    sector: string;
    change: number;
    volume: number;
    marketCap: number;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        dataKey: string;
        color: string;
        payload: ChartDataPoint;
    }>;
    label?: number;
}

export default function StocksPage() {
    const { theme, systemTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const [stocks, setStocks] = useState<StockData[]>([]);
    const [filteredStocks, setFilteredStocks] = useState<StockData[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [syncingStock, setSyncingStock] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'table' | 'compact'>('grid');
    const [watchlist, setWatchlist] = useState<string[]>([]);
    const [showAIChat, setShowAIChat] = useState(false);

    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [chartDataCache, setChartDataCache] = useState<Record<string, ChartDataPoint[]>>({});
    const [chartType, setChartType] = useState<'area' | 'candle' | 'line' | 'ohlc' | 'mountain' | 'baseline'>('area');
    const [indicators, setIndicators] = useState<Indicator[]>([
        { name: 'SMA 20', value: 0, color: '#FF6B6B', description: 'Simple Moving Average 20' },
        { name: 'SMA 50', value: 0, color: '#4ECDC4', description: 'Simple Moving Average 50' },
        { name: 'EMA 20', value: 0, color: '#45B7D1', description: 'Exponential Moving Average 20' },
        { name: 'RSI', value: 0, color: '#96CEB4', description: 'Relative Strength Index' },
        { name: 'MACD', value: 0, color: '#FFEEAD', description: 'Moving Average Convergence Divergence' },
        { name: 'BB Upper', value: 0, color: '#D4A5A5', description: 'Bollinger Band Upper' },
        { name: 'BB Lower', value: 0, color: '#9B59B6', description: 'Bollinger Band Lower' }
    ]);
    const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y' | 'MAX'>('1M');
    const [selectedStock, setSelectedStock] = useState<string>('');
    const [showVolume, setShowVolume] = useState(true);
    const [chartScale, setChartScale] = useState<'linear' | 'log'>('linear');
    const [chartGrid, setChartGrid] = useState(true);

    const [liveMode, setLiveMode] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    // WebSocket disabled
    const wsConnected = false;
    const liveQuotes = new Map();
    const wsSubscribe = () => { };
    const [fullscreen, setFullscreen] = useState(false);
    const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
    const [marketStatus, setMarketStatus] = useState<'OPEN' | 'CLOSED' | 'PRE-OPEN' | 'POST-CLOSE'>('CLOSED');
    const [timeToMarket, setTimeToMarket] = useState<string>('');

    // News panel state
    const [news, setNews] = useState<NewsItem[]>([]);
    const [newsLoading, setNewsLoading] = useState(false);
    const [showNewsPanel, setShowNewsPanel] = useState(true);
    const [newsFilter, setNewsFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
    const [fullNewsLoading, setFullNewsLoading] = useState(false);

    const [topGainers, setTopGainers] = useState<StockData[]>([]);
    const [topLosers, setTopLosers] = useState<StockData[]>([]);
    const [mostActive, setMostActive] = useState<StockData[]>([]);
    const [notifications, setNotifications] = useState<boolean>(true);

    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

    const chartRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const currentTheme = theme === 'system' ? systemTheme : theme;
    const isDark = currentTheme === 'dark';

    useEffect(() => setMounted(true), []);

    const COLORS = useMemo(() => ({
        primary: '#6366F1',
        secondary: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
        success: '#10B981',
        background: isDark ? '#1F2937' : '#FFFFFF',
        text: isDark ? '#F3F4F6' : '#111827',
        grid: isDark ? '#374151' : '#E5E7EB',
        volume: isDark ? '#4B5563' : '#9CA3AF',
        profit: '#10B981',
        loss: '#EF4444',
        candleUp: '#10B981',
        candleDown: '#EF4444',
        line1: '#6366F1',
        line2: '#10B981',
        line3: '#F59E0B',
        line4: '#EF4444',
        line5: '#8B5CF6',
        area1: 'rgba(99, 102, 241, 0.2)',
        area2: 'rgba(16, 185, 129, 0.2)',
        area3: 'rgba(245, 158, 11, 0.2)',
    }), [isDark]);

    // Formatting functions
    const formatLargeNumber = (num: number): string => {
        if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
        return num.toString();
    };

    const formatVolume = (volume: number): string => {
        if (volume >= 1e7) return `${(volume / 1e7).toFixed(2)}Cr`;
        if (volume >= 1e5) return `${(volume / 1e5).toFixed(2)}L`;
        if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
        return volume.toString();
    };

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    };

    const formatPercentage = (value: number): string => {
        return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
    };

    // Load watchlist from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem('watchlist');
            if (saved) {
                setWatchlist(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading watchlist:', error);
        }

        // Check for subscription upgrade
        const params = new URLSearchParams(window.location.search);
        if (params.get('upgraded') === 'true') {
            setShowAIChat(true);
            // Optional: Remove the upgraded param from URL without refreshing
            const url = new URL(window.location.href);
            url.searchParams.delete('upgraded');
            window.history.replaceState({}, '', url.toString());
        }
    }, []);




    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setShowAIChat(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Market status check
    useEffect(() => {
        const checkMarketStatus = () => {
            const now = new Date();
            const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
            const hours = ist.getHours();
            const minutes = ist.getMinutes();
            const day = ist.getDay();

            const currentTime = hours * 60 + minutes;
            const marketOpen = 9 * 60 + 15;
            const marketClose = 15 * 60 + 30;
            const preOpenStart = 9 * 60;
            const postCloseEnd = 16 * 60;

            if (day >= 1 && day <= 5) {
                if (currentTime >= marketOpen && currentTime <= marketClose) {
                    setMarketStatus('OPEN');
                    const timeLeft = marketClose - currentTime;
                    const hoursLeft = Math.floor(timeLeft / 60);
                    const minsLeft = timeLeft % 60;
                    setTimeToMarket(`Closing in ${hoursLeft}h ${minsLeft}m`);
                } else if (currentTime >= preOpenStart && currentTime < marketOpen) {
                    setMarketStatus('PRE-OPEN');
                    const timeToOpen = marketOpen - currentTime;
                    const minsToOpen = timeToOpen;
                    setTimeToMarket(`Opens in ${minsToOpen}m`);
                } else if (currentTime > marketClose && currentTime <= postCloseEnd) {
                    setMarketStatus('POST-CLOSE');
                    setTimeToMarket('Market closed');
                } else {
                    setMarketStatus('CLOSED');
                    if (currentTime > postCloseEnd) {
                        const tomorrow = new Date(ist);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        const nextOpen = new Date(tomorrow.setHours(9, 15, 0, 0));
                        const diff = nextOpen.getTime() - ist.getTime();
                        const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
                        const minsLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                        setTimeToMarket(`Opens in ${hoursLeft}h ${minsLeft}m`);
                    } else {
                        setTimeToMarket('Market closed');
                    }
                }
            } else {
                setMarketStatus('CLOSED');
                const daysToMonday = day === 6 ? 2 : 1;
                setTimeToMarket(`Opens in ${daysToMonday} day${daysToMonday > 1 ? 's' : ''}`);
            }
        };

        checkMarketStatus();
        const interval = setInterval(checkMarketStatus, 60000);
        return () => clearInterval(interval);
    }, []);

    // Use real chart data fetching
    const fetchRealChartData = useCallback(async (symbol: string, tf: string, currentStock: any): Promise<ChartDataPoint[]> => {
        const cacheKey = `${symbol}-${tf}`;
        if (chartDataCache[cacheKey]) {
            return chartDataCache[cacheKey];
        }

        try {
            const rangeMap: Record<string, string> = {
                '1D': '1d', '1W': '5d', '1M': '1mo', '3M': '3mo',
                '6M': '6mo', '1Y': '1y', '2Y': '2y', '5Y': '5y'
            };
            const intervalMap: Record<string, string> = {
                '1D': '5m', '1W': '15m', '1M': '1d', '3M': '1d',
                '6M': '1d', '1Y': '1d', '2Y': '1wk', '5Y': '1mo'
            };

            const range = rangeMap[tf] || '1mo';
            const interval = intervalMap[tf] || '1d';

            const response = await fetch(`${API_BASE_URL}/api/db-stocks/history/${symbol}?range=${range}&interval=${interval}`, {
                signal: AbortSignal.timeout(5000)
            });
            const result = await response.json();

            if (result.success && result.data && result.data.length > 0) {
                setChartDataCache(prev => ({ ...prev, [cacheKey]: result.data }));
                return result.data as ChartDataPoint[];
            }
        } catch (error) {
            console.error('Error fetching real chart data:', error);
        }

        // Fallback: If no history, plot exactly the provided current day data if valid
        const basePrice = currentStock ? parseFloat(currentStock["Current Price"] || '0') : 0;
        if (basePrice > 0) {
            const change = currentStock?.Change || 0;
            const open = basePrice - change;
            const high = parseFloat(currentStock?.High || `${basePrice}`);
            const low = parseFloat(currentStock?.Low || `${basePrice}`);
            const volume = parseInt(currentStock?.Volume || '0');

            return [{
                timestamp: Date.now(),
                date: new Date().toLocaleDateString(),
                open,
                high: high > 0 ? high : basePrice,
                low: low > 0 ? low : basePrice,
                close: basePrice,
                volume,
                vwap: basePrice
            }];
        }

        return [];
    }, [chartDataCache, API_BASE_URL]);

    // Calculate indicators
    const calculateIndicators = useCallback((data: ChartDataPoint[]) => {
        if (data.length === 0) return;

        const closes = data.map(d => d.close);

        // Calculate SMAs
        const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
        const sma50 = closes.slice(-50).reduce((a, b) => a + b, 0) / 50;

        // Calculate EMA 20
        const ema20 = closes.reduce((ema, price, i) => {
            const multiplier = 2 / (21);
            return i === 0 ? price : (price - ema) * multiplier + ema;
        }, closes[0]);

        // Calculate RSI (14)
        let gains = 0, losses = 0;
        for (let i = 1; i <= 14; i++) {
            const change = closes[closes.length - i] - closes[closes.length - i - 1];
            if (change > 0) gains += change;
            else losses -= change;
        }
        const avgGain = gains / 14;
        const avgLoss = losses / 14;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));

        // Calculate MACD
        const ema12 = closes.reduce((ema, price, i) => {
            const multiplier = 2 / (13);
            return i === 0 ? price : (price - ema) * multiplier + ema;
        }, closes[0]);

        const ema26 = closes.reduce((ema, price, i) => {
            const multiplier = 2 / (27);
            return i === 0 ? price : (price - ema) * multiplier + ema;
        }, closes[0]);

        const macd = ema12 - ema26;

        // Calculate Bollinger Bands
        const sma = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
        const stdDev = Math.sqrt(closes.slice(-20).map(x => Math.pow(x - sma, 2)).reduce((a, b) => a + b, 0) / 20);
        const bbUpper = sma + (2 * stdDev);
        const bbLower = sma - (2 * stdDev);

        setIndicators([
            { name: 'SMA 20', value: sma20, color: '#FF6B6B', description: 'Simple Moving Average 20' },
            { name: 'SMA 50', value: sma50, color: '#4ECDC4', description: 'Simple Moving Average 50' },
            { name: 'EMA 20', value: ema20, color: '#45B7D1', description: 'Exponential Moving Average 20' },
            { name: 'RSI', value: rsi, color: '#96CEB4', description: 'Relative Strength Index' },
            { name: 'MACD', value: macd, color: '#FFEEAD', description: 'Moving Average Convergence Divergence' },
            { name: 'BB Upper', value: bbUpper, color: '#D4A5A5', description: 'Bollinger Band Upper' },
            { name: 'BB Lower', value: bbLower, color: '#9B59B6', description: 'Bollinger Band Lower' }
        ]);
    }, []);

    // Update chart data when selected stock changes
    useEffect(() => {
        const initChart = async () => {
            if (selectedStock) {
                const stock = stocks.find(s => s.Symbol === selectedStock);
                const newChartData = await fetchRealChartData(selectedStock, timeframe, stock);
                setChartData(newChartData);
                calculateIndicators(newChartData);
            } else {
                // Should show data in the charts of all the available stocks who has the data. 
                // Auto-select the first stock that has a valid price > 0
                const availableStock = stocks.find(s => parseFloat(s["Current Price"] || '0') > 0);
                if (availableStock) {
                    setSelectedStock(availableStock.Symbol);
                } else if (stocks.length > 0) {
                    setSelectedStock(stocks[0].Symbol);
                }
            }
        };
        initChart();
    }, [selectedStock, stocks, timeframe, fetchRealChartData, calculateIndicators]);

    // Fetch stocks function
    const fetchStocks = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setInitialLoading(true);
        }

        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/db-stocks`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            let stocksData = [];
            if (result.success && Array.isArray(result.data)) {
                stocksData = result.data;
            } else if (Array.isArray(result)) {
                stocksData = result;
            } else if (result.data && Array.isArray(result.data)) {
                stocksData = result.data;
            } else {
                stocksData = [];
            }

            if (stocksData.length > 0) {
                console.log('📊 Raw stocks from API:', stocksData);
                console.log('   First stock:', stocksData[0]);
                console.log('   Total stocks:', stocksData.length);

                const transformedData = stocksData.map((item: any) => ({
                    Symbol: item.symbol || item.Symbol || '',
                    "Company Name": item.companyName || item["Company Name"] || item.symbol || 'Unknown',
                    "Current Price": String(item.currentPrice || item["Current Price"] || 0),
                    "Market Cap": item.marketCap || item["Market Cap"] || "0",
                    High: String(item.high || item.High || 0),
                    Low: String(item.low || item.Low || 0),
                    "Stock P/E": String(item.stockPE || item.pe || item["Stock P/E"] || "0"),
                    "Dividend Yield": String(item.dividendYield || item["Dividend Yield"] || "0"),
                    ROCE: String(item.roce || item.ROCE || "0"),
                    ROE: String(item.roe || item.ROE || "0"),
                    Volume: String(item.volume || item.Volume || "0"),
                    Change: item.change || item.Change || 0,
                    ChangePercent: item.changePercent || item.ChangePercent || 0,
                    Sector: item.sector || item.Sector || 'Unknown',
                    lastUpdated: item.lastApifySync || item.lastUpdated || new Date().toISOString()
                }));

                console.log('✅ Transformed stocks:', transformedData);
                console.log('   Stock symbols:', transformedData.map((s: any) => s.Symbol));
                console.log('   Stock prices:', transformedData.map((s: any) => `${s.Symbol}: ${s["Current Price"]}`));

                setStocks(transformedData);
                setFilteredStocks(transformedData);
                calculateMarketMetrics(transformedData);
                setLastUpdate(new Date());
            } else {
                console.warn('⚠️ No stocks data received from API');
                setStocks([]);
                setFilteredStocks([]);
            }
        } catch (err: any) {
            console.error('Error fetching stocks:', err);
            setError(err.message || 'Failed to fetch stocks');
        } finally {
            setInitialLoading(false);
            setRefreshing(false);
        }
    }, [API_BASE_URL]);

    const calculateMarketMetrics = (stocksData: StockData[]) => {
        console.log('📊 Calculating market metrics for', stocksData.length, 'stocks');
        console.log('   Sample stock:', stocksData[0]);

        // If all stocks have 0 change, show top/bottom by price as fallback
        const hasRealChange = stocksData.some(s => (s.Change || 0) !== 0);

        let gainers, losers;

        if (hasRealChange) {
            // Normal mode: filter by actual change
            gainers = [...stocksData]
                .filter((s: StockData) => (s.Change || 0) > 0)
                .sort((a: StockData, b: StockData) => (b.Change || 0) - (a.Change || 0))
                .slice(0, 5);
            losers = [...stocksData]
                .filter((s: StockData) => (s.Change || 0) < 0)
                .sort((a: StockData, b: StockData) => (a.Change || 0) - (b.Change || 0))
                .slice(0, 5);
        } else {
            // Fallback: show top/bottom by price when no change data available
            console.log('   ⚠️ No change data, showing top/bottom by price');
            const sortedByPrice = [...stocksData].sort((a: StockData, b: StockData) =>
                parseFloat(b["Current Price"] || '0') - parseFloat(a["Current Price"] || '0')
            );
            gainers = sortedByPrice.slice(0, 5);
            losers = sortedByPrice.slice(-5).reverse();
        }

        console.log('   Top gainers:', gainers.length, gainers.map(g => g.Symbol));
        console.log('   Top losers:', losers.length, losers.map(l => l.Symbol));
        setTopGainers(gainers);
        setTopLosers(losers);

        const active = [...stocksData]
            .sort((a, b) => (parseInt(b.Volume || '0') - parseInt(a.Volume || '0')))
            .slice(0, 5);
        setMostActive(active);
    };

    // Check backend connection
    const checkBackendConnection = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/health`); // Removed /api
            if (response.ok) {
                setBackendStatus('online');
            } else {
                setBackendStatus('offline');
            }
        } catch {
            setBackendStatus('offline');
        }
    }, [API_BASE_URL]);

    // Sync selected stock with Twelve Data (primary), fallback to Apify
    const syncSelectedStock = async () => {
        if (!selectedStock) return;
        setSyncingStock(true);
        setError(null);
        try {
            // First try Twelve Data
            const response = await fetch(`${API_BASE_URL}/api/twelve-data/update/${selectedStock}`, {
                method: 'POST',
            });
            const data = await response.json();
            if (data.success) {
                await fetchStocks(true);
            } else {
                // Fallback to Apify
                console.warn('⚠️ Twelve Data sync failed, trying Apify fallback...');
                const apifyResponse = await fetch(`${API_BASE_URL}/api/apify-stocks/update/${selectedStock}`, {
                    method: 'POST',
                });
                const apifyData = await apifyResponse.json();
                if (apifyData.success) {
                    await fetchStocks(true);
                } else {
                    setError(apifyData.error || 'Failed to sync stock live data');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Failed to sync stock live data');
            console.error('Error syncing individual stock:', err);
        } finally {
            setSyncingStock(false);
        }
    };

    // Initial load
    useEffect(() => {
        checkBackendConnection();
        fetchStocks(false);

        // If stocks don't have change data, trigger Twelve Data full sync
        const syncIfNeeded = async () => {
            const stocksData = await fetch(`${API_BASE_URL}/api/db-stocks`).then(r => r.json()).catch(() => null);
            if (stocksData?.data && stocksData.data.length > 0) {
                // Check if stocks are missing change data (null/undefined, not just 0)
                const needsSync = stocksData.data.some((s: any) =>
                    s.change === null || s.change === undefined ||
                    s.changePercent === null || s.changePercent === undefined ||
                    s.lastApifySync === null || s.lastApifySync === undefined
                );
                if (needsSync) {
                    console.log('📡 Stocks missing live data, triggering Twelve Data full sync...');
                    console.log('   This will auto-discover US stocks from Twelve Data (NASDAQ/NYSE)');
                    try {
                        // Use the new sync-all endpoint for auto-discovery (10 stocks default)
                        await fetch(`${API_BASE_URL}/api/twelve-data/sync-all`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ maxStocks: 10 })
                        });
                        // Refresh after sync
                        setTimeout(() => fetchStocks(true), 5000);
                    } catch (e) {
                        console.error('Auto-sync failed:', e);
                    }
                }
            }
        };

        // Delay sync to let initial load complete
        setTimeout(syncIfNeeded, 2000);
    }, [checkBackendConnection, fetchStocks]);

    // Auto-refresh and Live Mode timer
    useEffect(() => {
        if (!autoRefresh && !liveMode) return;

        const interval = setInterval(async () => {
            if (liveMode && selectedStock && !syncingStock) {
                // In Live Mode, actively poll Twelve Data API for the selected stock
                try {
                    await fetch(`${API_BASE_URL}/api/twelve-data/quote/${selectedStock}`);
                } catch (e) {
                    console.error('Live Sync Error:', e);
                }
            }
            fetchStocks(true);
        }, liveMode ? 15000 : refreshInterval); // 15s live polling, or 30s standby DB refresh

        return () => clearInterval(interval);
    }, [autoRefresh, liveMode, refreshInterval, fetchStocks, selectedStock, syncingStock, API_BASE_URL]);

    // Search filter
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredStocks(stocks);
        } else {
            const filtered = stocks.filter(stock =>
                stock.Symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (stock["Company Name"] && stock["Company Name"].toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredStocks(filtered);
        }
    }, [searchTerm, stocks]);

    // Custom Tooltip for chart
    const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {new Date(label || 0).toLocaleDateString()}
                    </p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm">
                            {entry.name}: ₹{entry.value.toFixed(2)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Render chart based on type
    const renderChart = () => {
        if (chartData.length === 0) {
            return (
                <div className="h-[400px] flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">No chart data available</p>
                </div>
            );
        }

        switch (chartType) {
            case 'area':
                return (
                    <RechartsAreaChart data={chartData}>
                        {chartGrid && <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />}
                        <XAxis
                            dataKey="date"
                            stroke={COLORS.text}
                            tick={{ fill: COLORS.text, fontSize: 12 }}
                        />
                        <YAxis
                            stroke={COLORS.text}
                            tick={{ fill: COLORS.text, fontSize: 12 }}
                            scale={chartScale}
                            domain={['auto', 'auto']}
                            tickFormatter={(value) => `₹${value.toFixed(0)}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="close"
                            stroke={COLORS.primary}
                            fill={COLORS.area1}
                            name="Close Price"
                            dot={false}
                            activeDot={{ r: 6 }}
                        />
                    </RechartsAreaChart>
                );

            case 'line':
                return (
                    <RechartsLineChart data={chartData}>
                        {chartGrid && <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />}
                        <XAxis
                            dataKey="date"
                            stroke={COLORS.text}
                            tick={{ fill: COLORS.text, fontSize: 12 }}
                        />
                        <YAxis
                            stroke={COLORS.text}
                            tick={{ fill: COLORS.text, fontSize: 12 }}
                            scale={chartScale}
                            tickFormatter={(value) => `₹${value.toFixed(0)}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <RechartsLine
                            type="monotone"
                            dataKey="close"
                            stroke={COLORS.primary}
                            name="Close Price"
                            dot={false}
                            strokeWidth={2}
                        />
                        <RechartsLine
                            type="monotone"
                            dataKey="high"
                            stroke={COLORS.success}
                            name="High"
                            dot={false}
                            strokeWidth={1}
                        />
                        <RechartsLine
                            type="monotone"
                            dataKey="low"
                            stroke={COLORS.danger}
                            name="Low"
                            dot={false}
                            strokeWidth={1}
                        />
                    </RechartsLineChart>
                );

            case 'candle':
                return (
                    <RechartsComposedChart data={chartData}>
                        {chartGrid && <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />}
                        <XAxis
                            dataKey="date"
                            stroke={COLORS.text}
                            tick={{ fill: COLORS.text, fontSize: 12 }}
                        />
                        <YAxis
                            stroke={COLORS.text}
                            tick={{ fill: COLORS.text, fontSize: 12 }}
                            scale={chartScale}
                            tickFormatter={(value) => `₹${value.toFixed(0)}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                            dataKey="high"
                            fill={COLORS.candleUp}
                            name="High"
                        />
                        <Bar
                            dataKey="low"
                            fill={COLORS.candleDown}
                            name="Low"
                        />
                        <RechartsLine
                            type="monotone"
                            dataKey="close"
                            stroke={COLORS.primary}
                            name="Close"
                            dot={false}
                        />
                    </RechartsComposedChart>
                );

            case 'mountain':
                return (
                    <RechartsAreaChart data={chartData}>
                        {chartGrid && <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />}
                        <XAxis
                            dataKey="date"
                            stroke={COLORS.text}
                            tick={{ fill: COLORS.text, fontSize: 12 }}
                        />
                        <YAxis
                            stroke={COLORS.text}
                            tick={{ fill: COLORS.text, fontSize: 12 }}
                            scale={chartScale}
                            tickFormatter={(value) => `₹${value.toFixed(0)}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="close"
                            stroke={COLORS.primary}
                            fill={COLORS.primary}
                            name="Close Price"
                            fillOpacity={0.6}
                            dot={false}
                        />
                    </RechartsAreaChart>
                );

            case 'baseline':
                return (
                    <RechartsAreaChart data={chartData}>
                        {chartGrid && <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />}
                        <XAxis
                            dataKey="date"
                            stroke={COLORS.text}
                            tick={{ fill: COLORS.text, fontSize: 12 }}
                        />
                        <YAxis
                            stroke={COLORS.text}
                            tick={{ fill: COLORS.text, fontSize: 12 }}
                            scale={chartScale}
                            tickFormatter={(value) => `₹${value.toFixed(0)}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="close"
                            stroke={COLORS.primary}
                            fill={COLORS.area1}
                            name="Close Price"
                            baseValue={chartData[0]?.close || 0}
                            dot={false}
                        />
                    </RechartsAreaChart>
                );

            default:
                return null;
        }
    };

    // Toggle watchlist
    const toggleWatchlist = (symbol: string) => {
        setWatchlist(prev => {
            const newWatchlist = prev.includes(symbol)
                ? prev.filter(s => s !== symbol)
                : [...prev, symbol];

            localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
            return newWatchlist;
        });
    };

    // Fetch news
    const fetchNews = useCallback(async () => {
        setNewsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/news/stocks`, {
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
                const formattedNews = data.data.map((item: any) => ({
                    id: item.id || item._id || Math.random().toString(),
                    title: item.title || 'No title',
                    source: item.source || 'Unknown',
                    time: item.publishedAt ? new Date(item.publishedAt).toLocaleTimeString() : new Date().toLocaleTimeString(),
                    sentiment: item.sentiment || 'neutral',
                    url: item.url || '#',
                    image: item.imageUrl || item.image,
                    description: item.description || '',
                    publishedAt: item.publishedAt || new Date().toISOString()
                }));
                setNews(formattedNews);
            } else {
                setNews([]);
            }
        } catch (error) {
            console.error('Error fetching news:', error);
            setNews([]);
        } finally {
            setNewsLoading(false);
        }
    }, [API_BASE_URL]);

    // Fetch full news content when a news item is selected
    useEffect(() => {
        const getFullContent = async () => {
            if (!selectedNews || selectedNews.fullContent || !selectedNews.url || selectedNews.url === '#') return;

            setFullNewsLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/news/extract?url=${encodeURIComponent(selectedNews.url)}`);
                const data = await response.json();

                if (data.success && data.content) {
                    setSelectedNews(prev => prev ? { ...prev, fullContent: data.content } : null);
                }
            } catch (error) {
                console.error('Error extracting full news:', error);
            } finally {
                setFullNewsLoading(false);
            }
        };

        getFullContent();
    }, [selectedNews, API_BASE_URL, setSelectedNews]);

    // Fetch news on mount and every 5 minutes
    useEffect(() => {
        fetchNews();
        const interval = setInterval(fetchNews, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchNews]);

    // Filter news by sentiment
    const filteredNews = useMemo(() => {
        if (newsFilter === 'all') return news;
        return news.filter(item => item.sentiment === newsFilter);
    }, [news, newsFilter]);

    // Get sentiment color class
    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'negative': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    // Add loading state for table rows to prevent layout shift
    const TableSkeleton = () => (
        <>
            {[...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                    <td className="py-2"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
                    <td className="py-2"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div></td>
                    <td className="py-2"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></td>
                    <td className="py-2"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-auto"></div></td>
                    <td className="py-2"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 ml-auto"></div></td>
                    <td className="py-2"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-auto"></div></td>
                    <td className="py-2"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 ml-auto"></div></td>
                    <td className="py-2"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 mx-auto"></div></td>
                </tr>
            ))}
        </>
    );

    if (!mounted) return null;

    // Show full page loader only on initial load with no data
    if (initialLoading && stocks.length === 0) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Loading Market Data</h3>
                    <p className="text-gray-600 dark:text-gray-400">Fetching stocks from database...</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white ${fullscreen ? 'fixed inset-0 z-50 overflow-auto' : ''}`}>
            <audio ref={audioRef} src="/alert.mp3" preload="none" />
            {/* <CosmicCharts /> */}

            {/* Refresh indicator - subtle and non-intrusive */}
            {refreshing && (
                <div className="fixed top-20 right-4 bg-indigo-600 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 z-50 text-sm">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Updating...</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                <div className="lg:col-span-3">
                    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
                        <div className="mb-6">
                            <MovableNewsBar
                                news={news}
                                isLoading={newsLoading}
                                error={error}
                                onRetry={fetchNews}
                                onNewsClick={setSelectedNews}
                                title="🔥 Hot Market News"
                                showSentiment={true}
                                showSource={true}
                                showTime={true}
                                autoScroll={true}
                                filterBySentiment="all"
                                maxItems={30}
                                variant="default"
                            />
                        </div>
                        {/* Header Section - with fixed heights to prevent layout shift */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 min-h-[100px]">
                            <div className="min-w-[300px]">
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2 sm:gap-3">
                                    <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500" />
                                    <span className="hidden xs:inline">Professional Trading Dashboard</span>
                                    <span className="inline xs:hidden">Dashboard</span>
                                </h1>
                                <div className="flex items-center gap-3 mt-2 flex-wrap min-h-[28px]">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${marketStatus === 'OPEN' ? 'bg-green-500/20 text-green-700 dark:text-green-400' :
                                        marketStatus === 'PRE-OPEN' ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                                            'bg-red-500/20 text-red-700 dark:text-red-400'
                                        }`}>
                                        {marketStatus}
                                    </span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {timeToMarket}
                                    </span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Last: {lastUpdate.toLocaleTimeString()}
                                    </span>
                                    <span className={`text-xs ${backendStatus === 'online' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        ● {backendStatus === 'online' ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                                {error && (
                                    <div className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-400/10 px-3 py-1 rounded-lg">
                                        Error: {error}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap min-h-[44px] w-full md:w-auto">
                                <select
                                    value={selectedStock}
                                    onChange={(e) => setSelectedStock(e.target.value)}
                                    className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 text-sm max-w-[200px] sm:max-w-none"
                                >
                                    {stocks.slice(0, 50).map(stock => (
                                        <option key={stock.Symbol} value={stock.Symbol}>
                                            {stock.Symbol} - {stock["Company Name"] ? stock["Company Name"].substring(0, 20) : 'N/A'}
                                        </option>
                                    ))}
                                </select>

                                {/* <button
                                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                                    className="p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                </button> */}

                                {/* <button
                                    onClick={() => setNotifications(!notifications)}
                                    className={`p-2.5 rounded-xl border ${notifications
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                                        }`}
                                >
                                    {notifications ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                                </button> */}
                                {/* AI Assistant Button - New */}
                                <button
                                    onClick={() => setShowAIChat(!showAIChat)}
                                    className="relative group px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl font-medium flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/30"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity -z-10"></div>
                                    <BrainCircuit className="w-4 h-4 animate-pulse" />
                                    <span className="hidden sm:inline">AI Assistant</span>
                                    <Zap className="w-3 h-3 text-yellow-300 animate-pulse" />

                                    {/* Status indicator */}
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>

                                    {/* Keyboard shortcut hint */}
                                    <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-1.5 py-0.5 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        ⌘K
                                    </span>
                                </button>

                                <button
                                    onClick={() => setLiveMode(!liveMode)}
                                    className={`px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 ${liveMode
                                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/40 animate-pulse'
                                        : 'bg-green-600 hover:bg-green-700 text-white'}`}
                                >
                                    {liveMode ? (
                                        <>
                                            <Radio className="w-4 h-4 animate-spin-slow" />
                                            Live Mode: ON
                                        </>
                                    ) : (
                                        <>
                                            <Database className="w-4 h-4" />
                                            Live Mode: OFF
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => fetchStocks(true)}
                                    disabled={refreshing || initialLoading}
                                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                    {refreshing ? 'Refreshing...' : 'Refresh'}
                                </button>

                                {/* <button
                                    onClick={() => setFullscreen(!fullscreen)}
                                    className="p-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl"
                                >
                                    {fullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                                </button> */}
                            </div>
                        </div>

                        {/* Movable Stock Bar */}
                        <div className="mb-6">
                            <MovableStockBar
                                stocks={stocks}
                                selectedStock={selectedStock}
                                onSelectStock={setSelectedStock}
                                watchlist={watchlist}
                                onToggleWatchlist={toggleWatchlist}
                                isLoading={initialLoading}
                                error={error}
                                onRetry={() => fetchStocks(false)}
                                title="🔥 Hot Stocks"
                                showVolume={true}
                                showMarketCap={true}
                                showSector={true}
                                maxItems={100}
                                autoScroll={true}
                                scrollSpeed={0.5}
                                variant="default"
                                showExtendedInfo={true}
                            />
                        </div>

                        {/* Market Overview - fixed height cards */}
                        {!fullscreen && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                {/* Top Gainers */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 min-h-[200px]">
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-green-600" />
                                        Top Gainers
                                    </h3>
                                    <div className="space-y-3">
                                        {topGainers.length > 0 ? (
                                            topGainers.map(stock => (
                                                <div key={stock.Symbol} className="flex items-center justify-between">
                                                    <div>
                                                        <span className="font-medium text-gray-900 dark:text-white">{stock.Symbol}</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{stock["Company Name"]?.substring(0, 15) || 'N/A'}</span>
                                                    </div>
                                                    <span className="text-green-600 font-medium">
                                                        +{(stock.Change || 0).toFixed(2)}%
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                                                {stocks.length > 0 ? 'No gainers found' : 'Loading...'}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Top Losers */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 min-h-[200px]">
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <TrendingDown className="w-5 h-5 text-red-600" />
                                        Top Losers
                                    </h3>
                                    <div className="space-y-3">
                                        {topLosers.length > 0 ? (
                                            topLosers.map(stock => (
                                                <div key={stock.Symbol} className="flex items-center justify-between">
                                                    <div>
                                                        <span className="font-medium text-gray-900 dark:text-white">{stock.Symbol}</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{stock["Company Name"]?.substring(0, 15) || 'N/A'}</span>
                                                    </div>
                                                    <span className="text-red-600 font-medium">
                                                        {(stock.Change || 0).toFixed(2)}%
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                                                {stocks.length > 0 ? 'No losers found' : 'Loading...'}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Most Active */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 min-h-[200px]">
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-blue-600" />
                                        Most Active
                                    </h3>
                                    <div className="space-y-3">
                                        {mostActive.length > 0 ? (
                                            mostActive.map(stock => (
                                                <div key={stock.Symbol} className="flex items-center justify-between">
                                                    <div>
                                                        <span className="font-medium text-gray-900 dark:text-white">{stock.Symbol}</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{formatVolume(parseInt(stock.Volume || '0'))}</span>
                                                    </div>
                                                    <span className={`font-medium ${(stock.Change || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {(stock.Change || 0).toFixed(2)}%
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                                                {stocks.length > 0 ? 'No data' : 'Loading...'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Chart Controls */}
                        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    {[
                                        { type: 'area', icon: AreaChartIcon, label: 'Area' },
                                        { type: 'line', icon: LineChartIcon, label: 'Line' },
                                        { type: 'candle', icon: BarChart2, label: 'Candle' },
                                        { type: 'mountain', icon: TrendingUp, label: 'Mountain' },
                                        { type: 'baseline', icon: Activity, label: 'Baseline' }
                                    ].map(({ type, icon: Icon, label }) => (
                                        <button
                                            key={type}
                                            onClick={() => setChartType(type as any)}
                                            className={`p-2 rounded-lg flex items-center gap-1 ${chartType === type
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                }`}
                                            title={label}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span className="text-xs hidden sm:inline">{label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-1 flex-wrap">
                                    {(['1D', '1W', '1M', '3M', '6M', '1Y', '2Y', '5Y'] as const).map(tf => (
                                        <button
                                            key={tf}
                                            onClick={() => setTimeframe(tf)}
                                            className={`px-3 py-1.5 rounded-lg text-sm ${timeframe === tf
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            {tf}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setChartGrid(!chartGrid)}
                                        className={`px-3 py-1.5 rounded-lg text-sm ${chartGrid
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        Grid
                                    </button>
                                    <button
                                        onClick={() => setChartScale(chartScale === 'linear' ? 'log' : 'linear')}
                                        className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                                    >
                                        {chartScale === 'linear' ? 'Linear' : 'Log'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 overflow-x-auto min-h-[40px]">
                                {indicators.map(indicator => (
                                    <div key={indicator.name} className="flex items-center gap-2 flex-shrink-0">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{indicator.name}:</span>
                                        <span className="text-xs font-medium" style={{ color: indicator.color }}>
                                            {indicator.name.includes('RSI')
                                                ? indicator.value.toFixed(2)
                                                : indicator.name.includes('SMA') || indicator.name.includes('EMA') || indicator.name.includes('BB')
                                                    ? `₹${indicator.value.toFixed(2)}`
                                                    : indicator.value.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chart - with stable dimensions */}
                        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    {renderChart()}
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Stock List */}
                        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Stock List</h2>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded-lg ${viewMode === 'grid'
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            <Grid className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('table')}
                                            className={`p-2 rounded-lg ${viewMode === 'table'
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            <Table className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="relative w-full sm:w-48 md:w-56 lg:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search stocks..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto min-h-[300px]">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-sm text-gray-600 dark:text-gray-400">
                                            <th className="pb-3">Symbol</th>
                                            <th className="pb-3">Company</th>
                                            <th className="pb-3">Sector</th>
                                            <th className="pb-3 text-right">Price</th>
                                            <th className="pb-3 text-right">Change</th>
                                            <th className="pb-3 text-right">Volume</th>
                                            <th className="pb-3 text-right">Market Cap</th>
                                            <th className="pb-3 text-center">Watchlist</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStocks.length > 0 ? (
                                            filteredStocks.map((stock) => (
                                                <tr key={stock.Symbol} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                                    <td className="py-2 font-medium">{stock.Symbol}</td>
                                                    <td className="py-2">{stock["Company Name"]}</td>
                                                    <td className="py-2">{stock.Sector}</td>
                                                    <td className="py-2 text-right">{formatPrice(parseFloat(stock["Current Price"]))}</td>
                                                    <td className={`py-2 text-right font-medium ${(stock.Change || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        {formatPercentage(stock.Change || 0)}
                                                    </td>
                                                    <td className="py-2 text-right">{formatVolume(parseInt(stock.Volume || '0'))}</td>
                                                    <td className="py-2 text-right">{formatLargeNumber(parseFloat(stock["Market Cap"]))}</td>
                                                    <td className="py-2 text-center">
                                                        <button
                                                            onClick={() => toggleWatchlist(stock.Symbol)}
                                                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                                                        >
                                                            <Star
                                                                className={`w-4 h-4 ${watchlist.includes(stock.Symbol)
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-gray-400'
                                                                    }`}
                                                            />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <TableSkeleton />
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* News Panel - Responsive layout */}
                <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto lg:sticky lg:top-[80px] lg:h-[calc(100vh-80px)]">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Newspaper className="w-5 h-5 text-indigo-600" />
                                Market News
                            </h2>
                            <button
                                onClick={() => setShowNewsPanel(!showNewsPanel)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                aria-label="Toggle news panel"
                            >
                                {showNewsPanel ? <ChevronRight className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 rotate-180" />}
                            </button>
                        </div>

                        {/* News Filter */}
                        <div className="flex gap-2 mb-4 flex-wrap">
                            <button
                                onClick={() => setNewsFilter('all')}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${newsFilter === 'all'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setNewsFilter('positive')}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${newsFilter === 'positive'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30'
                                    }`}
                            >
                                Positive
                            </button>
                            <button
                                onClick={() => setNewsFilter('negative')}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${newsFilter === 'negative'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30'
                                    }`}
                            >
                                Negative
                            </button>
                            <button
                                onClick={() => setNewsFilter('neutral')}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${newsFilter === 'neutral'
                                    ? 'bg-gray-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                Neutral
                            </button>
                        </div>

                        {/* News List */}
                        {newsLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Loading news...</p>
                            </div>
                        ) : filteredNews.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Newspaper className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">No news available</p>
                                <button
                                    onClick={() => fetchNews()}
                                    className="mt-3 px-4 py-2 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Refresh
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
                                {filteredNews.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedNews(item)}
                                        className="block p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:shadow-md transition-shadow hover:bg-gray-100 dark:hover:bg-gray-800 group cursor-pointer"
                                    >
                                        <div className="flex gap-3">
                                            {item.image && (
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={item.image}
                                                        alt={item.title}
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium mb-1 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {item.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs text-gray-500 truncate max-w-[80px]">{item.source}</span>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-gray-500">{item.time}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${getSentimentColor(item.sentiment)}`}>
                                                        {item.sentiment}
                                                    </span>
                                                    <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showAIChat && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
                    onClick={() => setShowAIChat(false)}
                >
                    <div
                        className="relative w-full max-w-4xl h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowAIChat(false)}
                            className="absolute top-4 right-4 z-10 p-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* AI Assistant Component - Now using AIAgent with History */}
                        <AIAgent
                            onClose={() => setShowAIChat(false)}
                            fullScreen={false}
                            initialMessage={selectedStock ? `Analyze $${selectedStock} technicals` : undefined}
                            selectedStock={selectedStock}
                        />
                    </div>
                </div>
            )}

            {/* News Detail Modal */}
            {selectedNews && (
                <div
                    className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
                    onClick={() => setSelectedNews(null)}
                >
                    <div
                        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-slide-up overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Image */}
                        {selectedNews.image && (
                            <div className="w-full h-48 sm:h-64 overflow-hidden relative shrink-0">
                                <img
                                    src={selectedNews.image}
                                    alt={selectedNews.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-4 left-6">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getSentimentColor(selectedNews.sentiment)}`}>
                                        {selectedNews.sentiment}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="p-6 flex flex-col flex-1 overflow-hidden">
                            <div className="flex justify-between items-start mb-4 shrink-0">
                                <div className="flex-1">
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
                                        {selectedNews.title}
                                    </h2>
                                    <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-medium text-indigo-600 dark:text-indigo-400">{selectedNews.source}</span>
                                        <span>•</span>
                                        <span>{selectedNews.time}</span>
                                        <span>•</span>
                                        <span>{new Date(selectedNews.publishedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedNews(null)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors shrink-0 ml-4"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 mb-6 flex-1 overflow-y-auto custom-scrollbar pr-3">
                                {fullNewsLoading ? (
                                    <div className="flex flex-col items-center justify-center py-10 space-y-3">
                                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-sm font-medium animate-pulse">Reading the full article for you...</p>
                                    </div>
                                ) : selectedNews.fullContent ? (
                                    <div className="space-y-4">
                                        {selectedNews.fullContent.split('\n\n').map((para, i) => (
                                            <p key={i} className="text-lg leading-relaxed">{para}</p>
                                        ))}
                                    </div>
                                ) : selectedNews.description ? (
                                    <p className="text-lg leading-relaxed">{selectedNews.description}</p>
                                ) : (
                                    <p className="italic">No detailed description available for this news item.</p>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100 dark:border-gray-800 shrink-0">
                                <a
                                    href={selectedNews.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
                                >
                                    Read Full Article
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                                <button
                                    onClick={() => setSelectedNews(null)}
                                    className="w-full sm:w-auto px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <style jsx>{`
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  .animate-fade-in {
    animation: fade-in 0.2s ease-out;
  }
  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
  }
  .dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #334155;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
  }
  .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #475569;
  }
`}</style>
        </div>
    );
}