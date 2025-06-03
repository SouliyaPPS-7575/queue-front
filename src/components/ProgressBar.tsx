import { BookingStep } from '~/types/queue';

function BookingProgressBar({ currentStep }: { currentStep: BookingStep }) {

  const steps: { key: BookingStep; label: string }[] = [
    { key: 'waiting', label: 'Waiting' },
    { key: 'queue', label: 'Queue' },
    { key: 'tickets', label: 'Select Tickets' },
    { key: 'payment', label: 'Payment' },
    { key: 'success', label: 'Complete' },
  ];

  const currentIndex = steps.findIndex(step => step.key === currentStep);

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${index <= currentIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {index + 1}
              </div>
              <span
                className={`
                  ml-2 text-sm font-medium
                  ${index <= currentIndex ? 'text-blue-600' : 'text-gray-500'}
                `}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`
                    w-12 h-0.5 ml-4
                    ${index < currentIndex ? 'bg-blue-600' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BookingProgressBar;
