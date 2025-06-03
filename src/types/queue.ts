type BookingStep = 'waiting' | 'queue' | 'tickets' | 'payment' | 'success';

interface PaymentData {
  bookId: string;
  amount: string;
  paymentId: string;
  phone?: string;
}

interface StepComponentProps {
  eventId: string;
  sessionId: string;
  customerId: string;
  onNext: (step: BookingStep, data?: any) => void;
}
