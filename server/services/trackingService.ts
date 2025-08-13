import crypto from "crypto";
import { storage } from "../storage";
import type { InsertTrackingEvent, InsertAdminLog } from "@shared/schema";

export class TrackingService {
  private static instance: TrackingService;

  static getInstance(): TrackingService {
    if (!TrackingService.instance) {
      TrackingService.instance = new TrackingService();
    }
    return TrackingService.instance;
  }

  // Hash sensitive identifiers using SHA-256
  hashIdentifier(identifier: string): string {
    return crypto.createHash('sha256').update(identifier).digest('hex');
  }

  // Generate secure pixel ID
  generatePixelId(): string {
    return crypto.randomUUID();
  }

  // Generate session ID
  generateSessionId(): string {
    return crypto.randomUUID();
  }

  // Track user interaction event
  async trackEvent(eventData: {
    pixelId: string;
    eventType: string;
    currentUrl: string;
    referrerUrl?: string;
    userAgent?: string;
    userId?: string;
    sessionId: string;
    metadata?: any;
  }): Promise<void> {
    try {
      // Hash user ID if provided for privacy compliance
      const hashedUserId = eventData.userId ? this.hashIdentifier(eventData.userId) : undefined;

      const trackingEvent: InsertTrackingEvent = {
        pixelId: eventData.pixelId,
        eventType: eventData.eventType,
        currentUrl: eventData.currentUrl,
        referrerUrl: eventData.referrerUrl || null,
        userAgent: eventData.userAgent || null,
        hashedUserId: hashedUserId || null,
        sessionId: eventData.sessionId,
        metadata: eventData.metadata || null,
      };

      await storage.createTrackingEvent(trackingEvent);
    } catch (error) {
      console.error("Failed to track event:", error);
      // Don't throw - tracking should not break the application
    }
  }

  // Log admin action for security monitoring
  async logAdminAction(actionData: {
    adminUserId: string;
    action: string;
    targetResource?: string;
    ipAddress: string;
    userAgent?: string;
    success: boolean;
    details?: any;
  }): Promise<void> {
    try {
      const adminLog: InsertAdminLog = {
        adminUserId: actionData.adminUserId,
        action: actionData.action,
        targetResource: actionData.targetResource || null,
        ipAddress: actionData.ipAddress,
        userAgent: actionData.userAgent || null,
        success: actionData.success,
        details: actionData.details || null,
      };

      await storage.createAdminLog(adminLog);
    } catch (error) {
      console.error("Failed to log admin action:", error);
    }
  }

  // Get analytics data (privacy-compliant)
  async getAnalytics(timeRange: { start: Date; end: Date }) {
    try {
      const events = await storage.getTrackingEvents(timeRange);
      
      // Aggregate data without exposing individual user information
      const analytics = {
        totalEvents: events.length,
        eventTypes: this.aggregateEventTypes(events),
        popularPages: this.aggregatePages(events),
        userEngagement: this.calculateEngagementMetrics(events),
        timeRange,
      };

      return analytics;
    } catch (error) {
      console.error("Failed to get analytics:", error);
      throw error;
    }
  }

  private aggregateEventTypes(events: any[]) {
    const eventCounts: Record<string, number> = {};
    events.forEach(event => {
      eventCounts[event.eventType] = (eventCounts[event.eventType] || 0) + 1;
    });
    return eventCounts;
  }

  private aggregatePages(events: any[]) {
    const pageCounts: Record<string, number> = {};
    events.forEach(event => {
      if (event.eventType === 'page_view') {
        const url = new URL(event.currentUrl).pathname;
        pageCounts[url] = (pageCounts[url] || 0) + 1;
      }
    });
    return Object.entries(pageCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
  }

  private calculateEngagementMetrics(events: any[]) {
    const sessions = new Set(events.map(e => e.sessionId));
    const chatInteractions = events.filter(e => e.eventType === 'chat_interaction').length;
    
    return {
      uniqueSessions: sessions.size,
      chatInteractions,
      avgInteractionsPerSession: sessions.size > 0 ? chatInteractions / sessions.size : 0,
    };
  }

  // Check if user has opted out of tracking
  async hasUserOptedOut(userId: string): Promise<boolean> {
    try {
      const user = await storage.getUser(parseInt(userId));
      return user?.optedOut || false;
    } catch {
      return false;
    }
  }

  // Handle user opt-out request
  async optOutUser(userId: string): Promise<void> {
    try {
      await storage.updateUserPrivacySettings(parseInt(userId), { optedOut: true });
    } catch (error) {
      console.error("Failed to opt out user:", error);
      throw error;
    }
  }
}

export const trackingService = TrackingService.getInstance();