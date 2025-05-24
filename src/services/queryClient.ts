import { QueryClient } from '@tanstack/react-query';
import { t } from 'i18next';
import { toast } from 'sonner';

// Modify Client to initialize queryClient
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1, // Retry failed queries 1 time
        staleTime: 1, // Keep the data fresh for 5 seconds (adjust based on use case)
        refetchOnWindowFocus: true, // Refetch data when window gets focus
        throwOnError(error) {
          if (error instanceof Error) {
            const parsed = JSON.parse((error as Error).message);
            toast.error(t(parsed.message));
            return false;
          }
          return true;
        },
      },
      mutations: {
        onSuccess: () => {
          toast.success(t('successfully'));
        },
        onError: async (error: unknown) => {
          const parsed = JSON.parse((error as Error).message);

          toast.error(t(parsed.message));
        },
      },
    },
  });
};

// Initialize query client with global error handler
export const queryClient = createQueryClient();
