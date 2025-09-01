import { NextRequest, NextResponse } from 'next/server';

/**
 * API route handler for retrieving tracking data
 * This endpoint provides access to stored tracking events, sessions, and analytics
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'events';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const startDate = searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate') as string) 
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default to last 7 days
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate') as string)
      : new Date();
    
    // Validate parameters
    if (isNaN(limit) || limit <= 0 || limit > 1000) {
      return NextResponse.json({ error: 'Invalid limit parameter' }, { status: 400 });
    }
    
    if (startDate > endDate) {
      return NextResponse.json({ error: 'Start date must be before end date' }, { status: 400 });
    }
    
    // Retrieve data based on type
    let data;
    switch (type) {
      case 'events':
        data = await getTrackingEvents(limit, startDate, endDate);
        break;
      case 'sessions':
        data = await getUserSessions(limit, startDate, endDate);
        break;
      case 'pageviews':
        data = await getPageViews(limit, startDate, endDate);
        break;
      case 'stats':
        data = await getTrackingStats(startDate, endDate);
        break;
      case 'realtime':
        data = await getRealTimeEvents(limit);
        break;
      default:
        return NextResponse.json({ error: 'Invalid data type requested' }, { status: 400 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error retrieving tracking data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve tracking data' }, 
      { status: 500 }
    );
  }
}

/**
 * Get tracking events from storage
 */
async function getTrackingEvents(limit: number, startDate: Date, endDate: Date) {
  // In a production environment, this would query a database
  // For now, we'll return mock data based on console logs
  
  // Get events from console logs (this is a simplified approach for demo purposes)
  const events = getEventsFromLogs();
  
  // Filter by date range
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.timestamp);
    return eventDate >= startDate && eventDate <= endDate;
  });
  
  // Sort by timestamp (newest first) and limit
  return filteredEvents
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

/**
 * Get user sessions from storage
 */
async function getUserSessions(limit: number, startDate: Date, endDate: Date) {
  // In a production environment, this would query a database
  // For now, we'll generate mock sessions based on events
  
  // Get events from console logs
  const events = getEventsFromLogs();
  
  // Group events by sessionId
  const sessionMap = new Map();
  events.forEach(event => {
    if (!event.sessionId) return;
    
    if (!sessionMap.has(event.sessionId)) {
      sessionMap.set(event.sessionId, {
        id: event.sessionId,
        userId: event.userId,
        startTime: event.timestamp,
        endTime: event.timestamp,
        pageViews: 0,
        interactions: 0,
        platform: event.metadata?.platform || 'Unknown',
        device: event.metadata?.device || 'Unknown',
        browser: event.metadata?.browser || 'Unknown'
      });
    }
    
    const session = sessionMap.get(event.sessionId);
    
    // Update session data
    if (new Date(event.timestamp) < new Date(session.startTime)) {
      session.startTime = event.timestamp;
    }
    if (new Date(event.timestamp) > new Date(session.endTime)) {
      session.endTime = event.timestamp;
    }
    
    // Count page views and interactions
    if (event.type === 'page_view') {
      session.pageViews++;
    } else {
      session.interactions++;
    }
  });
  
  // Convert to array and calculate duration
  const sessions = Array.from(sessionMap.values()).map(session => {
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    
    return {
      ...session,
      duration
    };
  });
  
  // Filter by date range
  const filteredSessions = sessions.filter(session => {
    const sessionStartDate = new Date(session.startTime);
    return sessionStartDate >= startDate && sessionStartDate <= endDate;
  });
  
  // Sort by startTime (newest first) and limit
  return filteredSessions
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, limit);
}

/**
 * Get page views from storage
 */
async function getPageViews(limit: number, startDate: Date, endDate: Date) {
  // In a production environment, this would query a database
  // For now, we'll filter events to get page views
  
  // Get events from console logs
  const events = getEventsFromLogs();
  
  // Filter to page view events only
  const pageViews = events
    .filter(event => event.type === 'page_view')
    .map(event => ({
      id: event.id,
      url: event.url,
      userId: event.userId,
      sessionId: event.sessionId,
      timestamp: event.timestamp,
      duration: Math.floor(Math.random() * 300) + 5, // Mock duration
      referrer: event.metadata?.referrer
    }));
  
  // Filter by date range
  const filteredPageViews = pageViews.filter(pageView => {
    const pageViewDate = new Date(pageView.timestamp);
    return pageViewDate >= startDate && pageViewDate <= endDate;
  });
  
  // Sort by timestamp (newest first) and limit
  return filteredPageViews
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

/**
 * Get tracking statistics
 */
async function getTrackingStats(startDate: Date, endDate: Date) {
  // In a production environment, this would query a database
  // For now, we'll calculate stats from events
  
  // Get events from console logs
  const events = getEventsFromLogs();
  
  // Filter by date range
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.timestamp);
    return eventDate >= startDate && eventDate <= endDate;
  });
  
  // Count total events
  const totalEvents = filteredEvents.length;
  
  // Count page views
  const pageViews = filteredEvents.filter(event => event.type === 'page_view');
  const totalPageViews = pageViews.length;
  
  // Count unique users
  const uniqueUsers = new Set(filteredEvents.map(event => event.userId)).size;
  
  // Calculate average session duration
  const sessions = await getUserSessions(1000, startDate, endDate);
  const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const averageSessionDuration = sessions.length > 0 ? Math.floor(totalDuration / sessions.length) : 0;
  
  // Count events by type
  const eventTypes = new Map();
  filteredEvents.forEach(event => {
    const count = eventTypes.get(event.type) || 0;
    eventTypes.set(event.type, count + 1);
  });
  const eventsByType = Array.from(eventTypes.entries()).map(([type, count]) => ({ type, count }));
  
  // Count top pages
  const pages = new Map();
  pageViews.forEach(event => {
    const count = pages.get(event.url) || 0;
    pages.set(event.url, count + 1);
  });
  const topPages = Array.from(pages.entries())
    .map(([url, views]) => ({ url, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);
  
  // Count device distribution
  const devices = new Map();
  filteredEvents.forEach(event => {
    const device = event.metadata?.device || 'Unknown';
    const count = devices.get(device) || 0;
    devices.set(device, count + 1);
  });
  const deviceDistribution = Array.from(devices.entries())
    .map(([device, count]) => ({ device, count }))
    .sort((a, b) => b.count - a.count);
  
  // Count top referrers
  const referrers = new Map();
  pageViews.forEach(event => {
    const referrer = event.metadata?.referrer || 'Direct';
    const count = referrers.get(referrer) || 0;
    referrers.set(referrer, count + 1);
  });
  const topReferrers = Array.from(referrers.entries())
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  return {
    totalEvents,
    totalPageViews,
    totalUsers: uniqueUsers,
    averageSessionDuration,
    eventsByType,
    topPages,
    deviceDistribution,
    topReferrers
  };
}

/**
 * Get real-time events
 */
async function getRealTimeEvents(limit: number) {
  // In a production environment, this would query a database for recent events
  // For now, we'll filter events to get the most recent ones
  
  // Get events from console logs
  const events = getEventsFromLogs();
  
  // Sort by timestamp (newest first) and limit
  return events
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
    .map(event => ({
      ...event,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 60 * 1000)).toISOString() // Make them appear recent
    }));
}

/**
 * Helper function to get events from console logs
 * In a real implementation, this would be replaced with database queries
 */
function getEventsFromLogs() {
  // This is a simplified approach for demo purposes
  // In a real application, you would query a database
  
  // Generate some mock events if none exist in memory
  if (!global.mockTrackingEvents || global.mockTrackingEvents.length === 0) {
    global.mockTrackingEvents = generateMockEvents(100);
  }
  
  return global.mockTrackingEvents;
}

/**
 * Generate mock events for testing
 */
function generateMockEvents(count: number) {
  const events = [];
  const eventTypes = ['page_view', 'click', 'scroll', 'form_submit', 'chat:message'];
  const urls = [
    '/home', '/about', '/features', '/pricing', '/contact',
    '/dashboard', '/settings', '/profile', '/login', '/signup'
  ];
  const platforms = ['Windows', 'MacOS', 'iOS', 'Android'];
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  const devices = ['Desktop', 'Laptop', 'Mobile', 'Tablet'];
  const referrers = [
    'https://google.com', 'https://facebook.com', 'https://twitter.com',
    'https://linkedin.com', 'https://instagram.com', 'direct', 'email'
  ];
  
  for (let i = 0; i < count; i++) {
    const timestamp = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const url = urls[Math.floor(Math.random() * urls.length)];
    const userId = `user_${Math.floor(Math.random() * 20)}`;
    const sessionId = `sess_${Math.floor(Math.random() * 50)}`;
    
    events.push({
      id: `evt_${Math.random().toString(36).substring(2, 10)}`,
      type,
      url,
      userId,
      sessionId,
      timestamp: timestamp.toISOString(),
      metadata: {
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        device: devices[Math.floor(Math.random() * devices.length)],
        referrer: Math.random() > 0.3 ? referrers[Math.floor(Math.random() * referrers.length)] : undefined,
        // For chat messages
        ...(type === 'chat:message' ? {
          role: Math.random() > 0.5 ? 'user' : 'assistant',
          content: `Sample message ${i}`,
          messageId: `msg_${Math.random().toString(36).substring(2, 10)}`,
          responseTime: Math.floor(Math.random() * 5000) + 500
        } : {})
      }
    });
  }
  
  return events;
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Add mock events to global scope for persistence between requests
declare global {
  var mockTrackingEvents: any[];
}

if (!global.mockTrackingEvents) {
  global.mockTrackingEvents = [];
}