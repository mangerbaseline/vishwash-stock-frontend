'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, ComposedChart,
    Brush, ReferenceLine
} from 'recharts';
import {
    TrendingUp, TrendingDown, Minus, Clock, Calendar,
    Download, RefreshCw, Maximize2, Minimize2, Info,
    BarChart3, LineChart as LineChartIcon, Activity,
    MoveHorizontal, Eye, EyeOff, Settings, Zap
} from 'lucide-react';

interface StockChartProps {
    symbol: string;
    companyName: string;
    currentPrice: number;
    change: number;
    changePercent: number;
    historicalData?: HistoricalDataPoint[];
    intradayData?: IntradayDataPoint[];
    onTimeframeChange?: (timeframe: Timeframe) => void;
    onChartTypeChange?: (type: ChartType) => void;
}

export type Timeframe = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'MAX';
export type ChartType = 'line' | 'area' | 'candlestick' | 'bar';
export type IndicatorType = 'SMA' | 'EMA' | 'RSI' | 'MACD' | 'BOLL';

interface HistoricalDataPoint {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface IntradayDataPoint {
    time: string;
    price: number;
    volume: number;
}

export const StockChart: React.FC<StockChartProps> = ({
    symbol,
    companyName,
    currentPrice,
    change,
    changePercent,
    historicalData: initialHistoricalData,
    intradayData: initialIntradayData,
    onTimeframeChange,
    onChartTypeChange
}) => {
    const [timeframe, setTimeframe] = useState<Timeframe>('1D');
    const [chartType, setChartType] = useState<ChartType>('area');
    const [indicators, setIndicators] = useState<IndicatorType[]>([]);
    const [showVolume, setShowVolume] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [comparisonStocks, setComparisonStocks] = useState<string[]>([]);
    const [showComparison, setShowComparison] = useState(false);
    const [comparisonData, setComparisonData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [chartData, setChartData] = useState<any[]>([]);
    const chartRef = useRef<HTMLDivElement>(null);

    // Generate mock data for demonstration
    useEffect(() => {
        generateChartData();
    }, [timeframe, symbol]);

    const generateChartData = () => {
        setIsLoading(true);

        const data: React.SetStateAction<any[]> = [];
        const now = new Date();
        let points = 0;
        let interval = 0;

        switch (timeframe) {
            case '1D':
                points = 24 * 60 / 5; // 5-minute intervals
                interval = 5 * 60 * 1000;
                break;
            case '1W':
                points = 7 * 24;
                interval = 60 * 60 * 1000;
                break;
            case '1M':
                points = 30;
                interval = 24 * 60 * 60 * 1000;
                break;
            case '3M':
                points = 90;
                interval = 24 * 60 * 60 * 1000;
                break;
            case '6M':
                points = 180;
                interval = 24 * 60 * 60 * 1000;
                break;
            case '1Y':
                points = 365;
                interval = 24 * 60 * 60 * 1000;
                break;
            case '5Y':
                points = 365 * 5;
                interval = 24 * 60 * 60 * 1000;
                break;
            default:
                points = 100;
                interval = 24 * 60 * 60 * 1000;
        }

        let basePrice = currentPrice;
        for (let i = points; i >= 0; i--) {
            const date = new Date(now.getTime() - i * interval);
            const volatility = 0.02; // 2% volatility
            const randomWalk = (Math.random() - 0.5) * 2 * volatility * basePrice;
            const price = basePrice + randomWalk;

            // Ensure price doesn't go negative
            const finalPrice = Math.max(price, basePrice * 0.5);

            // Generate OHLC data
            const dayHigh = finalPrice * (1 + Math.random() * 0.01);
            const dayLow = finalPrice * (1 - Math.random() * 0.01);

            data.push({
                date: date.toLocaleDateString(),
                time: date.toLocaleTimeString(),
                timestamp: date.getTime(),
                price: finalPrice,
                open: finalPrice * (1 - Math.random() * 0.005),
                high: Math.max(dayHigh, finalPrice * 1.01),
                low: Math.min(dayLow, finalPrice * 0.99),
                close: finalPrice,
                volume: Math.floor(Math.random() * 10000000) + 1000000,
                sma20: calculateSMA(data, 20, finalPrice),
                sma50: calculateSMA(data, 50, finalPrice),
                ema12: calculateEMA(data, 12, finalPrice),
                ema26: calculateEMA(data, 26, finalPrice)
            });

            basePrice = finalPrice;
        }

        setChartData(data);
        setIsLoading(false);
    };

    const calculateSMA = (data: any[], period: number, currentPrice: number) => {
        if (data.length < period - 1) return currentPrice;
        const sum = data.slice(-period).reduce((acc, item) => acc + (item?.price || currentPrice), 0);
        return sum / period;
    };

    const calculateEMA = (data: any[], period: number, currentPrice: number) => {
        if (data.length < period - 1) return currentPrice;
        const multiplier = 2 / (period + 1);
        const previousEMA = data[data.length - 1]?.ema12 || currentPrice;
        return (currentPrice - previousEMA) * multiplier + previousEMA;
    };

    const timeframeOptions: Timeframe[] = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y', 'MAX'];
    const chartTypeOptions: { type: ChartType; icon: React.ElementType }[] = [
        { type: 'line', icon: LineChartIcon },
        { type: 'area', icon: Activity },
        { type: 'candlestick', icon: BarChart3 },
        { type: 'bar', icon: MoveHorizontal }
    ];

    const isPositive = change >= 0;

    const toggleIndicator = (indicator: IndicatorType) => {
        setIndicators(prev =>
            prev.includes(indicator)
                ? prev.filter(i => i !== indicator)
                : [...prev, indicator]
        );
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            chartRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const formatPrice = (value: number) => `₹${value.toFixed(2)}`;
    const formatVolume = (value: number) => {
        if (value >= 1e7) return `${(value / 1e7).toFixed(1)}Cr`;
        if (value >= 1e5) return `${(value / 1e5).toFixed(1)}L`;
        return value.toString();
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{label}</p>
                    <div className="space-y-2">
                        <p className="text-sm flex items-center justify-between gap-4">
                            <span className="text-gray-500">Price:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                ₹{data.price?.toFixed(2)}
                            </span>
                        </p>
                        <p className="text-sm flex items-center justify-between gap-4">
                            <span className="text-gray-500">Open:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                ₹{data.open?.toFixed(2)}
                            </span>
                        </p>
                        <p className="text-sm flex items-center justify-between gap-4">
                            <span className="text-gray-500">High:</span>
                            <span className="font-semibold text-green-600">
                                ₹{data.high?.toFixed(2)}
                            </span>
                        </p>
                        <p className="text-sm flex items-center justify-between gap-4">
                            <span className="text-gray-500">Low:</span>
                            <span className="font-semibold text-red-600">
                                ₹{data.low?.toFixed(2)}
                            </span>
                        </p>
                        <p className="text-sm flex items-center justify-between gap-4">
                            <span className="text-gray-500">Volume:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {formatVolume(data.volume)}
                            </span>
                        </p>
                        {indicators.includes('SMA') && (
                            <p className="text-sm flex items-center justify-between gap-4">
                                <span className="text-gray-500">SMA 20:</span>
                                <span className="font-semibold text-blue-600">
                                    ₹{data.sma20?.toFixed(2)}
                                </span>
                            </p>
                        )}
                        {indicators.includes('EMA') && (
                            <p className="text-sm flex items-center justify-between gap-4">
                                <span className="text-gray-500">EMA 12:</span>
                                <span className="font-semibold text-purple-600">
                                    ₹{data.ema12?.toFixed(2)}
                                </span>
                            </p>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderChart = () => {
        if (chartType === 'candlestick') {
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                        <XAxis
                            dataKey={timeframe === '1D' ? 'time' : 'date'}
                            className="text-xs text-gray-600 dark:text-gray-400"
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            tickFormatter={formatPrice}
                            className="text-xs text-gray-600 dark:text-gray-400"
                            yAxisId="price"
                        />
                        {showVolume && (
                            <YAxis
                                yAxisId="volume"
                                orientation="right"
                                tickFormatter={formatVolume}
                                className="text-xs text-gray-600 dark:text-gray-400"
                            />
                        )}
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />

                        {/* Candlestick representation using bars */}
                        <Bar yAxisId="price" dataKey="high" fill="transparent" stroke="transparent" />
                        <Bar yAxisId="price" dataKey="low" fill="transparent" stroke="transparent" />

                        {/* You'd need a proper candlestick chart component here */}
                        {/* This is a simplified representation */}

                        {showVolume && (
                            <Bar
                                yAxisId="volume"
                                dataKey="volume"
                                fill="#8884d8"
                                opacity={0.3}
                                name="Volume"
                            />
                        )}

                        {indicators.includes('SMA') && (
                            <Line
                                yAxisId="price"
                                type="monotone"
                                dataKey="sma20"
                                stroke="#3b82f6"
                                dot={false}
                                name="SMA 20"
                            />
                        )}

                        {indicators.includes('EMA') && (
                            <Line
                                yAxisId="price"
                                type="monotone"
                                dataKey="ema12"
                                stroke="#8b5cf6"
                                dot={false}
                                name="EMA 12"
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            );
        }

        if (chartType === 'bar') {
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                        <XAxis
                            dataKey={timeframe === '1D' ? 'time' : 'date'}
                            className="text-xs text-gray-600 dark:text-gray-400"
                        />
                        <YAxis
                            yAxisId="price"
                            tickFormatter={formatPrice}
                            className="text-xs text-gray-600 dark:text-gray-400"
                        />
                        {showVolume && (
                            <YAxis
                                yAxisId="volume"
                                orientation="right"
                                tickFormatter={formatVolume}
                                className="text-xs text-gray-600 dark:text-gray-400"
                            />
                        )}
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />

                        <Bar yAxisId="price" dataKey="price" fill="#3b82f6" name="Price" />

                        {showVolume && (
                            <Bar
                                yAxisId="volume"
                                dataKey="volume"
                                fill="#8884d8"
                                opacity={0.3}
                                name="Volume"
                            />
                        )}

                        {indicators.includes('SMA') && (
                            <Line
                                yAxisId="price"
                                type="monotone"
                                dataKey="sma20"
                                stroke="#3b82f6"
                                dot={false}
                                name="SMA 20"
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            );
        }

        if (chartType === 'line') {
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                        <XAxis
                            dataKey={timeframe === '1D' ? 'time' : 'date'}
                            className="text-xs text-gray-600 dark:text-gray-400"
                        />
                        <YAxis
                            yAxisId="price"
                            tickFormatter={formatPrice}
                            className="text-xs text-gray-600 dark:text-gray-400"
                        />
                        {showVolume && (
                            <YAxis
                                yAxisId="volume"
                                orientation="right"
                                tickFormatter={formatVolume}
                                className="text-xs text-gray-600 dark:text-gray-400"
                            />
                        )}
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />

                        <Line
                            yAxisId="price"
                            type="monotone"
                            dataKey="price"
                            stroke={isPositive ? '#10b981' : '#ef4444'}
                            dot={false}
                            strokeWidth={2}
                            name="Price"
                        />

                        {showVolume && (
                            <Bar
                                yAxisId="volume"
                                dataKey="volume"
                                fill="#8884d8"
                                opacity={0.3}
                                name="Volume"
                            />
                        )}

                        {indicators.includes('SMA') && (
                            <Line
                                yAxisId="price"
                                type="monotone"
                                dataKey="sma20"
                                stroke="#3b82f6"
                                dot={false}
                                name="SMA 20"
                            />
                        )}

                        {indicators.includes('EMA') && (
                            <Line
                                yAxisId="price"
                                type="monotone"
                                dataKey="ema12"
                                stroke="#8b5cf6"
                                dot={false}
                                name="EMA 12"
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            );
        }

        // Default: Area chart
        return (
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis
                        dataKey={timeframe === '1D' ? 'time' : 'date'}
                        className="text-xs text-gray-600 dark:text-gray-400"
                    />
                    <YAxis
                        yAxisId="price"
                        tickFormatter={formatPrice}
                        className="text-xs text-gray-600 dark:text-gray-400"
                    />
                    {showVolume && (
                        <YAxis
                            yAxisId="volume"
                            orientation="right"
                            tickFormatter={formatVolume}
                            className="text-xs text-gray-600 dark:text-gray-400"
                        />
                    )}
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />

                    <Area
                        yAxisId="price"
                        type="monotone"
                        dataKey="price"
                        fill={isPositive ? '#10b981' : '#ef4444'}
                        stroke={isPositive ? '#10b981' : '#ef4444'}
                        fillOpacity={0.2}
                        name="Price"
                    />

                    {showVolume && (
                        <Bar
                            yAxisId="volume"
                            dataKey="volume"
                            fill="#8884d8"
                            opacity={0.3}
                            name="Volume"
                        />
                    )}

                    {indicators.includes('SMA') && (
                        <Line
                            yAxisId="price"
                            type="monotone"
                            dataKey="sma20"
                            stroke="#3b82f6"
                            dot={false}
                            name="SMA 20"
                        />
                    )}

                    {indicators.includes('EMA') && (
                        <Line
                            yAxisId="price"
                            type="monotone"
                            dataKey="ema12"
                            stroke="#8b5cf6"
                            dot={false}
                            name="EMA 12"
                        />
                    )}
                </ComposedChart>
            </ResponsiveContainer>
        );
    };

    return (
        <div
            ref={chartRef}
            className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
                }`}
        >
            {/* Chart Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{symbol}</h2>
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400">
                                {companyName}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                ₹{currentPrice.toFixed(2)}
                            </span>
                            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${isPositive
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                }`}>
                                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                <span className="font-medium">
                                    {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        >
                            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => setShowComparison(!showComparison)}
                            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors ${showComparison ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600' : ''
                                }`}
                            title="Compare"
                        >
                            <Zap className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setShowVolume(!showVolume)}
                            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors ${showVolume ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600' : ''
                                }`}
                            title={showVolume ? 'Hide Volume' : 'Show Volume'}
                        >
                            {showVolume ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </button>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Timeframe Selector */}
                <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center gap-2">
                        {timeframeOptions.map((tf) => (
                            <button
                                key={tf}
                                onClick={() => {
                                    setTimeframe(tf);
                                    onTimeframeChange?.(tf);
                                }}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${timeframe === tf
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        {chartTypeOptions.map(({ type, icon: Icon }) => (
                            <button
                                key={type}
                                onClick={() => {
                                    setChartType(type);
                                    onChartTypeChange?.(type);
                                }}
                                className={`p-2 rounded-lg transition-all ${chartType === type
                                    ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                title={type.charAt(0).toUpperCase() + type.slice(1)}
                            >
                                <Icon className="w-5 h-5" />
                            </button>
                        ))}

                        {/* Indicators Dropdown */}
                        <div className="relative group">
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                <Settings className="w-5 h-5" />
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 hidden group-hover:block z-10">
                                <div className="p-2">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">Indicators</p>
                                    {(['SMA', 'EMA', 'RSI', 'MACD', 'BOLL'] as IndicatorType[]).map((ind) => (
                                        <label
                                            key={ind}
                                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={indicators.includes(ind)}
                                                onChange={() => toggleIndicator(ind)}
                                                className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{ind}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Body */}
            <div className={`p-4 ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[500px]'}`}>
                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">Loading chart data...</p>
                        </div>
                    </div>
                ) : chartData.length > 0 ? (
                    renderChart()
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-gray-500 dark:text-gray-400">No data available</p>
                    </div>
                )}
            </div>

            {/* Chart Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                            <span>High: ₹{Math.max(...chartData.map(d => d.high)).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                            <span>Low: ₹{Math.min(...chartData.map(d => d.low)).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                            <span>Volume: {formatVolume(chartData.reduce((sum, d) => sum + d.volume, 0))}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Last updated: {new Date().toLocaleTimeString()}</span>
                        </div>
                        <button className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                            <RefreshCw className="w-3 h-3" />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};