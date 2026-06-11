// frontend/app/components/threejs/hooks/useMarketData.ts
import { useState, useEffect } from 'react';
import { MarketRegion } from '../MarketGlobe';

export const useMarketData = () => {
    const [marketData, setMarketData] = useState<MarketRegion[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                // Fetch real market data from your backend
                const response = await fetch('/api/market/sentiment');
                if (!response.ok) throw new Error('Failed to fetch market data');

                const data = await response.json();
                setMarketData(data);
            } catch (err) {
                console.error('Error fetching market data:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');

                // Fallback to mock data
                setMarketData(getMockMarketData());
            } finally {
                setLoading(false);
            }
        };

        fetchMarketData();

        // Set up WebSocket for real-time updates
        const ws = new WebSocket('ws://localhost:3001/ws/market');
        ws.onmessage = (event) => {
            const update = JSON.parse(event.data);
            setMarketData(prev => updateMarketData(prev, update));
        };

        return () => ws.close();
    }, []);

    return { marketData, loading, error };
};

// Helper function to update market data
const updateMarketData = (prev: MarketRegion[] | null, update: any): MarketRegion[] | null => {
    if (!prev) return null;
    return prev.map(region => {
        if (region.id === update.regionId) {
            return { ...region, ...update.data };
        }
        return region;
    });
};

// Mock data for fallback
const getMockMarketData = (): MarketRegion[] => {
    return [
        {
            id: 'us',
            name: 'USA',
            lat: 39.8283,
            lng: -98.5795,
            sentiment: 0.65,
            volume: 8500,
            indices: [
                { name: 'S&P 500', value: 4780, change: 1.2, volume: 2500000 },
                { name: 'NASDAQ', value: 16800, change: 0.8, volume: 1800000 },
            ]
        },
        {
            id: 'eu',
            name: 'Europe',
            lat: 50.1109,
            lng: 8.6821,
            sentiment: -0.2,
            volume: 6200,
            indices: [
                { name: 'FTSE 100', value: 7650, change: -0.5, volume: 1200000 },
                { name: 'DAX', value: 16850, change: -0.3, volume: 900000 },
            ]
        },
        {
            id: 'asia',
            name: 'Asia',
            lat: 35.6762,
            lng: 139.6503,
            sentiment: 0.45,
            volume: 7200,
            indices: [
                { name: 'Nikkei 225', value: 38500, change: 1.5, volume: 1500000 },
                { name: 'HSI', value: 16500, change: 0.9, volume: 1100000 },
            ]
        },
        {
            id: 'china',
            name: 'China',
            lat: 31.2304,
            lng: 121.4737,
            sentiment: -0.35,
            volume: 5800,
            indices: [
                { name: 'SSE Composite', value: 3050, change: -0.8, volume: 2000000 },
                { name: 'CSI 300', value: 3520, change: -0.6, volume: 1600000 },
            ]
        },
        {
            id: 'india',
            name: 'India',
            lat: 20.5937,
            lng: 78.9629,
            sentiment: 0.85,
            volume: 4800,
            indices: [
                { name: 'NIFTY 50', value: 21800, change: 2.1, volume: 1300000 },
                { name: 'SENSEX', value: 72000, change: 1.9, volume: 1100000 },
            ]
        },
    ];
};