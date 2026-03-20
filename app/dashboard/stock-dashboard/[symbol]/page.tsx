'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    TrendingUp, TrendingDown, ArrowLeft, Star,
    Building2, Globe, DollarSign, BarChart3,
    Activity, PieChart, Users, Clock, Calendar,
    Download, Share2, Bell, MoreHorizontal,
    ChevronRight, Info, AlertCircle, RefreshCw,
    FileText, Target, Shield, Award, Zap
} from 'lucide-react';
import { StockChart, Timeframe, ChartType } from '../../../components/StockChart';

interface StockDetails {
    symbol: string;
    companyName: string;
    sector: string;
    industry: string;
    currentPrice: number;
    change: number;
    changePercent: number;
    dayHigh: number;
    dayLow: number;
    week52High: number;
    week52Low: number;
    volume: number;
    avgVolume: number;
    marketCap: number;
    pe: number;
    eps: number;
    dividend: number;
    dividendYield: number;
    beta: number;
    ipoDate: string;
    website: string;
    description: string;
    ceo: string;
    employees: number;
    headquarters: string;
    founded: string;
}

interface KeyMetric {
    label: string;
    value: string;
    change?: string;
    icon: React.ElementType;
    color: string;
}

export default function StockDetailPage() {
    const params = useParams();
    const router = useRouter();
    const symbol = params.symbol as string;

    const [stock, setStock] = useState<StockDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [inWatchlist, setInWatchlist] = useState(false);
    const [timeframe, setTimeframe] = useState<Timeframe>('1D');
    const [chartType, setChartType] = useState<ChartType>('area');
    const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'holders' | 'news'>('overview');

    useEffect(() => {
        fetchStockDetails();
        checkWatchlist();
    }, [symbol]);

    const fetchStockDetails = async () => {
        try {
            setLoading(true);
            // In a real app, fetch from your API
            // const response = await fetch(`/api/stocks/${symbol}`);
            // const data = await response.json();

            // Mock data for demonstration
            const mockStock: StockDetails = {
                symbol: symbol,
                companyName: 'Reliance Industries Ltd',
                sector: 'Energy',
                industry: 'Oil & Gas',
                currentPrice: 2456.75,
                change: 23.45,
                changePercent: 0.96,
                dayHigh: 2478.30,
                dayLow: 2432.15,
                week52High: 2875.00,
                week52Low: 2120.00,
                volume: 12500000,
                avgVolume: 15000000,
                marketCap: 16500000000000,
                pe: 28.5,
                eps: 86.20,
                dividend: 7.00,
                dividendYield: 0.28,
                beta: 1.2,
                ipoDate: '1977',
                website: 'https://www.ril.com',
                description: 'Reliance Industries Limited is an Indian multinational conglomerate company headquartered in Mumbai. It has businesses across energy, petrochemicals, textiles, natural resources, retail, and telecommunications.',
                ceo: 'Mukesh Ambani',
                employees: 236334,
                headquarters: 'Mumbai, India',
                founded: '1966'
            };

            setStock(mockStock);
        } catch (err) {
            setError('Failed to fetch stock details');
        } finally {
            setLoading(false);
        }
    };

    const checkWatchlist = () => {
        try {
            const watchlist = JSON.parse(localStorage.getItem('stockWatchlist') || '[]');
            setInWatchlist(watchlist.includes(symbol));
        } catch (err) {
            console.error('Error checking watchlist:', err);
        }
    };

    const toggleWatchlist = () => {
        try {
            const watchlist = JSON.parse(localStorage.getItem('stockWatchlist') || '[]');
            let updated;

            if (inWatchlist) {
                updated = watchlist.filter((s: string) => s !== symbol);
            } else {
                updated = [...watchlist, symbol];
            }

            localStorage.setItem('stockWatchlist', JSON.stringify(updated));
            setInWatchlist(!inWatchlist);
        } catch (err) {
            console.error('Error updating watchlist:', err);
        }
    };

    const formatNumber = (num: number) => {
        if (num >= 1e12) return `₹${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `₹${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e7) return `₹${(num / 1e7).toFixed(2)}Cr`;
        if (num >= 1e5) return `₹${(num / 1e5).toFixed(2)}L`;
        return `₹${num.toFixed(2)}`;
    };

    const formatLargeNumber = (num: number) => {
        if (num >= 1e7) return `${(num / 1e7).toFixed(2)}Cr`;
        if (num >= 1e5) return `${(num / 1e5).toFixed(2)}L`;
        return num.toString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading stock data...</p>
                </div>
            </div>
        );
    }

    if (error || !stock) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Stock</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Stock not found'}</p>
                    <button
                        onClick={() => router.push('/dashboard/stocks')}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                        Back to Stocks
                    </button>
                </div>
            </div>
        );
    }

    const isPositive = stock.change >= 0;

    const keyMetrics: KeyMetric[] = [
        { label: 'Market Cap', value: formatNumber(stock.marketCap), icon: DollarSign, color: 'from-blue-500 to-indigo-600' },
        { label: 'P/E Ratio', value: stock.pe.toFixed(2), icon: BarChart3, color: 'from-green-500 to-emerald-600' },
        { label: 'EPS', value: `₹${stock.eps.toFixed(2)}`, icon: Activity, color: 'from-purple-500 to-pink-600' },
        { label: 'Dividend Yield', value: `${stock.dividendYield}%`, icon: Award, color: 'from-yellow-500 to-orange-600' },
        { label: 'Day Range', value: `₹${stock.dayLow} - ₹${stock.dayHigh}`, icon: TrendingUp, color: 'from-red-500 to-pink-600' },
        { label: '52W Range', value: `₹${stock.week52Low} - ₹${stock.week52High}`, icon: Activity, color: 'from-indigo-500 to-blue-600' },
        { label: 'Volume', value: formatLargeNumber(stock.volume), icon: Users, color: 'from-purple-500 to-pink-600' },
        { label: 'Beta', value: stock.beta.toFixed(2), icon: Activity, color: 'from-indigo-500 to-blue-600' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{stock.symbol}</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{stock.companyName}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleWatchlist}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${inWatchlist
                                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <Star className={`w-5 h-5 ${inWatchlist ? 'fill-yellow-500' : ''}`} />
                                {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                            </button>

                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                <Bell className="w-5 h-5" />
                            </button>

                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stock Chart */}
                <StockChart
                    symbol={stock.symbol}
                    companyName={stock.companyName}
                    currentPrice={stock.currentPrice}
                    change={stock.change}
                    changePercent={stock.changePercent}
                    onTimeframeChange={setTimeframe}
                    onChartTypeChange={setChartType}
                />

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    {keyMetrics.map((metric, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center`}>
                                    <metric.icon className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{metric.label}</span>
                            </div>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{metric.value}</p>
                            {metric.change && (
                                <p className="text-xs text-green-600 mt-1">{metric.change}</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="mt-8 border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex gap-8">
                        {(['overview', 'financials', 'holders', 'news'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${activeTab === tab
                                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="mt-8">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About {stock.companyName}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{stock.description}</p>

                                    <div className="grid grid-cols-2 gap-6 mt-6">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">CEO</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{stock.ceo}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Employees</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{formatLargeNumber(stock.employees)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Headquarters</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{stock.headquarters}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Founded</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{stock.founded}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Sector</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{stock.sector}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Industry</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{stock.industry}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Statistics</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Market Cap</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{formatNumber(stock.marketCap)}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">P/E Ratio</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{stock.pe.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">EPS (TTM)</span>
                                            <span className="font-medium text-gray-900 dark:text-white">₹{stock.eps.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Dividend Yield</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{stock.dividendYield}%</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Beta</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{stock.beta.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-gray-500 dark:text-gray-400">52 Week High</span>
                                            <span className="font-medium text-green-600">₹{stock.week52High.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-gray-500 dark:text-gray-400">52 Week Low</span>
                                            <span className="font-medium text-red-600">₹{stock.week52Low.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Website</h3>
                                    <a
                                        href={stock.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        <Globe className="w-4 h-4" />
                                        {stock.website.replace('https://', '')}
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'financials' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Financial Data</h3>
                            <p className="text-gray-500 dark:text-gray-400">Financial statements and ratios will be displayed here</p>
                        </div>
                    )}

                    {activeTab === 'holders' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Shareholding Pattern</h3>
                            <p className="text-gray-500 dark:text-gray-400">Promoter and institutional holding data will be displayed here</p>
                        </div>
                    )}

                    {activeTab === 'news' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
                            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Latest News</h3>
                            <p className="text-gray-500 dark:text-gray-400">Company news and announcements will be displayed here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}












// 'use client';

// import { useState, useEffect } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import Link from 'next/link';
// import {
//     TrendingUp, TrendingDown, DollarSign, PieChart,
//     BarChart3, Activity, Users, Building2, Calendar,
//     ArrowUpRight, ArrowDownRight, Info, RefreshCw,
//     Download, Share2, Star, Bell, ChevronRight, ArrowLeft,
//     Percent, Target, LineChart as LineChartIcon
// } from 'lucide-react';
// import {
//     LineChart,
//     Line,
//     AreaChart,
//     Area,
//     BarChart,
//     Bar,
//     PieChart as RechartsPieChart,
//     Pie,
//     Cell,
//     XAxis,
//     YAxis,
//     CartesianGrid,
//     Tooltip,
//     ResponsiveContainer
// } from 'recharts';
// import axios from 'axios';

// interface StockData {
//     Symbol: string;
//     "Company Name": string;
//     "Market Cap": string;
//     "Current Price": string;
//     High: string;
//     Low: string;
//     "Stock P/E": string;
//     "Book Value": string;
//     "Dividend Yield": string;
//     ROCE: string;
//     ROE: string;
//     "Face Value": string;
//     "Compounded Sales Growth - 10 Years": string;
//     "Compounded Sales Growth - 5 Years": string;
//     "Compounded Sales Growth - 3 Years": string;
//     "Compounded Sales Growth - TTM": string;
//     "Compounded Profit Growth - 10 Years": string;
//     "Compounded Profit Growth - 5 Years": string;
//     "Compounded Profit Growth - 3 Years": string;
//     "Compounded Profit Growth - TTM": string;
//     "Stock Price CAGR - 10 Years": string;
//     "Stock Price CAGR - 5 Years": string;
//     "Stock Price CAGR - 3 Years": string;
//     "Stock Price CAGR - 1 Year": string;
//     "Return on Equity - 10 Years": string;
//     "Return on Equity - 5 Years": string;
//     "Return on Equity - 3 Years": string;
//     "Return on Equity - Last Year": string;
//     Promoters: string;
//     FIIs: string;
//     DIIs: string;
//     Public: string;
//     Government: string;
//     Announcement1: string;
//     Announcement2: string;
//     Announcement3: string;
//     Announcement4: string;
//     Announcement5: string;
//     "No. of Shareholders": string;
// }

// export default function StockDetailPage() {
//     const params = useParams();
//     const router = useRouter();

//     // Get symbol from URL params
//     const symbol = params?.symbol as string;

//     const [stock, setStock] = useState<StockData | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [isInWatchlist, setIsInWatchlist] = useState(false);
//     const [refreshing, setRefreshing] = useState(false);
//     const [fetchingStocks, setFetchingStocks] = useState(false);

//     const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

//     useEffect(() => {
//         if (!symbol) {
//             setError('No stock symbol provided in URL');
//             setLoading(false);
//             return;
//         }

//         checkWatchlist();
//         fetchStockData();
//     }, [symbol]);

//     const fetchStockData = async () => {
//         try {
//             setLoading(true);
//             setError(null);

//             const token = localStorage.getItem('token');

//             if (!token) {
//                 router.push('/Authentication/signin');
//                 return;
//             }

//             console.log('🔍 Fetching stock:', symbol);

//             // Encode symbol to handle special characters if any (though usually stock symbols are simple)
//             const encodedSymbol = encodeURIComponent(symbol);

//             const response = await axios.get(`${ API_URL } / api / stocks / ${ encodedSymbol }`, {
//                 headers: {
//                     Authorization: `Bearer ${ token }`
//                 }
//             });

//             console.log('✅ API Response:', response.data);

//             if (response.data) {
//                 setStock(response.data);
//             } else {
//                 throw new Error('Failed to fetch stock data');
//             }

//         } catch (err: any) {
//             console.error('❌ Error fetching stock:', err);

//             if (err.response?.status === 401) {
//                 setError('Session expired. Please login again.');
//                 setTimeout(() => router.push('/Authentication/signin'), 2000);
//             } else if (err.response?.status === 404) {
//                 setError(`Stock '${symbol}' not found in database.`);
//             } else {
//                 setError(err.response?.data?.message || err.message || 'Failed to fetch stock data');
//             }

//             setStock(null);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchStocksFirst = async () => {
//         try {
//             setFetchingStocks(true);
//             setError(null);

//             const token = localStorage.getItem('token');

//             if (!token) {
//                 router.push('/Authentication/signin');
//                 return;
//             }

//             console.log('📥 Triggering stock refresh from Apify...');

//             const response = await axios.post(`${ API_URL } / api / stocks / refresh`, {}, {
//                 headers: { Authorization: `Bearer ${ token }` }
//             });

//             console.log('✅ Refresh response:', response.data);

//             if (response.data.message) {
//                 // Wait a bit and retry fetching
//                 setTimeout(async () => {
//                     await fetchStockData();
//                 }, 3000);
//             }

//         } catch (err: any) {
//             console.error('❌ Error fetching stocks:', err);
//             setError(err.response?.data?.message || 'Failed to refresh stocks');
//         } finally {
//             setFetchingStocks(false);
//         }
//     };

//     const handleRefresh = async () => {
//         try {
//             setRefreshing(true);
//             const token = localStorage.getItem('token');

//             await axios.post(`${ API_URL } / api / stocks / refresh`, {}, {
//                 headers: { Authorization: `Bearer ${ token }` }
//             });

//             // Wait a bit then fetch updated data
//             setTimeout(() => {
//                 fetchStockData();
//                 setRefreshing(false);
//             }, 3000);

//         } catch (err) {
//             console.error('Error refreshing stock:', err);
//             setRefreshing(false);
//         }
//     };

//     const checkWatchlist = () => {
//         try {
//             const watchlist = localStorage.getItem('stockWatchlist');
//             if (watchlist) {
//                 const parsed = JSON.parse(watchlist);
//                 setIsInWatchlist(parsed.includes(symbol));
//             }
//         } catch (err) {
//             console.error('Error reading watchlist:', err);
//         }
//     };

//     const toggleWatchlist = () => {
//         try {
//             const watchlist = localStorage.getItem('stockWatchlist');
//             let updated: string[];

//             if (watchlist) {
//                 const parsed = JSON.parse(watchlist);
//                 if (parsed.includes(symbol)) {
//                     updated = parsed.filter((s: string) => s !== symbol);
//                 } else {
//                     updated = [...parsed, symbol];
//                 }
//             } else {
//                 updated = [symbol];
//             }

//             localStorage.setItem('stockWatchlist', JSON.stringify(updated));
//             setIsInWatchlist(!isInWatchlist);
//         } catch (err) {
//             console.error('Error updating watchlist:', err);
//         }
//     };

//     const formatNumber = (num: string) => {
//         if (!num) return '0';
//         return num.replace(/,/g, ',');
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
//                 <div className="flex flex-col items-center">
//                     <div className="relative">
//                         <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
//                         <div className="absolute inset-0 flex items-center justify-center">
//                             <TrendingUp className="w-6 h-6 text-indigo-600 animate-pulse" />
//                         </div>
//                     </div>
//                     <p className="mt-4 text-gray-600 dark:text-gray-400">
//                         {symbol ? `Loading ${ symbol } data...` : 'Loading...'}
//                     </p>
//                 </div>
//             </div>
//         );
//     }

//     if (error || !stock) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
//                 <div className="max-w-3xl mx-auto">
//                     <button
//                         onClick={() => router.back()}
//                         className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors group"
//                     >
//                         <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
//                         <span>Back to Stocks</span>
//                     </button>

//                     <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8 text-center">
//                         <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
//                             <TrendingDown className="w-10 h-10 text-red-600" />
//                         </div>

//                         <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
//                             {!symbol ? 'No Stock Selected' : 'Stock Not Found'}
//                         </h2>

//                         <p className="text-gray-600 dark:text-gray-400 mb-6">
//                             {error || `No data available for ${ symbol || 'this stock' }`}
//                         </p>

//                         <div className="flex flex-col sm:flex-row gap-3 justify-center">
//                             {error?.includes('fetch stocks first') && (
//                                 <button
//                                     onClick={fetchStocksFirst}
//                                     disabled={fetchingStocks}
//                                     className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors inline-flex items-center gap-2 justify-center disabled:opacity-50"
//                                 >
//                                     {fetchingStocks ? (
//                                         <>
//                                             <RefreshCw className="w-4 h-4 animate-spin" />
//                                             Fetching...
//                                         </>
//                                     ) : (
//                                         <>
//                                             <RefreshCw className="w-4 h-4" />
//                                             Fetch Stocks Now
//                                         </>
//                                     )}
//                                 </button>
//                             )}

//                             <Link
//                                 href="/dashboard/stock-dashboard"
//                                 className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium transition-colors inline-flex items-center gap-2 justify-center"
//                             >
//                                 <ArrowLeft className="w-4 h-4" />
//                                 Back to Stocks List
//                             </Link>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     // Prepare chart data
//     const salesGrowthData = [
//         { year: '10Y', growth: parseFloat(stock["Compounded Sales Growth - 10 Years"] || '0') },
//         { year: '5Y', growth: parseFloat(stock["Compounded Sales Growth - 5 Years"] || '0') },
//         { year: '3Y', growth: parseFloat(stock["Compounded Sales Growth - 3 Years"] || '0') },
//         { year: 'TTM', growth: parseFloat(stock["Compounded Sales Growth - TTM"] || '0') }
//     ];

//     const profitGrowthData = [
//         { year: '10Y', growth: parseFloat(stock["Compounded Profit Growth - 10 Years"] || '0') },
//         { year: '5Y', growth: parseFloat(stock["Compounded Profit Growth - 5 Years"] || '0') },
//         { year: '3Y', growth: parseFloat(stock["Compounded Profit Growth - 3 Years"] || '0') },
//         { year: 'TTM', growth: parseFloat(stock["Compounded Profit Growth - TTM"] || '0') }
//     ];

//     const cagrData = [
//         { period: '10Y', value: parseFloat(stock["Stock Price CAGR - 10 Years"] || '0') },
//         { period: '5Y', value: parseFloat(stock["Stock Price CAGR - 5 Years"] || '0') },
//         { period: '3Y', value: parseFloat(stock["Stock Price CAGR - 3 Years"] || '0') },
//         { period: '1Y', value: parseFloat(stock["Stock Price CAGR - 1 Year"] || '0') }
//     ];

//     const roeData = [
//         { period: '10Y', value: parseFloat(stock["Return on Equity - 10 Years"] || '0') },
//         { period: '5Y', value: parseFloat(stock["Return on Equity - 5 Years"] || '0') },
//         { period: '3Y', value: parseFloat(stock["Return on Equity - 3 Years"] || '0') },
//         { period: 'LY', value: parseFloat(stock["Return on Equity - Last Year"] || '0') }
//     ];

//     const shareholderData = [
//         { name: 'Promoters', value: parseFloat(stock.Promoters || '0'), color: '#6366F1' },
//         { name: 'FIIs', value: parseFloat(stock.FIIs || '0'), color: '#8B5CF6' },
//         { name: 'DIIs', value: parseFloat(stock.DIIs || '0'), color: '#EC4899' },
//         { name: 'Public', value: parseFloat(stock.Public || '0'), color: '#10B981' },
//         { name: 'Government', value: parseFloat(stock.Government || '0'), color: '#F59E0B' }
//     ];

//     const currentPrice = parseFloat(stock["Current Price"]?.replace(/,/g, '') || '0');
//     const high = parseFloat(stock.High?.replace(/,/g, '') || '0');
//     const low = parseFloat(stock.Low?.replace(/,/g, '') || '0');
//     const changeFromHigh = high ? ((currentPrice - high) / high * 100).toFixed(2) : '0';
//     const changeFromLow = low ? ((currentPrice - low) / low * 100).toFixed(2) : '0';

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
//             <div className="max-w-7xl mx-auto">
//                 {/* Breadcrumb Navigation */}
//                 <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
//                     <Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
//                         Dashboard
//                     </Link>
//                     <ChevronRight className="w-4 h-4" />
//                     <Link href="/dashboard/stock-dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
//                         Stocks
//                     </Link>
//                     <ChevronRight className="w-4 h-4" />
//                     <span className="text-indigo-600 dark:text-indigo-400 font-medium">{stock.Symbol}</span>
//                 </div>

//                 {/* Header with Refresh Button */}
//                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
//                     <div>
//                         <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
//                             <Building2 className="w-8 h-8 text-indigo-500" />
//                             {stock["Company Name"]}
//                             <span className="text-lg font-normal text-gray-500 dark:text-gray-400">
//                                 ({stock.Symbol})
//                             </span>
//                         </h1>
//                         <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                             Last updated: {new Date().toLocaleDateString()}
//                         </p>
//                     </div>

//                     <div className="flex items-center gap-3">
//                         <button
//                             onClick={handleRefresh}
//                             disabled={refreshing}
//                             className="p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all disabled:opacity-50"
//                             title="Refresh data"
//                         >
//                             <RefreshCw className={`w - 5 h - 5 ${ refreshing ? 'animate-spin' : '' } `} />
//                         </button>
//                         <button
//                             onClick={toggleWatchlist}
//                             className={`p - 2.5 rounded - xl transition - all ${ isInWatchlist
//                                 ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 hover:bg-yellow-200 dark:hover:bg-yellow-900/30'
//                                 : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
//                                 }`}
//                         >
//                             <Star className={`w-5 h-5 ${isInWatchlist ? 'fill-yellow-500 text-yellow-500' : ''}`} />
//                         </button>
//                         <button className="p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all">
//                             <Share2 className="w-5 h-5" />
//                         </button>
//                         <button className="p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all">
//                             <Download className="w-5 h-5" />
//                         </button>
//                     </div>
//                 </div>

//                 {/* Success Banner */}
//                 {!error && stock && (
//                     <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-xs text-green-700 dark:text-green-400">
//                         <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                         <span>Data loaded successfully from database</span>
//                         <span className="text-gray-500 dark:text-gray-500 ml-auto">
//                             Symbol: {stock.Symbol}
//                         </span>
//                     </div>
//                 )}

//                 {/* Key Metrics Cards */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//                     <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all">
//                         <div className="flex items-center justify-between mb-2">
//                             <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
//                                 <DollarSign className="w-5 h-5 text-blue-600" />
//                             </div>
//                             <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full animate-pulse">
//                                 LIVE
//                             </span>
//                         </div>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">Current Price</p>
//                         <div className="flex items-baseline gap-2">
//                             <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{stock["Current Price"]}</p>
//                             <span className={`text-xs flex items-center ${parseFloat(changeFromHigh) >= 0 ? 'text-green-600' : 'text-red-600'
//                                 }`}>
//                                 {parseFloat(changeFromHigh) >= 0 ? '+' : ''}{changeFromHigh}%
//                             </span>
//                         </div>
//                         <div className="flex items-center justify-between mt-2 text-xs">
//                             <span className="text-gray-500">52W High: ₹{stock.High}</span>
//                             <span className="text-gray-500">52W Low: ₹{stock.Low}</span>
//                         </div>
//                     </div>

//                     <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all">
//                         <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg w-fit mb-2">
//                             <TrendingUp className="w-5 h-5 text-purple-600" />
//                         </div>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">Market Cap</p>
//                         <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{stock["Market Cap"]}Cr</p>
//                         <div className="flex items-center gap-3 mt-2">
//                             <span className="text-xs text-gray-500">P/E:</span>
//                             <span className="text-sm font-semibold text-gray-900 dark:text-white">{stock["Stock P/E"]}</span>
//                             <span className="text-xs text-gray-500">Book Value:</span>
//                             <span className="text-sm font-semibold text-gray-900 dark:text-white">₹{stock["Book Value"]}</span>
//                         </div>
//                     </div>

//                     <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all">
//                         <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg w-fit mb-2">
//                             <Activity className="w-5 h-5 text-indigo-600" />
//                         </div>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">ROCE & ROE</p>
//                         <div className="flex items-baseline gap-4">
//                             <div>
//                                 <p className="text-3xl font-bold text-gray-900 dark:text-white">{stock.ROCE}%</p>
//                                 <p className="text-xs text-gray-500">ROCE</p>
//                             </div>
//                             <div>
//                                 <p className="text-2xl font-bold text-gray-900 dark:text-white">{stock.ROE}%</p>
//                                 <p className="text-xs text-gray-500">ROE</p>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all">
//                         <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg w-fit mb-2">
//                             <Percent className="w-5 h-5 text-green-600" />
//                         </div>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">Dividend Yield</p>
//                         <p className="text-3xl font-bold text-gray-900 dark:text-white">{stock["Dividend Yield"]}%</p>
//                         <div className="flex items-center gap-3 mt-2">
//                             <span className="text-xs text-gray-500">Face Value:</span>
//                             <span className="text-sm font-semibold text-gray-900 dark:text-white">₹{stock["Face Value"]}</span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Charts Section */}
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//                     {/* Sales Growth Chart */}
//                     <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
//                         <div className="flex items-center justify-between mb-4">
//                             <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
//                                 <BarChart3 className="w-5 h-5 text-indigo-500" />
//                                 Sales Growth (%)
//                             </h3>
//                             <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
//                                 Compounded
//                             </span>
//                         </div>
//                         <ResponsiveContainer width="100%" height={300}>
//                             <BarChart data={salesGrowthData}>
//                                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
//                                 <XAxis dataKey="year" stroke="#6B7280" />
//                                 <YAxis stroke="#6B7280" />
//                                 <Tooltip
//                                     contentStyle={{
//                                         backgroundColor: '#1F2937',
//                                         border: 'none',
//                                         borderRadius: '0.5rem',
//                                         color: '#fff'
//                                     }}
//                                 />
//                                 <Bar dataKey="growth" fill="#6366F1" radius={[4, 4, 0, 0]} />
//                             </BarChart>
//                         </ResponsiveContainer>
//                     </div>

//                     {/* Profit Growth Chart */}
//                     <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
//                         <div className="flex items-center justify-between mb-4">
//                             <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
//                                 <TrendingUp className="w-5 h-5 text-purple-500" />
//                                 Profit Growth (%)
//                             </h3>
//                             <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
//                                 Compounded
//                             </span>
//                         </div>
//                         <ResponsiveContainer width="100%" height={300}>
//                             <BarChart data={profitGrowthData}>
//                                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
//                                 <XAxis dataKey="year" stroke="#6B7280" />
//                                 <YAxis stroke="#6B7280" />
//                                 <Tooltip
//                                     contentStyle={{
//                                         backgroundColor: '#1F2937',
//                                         border: 'none',
//                                         borderRadius: '0.5rem',
//                                         color: '#fff'
//                                     }}
//                                 />
//                                 <Bar dataKey="growth" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
//                             </BarChart>
//                         </ResponsiveContainer>
//                     </div>

//                     {/* Stock Price CAGR Chart */}
//                     <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
//                         <div className="flex items-center justify-between mb-4">
//                             <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
//                                 <LineChartIcon className="w-5 h-5 text-green-500" />
//                                 Stock Price CAGR (%)
//                             </h3>
//                             <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
//                                 Annualized
//                             </span>
//                         </div>
//                         <ResponsiveContainer width="100%" height={300}>
//                             <AreaChart data={cagrData}>
//                                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
//                                 <XAxis dataKey="period" stroke="#6B7280" />
//                                 <YAxis stroke="#6B7280" />
//                                 <Tooltip
//                                     contentStyle={{
//                                         backgroundColor: '#1F2937',
//                                         border: 'none',
//                                         borderRadius: '0.5rem',
//                                         color: '#fff'
//                                     }}
//                                 />
//                                 <Area type="monotone" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
//                             </AreaChart>
//                         </ResponsiveContainer>
//                     </div>

//                     {/* ROE Chart */}
//                     <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
//                         <div className="flex items-center justify-between mb-4">
//                             <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
//                                 <Target className="w-5 h-5 text-orange-500" />
//                                 Return on Equity (%)
//                             </h3>
//                             <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
//                                 ROE
//                             </span>
//                         </div>
//                         <ResponsiveContainer width="100%" height={300}>
//                             <LineChart data={roeData}>
//                                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
//                                 <XAxis dataKey="period" stroke="#6B7280" />
//                                 <YAxis stroke="#6B7280" />
//                                 <Tooltip
//                                     contentStyle={{
//                                         backgroundColor: '#1F2937',
//                                         border: 'none',
//                                         borderRadius: '0.5rem',
//                                         color: '#fff'
//                                     }}
//                                 />
//                                 <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B' }} />
//                             </LineChart>
//                         </ResponsiveContainer>
//                     </div>
//                 </div>

//                 {/* Shareholding Pattern & Key Statistics */}
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//                     {/* Shareholding Pattern */}
//                     <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
//                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
//                             <PieChart className="w-5 h-5 text-indigo-500" />
//                             Shareholding Pattern
//                         </h3>
//                         <div className="flex flex-col md:flex-row items-center gap-6">
//                             <ResponsiveContainer width="100%" height={250}>
//                                 <RechartsPieChart>
//                                     <Pie
//                                         data={shareholderData.filter(item => item.value > 0)}
//                                         cx="50%"
//                                         cy="50%"
//                                         innerRadius={60}
//                                         outerRadius={80}
//                                         paddingAngle={2}
//                                         dataKey="value"
//                                         label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(1)}%` : ''}
//                                         labelLine={false}
//                                     >
//                                         {shareholderData.map((entry, index) => (
//                                             <Cell key={`cell-${index}`} fill={entry.color} />
//                                         ))}
//                                     </Pie>
//                                     <Tooltip />
//                                 </RechartsPieChart>
//                             </ResponsiveContainer>
//                             <div className="space-y-2 w-full md:w-48">
//                                 {shareholderData.filter(item => item.value > 0).map((item, index) => (
//                                     <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
//                                         <div className="flex items-center gap-2">
//                                             <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
//                                             <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
//                                         </div>
//                                         <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}%</span>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Key Statistics */}
//                     <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
//                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
//                             <Info className="w-5 h-5 text-indigo-500" />
//                             Key Statistics
//                         </h3>
//                         <div className="grid grid-cols-2 gap-4">
//                             <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
//                                 <p className="text-xs text-gray-500 dark:text-gray-400">52 Week High</p>
//                                 <p className="text-lg font-bold text-gray-900 dark:text-white">₹{stock.High}</p>
//                                 <p className="text-xs text-red-600 mt-1">{Math.abs(parseFloat(changeFromHigh))}% below</p>
//                             </div>
//                             <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
//                                 <p className="text-xs text-gray-500 dark:text-gray-400">52 Week Low</p>
//                                 <p className="text-lg font-bold text-gray-900 dark:text-white">₹{stock.Low}</p>
//                                 <p className="text-xs text-green-600 mt-1">{Math.abs(parseFloat(changeFromLow))}% above</p>
//                             </div>
//                             <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
//                                 <p className="text-xs text-gray-500 dark:text-gray-400">Face Value</p>
//                                 <p className="text-lg font-bold text-gray-900 dark:text-white">₹{stock["Face Value"]}</p>
//                             </div>
//                             <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
//                                 <p className="text-xs text-gray-500 dark:text-gray-400">Book Value</p>
//                                 <p className="text-lg font-bold text-gray-900 dark:text-white">₹{stock["Book Value"]}</p>
//                             </div>
//                             <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
//                                 <p className="text-xs text-gray-500 dark:text-gray-400">Shareholders</p>
//                                 <p className="text-lg font-bold text-gray-900 dark:text-white">{stock["No. of Shareholders"]}</p>
//                             </div>
//                             <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
//                                 <p className="text-xs text-gray-500 dark:text-gray-400">Dividend Yield</p>
//                                 <p className="text-lg font-bold text-gray-900 dark:text-white">{stock["Dividend Yield"]}%</p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Announcements Section */}
//                 <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg mb-8">
//                     <div className="flex items-center justify-between mb-4">
//                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
//                             <Calendar className="w-5 h-5 text-indigo-500" />
//                             Recent Announcements & Updates
//                         </h3>
//                         <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
//                             Last 7 Days
//                         </span>
//                     </div>
//                     <div className="space-y-3">
//                         {[
//                             stock.Announcement1,
//                             stock.Announcement2,
//                             stock.Announcement3,
//                             stock.Announcement4,
//                             stock.Announcement5
//                         ].filter(Boolean).map((announcement, index) => {
//                             const dateMatch = announcement?.match(/^(\d+d|\d+\s\w+)/);
//                             const dateLabel = dateMatch ? dateMatch[0] : 'Today';

//                             return (
//                                 <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
//                                     <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
//                                         <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
//                                     </div>
//                                     <div className="flex-1">
//                                         <div className="flex items-center gap-2 mb-1">
//                                             <span className="text-xs font-medium px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
//                                                 {dateLabel}
//                                             </span>
//                                         </div>
//                                         <p className="text-sm text-gray-700 dark:text-gray-300">{announcement}</p>
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </div>

//                 {/* Growth Metrics Table */}
//                 <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
//                     <div className="flex items-center justify-between mb-4">
//                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
//                             <BarChart3 className="w-5 h-5 text-indigo-500" />
//                             Historical Growth Metrics (%)
//                         </h3>
//                         <div className="flex gap-2">
//                             <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
//                                 Compounded Annual Growth
//                             </span>
//                         </div>
//                     </div>
//                     <div className="overflow-x-auto">
//                         <table className="w-full">
//                             <thead>
//                                 <tr className="border-b-2 border-gray-200 dark:border-gray-700">
//                                     <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Metric</th>
//                                     <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">10 Years</th>
//                                     <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">5 Years</th>
//                                     <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">3 Years</th>
//                                     <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">TTM / 1Y</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                                 <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
//                                     <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">Revenue Growth</td>
//                                     <td className="py-4 px-4 text-sm text-right text-gray-900 dark:text-white">{stock["Compounded Sales Growth - 10 Years"]}</td>
//                                     <td className="py-4 px-4 text-sm text-right text-gray-900 dark:text-white">{stock["Compounded Sales Growth - 5 Years"]}</td>
//                                     <td className="py-4 px-4 text-sm text-right text-gray-900 dark:text-white">{stock["Compounded Sales Growth - 3 Years"]}</td>
//                                     <td className="py-4 px-4 text-sm text-right text-gray-900 dark:text-white">{stock["Compounded Sales Growth - TTM"]}</td>
//                                 </tr>
//                                 <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
//                                     <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">Profit Growth</td>
//                                     <td className="py-4 px-4 text-sm text-right text-gray-900 dark:text-white">{stock["Compounded Profit Growth - 10 Years"]}</td>
//                                     <td className="py-4 px-4 text-sm text-right text-gray-900 dark:text-white">{stock["Compounded Profit Growth - 5 Years"]}</td>
//                                     <td className="py-4 px-4 text-sm text-right text-gray-900 dark:text-white">{stock["Compounded Profit Growth - 3 Years"]}</td>
//                                     <td className="py-4 px-4 text-sm text-right text-gray-900 dark:text-white">{stock["Compounded Profit Growth - TTM"]}</td>
//                                 </tr>
//                                 <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
//                                     <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">Stock Price CAGR</td>
//                                     <td className="py-4 px-4 text-sm text-right text-gray-900 dark:text-white">{stock["Stock Price CAGR - 10 Years"]}</td>
//                                     <td className="py-4 px-4 text-sm text-right text-gray-900 dark:text-white">{stock["Stock Price CAGR - 5 Years"]}</td>
//                                     <td className="py-4 px-4 text-sm text-right text-gray-900 dark:text-white">{stock["Stock Price CAGR - 3 Years"]}</td>
//                                     <td className="py-4 px-4 text-sm text-right text-gray-900 dark:text-white">{stock["Stock Price CAGR - 1 Year"]}</td>
//                                 </tr>
//                                 <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
//                                     <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">Return on Equity (ROE)</td>
//                                     <td className="py-4 px-4 text-sm text-right text-gray-900 dark:text-white">{stock["Return on Equity - 10 Years"]}</td>
//                                     <td className="py-4 px-4 text-sm text-right text-gray-900 dark:text-white">{stock["Return on Equity - 5 Years"]}</td>
//                                     <td className="py-4 px-4 text-sm text-right text-gray-900 dark:text-white">{stock["Return on Equity - 3 Years"]}</td>
//                                     <td className="py-4 px-4 text-sm text-right text-gray-900 dark:text-white">{stock["Return on Equity - Last Year"]}</td>
//                                 </tr>
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }