/**
 * Tracking Service
 * 
 * This service handles all tracking-related functionality including:
 * - User interaction logging
 * - Chat history tracking
 * - Privacy-preserving data collection
 * - Analytics event transmission
 */

// Define interfaces for tracking data
export interface UserInteraction {
  userId?: string;
  sessionId: string;
  eventType: string;
  eventData: Record<string, any>;
  timestamp: number;
  page?: string;
  referrer?: string;
  userAgent?: string;
}

export interface ChatInteraction extends UserInteraction {
  messageId: string;
  role: 'user' | 'assistant';
  content: string;
  responseTime?: number;
}

// Privacy settings interface
export interface PrivacySettings {
  doNotTrack: boolean;
  anonymizeIp: boolean;
  cookieConsent: boolean;
}

// Default privacy settings
const defaultPrivacySettings: PrivacySettings = {
  doNotTrack: false,
  anonymizeIp: true,
  cookieConsent: false
};

// Class to handle all tracking functionality
export class TrackingService {
  private static instance: TrackingService;
  private sessionId: string;
  private userId?: string;
  private privacySettings: PrivacySettings;
  private endpoint: string = '/api/tracking';
  private queue: UserInteraction[] = [];
  private flushInterval: number = 5000; // 5 seconds
  private intervalId?: NodeJS.Timeout;
  private isInitialized: boolean = false;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.privacySettings = { ...defaultPrivacySettings };
    this.checkDoNotTrack();
    this.isInitialized = false;
  }

  /**
   * Get the singleton instance of the tracking service
   */
  public static getInstance(): TrackingService {
    if (!TrackingService.instance) {
      TrackingService.instance = new TrackingService();
    }
    return TrackingService.instance;
  }

  /**
   * Initialize the tracking service
   * @param userId Optional user ID for authenticated users
   * @param settings Optional privacy settings
   */
  public initialize(userId?: string, settings?: Partial<PrivacySettings>): void {
    if (this.isInitialized) return;

    this.userId = userId;
    if (settings) {
      this.privacySettings = { ...this.privacySettings, ...settings };
    }

    // Start the queue flush interval
    this.intervalId = setInterval(() => this.flushQueue(), this.flushInterval);

    // Track initialization event
    this.trackEvent('system', 'initialize', { userId: this.userId });

    this.isInitialized = true;
    console.log('Tracking service initialized', { userId, settings });
  }

  /**
   * Clean up resources when the service is no longer needed
   */
  public dispose(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.flushQueue(true); // Force flush the queue
  }

  /**
   * Track a user event
   * @param category Event category
   * @param action Event action
   * @param data Additional event data
   */
  public trackEvent(category: string, action: string, data: Record<string, any> = {}): void {
    if (!this.shouldTrack()) return;

    const event: UserInteraction = {
      userId: this.anonymizeUserId(),
      sessionId: this.sessionId,
      eventType: `${category}:${action}`,
      eventData: this.sanitizeData(data),
      timestamp: Date.now(),
      page: typeof window !== 'undefined' ? window.location.pathname : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };

    this.queueEvent(event);
  }

  /**
   * Track a chat message
   * @param messageId Unique ID for the message
   * @param role Role of the message sender (user or assistant)
   * @param content Content of the message
   * @param responseTime Optional response time in milliseconds
   */
  public trackChatMessage(messageId: string, role: 'user' | 'assistant', content: string, responseTime?: number): void {
    if (!this.shouldTrack()) return;

    const chatEvent: ChatInteraction = {
      userId: this.anonymizeUserId(),
      sessionId: this.sessionId,
      messageId,
      eventType: 'chat:message',
      role,
      content: this.privacySettings.anonymizeIp ? this.redactSensitiveInfo(content) : content,
      responseTime,
      eventData: { role, responseTime },
      timestamp: Date.now(),
      page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    };

    this.queueEvent(chatEvent);
  }

  /**
   * Track a page view
   * @param page Page path
   * @param referrer Referrer URL
   */
  public trackPageView(page?: string, referrer?: string): void {
    if (!this.shouldTrack()) return;

    const pageUrl = page || (typeof window !== 'undefined' ? window.location.pathname : '');
    const refUrl = referrer || (typeof document !== 'undefined' ? document.referrer : '');

    this.trackEvent('page', 'view', {
      page: pageUrl,
      referrer: refUrl,
      title: typeof document !== 'undefined' ? document.title : '',
    });
  }

  /**
   * Update privacy settings
   * @param settings New privacy settings
   */
  public updatePrivacySettings(settings: Partial<PrivacySettings>): void {
    this.privacySettings = { ...this.privacySettings, ...settings };
    this.trackEvent('system', 'privacy_update', { settings });
  }

  /**
   * Check if the user has enabled Do Not Track
   */
  private checkDoNotTrack(): void {
    if (typeof navigator !== 'undefined' && navigator.doNotTrack === '1') {
      this.privacySettings.doNotTrack = true;
    }
  }

  /**
   * Determine if tracking should occur based on privacy settings
   */
  private shouldTrack(): boolean {
    return !this.privacySettings.doNotTrack && 
           (this.privacySettings.cookieConsent || !this.requiresConsent());
  }

  /**
   * Check if consent is required based on region
   */
  private requiresConsent(): boolean {
    // Simplified implementation - in production, this would check user's region
    // against regions requiring explicit consent (e.g., EU for GDPR)
    return false;
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Anonymize user ID if privacy settings require it
   */
  private anonymizeUserId(): string | undefined {
    if (!this.userId) return undefined;
    if (this.privacySettings.anonymizeIp) {
      // Hash the user ID to anonymize it
      return this.hashString(this.userId);
    }
    return this.userId;
  }

  /**
   * Simple string hashing function
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * Sanitize data to remove sensitive information
   */
  private sanitizeData(data: Record<string, any>): Record<string, any> {
    const sanitized = { ...data };
    
    // Remove known sensitive fields
    const sensitiveFields = ['password', 'token', 'credit_card', 'ssn', 'email'];
    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  /**
   * Redact potentially sensitive information from text
   */
  private redactSensitiveInfo(text: string): string {
    // Redact email addresses
    let redacted = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL REDACTED]');
    
    // Redact phone numbers (simple pattern)
    redacted = redacted.replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[PHONE REDACTED]');
    
    // Redact credit card numbers (simple pattern)
    redacted = redacted.replace(/\b(?:\d{4}[- ]?){3}\d{4}\b/g, '[CREDIT CARD REDACTED]');
    
    return redacted;
  }

  /**
   * Add an event to the queue
   */
  private queueEvent(event: UserInteraction): void {
    this.queue.push(event);
    
    // If queue is getting large, flush it immediately
    if (this.queue.length >= 10) {
      this.flushQueue();
    }
  }

  /**
   * Send queued events to the server
   */
  private flushQueue(force: boolean = false): void {
    if (this.queue.length === 0) return;
    if (!force && !this.isOnline()) {
      // Don't flush if offline unless forced
      return;
    }

    const events = [...this.queue];
    this.queue = [];

    // Try to use sendBeacon for reliability during page unload
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ events })], { type: 'application/json' });
      const success = navigator.sendBeacon(this.endpoint, blob);
      
      if (success) return;
      // Fall back to fetch if sendBeacon fails
    }

    // Use fetch API as fallback
    if (typeof fetch !== 'undefined') {
      fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
        // Keep-alive to improve reliability
        keepalive: true,
      }).catch(err => {
        console.error('Error sending tracking data:', err);
        // Put events back in the queue if sending failed
        this.queue = [...events, ...this.queue];
      });
    }
  }

  /**
   * Check if the browser is online
   */
  private isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }
}

// Export a singleton instance
export const trackingService = TrackingService.getInstance();

// Helper functions for common tracking operations
export function trackEvent(category: string, action: string, data: Record<string, any> = {}): void {
  trackingService.trackEvent(category, action, data);
}

export function trackChatMessage(messageId: string, role: 'user' | 'assistant', content: string, responseTime?: number): void {
  trackingService.trackChatMessage(messageId, role, content, responseTime);
}

export function trackPageView(page?: string, referrer?: string): void {
  trackingService.trackPageView(page, referrer);
}