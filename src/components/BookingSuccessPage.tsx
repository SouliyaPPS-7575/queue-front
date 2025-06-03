import { useNavigate } from '@tanstack/react-router';

function BookingSuccessPage({ eventId }: { eventId: string }) {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Booking Successful!
      </h2>

      <p className="text-gray-600 mb-6">
        Your tickets have been booked successfully. You will receive a confirmation email shortly.
      </p>

      <div className="space-y-3">
        <button
          onClick={() => navigate({ to: '/bookings' })}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          View My Bookings
        </button>

        <button
          onClick={() => navigate({ to: '/events' })}
          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
        >
          Browse More Events
        </button>
      </div>
    </div>
  );
}

export default BookingSuccessPage;
