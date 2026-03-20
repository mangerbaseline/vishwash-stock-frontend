// // app/api/stocks/route.js
// import { NextResponse } from 'next/server';

// export async function GET(request) {
//     try {
//         const API_URL = 'https://api.apify.com/v2/acts/akash9078~indian-stocks-financial-data-scraper/run-sync-get-dataset-items';

//         const response = await fetch(`${API_URL}?token=${API_TOKEN}`);

//         if (!response.ok) {
//             throw new Error(`API responded with status: ${response.status}`);
//         }

//         const data = await response.json();

//         return NextResponse.json(data);
//     } catch (error) {
//         console.error('Stock API Error:', error);
//         return NextResponse.json(
//             { error: 'Failed to fetch stock data' },
//             { status: 500 }
//         );
//     }
// }