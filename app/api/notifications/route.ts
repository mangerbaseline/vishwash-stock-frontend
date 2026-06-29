// D:\vishwash\clone-stocks-new\frontend\app\api\notifications\route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    // Forward the request to backend
    const response = await fetch(`${BACKEND_URL}/api/notifications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if it exists
        'Authorization': request.headers.get('Authorization') || '',
        'Cookie': request.headers.get('Cookie') || '',
      },
      credentials: 'include',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const notificationId = pathParts[pathParts.length - 1];
    
    // Handle /api/notifications/read-all
    if (notificationId === 'read-all') {
      const response = await fetch(`${BACKEND_URL}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || '',
          'Cookie': request.headers.get('Cookie') || '',
        },
        credentials: 'include',
      });
      
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }
    
    // Handle /api/notifications/:id/read
    if (notificationId === 'read') {
      // Get the actual ID from the URL pattern
      const id = pathParts[pathParts.length - 2];
      const response = await fetch(`${BACKEND_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || '',
          'Cookie': request.headers.get('Cookie') || '',
        },
        credentials: 'include',
      });
      
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }
    
    // Default: try to forward as is
    const response = await fetch(`${BACKEND_URL}/api/notifications/${notificationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
        'Cookie': request.headers.get('Cookie') || '',
      },
      body: JSON.stringify(await request.json()),
      credentials: 'include',
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Error updating notification:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update notification' },
      { status: 500 }
    );
  }
}