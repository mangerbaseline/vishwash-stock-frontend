'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface StockData {
    Symbol: string;
    "Current Price": string;
    Change: number;
    ChangePercent: number;
}

interface LivePrice {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    timestamp: number;
}

export function useLivePrices(
    initialStocks: StockData[],
    enabled: boolean = true,
    speed: number = 50,
    volatility: number = 0.001
) {
    const [stocks, setStocks] = useState<StockData[]>(initialStocks);
    const [livePrices, setLivePrices] = useState<Map<string, LivePrice>>(new Map());
    const animationRef = useRef<number>();
    const lastUpdateRef = useRef<number>(Date.now());

    const updatePrices = useCallback(() => {
        setStocks(prev => prev.map(stock => {
            const currentPrice = parseFloat(stock["Current Price"]);
            // Simulate realistic price movement
            const change = currentPrice * (Math.random() - 0.5) * volatility * 2;
            const newPrice = currentPrice + change;
            const changePercent = (change / currentPrice) * 100;

            // Store live price
            setLivePrices(prevMap => {
                const newMap = new Map(prevMap);
                newMap.set(stock.Symbol, {
                    symbol: stock.Symbol,
                    price: newPrice,
                    change,
                    changePercent,
                    timestamp: Date.now()
                });
                return newMap;
            });

            return {
                ...stock,
                "Current Price": newPrice.toFixed(2),
                Change: stock.Change + change,
                ChangePercent: stock.ChangePercent + changePercent,
            };
        }));
    }, [volatility]);

    const animate = useCallback(() => {
        const now = Date.now();
        if (now - lastUpdateRef.current >= speed) {
            lastUpdateRef.current = now;
            updatePrices();
        }
        animationRef.current = requestAnimationFrame(animate);
    }, [speed, updatePrices]);

    useEffect(() => {
        if (!enabled) return;

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [enabled, animate]);

    // Update stocks when initial stocks change
    useEffect(() => {
        setStocks(initialStocks);
    }, [initialStocks]);

    return { stocks, livePrices };
}