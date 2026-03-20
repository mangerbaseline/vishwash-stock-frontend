// app/types/ai.ts
export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: {
        stocks?: string[];
        sentiment?: 'positive' | 'negative' | 'neutral';
        confidence?: number;
        sources?: string[];
        analysis?: StockAnalysis;
    };
}

export interface StockAnalysis {
    symbol: string;
    companyName: string;
    currentPrice: number;
    change: number;
    changePercent: number;
    analysis: {
        summary: string;
        recommendation: 'BUY' | 'SELL' | 'HOLD' | 'STRONG_BUY' | 'STRONG_SELL';
        confidence: number;
        targetPrice: number;
        stopLoss: number;
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
        keyPoints: string[];
    };
    technicalIndicators: {
        rsi: number;
        macd: {
            value: number;
            signal: number;
            histogram: number;
        };
        movingAverages: {
            ma50: number;
            ma200: number;
            signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
        };
        support: number[];
        resistance: number[];
    };
    fundamentals: {
        pe: number;
        eps: number;
        marketCap: number;
        dividend: number;
        sector: string;
        industry: string;
        volume: number;
        avgVolume: number;
    };
}

export interface MarketAnalysis {
    overallSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    topGainers: Array<{ symbol: string; name: string; price: number; change: number; changePercent: number }>;
    topLosers: Array<{ symbol: string; name: string; price: number; change: number; changePercent: number }>;
    mostActive: Array<{ symbol: string; name: string; price: number; volume: number }>;
    sectorPerformance: Array<{ sector: string; change: number; sentiment: 'positive' | 'negative' | 'neutral' }>;
    indices: {
        sensex: { value: number; change: number; changePercent: number };
        nifty: { value: number; change: number; changePercent: number };
        dowJones?: { value: number; change: number; changePercent: number };
        nasdaq?: { value: number; change: number; changePercent: number };
    };
    newsImpact: Array<{
        title: string;
        source: string;
        sentiment: 'positive' | 'negative' | 'neutral';
        impact: 'HIGH' | 'MEDIUM' | 'LOW';
        url: string;
        publishedAt: string;
    }>;
    recommendations: string[];
    marketBreadth: {
        advances: number;
        declines: number;
        unchanged: number;
        advanceDeclineRatio: number;
    };
}

export interface AIAgentConfig {
    model: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-2' | 'llama-2';
    temperature: number;
    maxTokens: number;
    hasMemory: boolean;
    tools: string[];
}

export interface Conversation {
    id: string;
    userId: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
    metadata?: {
        favorite?: boolean;
        tags?: string[];
        summary?: string;
    };
}