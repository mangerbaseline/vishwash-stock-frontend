// app/api/ai/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const requestId = Date.now();
    console.log(`\n=== AI API ROUTE [${requestId}] ===`);

    try {
        // Get authorization header
        const authHeader = request.headers.get('authorization');

        // Try to get body
        const body = await request.json().catch(e => {
            console.error('Failed to parse body:', e);
            return null;
        });

        if (!body) {
            return NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            );
        }

        const { message } = body;

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Extract token
        let token = null;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else if (body.token) {
            token = body.token;
        }

        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        console.log('Forwarding to backend...');

        // Forward to backend with timeout
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
        console.log(`[${requestId}] Fetching from: ${backendUrl}/api/ai-agent/query`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        try {
            const response = await fetch(`${backendUrl}/api/ai-agent/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ query: message }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Try to parse the error response body
            const responseText = await response.text();

            if (!response.ok) {
                console.error('Backend error response:', responseText);

                // Try to parse the error response as JSON
                try {
                    const errorData = JSON.parse(responseText);
                    // Pass through the exact error data from backend
                    return NextResponse.json(errorData, { status: response.status });
                } catch (e) {
                    // If not JSON, return a generic error
                    return NextResponse.json(
                        { error: `Backend error: ${response.status}` },
                        { status: response.status }
                    );
                }
            }

            // Parse successful response
            const data = JSON.parse(responseText);
            return NextResponse.json(data);

        } catch (fetchError: any) {
            clearTimeout(timeoutId);
            console.error('Fetch error:', fetchError.message);
            if (fetchError.name === 'AbortError') {
                return NextResponse.json(
                    { error: 'Backend request timeout' },
                    { status: 504 }
                );
            }
            throw fetchError;
        }

    } catch (error: any) {
        console.error(`[${requestId}] API route error:`, error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'AI API endpoint is ready',
        timestamp: new Date().toISOString()
    });
}










// // app/api/ai/route.ts
// import { NextResponse } from 'next/server';

// export async function POST(request: Request) {
//     const requestId = Date.now();
//     console.log(`\n=== AI API ROUTE [${requestId}] ===`);

//     try {
//         // Get authorization header
//         const authHeader = request.headers.get('authorization');

//         // Try to get body
//         const body = await request.json().catch(e => {
//             console.error('Failed to parse body:', e);
//             return null;
//         });

//         if (!body) {
//             return NextResponse.json(
//                 { error: 'Invalid request body' },
//                 { status: 400 }
//             );
//         }

//         const { message } = body;

//         if (!message) {
//             return NextResponse.json(
//                 { error: 'Message is required' },
//                 { status: 400 }
//             );
//         }

//         // Extract token
//         let token = null;
//         if (authHeader && authHeader.startsWith('Bearer ')) {
//             token = authHeader.substring(7);
//         } else if (body.token) {
//             token = body.token;
//         }

//         if (!token) {
//             return NextResponse.json(
//                 { error: 'Authentication required' },
//                 { status: 401 }
//             );
//         }

//         console.log('Forwarding to backend...');

//         // Forward to backend with timeout
//         const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
//         console.log(`[${requestId}] Fetching from: ${backendUrl}/api/ai-agent/query`);

//         const controller = new AbortController();
//         const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

//         try {
//             const response = await fetch(`${backendUrl}/api/ai-agent/query`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: JSON.stringify({ query: message }),
//                 signal: controller.signal
//             });

//             clearTimeout(timeoutId);

//             if (!response.ok) {
//                 const errorText = await response.text();
//                 console.error('Backend error response:', errorText);
//                 return NextResponse.json(
//                     { error: `Backend error: ${response.status}` },
//                     { status: response.status }
//                 );
//             }

//             const data = await response.json();
//             return NextResponse.json(data);

//         } catch (fetchError: any) {
//             clearTimeout(timeoutId);
//             console.error('Fetch error:', fetchError.message);
//             if (fetchError.name === 'AbortError') {
//                 return NextResponse.json(
//                     { error: 'Backend request timeout' },
//                     { status: 504 }
//                 );
//             }
//             throw fetchError;
//         }

//     } catch (error: any) {
//         console.error(`[${requestId}] API route error:`, error);
//         return NextResponse.json(
//             { error: error.message || 'Internal server error' },
//             { status: 500 }
//         );
//     }
// }

// export async function GET() {
//     return NextResponse.json({
//         status: 'ok',
//         message: 'AI API endpoint is ready',
//         timestamp: new Date().toISOString()
//     });
// }