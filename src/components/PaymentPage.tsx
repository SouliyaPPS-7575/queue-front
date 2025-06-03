import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';

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
  simulate_result: 'success' | 'failed'; // Add simulation result
}

interface SimulatePaymentResponse {
  success: boolean;
  payment_id: string;
  message: string;
  status: 'success' | 'failed';
  transaction_id?: string;
}

const API_BASE = process.env.API_BASE ?? `${process.env.BASE_URL}/api/v1`;

// API function for simulating payment
const api = {
  simulatePayment: async (data: SimulatePaymentRequest): Promise<SimulatePaymentResponse> => {
    const response = await fetch(`${API_BASE}/test/simulate-payment`, {
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

const PaymentPage: React.FC<PaymentPageProps> = ({
  eventId,
  sessionId,
  paymentId,
  selectedSeat,
  onNext,
}) => {
  const [qrCode] = useState(
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyI+TW9jayBRUiBDb2RlPC90ZXh0Pjwvc3ZnPg=='
  );

  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [countdown, setCountdown] = useState(600); // 10 minutes countdown
  const [error, setError] = useState<string | null>(null);

  // Get payment details
  const currentPaymentId = paymentId || localStorage.getItem('payment_id') || `payment_${Date.now()}`;
  const seatPrice = selectedSeat?.price || 100;

  // Simulate payment mutation
  const simulatePaymentMutation = useMutation({
    mutationFn: api.simulatePayment,
    onSuccess: (response: SimulatePaymentResponse) => {
      if (response.success && response.status === 'success') {
        setPaymentStatus('success');
        setError(null);

        // Store transaction details
        localStorage.setItem('transaction_id', response.transaction_id || '');
        localStorage.setItem('payment_completed', 'true');

        // Redirect to success page after a short delay
        setTimeout(() => {
          onNext('success');
        }, 2000);
      } else {
        setPaymentStatus('failed');
        setError(response.message || 'Payment failed');
      }
    },
    onError: (error: Error) => {
      setPaymentStatus('failed');
      setError(error.message);
    },
  });

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0 && paymentStatus === 'pending') {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && paymentStatus === 'pending') {
      setPaymentStatus('failed');
      setError('Payment timeout - please try again');
    }
  }, [countdown, paymentStatus]);

  // Format countdown time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle successful payment simulation
  const handleSuccessfulPayment = () => {
    console.log('✅ Simulating successful payment...');
    setPaymentStatus('processing');
    setError(null);

    // Call API with success simulation
    simulatePaymentMutation.mutate({
      payment_id: currentPaymentId,
      event_id: eventId,
      session_id: sessionId,
      amount: seatPrice,
      seat_ids: selectedSeat ? [selectedSeat.id] : [],
      simulate_result: 'success', // Force success
    });
  };

  // Handle failed payment simulation
  const handleFailedPayment = () => {
    console.log('❌ Simulating failed payment...');
    setPaymentStatus('processing');
    setError(null);

    // Call API with failure simulation
    simulatePaymentMutation.mutate({
      payment_id: currentPaymentId,
      event_id: eventId,
      session_id: sessionId,
      amount: seatPrice,
      seat_ids: selectedSeat ? [selectedSeat.id] : [],
      simulate_result: 'failed', // Force failure
    });
  };

  // Reset payment state
  const handleReset = () => {
    console.log('🔄 Resetting payment...');
    setPaymentStatus('pending');
    setError(null);
    setCountdown(600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Complete Your Payment
          </h1>

          {/* Payment Status */}
          <div className="text-center mb-6">
            {paymentStatus === 'pending' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-blue-600 text-lg font-semibold mb-2">
                  Scan QR Code to Pay
                </div>
                <div className="text-blue-500">
                  Time remaining: {formatTime(countdown)}
                </div>
              </div>
            )}

            {paymentStatus === 'processing' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-2"></div>
                <div className="text-yellow-600 text-lg font-semibold">
                  Processing Payment...
                </div>
                <div className="text-yellow-500">
                  Please wait while we confirm your payment
                </div>
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-green-600 text-lg font-semibold mb-2">
                  ✅ Payment Successful!
                </div>
                <div className="text-green-500">
                  Redirecting to confirmation page...
                </div>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-600 text-lg font-semibold mb-2">
                  ❌ Payment Failed
                </div>
                <div className="text-red-500 mb-4">
                  {error || 'Something went wrong with your payment'}
                </div>
                <button
                  onClick={handleReset}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* QR Code */}
          {(paymentStatus === 'pending' || paymentStatus === 'processing') && (
            <div className="text-center mb-6">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 inline-block">
                <img
                  src={qrCode}
                  alt="Payment QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>
            </div>
          )}

          {/* Manual Payment Simulation Buttons */}
          {paymentStatus === 'pending' && (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-gray-700 mb-4 text-center">
                Simulate Payment Result
              </h4>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleSuccessfulPayment}
                  disabled={simulatePaymentMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <span>✅</span>
                  {simulatePaymentMutation.isPending ? 'Processing...' : 'Successful Payment'}
                </button>

                <button
                  onClick={handleFailedPayment}
                  disabled={simulatePaymentMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <span>❌</span>
                  {simulatePaymentMutation.isPending ? 'Processing...' : 'Failed Payment'}
                </button>
              </div>
              <p className="text-gray-600 text-sm text-center mt-3">
                Click either button to simulate the payment result
              </p>
            </div>
          )}

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-mono text-sm">{currentPaymentId.slice(-8)}</span>
              </div>
              {selectedSeat && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seat:</span>
                    <span>{selectedSeat.row}{selectedSeat.number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold">${selectedSeat.price}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Event ID:</span>
                <span className="font-mono text-sm">{eventId.slice(-8)}</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          {paymentStatus === 'pending' && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">Payment Instructions</h4>
              <ol className="list-decimal list-inside text-blue-800 text-sm space-y-1">
                <li>Open your mobile banking app</li>
                <li>Scan the QR code above</li>
                <li>Confirm the payment amount</li>
                <li>Complete the transaction</li>
                <li><strong>OR use the simulation buttons above for testing</strong></li>
              </ol>
            </div>
          )}

          {/* Debug Info - Development Only */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h5 className="font-semibold text-gray-700 text-sm mb-2">Debug Info</h5>
              <div className="text-xs space-y-1 text-gray-600">
                <div>Status: <span className="font-mono">{paymentStatus}</span></div>
                <div>Countdown: <span className="font-mono">{countdown}s</span></div>
                <div>API Pending: <span className="font-mono">{simulatePaymentMutation.isPending.toString()}</span></div>
                <div>Error: <span className="font-mono">{error || 'None'}</span></div>
              </div>

              {/* Additional Debug Controls */}
              <div className="mt-3 pt-3 border-t border-gray-300">
                <h6 className="font-semibold text-gray-700 text-xs mb-2">Quick Actions:</h6>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setPaymentStatus('processing')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                  >
                    Processing
                  </button>
                  <button
                    onClick={() => setCountdown(10)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs"
                  >
                    10s Timer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading indicator for API call */}
          {simulatePaymentMutation.isPending && (
            <div className="text-center mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Calling payment API...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
