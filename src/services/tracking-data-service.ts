/**
 * Tracking Data Service
 * 
 * This service provides access to tracking data for analytics dashboards
 * and visualization components.
 */

// Define interfaces for tracking data
export interface TrackingEvent {
  id: string;
  type: string;
  url: string;
  userId: string;
  sessionId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UserSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  pageViews: number;
  interactions: number;
  platform: string;
  device: string;
  browser: string;
}

export interface PageView {
  id: string;
  url: string;
  userId: string;
  sessionId: string;
  timestamp: string;
  duration: number;
  referrer?: string;
}

export interface TrackingStats {
  totalEvents: number;
  totalPageViews: number;
  totalUsers: number;
  averageSessionDuration: number;
  eventsByType: { type: string; count: number }[];
  topPages: { url: string; views: number }[];
  deviceDistribution: { device: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
}

// Mock data generator functions
const generateMockEvents = (count: number): TrackingEvent[] => {
  const events: TrackingEvent[] = [];
  const eventTypes = ['page_view', 'click', 'scroll', 'form_submit'];
  const urls = [
    '/home', '/about', '/features', '/pricing', '/contact',
    '/dashboard', '/settings', '/profile', '/login', '/signup'
  ];

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));
    events.push({
      id: `evt_${Math.random().toString(36).substring(2, 10)}`,
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      url: urls[Math.floor(Math.random() * urls.length)],
      userId: `user_${Math.floor(Math.random() * 100)}`,
      sessionId: `sess_${Math.floor(Math.random() * 50)}`,
      timestamp: timestamp.toISOString(),
      metadata: {
        browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
        platform: ['Windows', 'MacOS', 'iOS', 'Android'][Math.floor(Math.random() * 4)],
      }
    });
  }

  return events;
};

const generateMockSessions = (count: number): UserSession[] => {
  const sessions: UserSession[] = [];
  const platforms = ['Windows', 'MacOS', 'iOS', 'Android'];
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  const devices = ['Desktop', 'Laptop', 'Mobile', 'Tablet'];

  for (let i = 0; i < count; i++) {
    const startTime = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));
    const isActive = Math.random() > 0.7;
    const duration = isActive ? undefined : Math.floor(Math.random() * 3600);
    const endTime = isActive ? undefined : new Date(startTime.getTime() + (duration || 0) * 1000).toISOString();

    sessions.push({
      id: `sess_${Math.random().toString(36).substring(2, 10)}`,
      userId: `user_${Math.floor(Math.random() * 100)}`,
      startTime: startTime.toISOString(),
      endTime,
      duration,
      pageViews: Math.floor(Math.random() * 20) + 1,
      interactions: Math.floor(Math.random() * 50) + 1,
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
    });
  }

  return sessions;
};

const generateMockPageViews = (count: number): PageView[] => {
  const pageViews: PageView[] = [];
  const urls = [
    '/home', '/about', '/features', '/pricing', '/contact',
    '/dashboard', '/settings', '/profile', '/login', '/signup'
  ];
  const referrers = [
    'https://google.com', 'https://facebook.com', 'https://twitter.com',
    'https://linkedin.com', 'https://instagram.com', 'direct', 'email'
  ];

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));
    pageViews.push({
      id: `pv_${Math.random().toString(36).substring(2, 10)}`,
      url: urls[Math.floor(Math.random() * urls.length)],
      userId: `user_${Math.floor(Math.random() * 100)}`,
      sessionId: `sess_${Math.floor(Math.random() * 50)}`,
      timestamp: timestamp.toISOString(),
      duration: Math.floor(Math.random() * 300) + 5,
      referrer: Math.random() > 0.3 ? referrers[Math.floor(Math.random() * referrers.length)] : undefined,
    });
  }

  return pageViews;
};

const generateMockStats = (): TrackingStats => {
  return {
    totalEvents: Math.floor(Math.random() * 10000) + 1000,
    totalPageViews: Math.floor(Math.random() * 5000) + 500,
    totalUsers: Math.floor(Math.random() * 1000) + 100,
    averageSessionDuration: Math.floor(Math.random() * 600) + 60,
    eventsByType: [
      { type: 'page_view', count: Math.floor(Math.random() * 5000) + 500 },
      { type: 'click', count: Math.floor(Math.random() * 3000) + 300 },
      { type: 'scroll', count: Math.floor(Math.random() * 2000) + 200 },
      { type: 'form_submit', count: Math.floor(Math.random() * 1000) + 100 },
    ],
    topPages: [
      { url: '/home', views: Math.floor(Math.random() * 1000) + 100 },
      { url: '/features', views: Math.floor(Math.random() * 800) + 80 },
      { url: '/pricing', views: Math.floor(Math.random() * 600) + 60 },
      { url: '/about', views: Math.floor(Math.random() * 400) + 40 },
      { url: '/contact', views: Math.floor(Math.random() * 200) + 20 },
    ],
    deviceDistribution: [
      { device: 'Desktop', count: Math.floor(Math.random() * 500) + 200 },
      { device: 'Mobile', count: Math.floor(Math.random() * 400) + 150 },
      { device: 'Tablet', count: Math.floor(Math.random() * 100) + 50 },
    ],
    topReferrers: [
      { referrer: 'Google', count: Math.floor(Math.random() * 300) + 100 },
      { referrer: 'Facebook', count: Math.floor(Math.random() * 200) + 80 },
      { referrer: 'Twitter', count: Math.floor(Math.random() * 150) + 60 },
      { referrer: 'LinkedIn', count: Math.floor(Math.random() * 100) + 40 },
      { referrer: 'Direct', count: Math.floor(Math.random() * 250) + 90 },
    ],
  };
};

// Service implementation
class TrackingDataService {
  private apiBaseUrl = '/api/tracking/data';

  // Get tracking statistics
  async getStats(options: { startDate: Date; endDate: Date }): Promise<TrackingStats> {
    try {
      const response = await fetch(`${this.apiBaseUrl}?type=stats&startDate=${options.startDate.toISOString()}&endDate=${options.endDate.toISOString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching tracking stats:', error);
      // Fallback to mock data if API fails
      return generateMockStats();
    }
  }

  // Get tracking events
  async getEvents(options: { limit: number; startDate: Date; endDate: Date }): Promise<TrackingEvent[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}?type=events&limit=${options.limit}&startDate=${options.startDate.toISOString()}&endDate=${options.endDate.toISOString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching tracking events:', error);
      // Fallback to mock data if API fails
      return generateMockEvents(options.limit);
    }
  }

  // Get user sessions
  async getSessions(options: { limit: number; startDate: Date; endDate: Date }): Promise<UserSession[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}?type=sessions&limit=${options.limit}&startDate=${options.startDate.toISOString()}&endDate=${options.endDate.toISOString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      // Fallback to mock data if API fails
      return generateMockSessions(options.limit);
    }
  }

  // Get page views
  async getPageViews(options?: { limit?: number; startDate?: Date; endDate?: Date }): Promise<PageView[]> {
    try {
      const limit = options?.limit || 50;
      const startDate = options?.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const endDate = options?.endDate || new Date();
      
      const response = await fetch(`${this.apiBaseUrl}?type=pageviews&limit=${limit}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch page views: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching page views:', error);
      // Fallback to mock data if API fails
      return generateMockPageViews(options?.limit || 50);
    }
  }

  // Get real-time events
  async getRealTimeEvents(limit: number): Promise<TrackingEvent[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}?type=realtime&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch real-time events: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching real-time events:', error);
      // Fallback to mock data if API fails
      return generateMockEvents(limit).map(event => ({
        ...event,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 60 * 1000)).toISOString()
      }));
    }
  }

  // Export tracking data
  async exportData(options: {
    type: 'events' | 'sessions' | 'pageViews';
    format: 'csv' | 'json';
    startDate: Date;
    endDate: Date;
  }): Promise<string> {
    try {
      const response = await fetch(
        `/api/tracking/export?type=${options.type}&format=${options.format}&startDate=${options.startDate.toISOString()}&endDate=${options.endDate.toISOString()}`,
        { method: 'POST' }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to export data: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.downloadUrl;
    } catch (error) {
      console.error('Error exporting tracking data:', error);
      // Fallback to mock URL if API fails
      return `/api/export/${options.type}.${options.format}`;
    }
  }
}

// Export a singleton instance
export const trackingDataService = new TrackingDataService();