import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

/**
 * API route handler for tracking data
 * This endpoint receives tracking data from both the client-side tracking pixel
 * and the server-side tracking service
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    const { events } = body;
    
    if (!events || !Array.isArray(events)) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }
    
    // Get IP address and headers for additional context
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'Unknown';
    const referer = headersList.get('referer') || 'Unknown';
    const ip = request.headers.get('x-forwarded-for') || 
              request.headers.get('x-real-ip') || 
              'Unknown';
    
    // Process each event
    const processedEvents = events.map(event => ({
      ...event,
      metadata: {
        ...event.metadata,
        ip: anonymizeIp(ip.toString()),
        userAgent,
        referer,
        receivedAt: new Date().toISOString()
      }
    }));
    
    // In a production environment, this would store the events in a database
    // For now, we'll just log them to the console
    console.log('Received tracking events:', processedEvents);
    
    // Here you would typically:
    // 1. Validate the events
    // 2. Store them in a database
    // 3. Process them for analytics
    
    // Mock successful storage
    const storedCount = await mockStoreEvents(processedEvents);
    
    return NextResponse.json({ success: true, processed: storedCount });
  } catch (error) {
    console.error('Error processing tracking data:', error);
    return NextResponse.json(
      { error: 'Failed to process tracking data' }, 
      { status: 500 }
    );
  }
}

/**
 * Anonymize an IP address by removing the last octet
 * @param ip The IP address to anonymize
 */
function anonymizeIp(ip: string): string {
  // For IPv4
  if (ip.includes('.')) {
    return ip.split('.').slice(0, 3).join('.') + '.0';
  }
  // For IPv6
  else if (ip.includes(':')) {
    return ip.split(':').slice(0, 4).join(':') + ':0000:0000:0000:0000';
  }
  return ip;
}

/**
 * Mock function to simulate storing events in a database
 * In a real application, this would be replaced with actual database operations
 */
async function mockStoreEvents(events: any[]): Promise<number> {
  // Simulate database latency
  await new Promise(resolve => setTimeout(resolve, 50));
  return events.length;
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}