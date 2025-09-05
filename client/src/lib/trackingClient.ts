import { apiRequest } from './queryClient';

export class TrackingClient {
  private pixelId: string;
  private sessionId: string;
  private hasOptedOut: boolean = false;

  constructor() {
    this.pixelId = this.getOrCreatePixelId();
    this.sessionId = this.getOrCreateSessionId();
    this.checkOptOutStatus();
  }

  private getOrCreatePixelId(): string {
    let pixelId = localStorage.getItem('neura_pixel_id');
    if (!pixelId) {
      pixelId = crypto.randomUUID();
      localStorage.setItem('neura_pixel_id', pixelId);
    }
    return pixelId;
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('neura_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('neura_session_id', sessionId);
    }
    return sessionId;
  }

  private checkOptOutStatus(): void {
    this.hasOptedOut = localStorage.getItem('neura_tracking_opt_out') === 'true';
  }

  // Track page view
  trackPageView(url?: string): void {
    if (this.hasOptedOut) return;

    this.trackEvent('page_view', {
      url: url || window.location.href,
      referrer: document.referrer,
    });
  }

  // Track chat interaction
  trackChatInteraction(metadata: {
    messageLength?: number;
    responseTime?: number;
    type?: 'user_message' | 'ai_response';
  }): void {
    if (this.hasOptedOut) return;

    this.trackEvent('chat_interaction', metadata);
  }

  // Track button click
  trackButtonClick(buttonName: string, context?: any): void {
    if (this.hasOptedOut) return;

    this.trackEvent('button_click', {
      buttonName,
      context,
    });
  }

  // Track user engagement
  trackEngagement(eventType: string, duration?: number): void {
    if (this.hasOptedOut) return;

    this.trackEvent('user_engagement', {
      eventType,
      duration,
      timestamp: Date.now(),
    });
  }

  // Generic track event method
  private trackEvent(eventType: string, metadata?: any): void {
    if (this.hasOptedOut) return;

    const eventData = {
      pixelId: this.pixelId,
      eventType,
      currentUrl: window.location.href,
      referrerUrl: document.referrer || null,
      sessionId: this.sessionId,
      hashedUserId: this.getUserId(),
      metadata,
    };

    // Use sendBeacon for better reliability
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(eventData)], {
        type: 'application/json',
      });
      navigator.sendBeacon('/api/track', blob);
    } else {
      // Fallback to fetch
      fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Pixel-ID': this.pixelId,
          'X-Session-ID': this.sessionId,
        },
        body: JSON.stringify(eventData),
        keepalive: true,
      }).catch(error => {
        console.warn('Tracking request failed:', error);
      });
    }
  }

  // Get hashed user ID if user is logged in
  private getUserId(): string | null {
    const userStr = localStorage.getItem('chatbot_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Hash the user ID for privacy
        return btoa(user.id.toString()); // Simple base64 encoding, should use SHA-256 in production
      } catch {
        return null;
      }
    }
    return null;
  }

  // Privacy compliance methods
  optOut(): void {
    this.hasOptedOut = true;
    localStorage.setItem('neura_tracking_opt_out', 'true');
    
    // Also notify the server
    const userId = this.getUserId();
    if (userId) {
      apiRequest('/api/privacy/opt-out', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }).catch(error => {
        console.error('Failed to opt out on server:', error);
      });
    }
  }

  optIn(): void {
    this.hasOptedOut = false;
    localStorage.removeItem('neura_tracking_opt_out');
  }

  // Get current privacy status
  isOptedOut(): boolean {
    return this.hasOptedOut;
  }

  // Clear all tracking data
  clearData(): void {
    localStorage.removeItem('neura_pixel_id');
    sessionStorage.removeItem('neura_session_id');
    localStorage.removeItem('neura_tracking_opt_out');
    this.pixelId = this.getOrCreatePixelId();
    this.sessionId = this.getOrCreateSessionId();
    this.hasOptedOut = false;
  }
}

// Create singleton instance
export const trackingClient = new TrackingClient();

// Auto-track page views
if (typeof window !== 'undefined') {
  // Track initial page load
  trackingClient.trackPageView();

  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      trackingClient.trackEngagement('page_focus');
    } else {
      trackingClient.trackEngagement('page_blur');
    }
  });

  // Track time spent on page
  let startTime = Date.now();
  window.addEventListener('beforeunload', () => {
    const timeSpent = Date.now() - startTime;
    trackingClient.trackEngagement('page_unload', timeSpent);
  });
}