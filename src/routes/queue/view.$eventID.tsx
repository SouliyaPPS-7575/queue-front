import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Users, CheckCircle, Lock, CreditCard, AlertCircle } from 'lucide-react';
import { useRef } from 'react';
import PubNub from 'pubnub';
import { localStorageData } from '~/server/cache';
import { getToken } from '~/server/auth';

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/queue/view/$eventID')({
  component: RouteComponent,
})



// Mock API functions (replace with actual API calls)
const API_BASE = process.env.API_BASE ?? `${process.env.BASE_URL}/api/v1`

const api = {
  getWaitingPageInfo: async (eventId: string) => {

    const { token } = await getToken();
    console.log("=> token", token)

    const response = await fetch(`${API_BASE}/events/${eventId}/waiting`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = 'Failed to fetch waiting page info';

      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          errorMessage = await response.text();
        }
      } catch (e) {
        // If parsing fails, use default message
      }

      throw new Error(errorMessage);
    }

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      throw new Error('Response is not JSON');
    }
  },

  enterQueue: async ({ customerId, eventId }: { customerId: string; eventId: string }) => {
    const { token } = await getToken();
    const response = await fetch(`${API_BASE}/queue/enter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ customer_id: customerId, event_id: eventId }),
    });
    if (!response.ok) throw new Error('Failed to enter queue');
    return response.json();
  },

  getQueueStatus: async ({ customerId, eventId }: { customerId: string; eventId: string }) => {
    const { token } = await getToken();
    const response = await fetch(`${API_BASE}/events/${eventId}/queue/status?customer_id=${customerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to get queue status');
    return response.json();
    // return JSON.stringify({ can_proceed: false, position: 2, estimate_wait_time: 4 })
  },

  lockSeat: async ({ customerId, eventId, seatId }: { customerId: string; eventId: string; seatId: string }) => {
    const { token } = await getToken();
    const response = await fetch(`${API_BASE}/seats/lock`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ customer_id: customerId, event_id: eventId, seat_id: seatId }),
    });
    if (!response.ok) throw new Error('Failed to lock seat');
    return response.json();
  },

  booking: async ({ customerId, eventId }: { customerId: string; eventId: string }) => {
    const { token } = await getToken();
    const response = await fetch(`${API_BASE}/events/${eventId}/book`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ customer_id: customerId, event_id: eventId }),
    });
    if (!response.ok) throw new Error('Failed to lock seat');
    return response.json();
  },
};


const usePubNub = (customerId: string, onMessage: (message: any) => void) => {
  const pubnubRef = useRef<PubNub | null>(null);

  useEffect(() => {
    // Initialize PubNub
    const pubnub = new PubNub({
      publishKey: 'pub-c-299a157e-7974-497a-b889-80505c899ce8',
      subscribeKey: 'sub-c-0f1fa40a-c489-11ec-a5a3-fed9c56767c0',
      userId: customerId || 'anonymous-user',
      // Optional: Add UUID for unique identification
      // uuid: customerId,
    });

    pubnubRef.current = pubnub;

    // Define the channel name (customize based on your needs)
    const channelName = `customer-${customerId}`;
    // Or use a general channel: const channelName = 'ticket-notifications';

    // Set up message listener
    const messageListener = {
message: (messageEvent: any) => {
        console.log('=> PubNub message received:', messageEvent);

        // Extract message data
        const { message, channel, publisher } = messageEvent;

        // Call the onMessage callback with the received data
        onMessage({
          type: message.type || 'notification',
          message: message.text || message,
          channel,
          publisher,
          timestamp: messageEvent.timetoken
        });
      },

      // Optional: Handle presence events
presence: (presenceEvent: any) => {
        console.log('PubNub presence event:', presenceEvent);
      },

      // Optional: Handle status events
status: (statusEvent: any) => {
        console.log('PubNub status:', statusEvent);

        if (statusEvent.category === 'PNConnectedCategory') {
          console.log('Connected to PubNub');
        } else if (statusEvent.category === 'PNNetworkDownCategory') {
          console.log('Network is down');
        } else if (statusEvent.category === 'PNNetworkUpCategory') {
          console.log('Network is back up');
        }
      }
    };

    // Add listener
    pubnub.addListener(messageListener);

    // Subscribe to channel
    pubnub.subscribe({
      channels: [channelName],
      withPresence: true // Optional: to track user presence
    });

    console.log(`Subscribed to PubNub channel: ${channelName}`);

    // Cleanup function
    return () => {
      console.log('Cleaning up PubNub subscription');

      // Unsubscribe from channels
      pubnub.unsubscribe({
        channels: [channelName]
      });

      // Remove listener
      pubnub.removeListener(messageListener);

      // Stop PubNub
      pubnub.stop();
    };
  }, [customerId, onMessage]);

  // Return PubNub instance for manual operations if needed
  return pubnubRef.current;
};



// Step 1: Waiting Page Component
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
    refetchInterval: 1000, // Poll every second
  });

  useEffect(() => {
    if (waitingInfo?.countdown_seconds) {
      setCountdown(waitingInfo.countdown_seconds);
      const timer = setInterval(() => {
        setCountdown(prev => Math.max(0, prev - 1));
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Ticket Sale Starting Soon</h1>

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

// Step 2: Queue Page Component
const QueuePage = ({
  eventId,
  customerId,
  onNext,
}: {
  eventId: string;
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

  const { data: queueStatus, isLoading } = useQuery({
    queryKey: ['queueStatus', eventId, customerId],
    queryFn: () => api.getQueueStatus({ customerId, eventId }),
    refetchInterval: 2000, // Poll every 2 seconds
    enabled: !!enterQueueMutation.isSuccess || enterQueueMutation.isIdle,
  });

  usePubNub(customerId, (message) => {
    console.log('=> Received notification:', message);

    if (message.type === 'proceed') {
      onNext('tickets');
    } else if (message.type === 'queue_update') {
      console.log('=> Queue update:', message.message);
    } else if (message.type === 'error') {
      console.error('=> Error notification:', message.message);
    }
  });

  useEffect(() => {
    if (!enterQueueMutation.isSuccess && !enterQueueMutation.isPending) {
      enterQueueMutation.mutate({ customerId, eventId });
    }
  }, []);

  // Auto-proceed when queue status indicates ready
  useEffect(() => {
    if (queueStatus?.can_proceed) {
      console.log("=> step inside: ", queueStatus?.can_proceed)
      setTimeout(() => onNext('tickets'), 1000);
    }
  }, [queueStatus?.can_proceed, onNext]);

  if (enterQueueMutation.isPending || isLoading) {
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">You're in the Queue!</h1>

        <div className="space-y-6">
          <div className="bg-purple-50 rounded-lg p-6">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              #{queueStatus?.position || 0}
            </div>
            <p className="text-gray-600">Your position in queue</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-semibold text-blue-600 mb-1">
              ~{queueStatus?.estimated_wait_time_minutes || 0} mins
            </div>
            <p className="text-gray-600 text-sm">Estimated wait time</p>
          </div>

          {queueStatus?.can_proceed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-semibold">Ready to proceed!</p>
              <p className="text-green-600 text-sm">Redirecting to ticket selection...</p>
            </div>
          )}

          <div className="text-xs text-gray-500">
            Please keep this page open. You'll be automatically redirected when it's your turn.
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 3: Ticket Selection Page Component
const TicketSelectionPage = ({
  eventId,
  customerId,
  onNext,
}: {
  eventId: string;
  customerId: string;
  onNext: (step: string) => void;
}) => {
  const [selectedSeat, setSelectedSeat] = useState<{ id: string; row: string; number: number; price: number; available: boolean } | null>(null);
  const [lockTimer, setLockTimer] = useState<number | null>(null);

  const seats: { id: string; row: string; number: number; price: number; available: boolean }[] = [
    { id: 'A1', row: 'A', number: 1, price: 100, available: true },
    { id: 'A2', row: 'A', number: 2, price: 100, available: true },
    { id: 'A3', row: 'A', number: 3, price: 100, available: false },
    { id: 'B1', row: 'B', number: 1, price: 80, available: true },
    { id: 'B2', row: 'B', number: 2, price: 80, available: true },
    { id: 'B3', row: 'B', number: 3, price: 80, available: true },
  ];

  const submitMutation = useMutation({
    mutationFn: api.booking,
    onSuccess: () => {
      setLockTimer(300);
    },
  });

  const lockSeatMutation = useMutation({
    mutationFn: api.lockSeat,
    onSuccess: () => {
      // Start 5-minute countdown
      setLockTimer(300); // 5 minutes in seconds
    },
  });

  useEffect(() => {
    if (lockTimer !== null && lockTimer > 0) {
      const timer = setTimeout(() => {
        setLockTimer(lockTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [lockTimer]);

  const handleSeatSelect = (seat: { id: string; row: string; number: number; price: number; available: boolean }) => {
    if (!seat.available) return;
    setSelectedSeat(seat);
    lockSeatMutation.mutate({
      customerId,
      eventId,
      seatId: seat.id,
    });
  };

  const handleSubmit = () => {
    submitMutation.mutate({ customerId, eventId });
    onNext('payment');
  };

  const formatLockTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Select Your Seat</h1>

          {lockTimer !== null && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 text-center">
              <Lock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-orange-800 font-semibold">
                Seat locked for: {formatLockTime(lockTimer)}
              </p>
              <p className="text-orange-600 text-sm">Complete your purchase before time expires</p>
            </div>
          )}

          {/* Stage */}
          <div className="bg-gray-800 text-white text-center py-4 rounded-lg mb-8">
            <p className="font-semibold">STAGE</p>
          </div>

          {/* Seating Chart */}
          <div className="space-y-4 mb-8">
            {['A', 'B'].map(row => (
              <div key={row} className="flex justify-center items-center space-x-4">
                <span className="w-8 text-center font-semibold">{row}</span>
                <div className="flex space-x-2">
                  {seats.filter(seat => seat.row === row).map(seat => (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatSelect(seat)}
                      disabled={!seat.available || selectedSeat?.id === seat.id}
                      className={`
                        w-12 h-12 rounded-lg font-semibold text-sm transition-colors
                        ${!seat.available
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : selectedSeat?.id === seat.id
                            ? 'bg-orange-500 text-white'
                            : 'bg-green-100 hover:bg-green-200 text-green-800'
                        }
                      `}
                    >
                      {seat.number}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex justify-center space-x-6 mb-8 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
              <span>Unavailable</span>
            </div>
          </div>

          {/* Selected Seat Info */}
          {selectedSeat && (
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Selected Seat</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-blue-800">Seat {selectedSeat.row}{selectedSeat.number}</p>
                  <p className="text-blue-600 text-sm">Row {selectedSeat.row}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-900">${selectedSeat.price}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleSubmit}
            disabled={!selectedSeat || lockSeatMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors"
          >
            {lockSeatMutation.isPending ? 'Locking Seat...' : 'Proceed to Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Step 4: Payment Page Component
const PaymentPage = () => {
  const [qrCode] = useState('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyI+TW9jayBRUiBDb2RlPC90ZXh0Pjwvc3ZnPg==');
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed

  useEffect(() => {
    // Simulate payment processing
    const timer = setTimeout(() => {
      setPaymentStatus('processing');
      setTimeout(() => {
        setPaymentStatus(Math.random() > 0.2 ? 'success' : 'failed');
      }, 3000);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">Your ticket has been confirmed.</p>
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-semibold">Ticket Details</p>
            <p className="text-green-600">Seat A1 - $100</p>
          </div>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold">
            Download Ticket
          </button>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Failed</h1>
          <p className="text-gray-600 mb-6">Please try again or contact support.</p>
          <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <CreditCard className="w-16 h-16 text-blue-600 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Payment</h1>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-blue-800 font-semibold">Total Amount</p>
          <p className="text-3xl font-bold text-blue-900">$100</p>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">Scan QR code with your banking app</p>
          <div className="flex justify-center">
            <img src={qrCode} alt="Payment QR Code" className="w-48 h-48 border rounded-lg" />
          </div>
        </div>

        {paymentStatus === 'processing' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600 mx-auto mb-2"></div>
            <p className="text-yellow-800 font-semibold">Processing Payment...</p>
          </div>
        )}

        {paymentStatus === 'pending' && (
          <p className="text-gray-500 text-sm">
            Waiting for payment confirmation...
          </p>
        )}
      </div>
    </div>
  );
};

// Main App Component
function RouteComponent() {
  const [currentStep, setCurrentStep] = useState('waiting');

  // Mock data - replace with actual values
  const eventId = 'event-123';
  const customerId = localStorageData('customer_id').getLocalStrage()

  const handleNext = (step: string) => {
    setCurrentStep(step);
  };

  switch (currentStep) {
    case 'waiting':
      return <WaitingPage eventId={eventId} onNext={handleNext} />;
    case 'queue':
      return <QueuePage eventId={eventId} customerId={customerId} onNext={handleNext} />;
    case 'tickets':
      return <TicketSelectionPage eventId={eventId} customerId={customerId} onNext={handleNext} />;
    case 'payment':
      return <PaymentPage />;
    default:
      return <WaitingPage eventId={eventId} onNext={handleNext} />;
  }
};

