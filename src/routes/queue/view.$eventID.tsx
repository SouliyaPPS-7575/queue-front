import { useState, useEffect, useRef } from 'react';
import PubNub from 'pubnub';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Clock,
  Users,
  CheckCircle,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { createFileRoute } from '@tanstack/react-router';
import { useSession } from '~/hooks/session';
import { getToken } from '~/server/auth';
import { localStorageData } from '~/server/cache';
import TicketSelectionPage from '~/components/SelectSeat';
import PaymentPage from '~/components/PaymentPage';

export const Route = createFileRoute('/queue/view/$eventID')({
  component: RouteComponent,
});

const API_BASE = process.env.API_BASE ?? `${process.env.BASE_URL}/api/v1`;

interface PaymentPageProps {
  eventId: string;
  sessionId: string;
  paymentId?: string;
  selectedSeat?: {
    id: string;
    row: string;
    number: number;
    price: number;
  };
  onNext: (step: string) => void;
}

interface SimulatePaymentRequest {
  payment_id: string;
  event_id: string;
  session_id: string;
  amount: number;
  seat_ids: string[];
}

interface SimulatePaymentResponse {
  success: boolean;
  payment_id: string;
  message: string;
  status: 'success' | 'failed';
  transaction_id?: string;
}

const api = {
  getWaitingPageInfo: async (eventId: string) => {
    const { token } = await getToken();

    const response = await fetch(`${API_BASE}/events/${eventId}/waiting`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch waiting page info';

      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          errorMessage = await response.text();
        }
      } catch (e) { }

      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      throw new Error('Response is not JSON');
    }
  },

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

  lockSeat: async ({
    eventId,
    seatId,
  }: {
    sessionId: string;
    eventId: string;
    seatId: string;
  }) => {
    const { token } = await getToken();
    const response = await fetch(`${API_BASE}/seats/lock`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_id: eventId,
        seat_id: seatId,
      }),
    });
    if (!response.ok) throw new Error('Failed to lock seat');
    return response.json();
  },

  booking: async ({
    sessionId,
    eventId,
    seatId,
  }: {
    sessionId: string;
    eventId: string;
    seatId: string;
  }) => {
    const { token } = await getToken();
    const response = await fetch(`${API_BASE}/booking/confirm`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId, seatIds: [seatId], event_id: eventId }),
    });
    if (!response.ok) throw new Error('Failed to lock seat');
    return response.json();
  },
  simulatePayment: async (data: SimulatePaymentRequest): Promise<SimulatePaymentResponse> => {
    const response = await fetch('/api/v1/test/simulate-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Payment simulation failed');
    }

    return response.json();
  },
};

const usePubNub = (customerId: string, onMessage: (message: any) => void) => {
  const pubnubRef = useRef<PubNub | null>(null);

  useEffect(() => {
    const pubnub = new PubNub({
      publishKey: 'pub-c-299a157e-7974-497a-b889-80505c899ce8',
      subscribeKey: 'sub-c-0f1fa40a-c489-11ec-a5a3-fed9c56767c0',
      userId: customerId || 'anonymous-user',
    });

    pubnubRef.current = pubnub;

    const channelName = `customer-${customerId}`;

    const messageListener = {
      message: (messageEvent: any) => {
        const { message, channel, publisher } = messageEvent;

        onMessage({
          type: message.type || 'notification',
          message: message.text || message,
          channel,
          publisher,
          timestamp: messageEvent.timetoken,
        });
      },
    };

    pubnub.addListener(messageListener);

    pubnub.subscribe({
      channels: [channelName],
      withPresence: true,
    });

    return () => {
      pubnub.unsubscribe({
        channels: [channelName],
      });

      pubnub.removeListener(messageListener);

      pubnub.destroy();
    };
  }, [customerId, onMessage]);

  return pubnubRef.current;
};

const WaitingPage = ({
  eventId,
  onNext,
}: {
  eventId: string;
  onNext: (step: string) => void;
}) => {
  const [countdown, setCountdown] = useState(0);

  const { data: waitingInfo, isLoading } = useQuery({
    queryKey: ['waitingPage', eventId],
    queryFn: () => api.getWaitingPageInfo(eventId),
    refetchInterval: 1000,
  });

  useEffect(() => {
    if (waitingInfo?.countdown_seconds) {
      setCountdown(waitingInfo.countdown_seconds);
      const timer = setInterval(() => {
        setCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [waitingInfo?.countdown_seconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <Clock className="w-16 h-16 text-blue-600 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Ticket Sale Starting Soon
        </h1>

        {!waitingInfo?.can_enter_queue ? (
          <>
            <div className="text-6xl font-mono font-bold text-blue-600 mb-4">
              {formatTime(countdown)}
            </div>
            <p className="text-gray-600 mb-6">
              Please wait for the countdown to finish before entering the queue
            </p>
            <button
              disabled
              className="w-full bg-gray-300 text-gray-500 py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
            >
              Wait for Sale to Start
            </button>
          </>
        ) : (
          <>
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">
              Ticket sale is now open! Click below to enter the queue.
            </p>
            <button
              onClick={() => onNext('queue')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              Enter Queue
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const QueuePage = ({
  eventId,
  sessionId,
  customerId,
  onNext,
}: {
  eventId: string;
  sessionId: string;
  customerId: string;
  onNext: (step: string) => void;
}) => {
  const queryClient = useQueryClient();

  const enterQueueMutation = useMutation({
    mutationFn: api.enterQueue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queueStatus'] });
    },
  });

  const { data: queuePosition, isLoading: isQueueLoading } = useQuery({
    queryKey: ['queueStatus', eventId, sessionId],
    queryFn: () => api.getQueuePosition({ eventId }),
    refetchInterval: 4000,
    enabled: enterQueueMutation.isSuccess || enterQueueMutation.isIdle,
  });

  if (customerId == "") {
    console.log("=> customer id is empty")
    return
  }

  usePubNub(customerId, (message) => {
    if (message.type === 'proceed') {
      onNext('tickets');
    } else if (message.type === 'queue_update') {
    } else if (message.type === 'error') {
    }
  });

  useEffect(() => {
    if (!enterQueueMutation.isSuccess && !enterQueueMutation.isPending) {
      enterQueueMutation.mutate({ sessionId, eventId });
    }
  }, []);

  useEffect(() => {
    console.log("=> queue position", queuePosition)
    if (queuePosition?.status == "processing") {
      setTimeout(() => onNext('tickets'), 1000);
    }
  }, [queuePosition?.status, onNext]);

  if (isQueueLoading) {
    console.log("=> call loading")
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Entering queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <Users className="w-16 h-16 text-purple-600 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          You're in the Queue!
        </h1>

        <div className="space-y-6">
          <div className="bg-purple-50 rounded-lg p-6">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              #{queuePosition?.position || 0}
            </div>
            <p className="text-gray-600">Your position in queue</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-semibold text-blue-600 mb-1">
              ~{queuePosition?.estimated_wait_time_minutes || 0} mins
            </div>
            <p className="text-gray-600 text-sm">Estimated wait time</p>
          </div>

          {queuePosition?.can_proceed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-semibold">Ready to proceed!</p>
              <p className="text-green-600 text-sm">
                Redirecting to ticket selection...
              </p>
            </div>
          )}

          <div className="text-xs text-gray-500">
            Please keep this page open. You'll be automatically redirected when
            it's your turn.
          </div>
        </div>
      </div>
    </div>
  );
};



function RouteComponent() {
  const [currentStep, setCurrentStep] = useState('waiting');
  const { eventID } = Route.useParams();
  const { sessionID, isLoading: sessionLoading } = useSession();
  // const { customerId, isLoading: customerLoading } = useCustomer();

  // localStorageData('token').getLocalStrage()
  const customerId = localStorageData('customer_id').getLocalStrage()



  if (sessionLoading || !sessionID) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const eventId = eventID;

  const handleNext = (step: string) => setCurrentStep(step);

  switch (currentStep) {
    case 'waiting':
      return <WaitingPage eventId={eventId} onNext={handleNext} />;
    case 'queue':
      return (
        <QueuePage
          eventId={eventId}
          sessionId={sessionID}
          customerId={customerId ?? ''}
          onNext={handleNext}
        />
      );
    case 'tickets':
      return (
        <TicketSelectionPage
          eventId={eventId}
          sessionId={sessionID}
          onNext={handleNext}
        />
      );
    case 'payment':
      return <PaymentPage
        eventId={eventID}
        sessionId={sessionID}
        onNext={handleNext}
      />;
    default:
      return <WaitingPage eventId={eventId} onNext={handleNext} />;
  }
}
