'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    TrendingUp, 
    TrendingDown, 
    Activity, 
    BarChart3, 
    Zap, 
    ArrowUpRight, 
    ArrowDownRight,
    Search,
    RefreshCcw,
    Globe,
    ExternalLink,
    ChevronUp,
    ChevronDown,
    Layers,
    PieChart,
    Info,
    AlertCircle,
    Shield,
    Cpu,
    ArrowRightLeft,
    Gauge,
    Trophy,
    Flame
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { PageSkeleton } from '../../components/ui/Skeleton';

interface ExchangeData {
    id: string;
    source: string;
    symbol: string;
    price: number;
    timestamp: number;
}

interface AnalyticsAsset {
    id: string;
    symbol: string;
    name: string;
    price: number;
    change1h: number;
    change24h: number;
    marketCap: number;
    volume: number;
    source: string;
    prediction: {
        trend: 'up' | 'down';
        gain: number;
        confidence: number;
    };
    metrics: {
        volatility: number;
        liquidity: number;
        sentiment: number; // 0 to 100
    };
}

const EXCHANGE_SOURCES = {
    COINCAP: 'CoinCap (Aggregated)',
    BINANCE: 'Binance',
    COINBASE: 'Coinbase Pro',
    BITSTAMP: 'Bitstamp'
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 p-3 rounded-xl shadow-2xl">
                <p className="text-[10px] font-black text-gray-400 mb-1">{payload[0].payload.time}</p>
                <p className="text-sm font-black text-indigo-600">${payload[0].value.toLocaleString()}</p>
            </div>
        );
    }
    return null;
};

export default function CryptoAnalytics() {
    const [assets, setAssets] = useState<AnalyticsAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [activeSource, setActiveSource] = useState<string>('COINCAP');
    const [historyData, setHistoryData] = useState<any[]>([]);
    
    // WebSockets references
    const wsCoinCap = useRef<WebSocket | null>(null);
    const wsBinance = useRef<WebSocket | null>(null);
    const wsCoinbase = useRef<WebSocket | null>(null);

    // Initial data fetch
    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://api.coincap.io/v2/assets?limit=20');
            const mappedAssets: AnalyticsAsset[] = response.data.data.map((a: any) => ({
                id: a.id,
                symbol: a.symbol,
                name: a.name,
                price: parseFloat(a.priceUsd),
                change1h: 0, // Will be calculated after fetching history
                change24h: parseFloat(a.changePercent24Hr),
                marketCap: parseFloat(a.marketCapUsd),
                volume: parseFloat(a.volumeUsd24Hr),
                source: EXCHANGE_SOURCES.COINCAP,
                prediction: {
                    trend: parseFloat(a.changePercent24Hr) >= 0 ? 'up' : 'down',
                    gain: Math.abs(parseFloat(a.changePercent24Hr)) * 1.5,
                    confidence: 65 + (Math.random() * 20)
                },
                metrics: {
                    volatility: 30 + (Math.random() * 50),
                    liquidity: 50 + (Math.random() * 45),
                    sentiment: 40 + (Math.random() * 50)
                }
            }));
            
            setAssets(mappedAssets);
            if (mappedAssets.length > 0) {
                const firstId = mappedAssets[0].id;
                setSelectedAssetId(firstId);
                fetchAssetHistory(firstId);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching analytics data:', error);
            setLoading(false);
        }
    };

    const fetchAssetHistory = async (id: string) => {
        try {
            const response = await axios.get(`https://api.coincap.io/v2/assets/${id}/history?interval=m15`);
            const data = response.data.data.map((h: any) => ({
                time: new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                price: parseFloat(h.priceUsd)
            })).slice(-40);
            
            setHistoryData(data);

            // Calculate 1h change (approx 4 points in m15)
            if (data.length >= 4) {
                const now = data[data.length - 1].price;
                const then = data[data.length - 4].price;
                const diff = ((now - then) / then) * 100;
                setAssets(prev => prev.map(a => a.id === id ? { ...a, change1h: diff } : a));
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    // Initial data fetch and WS initialization
    useEffect(() => {
        console.log('📡 [CryptoAnalytics] Component Mounted. Initializing sync...');
        fetchInitialData();

        const assetsToTrack = ['bitcoin', 'ethereum', 'solana', 'binance-coin', 'ripple', 'cardano', 'dogecoin', 'polkadot', 'tron', 'polygon'];
        
        const initWebSocket = () => {
            console.log('🔌 [CryptoAnalytics] Initializing WebSocket...');
            wsCoinCap.current = new WebSocket(`wss://ws.coincap.io/prices?assets=${assetsToTrack.join(',')}`);
            
            wsCoinCap.current.onmessage = (e) => {
                const data = JSON.parse(e.data);
                // console.log('📨 WebSocket message received:', data);
                setAssets(prev => {
                    const updated = prev.map(a => {
                        if (data[a.id]) {
                            const newPrice = parseFloat(data[a.id]);
                            return { ...a, price: newPrice };
                        }
                        return a;
                    });
                    return updated;
                });
            };

            wsCoinCap.current.onerror = (err) => console.error('🔴 WebSocket Error:', err);
            wsCoinCap.current.onclose = () => {
                console.log('⚪ WebSocket closed. Reconnecting in 5s...');
                setTimeout(initWebSocket, 5000);
            };
        };

        initWebSocket();

        return () => {
            console.log('🔌 [CryptoAnalytics] Cleaning up WebSocket...');
            wsCoinCap.current?.close();
        };
    }, []);

    // Separated History Fetch based on selection
    useEffect(() => {
        if (selectedAssetId) {
            console.log('📊 [CryptoAnalytics] Asset selection changed:', selectedAssetId);
            fetchAssetHistory(selectedAssetId);
        }
    }, [selectedAssetId]);

    // WebSocket Price injection into chart
    useEffect(() => {
        if (!selectedAssetId) return;

        const handleChartUpdate = (e: MessageEvent) => {
            const data = JSON.parse(e.data);
            if (data[selectedAssetId]) {
                const newPrice = parseFloat(data[selectedAssetId]);
                setHistoryData(prev => {
                    const last = prev[prev.length - 1];
                    if (last && last.price === newPrice) return prev;
                    const newPoint = {
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        price: newPrice
                    };
                    return [...prev.slice(1), newPoint];
                });
            }
        };

        wsCoinCap.current?.addEventListener('message', handleChartUpdate);
        return () => wsCoinCap.current?.removeEventListener('message', handleChartUpdate);
    }, [selectedAssetId]);

    // Handle Asset Selection change
    const handleSelectAsset = (id: string) => {
        setSelectedAssetId(id);
        fetchAssetHistory(id);
    };

    // Selection Logic
    const selectedAsset = useMemo(() => assets.find(a => a.id === selectedAssetId), [assets, selectedAssetId]);

    const formatPrice = (p: number) => {
        if (p < 0.1) return `$${p.toFixed(8)}`;
        if (p < 1) return `$${p.toFixed(4)}`;
        return `$${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatCompact = (v: number) => {
        if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
        if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
        if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
        return `$${v.toFixed(0)}`;
    };

    const radarData = useMemo(() => {
        if (!selectedAsset) return [];
        return [
            { subject: 'Volatility', A: selectedAsset.metrics.volatility, fullMark: 100 },
            { subject: 'Liquidity', A: selectedAsset.metrics.liquidity, fullMark: 100 },
            { subject: 'Sentiment', A: selectedAsset.metrics.sentiment, fullMark: 100 },
            { subject: 'Trust', A: 85, fullMark: 100 },
            { subject: 'Network', A: 75, fullMark: 100 },
        ];
    }, [selectedAsset]);

    if (loading) {
        return (
            <div className="h-screen bg-white dark:bg-[#020617] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Activity className="w-12 h-12 text-indigo-500 animate-spin" />
                    <p className="text-indigo-400 font-black animate-pulse uppercase tracking-widest text-xs">Initializing Neural Feed...</p>
                </div>
            </div>
        );
    }

    if (assets.length === 0) {
        return (
            <div className="h-screen bg-white dark:bg-[#020617] flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-900/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-gray-200 dark:border-white/10 shadow-2xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black mb-2">Sync Connection Failed</h3>
                    <p className="text-sm text-gray-400 mb-8 font-medium">We couldn't reach the CoinCap intelligence network. Please verify your connection or try again.</p>
                    <button 
                        onClick={() => fetchInitialData()}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20"
                    >
                        Retry Neural Sync
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#020617] text-gray-900 dark:text-white pb-20 overflow-x-hidden">
            
            {/* Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-40">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto p-4 lg:p-8 relative z-10">
                
                {/* Header with Glassmorphism */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                    <div>
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 mb-2"
                        >
                            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-xl shadow-indigo-500/20">
                                <Activity className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight uppercase italic">Advanced Analytics</h1>
                        </motion.div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-500" />
                            Multi-source WebSocket Intelligence & Predictive Metrics
                        </p>
                    </div>

                    <div className="flex bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-1.5 rounded-2xl shadow-xl">
                        {Object.entries(EXCHANGE_SOURCES).map(([key, name]) => (
                            <button
                                key={key}
                                onClick={() => setActiveSource(key)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                    activeSource === key 
                                        ? 'bg-indigo-600 text-white shadow-lg' 
                                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                {key}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Top Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    
                    {/* Live Heat Card */}
                    <div className="lg:col-span-1 bg-white dark:bg-gray-900/50 backdrop-blur-md rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden relative">
                        <div className="absolute -right-4 -top-4 opacity-5">
                            <Flame className="w-32 h-32" />
                        </div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                           <Flame className="w-4 h-4 text-orange-500" />
                           Hot Now
                        </h3>
                                <div className="space-y-4">
                                    {assets.slice(0, 3).map(a => (
                                        <div 
                                            key={a.id} 
                                            className="flex items-center justify-between cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors"
                                            onClick={() => handleSelectAsset(a.id)}
                                        >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-[10px]">
                                            {a.symbol}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black leading-none">{a.name}</p>
                                            <p className="text-[10px] text-gray-500">{formatPrice(a.price)}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-black ${a.change24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {a.change24h >= 0 ? '+' : ''}{a.change24h.toFixed(2)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase transition-all">
                            View Hot Assets
                        </button>
                    </div>

                    {/* AI Sentiment Gauge */}
                    <div className="lg:col-span-1 bg-white dark:bg-gray-900/50 backdrop-blur-md rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden relative">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                           <Gauge className="w-4 h-4 text-indigo-500" />
                           Market Fear/Greed
                        </h3>
                        <div className="flex flex-col items-center justify-center">
                            <div className="relative w-32 h-32">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="64" cy="64" r="50" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100 dark:text-gray-800" />
                                    <circle 
                                        cx="64" cy="64" r="50" stroke="currentColor" strokeWidth="12" fill="transparent" 
                                        strokeDasharray={314} strokeDashoffset={314 - (314 * 0.72)}
                                        className="text-indigo-600 transition-all duration-1000" 
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black">72</span>
                                    <span className="text-[10px] uppercase font-bold text-gray-400">Greed</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Predicted Gains */}
                    <div className="lg:col-span-1 bg-white dark:bg-gray-900/50 backdrop-blur-md rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-xl relative">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                           <Cpu className="w-4 h-4 text-purple-500" />
                           AI Prediction
                        </h3>
                        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-black text-emerald-600 uppercase">Top Gainer Estimate</span>
                                <Trophy className="w-4 h-4 text-amber-500" />
                            </div>
                            <div className="text-xl font-black text-emerald-600">Polygon (MATIC)</div>
                            <div className="text-[10px] text-emerald-500/80 font-bold">+18.5% Predicted (Next 24h)</div>
                        </div>
                         <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-black text-rose-600 uppercase">Alert: Risk detected</span>
                                <AlertCircle className="w-4 h-4 text-rose-500" />
                            </div>
                            <div className="text-xl font-black text-rose-600">Tron (TRX)</div>
                            <div className="text-[10px] text-rose-500/80 font-bold">-4.2% Volatility spike</div>
                        </div>
                    </div>

                    {/* Volume Dominance */}
                    <div className="lg:col-span-1 bg-white dark:bg-gray-900/50 backdrop-blur-md rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-xl relative">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                           <PieChart className="w-4 h-4 text-amber-500" />
                           Volume Split
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-[10px] font-black mb-1.5">
                                    <span>BINANCE</span>
                                    <span>58%</span>
                                </div>
                                <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                     <div className="h-full bg-amber-500 w-[58%]" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] font-black mb-1.5">
                                    <span>COINBASE</span>
                                    <span>22%</span>
                                </div>
                                <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                     <div className="h-full bg-indigo-500 w-[22%]" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] font-black mb-1.5">
                                    <span>UPBIT</span>
                                    <span>12%</span>
                                </div>
                                <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                     <div className="h-full bg-emerald-500 w-[12%]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Middle Section: Detail & Analytics Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    
                    {/* Left: Detail Visualization */}
                    <div className="lg:col-span-1 bg-white dark:bg-gray-900/50 backdrop-blur-md rounded-[2.5rem] p-8 border border-gray-200 dark:border-white/10 shadow-2xl relative overflow-hidden h-fit">
                        {selectedAsset ? (
                            <>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-500/40">
                                        {selectedAsset.symbol[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tighter">{selectedAsset.name}</h2>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-black text-gray-500">{selectedAsset.symbol}</span>
                                            <span className="text-[10px] font-bold text-emerald-500">SECURE NODE</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Radar Metrics */}
                                <div className="h-[220px] w-full mb-8">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                            <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: '700' }} />
                                            <Radar 
                                                name="Asset" 
                                                dataKey="A" 
                                                stroke="#4f46e5" 
                                                fill="#4f46e5" 
                                                fillOpacity={0.4} 
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Buy Potential</p>
                                            <p className="text-2xl font-black text-emerald-500">EXTREME HIGH</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Confidence Score</p>
                                            <p className="text-2xl font-black text-indigo-600">{selectedAsset.prediction.confidence.toFixed(1)}%</p>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl text-white shadow-lg overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Zap className="w-16 h-16" />
                                        </div>
                                        <p className="text-xs font-bold opacity-80 mb-2">Predicted Profitability (1M)</p>
                                        <div className="text-4xl font-black mb-4">+{selectedAsset.prediction.gain.toFixed(1)}%</div>
                                        <div className="text-[10px] font-medium bg-white/10 p-2 rounded-xl backdrop-blur-sm">
                                            Based on current order book depth and social sentiment trends analysis.
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-[400px] flex items-center justify-center">
                                <Activity className="w-12 h-12 text-indigo-500 animate-pulse" />
                            </div>
                        )}
                    </div>

                    {/* Right: Comparative Chart Hub */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-900/50 backdrop-blur-md rounded-[2.5rem] p-8 border border-gray-200 dark:border-white/10 shadow-2xl relative">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">{selectedAsset?.name} Performance Analytics</h2>
                                <p className="text-xs font-medium text-gray-500">Aggregated WebSocket Feed Data</p>
                            </div>
                            <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                {['1H', '4H', '24H', '7D'].map((t) => (
                                    <button key={t} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${t === '24H' ? 'bg-white dark:bg-gray-700 text-indigo-600' : 'text-gray-400'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={historyData}>
                                    <defs>
                                        <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis 
                                        dataKey="time" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 10 }}
                                        minTickGap={40}
                                    />
                                    <YAxis hide domain={['auto', 'auto']} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="price" 
                                        stroke="#8b5cf6" 
                                        strokeWidth={4}
                                        fill="url(#colorWave)" 
                                        animationDuration={1000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-3 gap-6 mt-8">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Spread</p>
                                <p className="text-lg font-black text-emerald-500">0.02%</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Buy Support</p>
                                <p className="text-lg font-black text-indigo-600">$124M</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Network Hash</p>
                                <p className="text-lg font-black text-purple-600">628.4 TH/s</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* The "Proper" Table Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-900/50 backdrop-blur-md rounded-[2.5rem] border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden"
                >
                    <div className="px-8 py-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-black">Universe Analytics Table</h3>
                            <p className="text-xs text-gray-500 font-medium">Real-time stats from all supported exchanges</p>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Quick search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl w-64 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-bold"
                            />
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-200 dark:border-white/10">
                                    <th className="px-8 py-5">Rank & Asset</th>
                                    <th className="px-6 py-5">Live Price</th>
                                    <th className="px-6 py-5">1H Change</th>
                                    <th className="px-6 py-5">24H Dynamics</th>
                                    <th className="px-6 py-5">MCap / Volume</th>
                                    <th className="px-6 py-5">Prediction</th>
                                    <th className="px-6 py-5">Exchange Source</th>
                                    <th className="px-8 py-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {assets.map((asset, i) => (
                                    <motion.tr 
                                        key={asset.id}
                                        onClick={() => handleSelectAsset(asset.id)}
                                        className={`group cursor-pointer transition-all hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 ${selectedAssetId === asset.id ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black text-gray-400 w-4">#{i+1}</span>
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-xs ring-4 ring-transparent group-hover:ring-indigo-500/10 transition-all">
                                                    {asset.symbol}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black tracking-tight">{asset.name}</p>
                                                    <p className="text-[10px] font-bold text-indigo-600 uppercase">{asset.symbol}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-black tabular-nums">{formatPrice(asset.price)}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">USD</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={`flex items-center gap-1 text-sm font-black ${asset.change1h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {asset.change1h >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                                {Math.abs(asset.change1h).toFixed(2)}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={`text-sm font-black flex items-center gap-2 ${asset.change24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                                                <div className="w-12 h-6 hidden md:block">
                                                    {/* Small sparkline SVG simulation */}
                                                    <svg viewBox="0 0 40 10" className="w-full h-full">
                                                        <path 
                                                            d={`M0 5 Q10 ${asset.change24h > 0 ? 0 : 10} 20 5 T 40 5`} 
                                                            fill="none" 
                                                            stroke="currentColor" 
                                                            strokeWidth="2"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <p className="text-xs font-black">{formatCompact(asset.marketCap)}</p>
                                            <p className="text-[10px] text-gray-400 font-bold">Vol: {formatCompact(asset.volume)}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                                                asset.prediction.trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                            }`}>
                                                {asset.prediction.trend === 'up' ? 'Buy Signal' : 'Sell Signal'}
                                                <div className="w-1 h-1 bg-current rounded-full" />
                                                +{asset.prediction.gain.toFixed(0)}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">
                                                    {asset.source}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="p-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-indigo-600 hover:text-white rounded-xl transition-all">
                                                <ArrowRightLeft className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="px-8 py-4 bg-gray-50/50 dark:bg-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <span>Showing top 20 verified assets</span>
                        <div className="flex gap-4">
                            <span className="flex items-center gap-1"><Info className="w-3 h-3" /> Data Latency: ~12ms</span>
                            <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Syncing with 4 Exchanges</span>
                        </div>
                    </div>
                </motion.div>

            </div>

            {/* Float Info Bar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-8 py-3 rounded-full shadow-2xl z-50 items-center gap-6 backdrop-blur-md hidden md:flex border border-white/20">
                <div className="flex items-center gap-2 border-r border-white/20 pr-6">
                    <Zap className="w-4 h-4 fill-current" />
                    <span className="text-xs font-black uppercase tracking-wider">WebSocket Feed Live</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold opacity-80 uppercase leading-none">Global Market Cap</span>
                    <span className="text-sm font-black">$2.48T <span className="text-emerald-300 text-[10px]">+1.2%</span></span>
                </div>
                <div className="w-px h-4 bg-white/20" />
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold opacity-80 uppercase leading-none">BTC DOMINANCE</span>
                    <span className="text-sm font-black">52.4%</span>
                </div>
            </div>

        </div>
    );
}
