// frontend/app/dashboard/global-markets/page.tsx
'use client';

import { MarketGlobe } from '@/app/components/threejs/MarketGlobe';
import { Suspense } from 'react';

export default function GlobalMarketsPage() {
    return (
        <div className="min-h-screen bg-black">
            <Suspense fallback={
                <div className="flex items-center justify-center h-screen">
                    <div className="text-white text-xl">Loading 3D Globe...</div>
                </div>
            }>
                <MarketGlobe />
            </Suspense>
        </div>
    );
}