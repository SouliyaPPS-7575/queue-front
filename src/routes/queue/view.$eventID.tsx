import { useState, useCallback } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSession } from '~/hooks/session';
import { useCustomer } from '~/hooks/customer';
import { localStorageData } from '~/server/cache';
import TicketSelectionPage from '~/components/TicketSelectionPage';
import PaymentPage from '~/components/PaymentPage';
import WaitingPage from '~/components/WaitingPage';
import QueuePage from '~/components/QueuePage';
import BookingProgressBar from '~/components/ProgressBar';
import BookingSuccessPage from '~/components/BookingSuccessPage';


export const Route = createFileRoute('/queue/view/$eventID')({
  component: RouteComponent,
  // Add validation for eventID parameter
  validateSearch: (search: Record<string, unknown>) => {
    return {
      step: (search.step as BookingStep) || 'waiting',
    };
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const { eventID } = Route.useParams();
  const { step: initialStep } = Route.useSearch();

  const [currentStep, setCurrentStep] = useState<BookingStep>(initialStep);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  const { sessionID, isLoading: sessionLoading } = useSession();
  const { customerId, isLoading: customerLoading } = useCustomer();

  // Fallback to localStorage if hook fails
  const fallbackCustomerId = localStorageData('customer_id').getLocalStorage();
  const effectiveCustomerId = customerId || fallbackCustomerId || '';

  const handleStepChange = useCallback((step: BookingStep, data?: any) => {
    setCurrentStep(step);

    // Update URL to reflect current step
    navigate({
      to: '/queue/view/$eventID',
      params: { eventID },
      search: { step },
      replace: true,
    });

    // Store payment data when moving to payment step
    if (step === 'payment' && data) {
      setPaymentData(data);
    }
  }, [navigate, eventID]);

  const handlePaymentSuccess = useCallback(() => {
    handleStepChange('success');
  }, [handleStepChange]);

  const handlePaymentCancel = useCallback(() => {
    // Return to ticket selection
    handleStepChange('tickets');
  }, [handleStepChange]);

  // Show loading spinner while session is loading
  if (sessionLoading || customerLoading) {
    return <LoadingSpinner message="Initializing session..." />;
  }

  // Redirect to login if no session
  if (!sessionID) {
    navigate({ to: '/login' });
    return null;
  }

  // Validate required data
  if (!effectiveCustomerId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please log in to continue with your booking.
          </p>
          <button
            onClick={() => navigate({ to: '/login' })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const commonProps: StepComponentProps = {
    eventId: eventID,
    sessionId: sessionID,
    customerId: effectiveCustomerId,
    onNext: handleStepChange,
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-20">
      {/* Progress indicator */}
      <BookingProgressBar currentStep={currentStep} />

      {/* Render current step component */}
      <div className="container mx-auto px-4 py-8">
        {renderStepComponent(currentStep, {
          ...commonProps,
          paymentData,
          onPaymentSuccess: handlePaymentSuccess,
          onPaymentCancel: handlePaymentCancel,
        })}
      </div>
    </div>
  );
}

function renderStepComponent(
  step: BookingStep,
  props: StepComponentProps & {
    paymentData: PaymentData | null;
    onPaymentSuccess: () => void;
    onPaymentCancel: () => void;
  }
) {
  const { eventId, sessionId, customerId, onNext, paymentData, onPaymentSuccess, onPaymentCancel } = props;

  switch (step) {
    case 'waiting':
      return <WaitingPage eventId={eventId} onNext={onNext} />;

    case 'queue':
      return (
        <QueuePage
          eventId={eventId}
          sessionId={sessionId}
          customerId={customerId}
          onNext={onNext}
        />
      );

    case 'tickets':
      return (
        <TicketSelectionPage
          eventId={eventId}
          sessionId={sessionId}
          customerId={customerId}
          onNext={onNext}
        />
      );

    case 'payment':
      if (!paymentData) {
        console.log("=> payment data is empty")
        // If no payment data, redirect back to tickets
        onNext('tickets');
        return null;
      }

      return (
        <PaymentPage
          bookId={paymentData.bookId}
          phone={paymentData.phone || '+8562099483399'}
          amount={paymentData.amount}
          paymentId={paymentData.paymentId}
          onSuccess={onPaymentSuccess}
          onCancel={onPaymentCancel}
        />
      );

    case 'success':
      return <BookingSuccessPage eventId={eventId} />;

    default:
      return <WaitingPage eventId={eventId} onNext={onNext} />;
  }
}


// Loading spinner component
function LoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      {message && <p className="text-gray-600">{message}</p>}
    </div>
  );
}

