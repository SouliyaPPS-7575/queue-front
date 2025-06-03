import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Clock,
  CheckCircle,
} from 'lucide-react';
import { BookingStep } from '~/types/queue';
import { getToken } from '~/server/auth';

const API_BASE = process.env.API_BASE ?? `${process.env.BASE_URL}/api/v1`;

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
}

const WaitingPage = ({
  eventId,
  onNext,
}: {
  eventId: string;
  onNext: (step: BookingStep) => void;
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

export default WaitingPage;
