import { useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { getToken } from '~/server/auth';
import PubNub from 'pubnub';

interface QueuePageProps {
  eventId: string;
  sessionId: string;
  customerId: string;
  onNext: (step: string) => void;
}


const API_BASE = process.env.API_BASE ?? `${process.env.BASE_URL}/api/v1`;

const api = {
  enterQueue: async ({
    sessionId,
    eventId,
  }: {
    sessionId: string;
    eventId: string;
  }) => {
    const { token } = await getToken();
    const response = await fetch(`${API_BASE}/queue/enter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ session_id: sessionId, event_id: eventId }),
    });
    if (!response.ok) throw new Error('Failed to enter queue');
    return response.json();
  },

  getQueuePosition: async ({
    eventId,
  }: {
    eventId: string;
  }) => {
    const { token } = await getToken();
    const response = await fetch(
      `${API_BASE}/queue/position?event_id=${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    if (!response.ok) throw new Error('Failed to get queue status');
    return response.json();
  },
};

interface PubNubConfig {
  publishKey: string;
  subscribeKey: string;
  userId: string;
}

// Environment variable validation
const getPubNubConfig = (customerId: string): PubNubConfig | null => {
  const publishKey = process.env.NEXT_PUBLIC_PUBNUB_PUBLISH_KEY ||
    process.env.REACT_APP_PUBNUB_PUBLISH_KEY ||
    process.env.PN_PUBLISH;

  const subscribeKey = process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY ||
    process.env.REACT_APP_PUBNUB_SUBSCRIBE_KEY ||
    process.env.PN_SUBSCRIBE;

  if (!publishKey || !subscribeKey) {
    console.error('PubNub configuration missing:', {
      publishKey: !!publishKey,
      subscribeKey: !!subscribeKey
    });
    return null;
  }

  return {
    publishKey,
    subscribeKey,
    userId: customerId || `anonymous-${Date.now()}`
  };
};

const usePubNub = (
  customerId: string,
  onMessage: (message: any) => void,
  options?: {
    enablePresence?: boolean;
    heartbeatInterval?: number;
    reconnect?: boolean;
  }
) => {
  const pubnubRef = useRef<PubNub | null>(null);
  const isConnectedRef = useRef(false);

  // Memoized message handler to prevent unnecessary re-subscriptions
  const handleMessage = useCallback((messageEvent: any) => {
    try {
      onMessage(messageEvent.message);
    } catch (error) {
      console.error('Error handling PubNub message:', error);
    }
  }, [onMessage]);

  // Status handler for connection events
  const handleStatus = useCallback((statusEvent: any) => {
    console.log('PubNub status:', statusEvent);

    switch (statusEvent.category) {
      case 'PNConnectedCategory':
        isConnectedRef.current = true;
        console.log('PubNub connected successfully');
        break;
      case 'PNDisconnectedCategory':
        isConnectedRef.current = false;
        console.log('PubNub disconnected');
        break;
      case 'PNReconnectedCategory':
        isConnectedRef.current = true;
        console.log('PubNub reconnected');
        break;
      case 'PNNetworkDownCategory':
        isConnectedRef.current = false;
        console.warn('PubNub network is down');
        break;
      case 'PNNetworkUpCategory':
        console.log('PubNub network is back up');
        break;
      default:
        console.log('PubNub status update:', statusEvent.category);
    }
  }, []);

  useEffect(() => {
    // Validate customer ID
    if (!customerId) {
      console.warn('PubNub hook: customerId is required');
      return;
    }

    // Get and validate configuration
    const config = getPubNubConfig(customerId);
    if (!config) {
      console.error('Failed to initialize PubNub due to missing configuration');
      return;
    }

    // Initialize PubNub
    try {
      const pubnub = new PubNub({
        publishKey: config.publishKey,
        subscribeKey: config.subscribeKey,
        userId: config.userId,
        // Optional configuration
        restore: options?.reconnect ?? true,
        heartbeatInterval: options?.heartbeatInterval ?? 60,
        presenceTimeout: 120,
        keepAlive: true,
        suppressLeaveEvents: false,
      });

      pubnubRef.current = pubnub;

      // Set up event listeners
      pubnub.addListener({
        message: handleMessage,
        status: handleStatus,
        presence: (presenceEvent) => {
          console.log('PubNub presence:', presenceEvent);
        }
      });

      // Subscribe to customer channel
      const channelName = `customer-${customerId}`;

      pubnub.subscribe({
        channels: [channelName],
        withPresence: options?.enablePresence ?? false
      });

      console.log(`PubNub subscribed to channel: ${channelName}`);

    } catch (error) {
      console.error('Failed to initialize PubNub:', error);
    }

    // Cleanup function
    return () => {
      if (pubnubRef.current) {
        try {
          const channelName = `customer-${customerId}`;
          pubnubRef.current.unsubscribe({
            channels: [channelName]
          });

          pubnubRef.current.removeAllListeners();
          pubnubRef.current.stop();
          pubnubRef.current = null;
          isConnectedRef.current = false;

          console.log('PubNub cleaned up successfully');
        } catch (error) {
          console.error('Error during PubNub cleanup:', error);
        }
      }
    };
  }, [customerId, handleMessage, handleStatus, options]);

  // Return connection status and utilities
  return {
    isConnected: isConnectedRef.current,
    pubnub: pubnubRef.current,
    // Utility method to publish messages (if needed)
    publish: useCallback((channel: string, message: any) => {
      if (pubnubRef.current) {
        return pubnubRef.current.publish({
          channel,
          message
        });
      }
      return Promise.reject(new Error('PubNub not initialized'));
    }, [])
  };
};



interface QueuePosition {
  position: number;
  estimated_wait_time_minutes: number;
  status: 'waiting' | 'processing' | 'error';
  can_proceed: boolean;
}

interface PubNubMessage {
  type: 'proceed' | 'queue_update' | 'error';
  data?: any;
}

const QueuePage = ({ eventId, sessionId, customerId, onNext }: QueuePageProps) => {
  const queryClient = useQueryClient();

  // Early return for invalid customer ID
  if (!customerId) {
    console.warn('Customer ID is required');
    return <ErrorState message="Invalid session. Please try again." />;
  }

  // Queue entry mutation
  const enterQueueMutation = useMutation({
    mutationFn: () => api.enterQueue({ sessionId, eventId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queueStatus'] });
    },
    onError: (error) => {
      console.error('Failed to enter queue:', error);
    },
  });

  // Queue position query
  const {
    data: queuePosition,
    isLoading: isQueueLoading,
    error: queueError,
    isError: hasQueueError
  } = useQuery<QueuePosition>({
    queryKey: ['queueStatus', eventId, sessionId],
    queryFn: () => api.getQueuePosition({ eventId }),
    refetchInterval: 4000,
    enabled: !enterQueueMutation.isPending && (enterQueueMutation.isSuccess || enterQueueMutation.isIdle),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Handle PubNub messages
  const handlePubNubMessage = useCallback((message: PubNubMessage) => {
    console.log('PubNub message received:', message);

    switch (message.type) {
      case 'proceed':
        onNext('tickets');
        break;
      case 'queue_update':
        // Optionally invalidate queries to get fresh data
        queryClient.invalidateQueries({ queryKey: ['queueStatus'] });
        break;
      case 'error':
        console.error('Queue error from PubNub:', message.data);
        break;
      default:
        console.warn('Unknown PubNub message type:', message.type);
    }
  }, [onNext, queryClient]);

  // Initialize PubNub connection
  usePubNub(customerId, handlePubNubMessage);

  // Auto-enter queue on mount
  useEffect(() => {
    if (!enterQueueMutation.isSuccess && !enterQueueMutation.isPending) {
      enterQueueMutation.mutate();
    }
  }, [enterQueueMutation]);

  // Handle queue status changes
  useEffect(() => {
    if (queuePosition?.status === 'processing') {
      console.log('Queue position is processing, proceeding to tickets');
      const timer = setTimeout(() => onNext('tickets'), 1000);
      return () => clearTimeout(timer);
    }
  }, [queuePosition?.status, onNext]);

  // Computed values
  const canProceed = queuePosition?.can_proceed || queuePosition?.status === 'processing';
  const isWaiting = queuePosition?.status === 'waiting';
  const hasError = hasQueueError || enterQueueMutation.isError || queuePosition?.status === 'error';

  // Loading state
  if (isQueueLoading || enterQueueMutation.isPending) {
    return <LoadingState message="Entering queue..." />;
  }

  // Error state
  if (hasError) {
    const errorMessage = queueError?.message || enterQueueMutation.error?.message || 'Something went wrong';
    return <ErrorState message={errorMessage} onRetry={() => enterQueueMutation.mutate()} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Users className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">
            You're in the Queue!
          </h1>
        </div>

        <div className="space-y-6">
          {/* Queue Position */}
          <QueuePositionCard position={queuePosition?.position || 0} />

          {/* Wait Time */}
          <WaitTimeCard minutes={queuePosition?.estimated_wait_time_minutes || 0} />

          {/* Status Messages */}
          {canProceed && <ProceedingCard />}
          {isWaiting && <WaitingCard />}

          {/* Instructions */}
          <div className="text-xs text-gray-500 text-center leading-relaxed">
            Please keep this page open. You'll be automatically redirected when it's your turn.
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components for better organization
const LoadingState = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="flex items-center justify-center min-h-screen p-4">
    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Oops!</h2>
      <p className="text-gray-600 mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

const QueuePositionCard = ({ position }: { position: number }) => (
  <div className="bg-purple-50 rounded-lg p-6 text-center">
    <div className="text-4xl font-bold text-purple-600 mb-2">
      #{position}
    </div>
    <p className="text-gray-600">Your position in queue</p>
  </div>
);

const WaitTimeCard = ({ minutes }: { minutes: number }) => (
  <div className="bg-blue-50 rounded-lg p-4 text-center">
    <div className="flex items-center justify-center mb-2">
      <Clock className="w-5 h-5 text-blue-600 mr-2" />
      <span className="text-2xl font-semibold text-blue-600">
        ~{minutes} mins
      </span>
    </div>
    <p className="text-gray-600 text-sm">Estimated wait time</p>
  </div>
);

const ProceedingCard = () => (
  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
    <p className="text-green-800 font-semibold">Ready to proceed!</p>
    <p className="text-green-600 text-sm">
      Redirecting to ticket selection...
    </p>
  </div>
);

const WaitingCard = () => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
    <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
    <p className="text-yellow-800 font-semibold">Please wait</p>
    <p className="text-yellow-600 text-sm">
      We'll notify you when it's your turn
    </p>
  </div>
);

export default QueuePage;
