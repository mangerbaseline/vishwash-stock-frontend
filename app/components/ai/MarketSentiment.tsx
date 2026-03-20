// app/components/ai/MarketSentiment.tsx
'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Newspaper, Activity, BarChart3 } from 'lucide-react';
import { MarketAnalysis } from '../../types/ai';
import clsx from 'clsx';

interface MarketSentimentProps {
    analysis: MarketAnalysis;
}

export default function MarketSentiment({ analysis }: MarketSentimentProps) {
    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case 'BULLISH':
                return <TrendingUp className="w-4 h-4 text-green-600" />;
            case 'BEARISH':
                return <TrendingDown className="w-4 h-4 text-red-600" />;
            default:
                return <Minus className="w-4 h-4 text-yellow-600" />;
        }
    };

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'BULLISH':
                return 'text-green-600 dark:text-green-400';
            case 'BEARISH':
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-yellow-600 dark:text-yellow-400';
        }
    };

    return (
        <div className="space-y-4">
            {/* Overall Sentiment */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-500" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Market Overview</h4>
                    </div>
                    <div className={clsx(
                        'flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
                        analysis.overallSentiment === 'BULLISH' ? 'bg-green-100 dark:bg-green-900/30' :
                            analysis.overallSentiment === 'BEARISH' ? 'bg-red-100 dark:bg-red-900/30' :
                                'bg-yellow-100 dark:bg-yellow-900/30'
                    )}>
                        {getSentimentIcon(analysis.overallSentiment)}
                        <span className={getSentimentColor(analysis.overallSentiment)}>
                            {analysis.overallSentiment}
                        </span>
                    </div>
                </div>

                {/* Indices */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">SENSEX</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {analysis.indices.sensex.value.toLocaleString()}
                        </p>
                        <p className={clsx(
                            'text-sm',
                            analysis.indices.sensex.change >= 0 ? 'text-green-600' : 'text-red-600'
                        )}>
                            {analysis.indices.sensex.change >= 0 ? '+' : ''}
                            {analysis.indices.sensex.change.toFixed(2)} ({analysis.indices.sensex.changePercent.toFixed(2)}%)
                        </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">NIFTY 50</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {analysis.indices.nifty.value.toLocaleString()}
                        </p>
                        <p className={clsx(
                            'text-sm',
                            analysis.indices.nifty.change >= 0 ? 'text-green-600' : 'text-red-600'
                        )}>
                            {analysis.indices.nifty.change >= 0 ? '+' : ''}
                            {analysis.indices.nifty.change.toFixed(2)} ({analysis.indices.nifty.changePercent.toFixed(2)}%)
                        </p>
                    </div>
                </div>

                {/* Market Breadth */}
                <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Market Breadth</h5>
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Advances</p>
                            <p className="text-lg font-semibold text-green-600">{analysis.marketBreadth.advances}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Declines</p>
                            <p className="text-lg font-semibold text-red-600">{analysis.marketBreadth.declines}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">A/D Ratio</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {analysis.marketBreadth.advanceDeclineRatio.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Movers */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        Top Gainers
                    </h5>
                    <div className="space-y-2">
                        {analysis.topGainers.slice(0, 3).map((stock: { symbol: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; name: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; changePercent: number; }, i: React.Key | null | undefined) => (
                            <div key={i} className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{stock.symbol}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{stock.name}</p>
                                </div>
                                <p className="text-sm font-medium text-green-600">+{stock.changePercent.toFixed(2)}%</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1">
                        <TrendingDown className="w-4 h-4 text-red-600" />
                        Top Losers
                    </h5>
                    <div className="space-y-2">
                        {analysis.topLosers.slice(0, 3).map((stock: { symbol: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; name: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; changePercent: number; }, i: React.Key | null | undefined) => (
                            <div key={i} className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{stock.symbol}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{stock.name}</p>
                                </div>
                                <p className="text-sm font-medium text-red-600">{stock.changePercent.toFixed(2)}%</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sector Performance */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Sector Performance</h5>
                <div className="space-y-2">
                    {analysis.sectorPerformance.map((sector: { sector: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; change: number; }, i: React.Key | null | undefined) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400 w-24">{sector.sector}</span>
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={clsx(
                                        'h-full rounded-full',
                                        sector.change >= 0 ? 'bg-green-500' : 'bg-red-500'
                                    )}
                                    style={{ width: `${Math.min(Math.abs(sector.change) * 10, 100)}%` }}
                                />
                            </div>
                            <span className={clsx(
                                'text-sm font-medium',
                                sector.change >= 0 ? 'text-green-600' : 'text-red-600'
                            )}>
                                {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(2)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* News Impact */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1">
                    <Newspaper className="w-4 h-4" />
                    Top News
                </h5>
                <div className="space-y-3">
                    {analysis.newsImpact.slice(0, 3).map((news: { impact: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<React.AwaitedReactNode> | null | undefined; title: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; source: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; publishedAt: string | number | Date; }, i: React.Key | null | undefined) => (
                        <div key={i} className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-2 last:pb-0">
                            <div className="flex items-start gap-2">
                                <div className={clsx(
                                    'px-2 py-0.5 rounded text-xs font-medium',
                                    news.impact === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                        news.impact === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                )}>
                                    {news.impact}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900 dark:text-white">{news.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {news.source} • {new Date(news.publishedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}