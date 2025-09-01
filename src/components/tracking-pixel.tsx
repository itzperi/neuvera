"use client";

import { useEffect, useRef, useCallback } from "react";
import Script from "next/script";

interface TrackingEvent {
  event: string;
  page?: string;
  referrer?: string;
  timestamp?: number;
  userAgent?: string;
  sessionId?: string;
  userId?: string;
  data?: Record<string, any>;
}

interface TrackingPixelProps {
  endpoint?: string;
  pixelId?: string;
  sessionTimeout?: number;
  respectDoNotTrack?: boolean;
  requireConsent?: boolean;
  debug?: boolean;
  className?: string;
}

// Generate a secure session ID
const generateSessionId = (): string => {
  const array = new Uint8Array(16);
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto.getRandomValues
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Hash function for privacy-compliant identifiers
const hashString = async (str: string): Promise<string> => {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Simple fallback hash for environments without SubtleCrypto
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
};

export default function TrackingPixel({
  endpoint = "/api/tracking",
  pixelId = "px_default",
  sessionTimeout = 30 * 60 * 1000, // 30 minutes
  respectDoNotTrack = true,
  requireConsent = true,
  debug = false,
  className = "",
}: TrackingPixelProps) {
  const sessionIdRef = useRef<string | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const consentRef = useRef<boolean>(false);
  const pendingEventsRef = useRef<TrackingEvent[]>([]);

  // Check if tracking is allowed
  const isTrackingAllowed = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    
    // Check Do Not Track preference
    if (respectDoNotTrack && navigator.doNotTrack === "1") {
      if (debug) console.log("Tracking blocked by Do Not Track preference");
      return false;
    }
    
    // Check consent requirement
    if (requireConsent && !consentRef.current) {
      // Check for consent in localStorage or cookies
      const consent = localStorage.getItem("tracking-consent");
      if (consent !== "granted") {
        if (debug) console.log("Tracking blocked - consent required");
        return false;
      }
      consentRef.current = true;
    }
    
    return true;
  }, [respectDoNotTrack, requireConsent, debug]);

  // Get or create session ID
  const getSessionId = useCallback((): string => {
    if (typeof window === "undefined") return "";
    
    const now = Date.now();
    const lastActivity = lastActivityRef.current;
    
    // Check if session has expired
    if (sessionIdRef.current && (now - lastActivity) > sessionTimeout) {
      sessionIdRef.current = null;
      if (debug) console.log("Session expired, generating new session ID");
    }
    
    // Generate new session ID if needed
    if (!sessionIdRef.current) {
      sessionIdRef.current = generateSessionId();
      if (debug) console.log("Generated new session ID:", sessionIdRef.current);
    }
    
    lastActivityRef.current = now;
    return sessionIdRef.current;
  }, [sessionTimeout, debug]);

  // Send tracking data
  const sendTrackingData = useCallback(async (events: TrackingEvent[]): Promise<void> => {
    if (!isTrackingAllowed() || events.length === 0) return;
    
    try {
      const sessionId = await hashString(getSessionId());
      
      const payload = {
        events: events.map(event => ({
          ...event,
          sessionId,
          timestamp: event.timestamp || Date.now(),
          userAgent: navigator.userAgent,
          page: window.location.pathname,
          referrer: document.referrer || undefined,
        })),
        metadata: {
          url: window.location.href,
          timestamp: Date.now(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          screen: {
            width: window.screen.width,
            height: window.screen.height,
          },
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        },
      };

      if (debug) {
        console.log("Sending tracking data:", payload);
      }

      // Use sendBeacon for optimal performance and reliability
      if (navigator.sendBeacon) {
        const success = navigator.sendBeacon(
          endpoint,
          JSON.stringify(payload)
        );
        if (!success && debug) {
          console.warn("sendBeacon failed, falling back to fetch");
          throw new Error("sendBeacon failed");
        }
      } else {
        throw new Error("sendBeacon not available");
      }
    } catch (error) {
      if (debug) console.warn("sendBeacon failed, using fetch fallback:", error);
      
      // Fallback to fetch with keepalive
      try {
        const sessionId = await hashString(getSessionId());
        
        await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            events: events.map(event => ({
              ...event,
              sessionId,
              timestamp: event.timestamp || Date.now(),
              userAgent: navigator.userAgent,
              page: window.location.pathname,
              referrer: document.referrer || undefined,
            })),
          }),
          keepalive: true,
        });
      } catch (fetchError) {
        if (debug) console.error("Failed to send tracking data:", fetchError);
      }
    }
  }, [endpoint, isTrackingAllowed, getSessionId, debug]);

  // Track a single event
  const trackEvent = useCallback((eventData: TrackingEvent): void => {
    if (!isTrackingAllowed()) {
      if (debug) console.log("Event tracking blocked:", eventData.event);
      return;
    }

    const event: TrackingEvent = {
      ...eventData,
      timestamp: eventData.timestamp || Date.now(),
    };

    if (debug) console.log("Tracking event:", event);
    
    // Add to pending events for batching
    pendingEventsRef.current.push(event);
    
    // Send immediately for critical events, otherwise batch
    const criticalEvents = ['page_view', 'user_signup', 'purchase', 'error'];
    if (criticalEvents.includes(event.event)) {
      sendTrackingData([event]);
      pendingEventsRef.current = pendingEventsRef.current.filter(e => e !== event);
    }
  }, [isTrackingAllowed, sendTrackingData, debug]);

  // Batch send pending events
  const flushEvents = useCallback((): void => {
    if (pendingEventsRef.current.length > 0) {
      sendTrackingData([...pendingEventsRef.current]);
      pendingEventsRef.current = [];
    }
  }, [sendTrackingData]);

  // Initialize tracking and set up event listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Track initial page view
    trackEvent({
      event: "page_view",
    });

    // Set up automatic event detection
    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const href = target.getAttribute('href');
      const text = target.textContent?.trim().substring(0, 100);
      
      trackEvent({
        event: "click",
        data: {
          element: tagName,
          text,
          href,
          className: target.className,
          id: target.id,
        },
      });
    };

    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent >= 25 && scrollPercent < 50) {
        trackEvent({ event: "scroll_25" });
      } else if (scrollPercent >= 50 && scrollPercent < 75) {
        trackEvent({ event: "scroll_50" });
      } else if (scrollPercent >= 75) {
        trackEvent({ event: "scroll_75" });
      }
    };

    const handleVisibilityChange = () => {
      trackEvent({
        event: document.hidden ? "page_hidden" : "page_visible",
      });
    };

    const handleBeforeUnload = () => {
      trackEvent({ event: "page_unload" });
      flushEvents();
    };

    // Add event listeners
    document.addEventListener('click', handleClick, true);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Set up periodic event flushing
    const flushInterval = setInterval(flushEvents, 5000); // Flush every 5 seconds

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(flushInterval);
      flushEvents(); // Final flush on cleanup
    };
  }, [trackEvent, flushEvents]);

  // Expose tracking methods globally for custom events
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Expose tracking API
    (window as any).neuvera_track = {
      event: trackEvent,
      setConsent: (granted: boolean) => {
        consentRef.current = granted;
        if (typeof window !== "undefined") {
          localStorage.setItem("tracking-consent", granted ? "granted" : "denied");
        }
        if (debug) console.log("Tracking consent set to:", granted);
      },
      getSessionId: () => sessionIdRef.current,
      flush: flushEvents,
    };

    // Check for existing consent
    if (typeof window !== "undefined") {
      const existingConsent = localStorage.getItem("tracking-consent");
      if (existingConsent === "granted") {
        consentRef.current = true;
      }
    }
  }, [trackEvent, flushEvents, debug]);

  // Initialize tracking script
  useEffect(() => {
    // Add pixelId to URL if not already present
    if (typeof window !== "undefined" && !window.location.search.includes('id=') && pixelId) {
      const url = new URL(window.location.href);
      url.searchParams.set('id', pixelId);
      window.history.replaceState({}, '', url);
    }
  }, [pixelId]);

  // This component renders nothing visible - it's just the tracking logic
  return (
    <>
      <div className={`hidden ${className}`} aria-hidden="true" />
      <Script
        src="/js/pixel.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (debug) console.log('Neuvera tracking pixel loaded');
        }}
      />
    </>
  );
}

// Export utility functions for manual tracking
export const trackCustomEvent = (event: string, data?: Record<string, any>) => {
  if (typeof window !== "undefined" && (window as any).neuvera_track) {
    (window as any).neuvera_track.event({ event, data });
  }
};

export const setTrackingConsent = (granted: boolean) => {
  if (typeof window !== "undefined" && (window as any).neuvera_track) {
    (window as any).neuvera_track.setConsent(granted);
  }
};

export const flushTrackingEvents = () => {
  if (typeof window !== "undefined" && (window as any).neuvera_track) {
    (window as any).neuvera_track.flush();
  }
};