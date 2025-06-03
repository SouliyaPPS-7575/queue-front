import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useSession } from '~/hooks/session';
import { localStorageData } from '~/server/cache';
import TicketSelectionPage from '~/components/SelectSeat';
import PaymentPage from '~/components/PaymentPage';

export const Route = createFileRoute('/queue/view/$eventID')({
  component: RouteComponent,
});

function RouteComponent() {
  const [currentStep, setCurrentStep] = useState('waiting');
  const { eventID } = Route.useParams();
  const { sessionID, isLoading: sessionLoading } = useSession();
  // const { customerId, isLoading: customerLoading } = useCustomer();

  // localStorageData('token').getLocalStrage()
  const customerId = localStorageData('customer_id').getLocalStorage()



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
        bookId='xxxx'
        phone='+8562099483399'
        amount=''
        paymentId=''
        onSuccess={ }
        onCancel={ }
      />;
    default:
      return <WaitingPage eventId={eventId} onNext={handleNext} />;
  }
}
