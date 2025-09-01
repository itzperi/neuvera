import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

/**
 * API route handler for pixel tracking data
 * This endpoint receives tracking data from the client-side tracking pixel
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
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || 'Unknown';
    const referer = headersList.get('referer') || 'Unknown';
    const ip = request.headers.get('x-forwarded-for') || 
              request.headers.get('x-real-ip') || 
              request.ip || 
              'Unknown';
    
    // Process each event
    const processedEvents = events.map(event => ({
      ...event,
      metadata: {
        ...event.metadata,
        ip: anonymizeIp(ip.toString()),
        userAgent,
        referer,
        receivedAt: new Date().toISOString(),
        source: 'pixel'
      }
    }));
    
    // Forward the events to the main tracking endpoint
    await forwardToMainTracking(processedEvents);
    
    return NextResponse.json({ success: true, processed: processedEvents.length });
  } catch (error) {
    console.error('Error processing pixel tracking data:', error);
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
 * Forward events to the main tracking endpoint
 * In a production environment, this might send to a queue or directly to analytics
 */
async function forwardToMainTracking(events: any[]): Promise<void> {
  try {
    // In a real application, this might use a message queue or internal API
    // For now, we'll just log the events
    console.log('Forwarding pixel events to main tracking:', events.length);
    
    // Here you would typically:
    // 1. Send to a message queue (e.g., Kafka, RabbitMQ)
    // 2. Store directly in a time-series database
    // 3. Forward to an analytics service
  } catch (error) {
    console.error('Error forwarding events:', error);
    // Don't throw, just log the error to prevent breaking the response
  }
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