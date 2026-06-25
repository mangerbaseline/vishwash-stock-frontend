// WebSocket client for real-time stock data from Twelve Data
type WSMessageHandler = (data: any) => void;

class StockWebSocketClient {
    private ws: WebSocket | null = null;
    private url: string;
    private handlers: Map<string, WSMessageHandler[]> = new Map();
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private isConnected = false;

    constructor() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = process.env.NEXT_PUBLIC_API_URL 
            ? process.env.NEXT_PUBLIC_API_URL.replace(/^https?:\/\//, '')
            : 'localhost:5000';
        this.url = `${protocol}//${host}/ws/stocks`;
    }

    connect() {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            return;
        }

        console.log('🔌 Connecting to Stock WebSocket...');
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log('✅ Stock WebSocket connected');
            this.isConnected = true;
            this.emit('CONNECTION', { status: 'connected' });
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'QUOTE_UPDATE') {
                    this.emit('quote', data);
                } else if (data.type === 'QUOTE') {
                    this.emit('quote_response', data);
                } else if (data.type === 'CONNECTED') {
                    this.emit('CONNECTION', data);
                } else if (data.type === 'SUBSCRIBED') {
                    this.emit('subscribed', data);
                } else if (data.type === 'ERROR') {
                    console.error('❌ Stock WS Error:', data.message);
                    this.emit('error', data);
                } else {
                    this.emit('message', data);
                }
            } catch (err) {
                console.error('❌ Error parsing WS message:', err);
            }
        };

        this.ws.onclose = () => {
            console.log('🔌 Stock WebSocket disconnected');
            this.isConnected = false;
            this.emit('CONNECTION', { status: 'disconnected' });
            
            // Auto reconnect after 3 seconds
            if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
            this.reconnectTimer = setTimeout(() => this.connect(), 3000);
        };

        this.ws.onerror = (err) => {
            console.error('❌ Stock WebSocket error:', err);
        };
    }

    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
    }

    subscribe(symbols: string[]) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn('⚠️ WebSocket not connected, cannot subscribe');
            // Queue subscription after connect
            const trySubscribe = () => {
                if (this.isConnected) {
                    this.send({ type: 'SUBSCRIBE', symbols });
                } else {
                    setTimeout(trySubscribe, 500);
                }
            };
            this.connect();
            setTimeout(trySubscribe, 1000);
            return;
        }
        this.send({ type: 'SUBSCRIBE', symbols });
    }

    getQuote(symbol: string) {
        this.send({ type: 'GET_QUOTE', symbol });
    }

    private send(data: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    on(event: string, handler: WSMessageHandler) {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, []);
        }
        this.handlers.get(event)!.push(handler);
        
        // Return unsubscribe function
        return () => {
            const handlers = this.handlers.get(event);
            if (handlers) {
                const idx = handlers.indexOf(handler);
                if (idx >= 0) handlers.splice(idx, 1);
            }
        };
    }

    off(event: string, handler: WSMessageHandler) {
        const handlers = this.handlers.get(event);
        if (handlers) {
            const idx = handlers.indexOf(handler);
            if (idx >= 0) handlers.splice(idx, 1);
        }
    }

    private emit(event: string, data: any) {
        const handlers = this.handlers.get(event);
        if (handlers) {
            handlers.forEach(handler => handler(data));
        }
    }
}

// Singleton instance
export const stockWS = new StockWebSocketClient();

// React hook for using stock WebSocket
import { useEffect, useCallback, useRef, useState } from 'react';

export interface LiveQuote {
    symbol: string;
    exchange: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    timestamp: string;
    isRealTime: boolean;
}

export function useStockWebSocket() {
    const [connected, setConnected] = useState(false);
    const [liveQuotes, setLiveQuotes] = useState<Map<string, LiveQuote>>(new Map());
    const quotesRef = useRef<Map<string, LiveQuote>>(new Map());

    useEffect(() => {
        const unsubConnect = stockWS.on('CONNECTION', (data: any) => {
            setConnected(data.status === 'connected');
        });

        const unsubQuote = stockWS.on('quote', (data: LiveQuote) => {
            quotesRef.current.set(data.symbol, data);
            setLiveQuotes(new Map(quotesRef.current));
        });

        // Connect
        stockWS.connect();

        return () => {
            unsubConnect();
            unsubQuote();
            // Don't disconnect on unmount - keep connection alive globally
        };
    }, []);

    const subscribe = useCallback((symbols: string[]) => {
        stockWS.subscribe(symbols);
    }, []);

    const getQuote = useCallback((symbol: string) => {
        return stockWS.getQuote(symbol);
    }, []);

    return {
        connected,
        liveQuotes,
        subscribe,
        getQuote
    };
}

export default stockWS;