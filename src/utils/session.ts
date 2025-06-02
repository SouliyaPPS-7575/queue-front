import { SessionMetadata } from "~/types/session";

export function generateSecureSessionID(): string {
  try {
    // Use Web Crypto API for cryptographically secure random bytes
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);

    // Convert to hex string (matches Go's %x format)
    const hexString: string = Array.from(array, (byte: number) =>
      byte.toString(16).padStart(2, '0')
    ).join('');

    return `session_${hexString}`;
  } catch (error) {
    console.warn('Web Crypto API not available, falling back to less secure method:', error);

    // Fallback for older browsers or non-HTTPS environments
    return generateFallbackSessionID();
  }
}

/**
 * Fallback session ID generation for environments without Web Crypto API
 * Less secure but better than nothing
 */
function generateFallbackSessionID(): string {
  const timestamp: number = Date.now();
  const randomPart: string = Math.random().toString(36).substring(2, 15);
  const randomPart2: string = Math.random().toString(36).substring(2, 15);

  return `session_${timestamp}_${randomPart}${randomPart2}`;
}

/**
 * Validate session ID format
 * Should match the validation on Go backend
 */
export function isValidSessionID(sessionID: string | null | undefined): sessionID is string {
  if (!sessionID || typeof sessionID !== 'string') {
    return false;
  }

  // Check length (should be reasonable)
  if (sessionID.length < 10 || sessionID.length > 128) {
    return false;
  }

  // Should start with "session_"
  if (!sessionID.startsWith('session_')) {
    return false;
  }

  // Should contain only alphanumeric characters, hyphens, and underscores
  const validPattern: RegExp = /^[a-zA-Z0-9_-]+$/;
  return validPattern.test(sessionID);
}

/**
 * Generate session with additional metadata
 * Useful for debugging and analytics
 */
export function generateSessionWithMetadata(): SessionMetadata {
  const sessionID: string = generateSecureSessionID();

  return {
    sessionID,
    createdAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    timestamp: Date.now(),
    // Don't include sensitive info like IP address client-side
  };
}

/**
 * Session storage utilities
 */
export const SessionStorage = {
  // Store session in sessionStorage (clears on tab close)
  store(sessionID: string): void {
    try {
      sessionStorage.setItem('queue_session_id', sessionID);
      sessionStorage.setItem('queue_session_created', Date.now().toString());
    } catch (error) {
      console.error('Failed to store session ID:', error);
    }
  },

  // Retrieve session from storage
  retrieve(): string | null {
    try {
      const sessionID: string | null = sessionStorage.getItem('queue_session_id');
      const createdAt: string | null = sessionStorage.getItem('queue_session_created');

      if (!sessionID) {
        return null;
      }

      // Check if session is too old (optional)
      const maxAge: number = 24 * 60 * 60 * 1000; // 24 hours
      if (createdAt && (Date.now() - parseInt(createdAt, 10)) > maxAge) {
        this.clear();
        return null;
      }

      return sessionID;
    } catch (error) {
      console.error('Failed to retrieve session ID:', error);
      return null;
    }
  },

  // Clear session from storage
  clear(): void {
    try {
      sessionStorage.removeItem('queue_session_id');
      sessionStorage.removeItem('queue_session_created');
    } catch (error) {
      console.error('Failed to clear session ID:', error);
    }
  },

  // Get or create session
  getOrCreate(): string {
    let sessionID: string | null = this.retrieve();

    if (!sessionID || !isValidSessionID(sessionID)) {
      sessionID = generateSecureSessionID();
      this.store(sessionID);
    }

    return sessionID;
  }
};
