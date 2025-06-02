export interface SessionMetadata {
  sessionID: string;
  createdAt: string;
  userAgent: string;
  platform: string;
  language: string;
  timestamp: number;
}

export interface SessionValidationError {
  field: string;
  message: string;
}

export interface BrowserCapabilities {
  webCrypto: boolean;
  sessionStorage: boolean;
  localStorage: boolean;
  isSecureContext: boolean;
  userAgent: string;
}

export interface SessionHookReturn {
  sessionID: string | null;
  isLoading: boolean;
  regenerateSession: () => string;
  clearSession: () => void;
  isValid: boolean;
}

export interface QueueEntryProps {
  eventId: string;
  onError?: (error: string) => void;
  onSuccess?: (sessionId: string) => void;
}

export interface QueueApiRequest {
  event_id: string;
  session_id: string;
}

export interface QueueApiResponse {
  message: string;
  user_id: string;
  session_id: string;
  status: string;
}
