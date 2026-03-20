// app/api/test/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    console.log('✅ Test endpoint reached!');

    try {
        const body = await request.json();
        console.log('Test body:', body);

        return NextResponse.json({
            success: true,
            message: 'Test endpoint working',
            received: body
        });
    } catch (error) {
        console.error('Test endpoint error:', error);
        return NextResponse.json({ error: 'Test failed' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ message: 'Test endpoint ready' });
}