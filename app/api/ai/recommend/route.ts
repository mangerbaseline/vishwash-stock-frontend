// app/api/ai/recommend/route.ts
import { NextResponse } from 'next/server';
import { AIAgent } from '../../../lib/ai/agent';

export async function POST(request: Request) {
    try {
        const {
            sector,
            riskProfile = 'moderate',
            investmentHorizon = 'long',
            amount,
            preferences
        } = await request.json();

        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        const agent = new AIAgent(`recommend-${Date.now()}`, token || undefined);

        let query = `Based on the following criteria, recommend 3-5 stocks with analysis:\n\n`;
        query += `- Risk Profile: ${riskProfile}\n`;
        query += `- Investment Horizon: ${investmentHorizon}\n`;
        if (sector) query += `- Preferred Sector: ${sector}\n`;
        if (amount) query += `- Investment Amount: ₹${amount}\n`;
        if (preferences) query += `- Additional Preferences: ${preferences}\n\n`;
        query += `For each recommendation, explain why it fits the criteria and provide key metrics.`;

        const response = await agent.processMessage(query, 'system');

        return NextResponse.json({
            criteria: { riskProfile, investmentHorizon, sector, amount },
            recommendations: response,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Recommendation API Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate recommendations' },
            { status: 500 }
        );
    }
}