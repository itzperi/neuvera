/**
 * Neuvera Tracking Pixel
 * 
 * Advanced tracking script for capturing user interactions with privacy protections
 * Supports multiple transmission methods: navigator.sendBeacon() and fetch() API
 */

(function() {
  // Configuration
  const config = {
    endpoint: '/api/tracking/pixel',
    sessionIdKey: 'neuvera_session_id',
    userIdKey: 'neuvera_user_id',
    flushInterval: 5000, // 5 seconds
    maxQueueSize: 10,
    debug: false
  };

  // State
  let queue = [];
  let lastActivity = Date.now();
  let isInitialized = false;
  let intervalId = null;
  let sessionId, userId;
  const privacySettings = {
    doNotTrack: checkDoNotTrack(),
    anonymizeIp: true,
    cookieConsent: checkCookieConsent()
  };
  sessionId = getOrCreateSessionId();
  userId = getUserId();

  // Public API
  window.NeuveraPixel = {
    init: initialize,
    track: trackEvent,
    trackPageView: trackPageView,
    trackClick: trackClick,
    trackForm: trackForm,
    setUserId: setUserId,
    updatePrivacySettings: updatePrivacySettings,
    getSessionId: () => sessionId,
    getUserId: () => userId
  };

  /**
   * Initialize the tracking pixel
   * @param {Object} options - Configuration options
   */
  function initialize(options = {}) {
    if (isInitialized) return;

    // Merge configuration
    Object.assign(config, options);

    // Set up event listeners
    setupEventListeners();

    // Start the queue flush interval
    intervalId = setInterval(flushQueue, config.flushInterval);

    // Track initialization
    trackEvent('system', 'initialize', { 
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: Date.now()
    });

    // Track page view
    trackPageView();

    isInitialized = true;
    debug('Tracking pixel initialized');
  }

  /**
   * Track a custom event
   * @param {string} category - Event category
   * @param {string} action - Event action
   * @param {Object} data - Additional event data
   */
  function trackEvent(category, action, data = {}) {
    if (!shouldTrack()) return;

    const event = {
      type: 'event',
      category,
      action,
      data: sanitizeData(data),
      url: window.location.href,
      path: window.location.pathname,
      timestamp: Date.now(),
      sessionId,
      userId: privacySettings.anonymizeIp ? hashUserId(userId) : userId
    };

    queueEvent(event);
  }

  /**
   * Track a page view
   */
  function trackPageView() {
    if (!shouldTrack()) return;

    trackEvent('page', 'view', {
      title: document.title,
      referrer: document.referrer,
      url: window.location.href
    });
  }

  /**
   * Track a click event
   * @param {Event} e - Click event
   */
  function trackClick(e) {
    if (!shouldTrack()) return;

    const target = e.target;
    const targetElement = target.tagName.toLowerCase();
    const targetId = target.id || '';
    const targetClasses = Array.from(target.classList).join(' ') || '';
    const targetText = target.innerText?.substring(0, 50) || '';
    const targetHref = target.href || target.closest('a')?.href || '';

    trackEvent('interaction', 'click', {
      element: targetElement,
      id: targetId,
      classes: targetClasses,
      text: targetText,
      href: targetHref,
      x: e.clientX,
      y: e.clientY
    });
  }

  /**
   * Track form submissions
   * @param {Event} e - Form submission event
   */
  function trackForm(e) {
    if (!shouldTrack()) return;

    const form = e.target;
    const formId = form.id || '';
    const formAction = form.action || '';
    const formMethod = form.method || 'get';
    const formClasses = Array.from(form.classList).join(' ') || '';

    // Don't track form field values for privacy reasons
    trackEvent('interaction', 'form_submit', {
      formId,
      formAction,
      formMethod,
      formClasses,
      formFields: Array.from(form.elements)
        .filter(el => el.name && !isPasswordField(el))
        .map(el => ({ 
          name: el.name, 
          type: el.type || 'text',
          // Don't include values, just whether they're filled
          filled: !!el.value
        }))
    });
  }

  /**
   * Set or update the user ID
   * @param {string} id - User ID
   */
  function setUserId(id) {
    userId = id;
    if (privacySettings.cookieConsent) {
      setCookie(config.userIdKey, id, 365); // 1 year
    }
    trackEvent('user', 'identify', { userId: id });
  }

  /**
   * Update privacy settings
   * @param {Object} settings - New privacy settings
   */
  function updatePrivacySettings(settings) {
    privacySettings = { ...privacySettings, ...settings };
    
    // If consent was given, set cookies
    if (privacySettings.cookieConsent) {
      if (userId) setCookie(config.userIdKey, userId, 365);
      setCookie(config.sessionIdKey, sessionId, 1); // 1 day
    } else {
      // If consent was revoked, remove cookies
      deleteCookie(config.userIdKey);
      deleteCookie(config.sessionIdKey);
    }
    
    trackEvent('system', 'privacy_update', { settings: privacySettings });
  }

  /**
   * Set up event listeners for automatic tracking
   */
  function setupEventListeners() {
    // Track clicks
    document.addEventListener('click', function(e) {
      // Only track clicks on interactive elements
      const interactiveElements = ['a', 'button', 'input', 'select', 'textarea'];
      const target = e.target.tagName.toLowerCase();
      const parentTarget = e.target.closest('a, button');
      
      if (interactiveElements.includes(target) || parentTarget) {
        trackClick(e);
      }
    });

    // Track form submissions
    document.addEventListener('submit', function(e) {
      trackForm(e);
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', function() {
      trackEvent('page', document.hidden ? 'hide' : 'show', {
        timestamp: Date.now()
      });
    });

    // Track user activity
    document.addEventListener('mousemove', debounce(function() {
      const now = Date.now();
      // Only track if it's been more than 30 seconds since last activity
      if (now - lastActivity > 30000) {
        trackEvent('user', 'activity', { inactive_time: now - lastActivity });
      }
      lastActivity = now;
    }, 1000));

    // Track page unload
    window.addEventListener('beforeunload', function() {
      trackEvent('page', 'unload', { time_on_page: Date.now() - lastActivity });
      flushQueue(true); // Force flush on page unload
    });

    // Track history changes (for SPAs)
    const originalPushState = history.pushState;
    history.pushState = function() {
      originalPushState.apply(this, arguments);
      setTimeout(trackPageView, 0);
    };

    window.addEventListener('popstate', function() {
      setTimeout(trackPageView, 0);
    });
  }

  /**
   * Get or create a session ID
   */
  function getOrCreateSessionId() {
    let id = getCookie(config.sessionIdKey);
    if (!id) {
      id = generateUUID();
      if (privacySettings.cookieConsent) {
        setCookie(config.sessionIdKey, id, 1); // 1 day
      }
    }
    return id;
  }

  /**
   * Get the user ID from cookie if available
   */
  function getUserId() {
    return getCookie(config.userIdKey) || null;
  }

  /**
   * Check if Do Not Track is enabled
   */
  function checkDoNotTrack() {
    return navigator.doNotTrack === '1' || 
           window.doNotTrack === '1' || 
           navigator.msDoNotTrack === '1';
  }

  /**
   * Check if cookie consent has been given
   */
  function checkCookieConsent() {
    // This would typically check a consent management platform
    // For now, we'll just check for a consent cookie
    return !!getCookie('cookie_consent');
  }

  /**
   * Determine if tracking should occur based on privacy settings
   */
  function shouldTrack() {
    return !privacySettings.doNotTrack && 
           (privacySettings.cookieConsent || !requiresConsent());
  }

  /**
   * Check if consent is required based on region
   */
  function requiresConsent() {
    // Simplified implementation - in production, this would check user's region
    // against regions requiring explicit consent (e.g., EU for GDPR)
    return false;
  }

  /**
   * Add an event to the queue
   */
  function queueEvent(event) {
    queue.push(event);
    debug('Event queued', event);
    
    // If queue is getting large, flush it immediately
    if (queue.length >= config.maxQueueSize) {
      flushQueue();
    }
  }

  /**
   * Send queued events to the server
   */
  function flushQueue(force = false) {
    if (queue.length === 0) return;
    if (!force && !navigator.onLine) {
      // Don't flush if offline unless forced
      return;
    }

    const events = [...queue];
    queue = [];

    debug('Flushing queue', events);

    // Try to use sendBeacon for reliability during page unload
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ events })], { type: 'application/json' });
      const success = navigator.sendBeacon(config.endpoint, blob);
      
      if (success) return;
      // Fall back to fetch if sendBeacon fails
    }

    // Use fetch API as fallback
    fetch(config.endpoint, {
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
      queue = [...events, ...queue];
    });
  }

  /**
   * Sanitize data to remove sensitive information
   */
  function sanitizeData(data) {
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
   * Check if a form field is a password field
   */
  function isPasswordField(element) {
    return element.type === 'password' || 
           element.name.toLowerCase().includes('password') || 
           element.id.toLowerCase().includes('password');
  }

  /**
   * Hash a user ID for anonymization
   */
  function hashUserId(id) {
    if (!id) return null;
    
    // Simple string hashing function
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * Generate a UUID v4
   */
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Set a cookie
   */
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
  }

  /**
   * Get a cookie value
   */
  function getCookie(name) {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  /**
   * Delete a cookie
   */
  function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
  }

  /**
   * Debounce function to limit event firing
   */
  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  /**
   * Debug logging
   */
  function debug(message, data) {
    if (config.debug && console) {
      console.log(`[NeuveraPixel] ${message}`, data || '');
    }
  }

  // Auto-initialize if the script has data-auto-init attribute
  if (document.currentScript && document.currentScript.getAttribute('data-auto-init') === 'true') {
    initialize();
  }
})();