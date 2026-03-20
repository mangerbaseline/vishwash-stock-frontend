// app/components/ai/StockAnalysis.tsx
'use client';

import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Target, Shield, BarChart3, Activity, DollarSign } from 'lucide-react';
import { StockAnalysis as StockAnalysisType } from '../../types/ai';
import clsx from 'clsx';

interface StockAnalysisProps {
    analysis: StockAnalysisType;
}

export default function StockAnalysis({ analysis }: StockAnalysisProps) {
    const getRecommendationColor = (rec: string) => {
        switch (rec) {
            case 'STRONG_BUY':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
            case 'BUY':
                return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
            case 'HOLD':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
            case 'SELL':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
            case 'STRONG_SELL':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'LOW':
                return 'text-green-600 dark:text-green-400';
            case 'MEDIUM':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'HIGH':
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    return (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                        {analysis.symbol} - {analysis.companyName}
                    </h4>
                </div>
                <div className="flex items-center gap-2">
                    <span className={clsx(
                        'px-3 py-1 rounded-full text-xs font-medium border',
                        getRecommendationColor(analysis.analysis.recommendation)
                    )}>
                        {analysis.analysis.recommendation.replace('_', ' ')}
                    </span>
                    <span className={clsx(
                        'text-sm font-medium',
                        analysis.change >= 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                        {analysis.change >= 0 ? '+' : ''}{analysis.change.toFixed(2)} ({analysis.changePercent.toFixed(2)}%)
                    </span>
                </div>
            </div>

            {/* Price Info */}
            <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Current</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">₹{analysis.currentPrice.toFixed(2)}</p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Target</p>
                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">₹{analysis.analysis.targetPrice.toFixed(2)}</p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Stop Loss</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">₹{analysis.analysis.stopLoss.toFixed(2)}</p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Risk</p>
                    <p className={clsx('text-lg font-bold', getRiskColor(analysis.analysis.riskLevel))}>
                        {analysis.analysis.riskLevel}
                    </p>
                </div>
            </div>

            {/* Technical Indicators */}
            <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    Technical Indicators
                </h5>
                <div className="grid grid-cols-3 gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">RSI</p>
                        <p className={clsx(
                            'text-sm font-medium',
                            analysis.technicalIndicators.rsi > 70 ? 'text-red-600' :
                                analysis.technicalIndicators.rsi < 30 ? 'text-green-600' : 'text-gray-900 dark:text-white'
                        )}>
                            {analysis.technicalIndicators.rsi.toFixed(2)}
                        </p>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">MACD</p>
                        <p className={clsx(
                            'text-sm font-medium',
                            analysis.technicalIndicators.macd.value > 0 ? 'text-green-600' : 'text-red-600'
                        )}>
                            {analysis.technicalIndicators.macd.value.toFixed(2)}
                        </p>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">MA Signal</p>
                        <p className={clsx(
                            'text-sm font-medium',
                            analysis.technicalIndicators.movingAverages.signal === 'BULLISH' ? 'text-green-600' :
                                analysis.technicalIndicators.movingAverages.signal === 'BEARISH' ? 'text-red-600' : 'text-yellow-600'
                        )}>
                            {analysis.technicalIndicators.movingAverages.signal}
                        </p>
                    </div>
                </div>
            </div>

            {/* Fundamentals */}
            <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Fundamentals
                </h5>
                <div className="grid grid-cols-4 gap-3">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">P/E</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{analysis.fundamentals.pe.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">EPS</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">₹{analysis.fundamentals.eps.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Market Cap</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {analysis.fundamentals.marketCap > 1e12
                                ? `₹${(analysis.fundamentals.marketCap / 1e12).toFixed(2)}T`
                                : `₹${(analysis.fundamentals.marketCap / 1e9).toFixed(2)}B`
                            }
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Dividend</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {analysis.fundamentals.dividend ? `${analysis.fundamentals.dividend}%` : '-'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Key Points */}
            {analysis.analysis.keyPoints.length > 0 && (
                <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Insights</h5>
                    <ul className="space-y-1">
                        {analysis.analysis.keyPoints.map((point, i) => (
                            <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                <span className="text-indigo-500 mt-1">•</span>
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}