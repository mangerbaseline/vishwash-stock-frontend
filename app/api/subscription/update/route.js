import { NextResponse } from 'next/server';

export async function POST(request) {
    if (request.method !== 'POST') {
        return NextResponse.json(
            { success: false, message: 'Method not allowed' },
            { status: 405 }
        );
    }

    try {
        // Get the request body and token
        const body = await request.json();
        const token = request.headers.get('authorization')?.split(' ')[1];

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Forward the request to your backend server
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/subscription/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        // Return the response from backend
        return NextResponse.json(data, {
            status: response.status
        });

    } catch (error) {
        console.error('Subscription update error:', error);

        // Handle specific errors
        if (error.name === 'JsonWebTokenError') {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        if (error.name === 'TokenExpiredError') {
            return NextResponse.json(
                { success: false, message: 'Token expired' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred while processing your subscription',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}