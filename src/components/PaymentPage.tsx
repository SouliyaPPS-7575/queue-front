import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import QRCode from 'react-qr-code';
import PubNub from 'pubnub';

// Types
interface PaymentPageProps {
  bookId: string;
  phone: string;
  amount: string;
  paymentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface GenerateQRRequest {
  book_id: string;
  phone: string;
  amount: string;
}

interface GenerateQRResponse {
  code: string;
  status: string;
}

interface CancelPaymentResponse {
  success: boolean;
  message: string;
}

type PaymentStatus = 'loading' | 'pending' | 'success' | 'cancelled' | 'expired' | 'error';


const API_BASE = process.env.API_BASE ?? `${process.env.BASE_URL}/api/v1`;

// API Functions
const paymentAPI = {
  generateQR: async (data: GenerateQRRequest): Promise<GenerateQRResponse> => {
    const response = await fetch(`${API_BASE}/api/v1/payment/gen-jdb-qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to generate QR code');
    }

    return response.json();
  },

  cancelPayment: async (paymentId: string): Promise<CancelPaymentResponse> => {
    const response = await fetch(`${API_BASE}/api/v1/payment/${paymentId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to cancel payment');
    }

    return response.json();
  },
};

const PaymentPage: React.FC<PaymentPageProps> = ({
  bookId,
  phone,
  amount,
  paymentId,
  onSuccess,
  onCancel,
}) => {
  // State
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('loading');
  const [qrCode, setQrCode] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(300); // 5 minutes = 300 seconds
  const [error, setError] = useState<string | null>(null);

  // Refs
  const pubnubRef = useRef<PubNub | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate QR Code Mutation
  const generateQRMutation = useMutation({
    mutationFn: paymentAPI.generateQR,
    onSuccess: (data: GenerateQRResponse) => {
      if (data.status === 'success' && data.code) {
        setQrCode(data.code);
        setPaymentStatus('pending');
        setError(null);
        startCountdown();
        setupPubNub();
      } else {
        setError('Failed to generate QR code');
        setPaymentStatus('error');
      }
    },
    onError: (error: Error) => {
      setError(error.message);
      setPaymentStatus('error');
    },
  });

  // Cancel Payment Mutation
  const cancelPaymentMutation = useMutation({
    mutationFn: () => paymentAPI.cancelPayment(paymentId),
    onSuccess: (data: CancelPaymentResponse) => {
      if (data.success) {
        setPaymentStatus('cancelled');
        cleanupResources();
        onCancel();
      } else {
        setError(data.message || 'Failed to cancel payment');
      }
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Setup PubNub for payment notifications
  const setupPubNub = () => {
    if (!process.env.REACT_APP_PUBNUB_SUBSCRIBE_KEY) {
      console.error('PubNub subscribe key not found');
      return;
    }

    try {
      const pubnub = new PubNub({
        subscribeKey: process.env.REACT_APP_PUBNUB_SUBSCRIBE_KEY,
        userId: `payment_${paymentId}`,
      });

      pubnubRef.current = pubnub;

      // Listen for payment success messages
      pubnub.addListener({
        message: (event) => {
          console.log('PubNub message received:', event);

          if (event.message?.type === 'payment_success' &&
            event.message?.payment_id === paymentId) {
            console.log('Payment success received!');
            setPaymentStatus('success');
            cleanupResources();

            // Small delay before calling onSuccess for better UX
            setTimeout(() => {
              onSuccess();
            }, 2000);
          }
        },
        status: (statusEvent) => {
          console.log('PubNub status:', statusEvent);
        },
      });

      // Subscribe to payment channel
      pubnub.subscribe({
        channels: [`payment_${paymentId}`, 'payment_notifications'],
      });

      console.log('PubNub setup complete, subscribed to:', `payment_${paymentId}`);
    } catch (error) {
      console.error('PubNub setup error:', error);
      setError('Failed to setup payment notifications');
    }
  };

  // Start countdown timer
  const startCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          // Timer expired
          setPaymentStatus('expired');
          cleanupResources();
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);
  };

  // Cleanup resources
  const cleanupResources = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    if (pubnubRef.current) {
      pubnubRef.current.unsubscribeAll();
      pubnubRef.current.destroy();
      pubnubRef.current = null;
    }
  };

  // Format countdown time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle cancel payment
  const handleCancelPayment = () => {
    if (window.confirm('Are you sure you want to cancel this payment?')) {
      cancelPaymentMutation.mutate();
    }
  };

  // Initialize QR code generation on mount
  useEffect(() => {
    generateQRMutation.mutate({
      book_id: bookId,
      phone: phone,
      amount: amount,
    });

    // Cleanup on unmount
    return () => {
      cleanupResources();
    };
  }, [bookId, phone, amount]);

  // Render loading state
  if (paymentStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Generating QR Code</h2>
          <p className="text-gray-600">Please wait while we prepare your payment...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (paymentStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-red-900 mb-2">Payment Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render success state
  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-green-600 text-6xl mb-4">✅</div>
          <h2 className="text-xl font-semibold text-green-900 mb-2">Payment Successful!</h2>
          <p className="text-green-600 mb-4">Your payment has been processed successfully.</p>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              Redirecting to confirmation page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render cancelled state
  if (paymentStatus === 'cancelled') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-gray-600 text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Cancelled</h2>
          <p className="text-gray-600 mb-4">Your payment has been cancelled successfully.</p>
          <button
            onClick={onCancel}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Render expired state
  if (paymentStatus === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-orange-600 text-6xl mb-4">⏰</div>
          <h2 className="text-xl font-semibold text-orange-900 mb-2">Payment Expired</h2>
          <p className="text-orange-600 mb-4">The payment session has timed out.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Start New Payment
          </button>
        </div>
      </div>
    );
  }

  // Main payment UI (pending state)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Complete Your Payment
          </h1>

          {/* Countdown Timer */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 text-center">
            <div className="text-orange-600 text-lg font-semibold mb-1">
              Time Remaining: {formatTime(countdown)}
            </div>
            <div className="text-orange-500 text-sm">
              Complete your payment before the time expires
            </div>
          </div>

          {/* QR Code Display */}
          <div className="text-center mb-6">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 inline-block">
              {qrCode ? (
                <QRCode
                  value={qrCode}
                  size={256}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                />
              ) : (
                <div className="w-64 h-64 bg-gray-100 rounded flex items-center justify-center">
                  <div className="text-gray-500">Loading QR Code...</div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">${amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-mono text-sm">{phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-mono text-sm">{bookId.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-mono text-sm">{paymentId.slice(-8)}</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">Payment Instructions</h4>
            <ol className="list-decimal list-inside text-blue-800 text-sm space-y-1">
              <li>Open your JDB mobile banking app</li>
              <li>Select "QR Payment" or "Scan to Pay"</li>
              <li>Scan the QR code above</li>
              <li>Confirm the payment amount</li>
              <li>Complete the transaction</li>
            </ol>
          </div>

          {/* Cancel Button */}
          <div className="text-center">
            <button
              onClick={handleCancelPayment}
              disabled={cancelPaymentMutation.isPending}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {cancelPaymentMutation.isPending ? 'Cancelling...' : 'Cancel Payment'}
            </button>
          </div>

          {/* Loading indicators */}
          {(generateQRMutation.isPending || cancelPaymentMutation.isPending) && (
            <div className="text-center mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2 text-sm">
                {generateQRMutation.isPending ? 'Generating QR code...' : 'Cancelling payment...'}
              </p>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Development info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 mt-4">
              <h5 className="font-semibold text-gray-700 text-sm mb-2">Debug Info</h5>
              <div className="text-xs space-y-1 text-gray-600">
                <div>Status: <span className="font-mono">{paymentStatus}</span></div>
                <div>QR Generated: <span className="font-mono">{qrCode ? 'Yes' : 'No'}</span></div>
                <div>PubNub Connected: <span className="font-mono">{pubnubRef.current ? 'Yes' : 'No'}</span></div>
                <div>Countdown: <span className="font-mono">{countdown}s</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
