// src/lib/securityUtils.js
// Security utilities for authentication, rate limiting, and audit logging
// OWASP: A02, A04, A07, A09

import { supabase } from './supabase';

// ============================================================================
// RATE LIMITING
// ============================================================================

/**
 * In-memory rate limiter
 * OWASP A07: Authentication Failures (brute force protection)
 * NOTE: For production, use Redis or similar
 */

const rateLimitMap = new Map();

const RATE_LIMITS = {
  LOGIN_ATTEMPTS: { window: 15 * 60 * 1000, max: 5 }, // 5 attempts per 15 min
  API_CALLS: { window: 60 * 1000, max: 100 }, // 100 calls per minute
  FILE_UPLOAD: { window: 60 * 1000, max: 10 }, // 10 uploads per minute
};

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(identifier, limitType = 'API_CALLS') {
  const config = RATE_LIMITS[limitType];
  if (!config) return { allowed: true };

  const now = Date.now();
  const key = `${limitType}:${identifier}`;

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, { count: 1, startTime: now });
    return { allowed: true };
  }

  const record = rateLimitMap.get(key);

  // Reset window if expired
  if (now - record.startTime > config.window) {
    rateLimitMap.set(key, { count: 1, startTime: now });
    return { allowed: true };
  }

  record.count++;

  if (record.count > config.max) {
    const retryAfter = Math.ceil(
      (config.window - (now - record.startTime)) / 1000
    );
    return {
      allowed: false,
      retryAfter,
      remaining: 0,
    };
  }

  return {
    allowed: true,
    remaining: config.max - record.count,
  };
}

/**
 * Clean up old rate limit entries (call periodically)
 */
export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    const maxWindow = Math.max(
      ...Object.values(RATE_LIMITS).map((r) => r.window)
    );
    if (now - record.startTime > maxWindow) {
      rateLimitMap.delete(key);
    }
  }
}

// Clean up every 10 minutes
setInterval(cleanupRateLimits, 10 * 60 * 1000);

// ============================================================================
// SESSION SECURITY
// ============================================================================

/**
 * Configure session inactivity timeout
 * OWASP A07: Authentication Failures
 */

const SESSION_CONFIG = {
  INACTIVITY_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_SESSION_AGE: 8 * 60 * 60 * 1000, // 8 hours
};

let inactivityTimer;
let sessionStartTime;

export function setupSessionSecurity() {
  sessionStartTime = Date.now();

  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);

    // Check if session is too old
    if (Date.now() - sessionStartTime > SESSION_CONFIG.MAX_SESSION_AGE) {
      handleSessionTimeout('Max session age exceeded');
      return;
    }

    inactivityTimer = setTimeout(() => {
      handleSessionTimeout('Inactivity timeout');
    }, SESSION_CONFIG.INACTIVITY_TIMEOUT);
  }

  function handleSessionTimeout(reason) {
    console.warn(`Session timeout: ${reason}`);
    supabase.auth.signOut();
    localStorage.removeItem('sessionData');
    window.location.href = '/admin/login';
  }

  // Reset timer on user activity
  const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
  activityEvents.forEach((event) => {
    document.addEventListener(event, resetInactivityTimer, { passive: true });
  });

  // Initial timeout set
  resetInactivityTimer();

  return {
    cleanup: () => {
      clearTimeout(inactivityTimer);
      activityEvents.forEach((event) => {
        document.removeEventListener(event, resetInactivityTimer);
      });
    },
  };
}

// ============================================================================
// SECURITY HEADERS
// ============================================================================

/**
 * Inject security headers
 * OWASP A05: Security Misconfiguration
 */
export function setupSecurityHeaders() {
  // Content Security Policy
  if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = [
      "default-src 'self' https:",
      "script-src 'self' 'unsafe-inline'", // Note: unsafe-inline needed for inline React styles
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data: https://fonts.googleapis.com",
      "connect-src 'self' https://xxxxxxxxxxxx.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');
    document.head.appendChild(cspMeta);
  }

  // X-UA-Compatible
  if (!document.querySelector('meta[http-equiv="X-UA-Compatible"]')) {
    const xuaMeta = document.createElement('meta');
    xuaMeta.httpEquiv = 'X-UA-Compatible';
    xuaMeta.content = 'ie=edge';
    document.head.appendChild(xuaMeta);
  }

  // Referrer Policy
  if (!document.querySelector('meta[name="referrer"]')) {
    const refMeta = document.createElement('meta');
    refMeta.name = 'referrer';
    refMeta.content = 'no-referrer';
    document.head.appendChild(refMeta);
  }
}

// ============================================================================
// CREDENTIAL VERIFICATION
// ============================================================================

/**
 * Verify user has admin role before sensitive operations
 * OWASP A01: Broken Access Control
 */
export async function verifyAdminRole() {
  try {
    const { data: session } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      throw new Error('Not authenticated');
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', session.user.id)
      .single();

    if (error || !profile) {
      throw new Error('Profile not found');
    }

    if (profile.role !== 'admin' || !profile.is_active) {
      throw new Error('Insufficient permissions');
    }

    return { valid: true, profile };
  } catch (err) {
    console.error('Admin verification failed:', err);
    return { valid: false, error: err.message };
  }
}

/**
 * Verify user credentials with additional security checks
 * OWASP A07: Authentication Failures
 */
export async function verifyUserCredentials(email, password) {
  // Check rate limit first
  const { allowed, retryAfter } = checkRateLimit(email, 'LOGIN_ATTEMPTS');

  if (!allowed) {
    return {
      success: false,
      error: `Too many attempts. Try again in ${retryAfter} seconds.`,
      locked: true,
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Success
    return {
      success: true,
      session: data.session,
    };
  } catch (err) {
    console.error('Authentication error:', err);
    return {
      success: false,
      error: 'An error occurred during authentication',
    };
  }
}

// ============================================================================
// SECURE STORAGE
// ============================================================================

/**
 * Securely store sensitive client-side data
 * OWASP A02: Cryptographic Failures
 */
export function secureStore(key, value) {
  try {
    // In production, consider using a crypto library like TweetNaCl.js
    const encrypted = btoa(JSON.stringify(value)); // Basic encoding (not encryption)
    sessionStorage.setItem(key, encrypted);
  } catch (err) {
    console.error('Storage error:', err);
  }
}

export function secureRetrieve(key) {
  try {
    const encrypted = sessionStorage.getItem(key);
    if (!encrypted) return null;
    return JSON.parse(atob(encrypted));
  } catch (err) {
    console.error('Retrieval error:', err);
    return null;
  }
}

export function secureRemove(key) {
  sessionStorage.removeItem(key);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  checkRateLimit,
  setupSessionSecurity,
  setupSecurityHeaders,
  verifyAdminRole,
  verifyUserCredentials,
  secureStore,
  secureRetrieve,
  secureRemove,
};
