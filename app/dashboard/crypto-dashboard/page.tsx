'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
    TrendingUp, 
    TrendingDown, 
    Activity, 
    DollarSign, 
    BarChart3, 
    Zap, 
    ArrowUpRight, 
    ArrowDownRight,
    Search,
    RefreshCcw,
    Wallet,
    Globe,
    ExternalLink,
    ChevronUp,
    ChevronDown,
    LayoutGrid,
    List,
    Clock
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface CryptoAsset {
    id: string;
    rank: string;
    symbol: string;
    name: string;
    supply: string;
    maxSupply: string | null;
    marketCapUsd: string;
    volumeUsd24Hr: string;
    priceUsd: string;
    changePercent24Hr: string;
    vwap24Hr: string;
    history?: any[];
}

const ASSETS_TO_FOLLOW = [
    'bitcoin', 'ethereum', 'tether', 'binance-coin', 'solana', 
    'ripple', 'cardano', 'dogecoin', 'polkadot', 'tron'
];

export default function CryptoDashboard() {
    const [assets, setAssets] = useState<CryptoAsset[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const ws = useRef<WebSocket | null>(null);

    // Initial Fetch
    const fetchAssets = async () => {
        try {
            const response = await axios.get('https://api.coincap.io/v2/assets');
            const data = response.data.data.filter((a: any) => ASSETS_TO_FOLLOW.includes(a.id));
            
            // Set initial assets
            setAssets(data);
            if (!selectedAsset && data.length > 0) {
                fetchHistory(data[0].id);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching assets:', error);
            setLoading(false);
        }
    };

    const fetchHistory = async (assetId: string) => {
        try {
            const response = await axios.get(`https://api.coincap.io/v2/assets/${assetId}/history?interval=m15`);
            const historyData = response.data.data.map((h: any) => ({
                time: new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                fullDate: new Date(h.time).toLocaleString(),
                price: parseFloat(h.priceUsd)
            })).slice(-50); // Last 50 points

            setAssets(prev => prev.map(a => 
                a.id === assetId ? { ...a, history: historyData } : a
            ));

            setAssets(currentAssets => {
                const asset = currentAssets.find(a => a.id === assetId);
                if (asset) {
                    setSelectedAsset({ ...asset, history: historyData });
                }
                return currentAssets;
            });

        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    // Initial load
    useEffect(() => {
        console.log('📡 [CryptoDashboard] Page Mounted. Fetching initial sweep...');
        fetchAssets();

        const assetString = ASSETS_TO_FOLLOW.join(',');
        const connectWS = () => {
            console.log('🔌 [CryptoDashboard] Establishing live price feed...');
            ws.current = new WebSocket(`wss://ws.coincap.io/prices?assets=${assetString}`);

            ws.current.onmessage = (event) => {
                const prices = JSON.parse(event.data);
                setAssets(prev => prev.map(asset => {
                    if (prices[asset.id]) {
                        const newPrice = prices[asset.id];
                        return { ...asset, priceUsd: newPrice };
                    }
                    return asset;
                }));
            };

            ws.current.onerror = (err) => console.error('🔴 CryptoDashboard WS Error:', err);
            ws.current.onclose = () => {
                console.log('⚪ Dashboard WS closed. Attempting reconnect...');
                setTimeout(connectWS, 5000);
            };
        };

        connectWS();

        return () => {
            console.log('🔌 [CryptoDashboard] Disconnecting feed.');
            if (ws.current) ws.current.close();
        };
    }, []);

    // Selection sync
    useEffect(() => {
        if (selectedAsset) {
            const updated = assets.find(a => a.id === selectedAsset.id);
            if (updated && updated.priceUsd !== selectedAsset.priceUsd) {
                setSelectedAsset(prev => prev ? { ...prev, priceUsd: updated.priceUsd } : null);
            }
        }
    }, [assets, selectedAsset?.id]);

    const formatPrice = (price: string | number) => {
        const p = typeof price === 'string' ? parseFloat(price) : price;
        if (p < 1) return `$${p.toFixed(6)}`;
        if (p < 10) return `$${p.toFixed(4)}`;
        return `$${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatCompact = (val: string) => {
        const v = parseFloat(val);
        if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
        if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
        if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
        return `$${v.toFixed(2)}`;
    };

    const filteredAssets = assets.filter(a => 
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{payload[0].payload.fullDate}</p>
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {formatPrice(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="h-screen bg-gray-50 dark:bg-[#030711] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse" />
                        <Activity className="w-12 h-12 text-indigo-500 animate-spin relative z-10" />
                    </div>
                    <p className="text-gray-500 dark:text-indigo-400 font-bold animate-pulse text-sm">Synchronizing Market Pulse...</p>
                </div>
            </div>
        );
    }

    if (assets.length === 0) {
        return (
            <div className="h-screen bg-gray-50 dark:bg-[#030711] flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-2xl max-w-sm w-full text-center">
                    <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Zap className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black mb-2">Connection Interrupted</h3>
                    <p className="text-sm text-gray-400 mb-8">The market feed is currently unreachable. This may be due to rate limiting or network restrictions.</p>
                    <button 
                        onClick={() => fetchAssets()}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
                    >
                        Try Reconnecting
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#030711] text-gray-900 dark:text-white p-4 lg:p-8 pb-20">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <motion.h1 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-black tracking-tight mb-2 flex items-center gap-3"
                        >
                            <div className="p-2 bg-indigo-600 rounded-xl text-white">
                                <Zap className="w-8 h-8 fill-current" />
                            </div>
                            Crypto Pulse
                        </motion.h1>
                        <p className="text-gray-500 dark:text-gray-400">Real-time market insights across major assets</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Search assets..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl w-64 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                            />
                        </div>
                        <button 
                            onClick={() => fetchAssets()}
                            className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
                        >
                            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Side: Performance Hub & Charts */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Main Chart Card */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-xl shadow-indigo-500/5 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <BarChart3 className="w-64 h-64" />
                        </div>

                        {selectedAsset ? (
                            <>
                                <div className="flex items-start justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-2xl font-bold text-indigo-600 overflow-hidden ring-4 ring-indigo-500/10">
                                            <img 
                                                src={`https://assets.coincap.io/assets/icons/${selectedAsset.symbol.toLowerCase()}@2x.png`} 
                                                alt={selectedAsset.name}
                                                onError={(e) => {
                                                    (e.target as any).src = `https://ui-avatars.com/api/?name=${selectedAsset.symbol}&background=random`;
                                                }}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-2xl font-bold">{selectedAsset.name}</h2>
                                                <span className="text-gray-400 font-medium px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">{selectedAsset.symbol}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest ${
                                                    parseFloat(selectedAsset.changePercent24Hr) >= 0 
                                                        ? 'bg-emerald-500/10 text-emerald-500' 
                                                        : 'bg-rose-500/10 text-rose-500'
                                                }`}>
                                                    Rank #{selectedAsset.rank}
                                                </div>
                                                <div className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                                                <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Real-time Price
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                                            {formatPrice(selectedAsset.priceUsd)}
                                        </div>
                                        <div className={`flex items-center justify-end gap-1 font-bold ${
                                            parseFloat(selectedAsset.changePercent24Hr) >= 0 ? 'text-emerald-500' : 'text-rose-500'
                                        }`}>
                                            {parseFloat(selectedAsset.changePercent24Hr) >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                            {Math.abs(parseFloat(selectedAsset.changePercent24Hr)).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>

                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={selectedAsset.history || []}>
                                            <defs>
                                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis 
                                                dataKey="time" 
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#6b7280', fontSize: 10 }}
                                                minTickGap={30}
                                            />
                                            <YAxis 
                                                hide 
                                                domain={['auto', 'auto']}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area 
                                                type="monotone" 
                                                dataKey="price" 
                                                stroke="#4f46e5" 
                                                strokeWidth={3}
                                                fillOpacity={1} 
                                                fill="url(#colorPrice)" 
                                                animationDuration={1500}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 group hover:border-indigo-500/50 transition-colors">
                                        <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Market Cap</span>
                                        <span className="font-bold text-lg">{formatCompact(selectedAsset.marketCapUsd)}</span>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 group hover:border-indigo-500/50 transition-colors">
                                        <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Volume (24h)</span>
                                        <span className="font-bold text-lg">{formatCompact(selectedAsset.volumeUsd24Hr)}</span>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 group hover:border-indigo-500/50 transition-colors">
                                        <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Supply</span>
                                        <span className="font-bold text-lg">{formatCompact(selectedAsset.supply).replace('$', '')} {selectedAsset.symbol}</span>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 group hover:border-indigo-500/50 transition-colors">
                                        <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">VWAP (24h)</span>
                                        <span className="font-bold text-lg">{formatPrice(selectedAsset.vwap24Hr)}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-[500px] flex items-center justify-center">
                                <Activity className="w-12 h-12 text-indigo-500 animate-pulse" />
                            </div>
                        )}
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="p-6 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl text-white shadow-xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                <Wallet className="w-32 h-32 rotate-12" />
                            </div>
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner">
                                    <Wallet className="w-6 h-6" />
                                </div>
                                <div className="flex gap-1">
                                    {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-white/50 rounded-full" />)}
                                </div>
                            </div>
                            <h3 className="text-indigo-100 text-sm font-medium mb-1 relative z-10">Total Portfolio Value</h3>
                            <div className="text-3xl font-black mb-4 relative z-10">$124,592.84</div>
                            <div className="flex items-center gap-2 text-indigo-100 text-sm p-2 bg-white/10 rounded-xl relative z-10 backdrop-blur-sm border border-white/10">
                                <TrendingUp className="w-4 h-4 text-emerald-300" />
                                <span>+12.4% vs last month</span>
                            </div>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-amber-500/10 rounded-2xl">
                                    <Globe className="w-6 h-6 text-amber-500" />
                                </div>
                                <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">MARKET DOMINANCE</span>
                            </div>
                            <div className="space-y-5">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-bold">Bitcoin (BTC)</span>
                                        <span className="font-black text-indigo-600 dark:text-indigo-400">52.4%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: '52.4%' }}
                                            transition={{ duration: 1 }}
                                            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-bold">Ethereum (ETH)</span>
                                        <span className="font-black text-indigo-600 dark:text-indigo-400">17.8%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: '17.8%' }}
                                            transition={{ duration: 1, delay: 0.2 }}
                                            className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Right Side: Asset List */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black flex items-center gap-2">
                            Market Cap Leaders
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full uppercase">Top 10</span>
                        </h3>
                        <div className="flex bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-200 dark:border-gray-800">
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-400'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-400'}`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4' : 'space-y-3'} max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar pr-2`}>
                        <AnimatePresence mode='popLayout'>
                            {filteredAssets.map((asset, index) => (
                                <motion.div
                                    layout
                                    key={asset.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => fetchHistory(asset.id)}
                                    className={`group cursor-pointer p-4 transition-all border rounded-2xl relative overflow-hidden ${
                                        selectedAsset?.id === asset.id 
                                            ? 'bg-indigo-600 dark:bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-600/30' 
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-sm'
                                    }`}
                                >
                                    {selectedAsset?.id === asset.id && (
                                        <motion.div 
                                            layoutId="active-bg"
                                            className="absolute inset-0 bg-indigo-600"
                                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shadow-sm ${
                                                selectedAsset?.id === asset.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'
                                            }`}>
                                                <img 
                                                    src={`https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`} 
                                                    alt={asset.symbol}
                                                    className="w-7 h-7 object-contain"
                                                    onError={(e) => {
                                                        (e.target as any).src = `https://ui-avatars.com/api/?name=${asset.symbol}&background=random`;
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-sm leading-none mb-1.5 tracking-tight">{asset.name}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                                        selectedAsset?.id === asset.id ? 'bg-white/10 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                                    }`}>
                                                        {asset.symbol}
                                                    </span>
                                                    <span className={`text-[10px] font-black ${selectedAsset?.id === asset.id ? 'text-indigo-100' : 'text-gray-400'}`}>
                                                        #{asset.rank}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-black text-sm tracking-tight tabular-nums ${selectedAsset?.id === asset.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                                {formatPrice(asset.priceUsd)}
                                            </div>
                                            <div className={`text-[11px] font-black flex items-center justify-end gap-0.5 mt-0.5 ${
                                                parseFloat(asset.changePercent24Hr) >= 0 
                                                    ? (selectedAsset?.id === asset.id ? 'text-emerald-200' : 'text-emerald-500') 
                                                    : (selectedAsset?.id === asset.id ? 'text-rose-200' : 'text-rose-500')
                                            }`}>
                                                {parseFloat(asset.changePercent24Hr) >= 0 ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                {Math.abs(parseFloat(asset.changePercent24Hr)).toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {viewMode === 'list' && (
                                        <div className={`mt-4 pt-4 border-t relative z-10 flex items-center justify-between ${
                                            selectedAsset?.id === asset.id ? 'border-white/10' : 'border-gray-50 dark:border-gray-800'
                                        }`}>
                                            <div className="flex gap-4 text-[10px] font-black opacity-60">
                                                <span>MCAP: {formatCompact(asset.marketCapUsd)}</span>
                                                <span>VOL: {formatCompact(asset.volumeUsd24Hr)}</span>
                                            </div>
                                            <ArrowUpRight className={`w-3 h-3 ${selectedAsset?.id === asset.id ? 'opacity-40' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center group hover:bg-indigo-50/10 dark:hover:bg-indigo-900/5 transition-colors">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4 ring-8 ring-indigo-50 dark:ring-indigo-900/10 group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-6 h-6 text-indigo-500" />
                        </div>
                        <h4 className="font-black mb-1">Add to Watchlist</h4>
                        <p className="text-xs text-gray-500 mb-4 px-4">Track your favorite coins and get alerts when price drops</p>
                        <button className="w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-xs font-black transition-all shadow-sm">
                            Browse All Assets
                        </button>
                    </div>
                </div>
            </div>

            {/* Price Ticker Footer (Movable Bar Style) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-black/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 z-50 h-14 overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                <div className="flex items-center h-full whitespace-nowrap animate-marquee">
                    {[...assets, ...assets].map((asset, i) => (
                        <div key={`${asset.id}-${i}`} className="flex items-center gap-4 px-10 border-r border-gray-100 dark:border-gray-800 h-full">
                            <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <img 
                                    src={`https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`} 
                                    alt="" 
                                    className="w-4 h-4 object-contain"
                                    onError={(e) => (e.target as any).style.display = 'none'}
                                />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">{asset.symbol}</span>
                            <span className="text-sm font-black tabular-nums tracking-tight">{formatPrice(asset.priceUsd)}</span>
                            <div className={`flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-full ${
                                parseFloat(asset.changePercent24Hr) >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                                {parseFloat(asset.changePercent24Hr) >= 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                {Math.abs(parseFloat(asset.changePercent24Hr)).toFixed(2)}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 60s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(79, 70, 229, 0.1);
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}
