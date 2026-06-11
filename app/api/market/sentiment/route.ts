// frontend/app/api/market/sentiment/route.ts
import { NextResponse } from 'next/server';

// Mock data for regions
const regionsData = [
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
            { name: 'DOW JONES', value: 38500, change: 0.9, volume: 1500000 }
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
            { name: 'CAC 40', value: 7450, change: -0.2, volume: 800000 }
        ]
    },
    {
        id: 'asia',
        name: 'Asia Pacific',
        lat: 35.6762,
        lng: 139.6503,
        sentiment: 0.45,
        volume: 7200,
        indices: [
            { name: 'Nikkei 225', value: 38500, change: 1.5, volume: 1500000 },
            { name: 'HSI', value: 16500, change: 0.9, volume: 1100000 },
            { name: 'ASX 200', value: 7800, change: 0.7, volume: 800000 }
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
            { name: 'SZSE Component', value: 9500, change: -0.4, volume: 1200000 }
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
            { name: 'BANK NIFTY', value: 48500, change: 1.5, volume: 900000 }
        ]
    },
    {
        id: 'uk',
        name: 'United Kingdom',
        lat: 51.5074,
        lng: -0.1278,
        sentiment: -0.15,
        volume: 5400,
        indices: [
            { name: 'FTSE 100', value: 7650, change: -0.3, volume: 1100000 },
            { name: 'FTSE 250', value: 19200, change: -0.1, volume: 700000 }
        ]
    },
    {
        id: 'japan',
        name: 'Japan',
        lat: 35.6762,
        lng: 139.6503,
        sentiment: 0.55,
        volume: 6800,
        indices: [
            { name: 'Nikkei 225', value: 38500, change: 1.2, volume: 1400000 },
            { name: 'TOPIX', value: 2680, change: 0.8, volume: 1000000 }
        ]
    },
    {
        id: 'brazil',
        name: 'Brazil',
        lat: -14.2350,
        lng: -51.9253,
        sentiment: -0.25,
        volume: 4200,
        indices: [
            { name: 'IBOVESPA', value: 128000, change: -0.5, volume: 800000 },
            { name: 'Bovespa', value: 125000, change: -0.4, volume: 600000 }
        ]
    }
];

// GET handler for fetching market sentiment data
export async function GET(request: Request) {
    try {
        // Get query parameters
        const { searchParams } = new URL(request.url);
        const region = searchParams.get('region');

        // Simulate API delay (remove in production)
        await new Promise(resolve => setTimeout(resolve, 500));

        // If region is specified, return only that region's data
        if (region) {
            const regionData = regionsData.find(r => r.id === region);
            if (!regionData) {
                return NextResponse.json(
                    { error: 'Region not found' },
                    { status: 404 }
                );
            }
            return NextResponse.json(regionData);
        }

        // Return all regions data
        return NextResponse.json(regionsData);

    } catch (error) {
        console.error('Error in market sentiment API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST handler for updating market data (if needed)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { regionId, sentiment, volume } = body;

        // Here you would update your database
        // For now, just return success
        return NextResponse.json({
            success: true,
            message: 'Market data updated',
            updatedRegion: regionId
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update market data' },
            { status: 500 }
        );
    }
}