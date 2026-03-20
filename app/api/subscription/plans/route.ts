// Next.js API route for fetching subscription plans
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/subscription/plans`, {
            cache: 'no-store'
        });
        
        if (!response.ok) {
            throw new Error(`Backend responded with ${response.status}`);
        }
        
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching plans from backend:', error);
        
        // Fallback or error response
        return NextResponse.json(
            { success: false, message: 'Failed to fetch subscription plans' },
            { status: 500 }
        );
    }
}
