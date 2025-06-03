export type BookingStep = 'waiting' | 'queue' | 'tickets' | 'payment' | 'success';

export interface PaymentData {
  bookId: string;
  amount: string;
  paymentId: string;
  phone?: string;
}

export interface StepComponentProps {
  eventId: string;
  sessionId: string;
  customerId: string;
  onNext: (step: BookingStep, data?: any) => void;
}
