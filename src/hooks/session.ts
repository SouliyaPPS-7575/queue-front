import { useState, useEffect, useCallback } from 'react';
import {
  generateSecureSessionID,
  isValidSessionID,
  SessionStorage,
} from '../utils/session';
import { SessionHookReturn } from '~/types/session';

/**
 * Custom React hook for managing queue sessions
 */
export function useSession(): SessionHookReturn {
  const [sessionId, setSessionID] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize or restore session on component mount
  useEffect(() => {
    const initializeSession = (): void => {
      try {
        let storedSessionID: string | null = SessionStorage.retrieve();

        if (!storedSessionID || !isValidSessionID(storedSessionID)) {
          // Generate new session
          storedSessionID = generateSecureSessionID();
          SessionStorage.store(storedSessionID);
          console.log('Generated new session ID');
        } else {
          console.log('Restored existing session ID');
        }

        setSessionID(storedSessionID);
      } catch (error) {
        console.error('Failed to initialize session:', error);
        // Fallback: generate session without storage
        setSessionID(generateSecureSessionID());
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, []);

  // Regenerate session (useful for logout/login)
  const regenerateSession = useCallback((): string => {
    const newSessionID: string = generateSecureSessionID();
    SessionStorage.store(newSessionID);
    setSessionID(newSessionID);
    console.log('Regenerated session ID');
    return newSessionID;
  }, []);

  // Clear session
  const clearSession = useCallback((): void => {
    SessionStorage.clear();
    setSessionID(null);
    console.log('Cleared session ID');
  }, []);

  return {
    sessionID: sessionId,
    isLoading,
    regenerateSession,
    clearSession,
    isValid: sessionId ? isValidSessionID(sessionId) : false,
  };
}
