import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import { getToken } from '~/server/auth';
import { BookingStep } from '~/types/queue';

interface SeatResponse {
  seats: Seat[];           // ✅ Array of seats
  sections: Record<string, Seat[]>; // Grouped by section
  total_seats: number;
  available_seats: number;
  event_id: string;
}

// Types
interface Seat {
  id: string;
  row: string;
  number: number;
  price: number;
  status: 'available' | 'locked' | 'sold';
}

interface LockSeatRequest {
  event_id: string;
  seat_id: string;
}

interface BookingConfirmRequest {
  event_id: string;
  seat_ids: string[];
}

interface LockSeatResponse {
  success: boolean;
  message: string;
  locked_until?: number; // Unix timestamp
}

interface BookingConfirmResponse {
  success: boolean;
  book_id: string;
  payment_id: string;
  message: string;
  amount: string;
  phone: string;
}

interface TicketSelectionPageProps {
  eventId: string;
  sessionId: string;
  customerId: string;
  onNext: (step: BookingStep, data?: any) => void;
}

const API_BASE = process.env.API_BASE ?? `${process.env.BASE_URL}/api/v1`;

// API Functions
const api = {
  // Lock a seat
  lockSeat: async (data: LockSeatRequest): Promise<LockSeatResponse> => {
    const { token } = await getToken();

    const response = await fetch(`${API_BASE}/seats/lock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to lock seat');
    }

    return response.json();
  },

  // Confirm booking
  confirmBooking: async (data: BookingConfirmRequest): Promise<BookingConfirmResponse> => {

    const { token } = await getToken();

    const response = await fetch(`${API_BASE}/booking/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to confirm booking');
    }

    return response.json();
  },

  // Get seat availability
  getSeats: async (eventId: string): Promise<Seat[]> => {

    const { token } = await getToken(); // make sure getToken() returns a Promise
    console.log("=> token", token)

    const response = await fetch(`${API_BASE}/events/${eventId}/seats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch seats');
    }

    const data: SeatResponse = await response.json();

    return data.seats || [];
  },
};

const TicketSelectionPage = ({
  eventId,
  onNext,
}: TicketSelectionPageProps) => {
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [lockTimer, setLockTimer] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    data: seatsResponse,
    isLoading: seatsLoading,
    error: seatsError,
    refetch: refetchSeats,
  } = useQuery({
    queryKey: ['seats', eventId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/events/${eventId}/seats`);
      if (!response.ok) throw new Error('Failed to fetch seats');
      return response.json() as Promise<SeatResponse>;
    },
    refetchInterval: 5000,
  });

  const seats = seatsResponse?.seats || [];

  // Lock seat mutation
  const lockSeatMutation = useMutation({
    mutationFn: api.lockSeat,
    onSuccess: (response: LockSeatResponse) => {
      if (response.success && response.locked_until) {
        // Calculate remaining time from server timestamp
        const remainingTime = Math.max(0, response.locked_until - Math.floor(Date.now() / 1000));
        setLockTimer(remainingTime);
        setError(null);

        // Refresh seats to get updated status
        refetchSeats();
      }
    },
    onError: (error: Error) => {
      setError(error.message);
      setSelectedSeat(null);
    },
  });

  // Booking confirmation mutation
  const confirmBookingMutation = useMutation({
    mutationFn: api.confirmBooking,
    onSuccess: (response: BookingConfirmResponse) => {
      if (response.success) {
        console.log("=> book success")
        // Store payment ID for next step
        localStorage.setItem('payment_id', response.payment_id);

        onNext('payment', {
          bookId: response.book_id,
          paymentId: response.payment_id,
          amount: response.amount,
          phone: response.phone || '+8562099483399', // fallback phone
        });

        console.log("=> end book success")
      }
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Timer countdown effect
  useEffect(() => {
    if (lockTimer !== null && lockTimer > 0) {
      const timer = setTimeout(() => {
        setLockTimer(lockTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (lockTimer === 0) {
      // Timer expired, clear selected seat and refresh
      setSelectedSeat(null);
      setLockTimer(null);
      refetchSeats();
    }
  }, [lockTimer]);

  const handleSeatSelect = (seat: Seat) => {
    if (seat.status !== 'available') return;

    setError(null);
    setSelectedSeat(seat);

    // Lock the seat
    lockSeatMutation.mutate({
      event_id: eventId,
      seat_id: seat.id,
    });
  };

  const handleSubmit = () => {
    if (!selectedSeat) return;

    setError(null);

    confirmBookingMutation.mutate({
      event_id: eventId,
      seat_ids: [selectedSeat.id],
    });
  };

  const formatLockTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSeatButtonClass = (seat: Seat): string => {
    const baseClass = 'w-12 h-12 rounded-lg font-semibold text-sm transition-colors';

    if (seat.status === 'sold') {
      return `${baseClass} bg-red-300 text-red-700 cursor-not-allowed`;
    }

    if (seat.status === 'locked' && selectedSeat?.id !== seat.id) {
      return `${baseClass} bg-yellow-300 text-yellow-700 cursor-not-allowed`;
    }

    if (selectedSeat?.id === seat.id) {
      return `${baseClass} bg-orange-500 text-white`;
    }

    return `${baseClass} bg-green-100 hover:bg-green-200 text-green-800`;
  };

  if (seatsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading seats...</p>
        </div>
      </div>
    );
  }

  if (seatsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Failed to Load Seats</h2>
          <p className="text-gray-600 mb-4">{seatsError.message}</p>
          <button
            onClick={() => refetchSeats()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  const rows = Object.keys(seatsByRow).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 mt-10">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Select Your Seat
          </h1>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Lock Timer */}
          {lockTimer !== null && lockTimer > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 text-center">
              <Lock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-orange-800 font-semibold">
                Seat locked for: {formatLockTime(lockTimer)}
              </p>
              <p className="text-orange-600 text-sm">
                Complete your purchase before time expires
              </p>
            </div>
          )}

          {/* Stage */}
          <div className="bg-gray-800 text-white text-center py-4 rounded-lg mb-8">
            <p className="font-semibold">STAGE</p>
          </div>

          {/* Seat Map */}
          <div className="space-y-4 mb-8">
            {rows.map((row) => (
              <div
                key={row}
                className="flex justify-center items-center space-x-4"
              >
                <span className="w-8 text-center font-semibold">{row}</span>
                <div className="flex space-x-2">
                  {seatsByRow[row]
                    .sort((a, b) => a.number - b.number)
                    .map((seat) => (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatSelect(seat)}
                        disabled={
                          lockSeatMutation.isPending ||
                          seat.status === 'sold' ||
                          (seat.status === 'locked' && selectedSeat?.id !== seat.id)
                        }
                        className={getSeatButtonClass(seat)}
                        title={`Seat ${seat.row}${seat.number} - $${seat.price} - ${seat.status}`}
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
              <div className="w-4 h-4 bg-yellow-300 rounded mr-2"></div>
              <span>Locked</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-300 rounded mr-2"></div>
              <span>Sold</span>
            </div>
          </div>

          {/* Selected Seat Info */}
          {selectedSeat && (
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                Selected Seat
              </h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-blue-800">
                    Seat {selectedSeat.row}{selectedSeat.number}
                  </p>
                  <p className="text-blue-600 text-sm">
                    Row {selectedSeat.row}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-900">
                    ${selectedSeat.price}
                  </p>
                </div>
              </div>
            </div>
          )}


          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={
              !selectedSeat ||
              lockSeatMutation.isPending ||
              confirmBookingMutation.isPending
            }
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors"
          >
            {lockSeatMutation.isPending
              ? 'Locking Seat...'
              : confirmBookingMutation.isPending
                ? 'Confirming Booking...'
                : 'Proceed to Payment'}
          </button>

          {/* Loading States */}
          {(lockSeatMutation.isPending || confirmBookingMutation.isPending) && (
            <div className="text-center mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketSelectionPage;
