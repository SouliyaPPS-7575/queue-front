import { useEffect, useState } from "react";
import { getCookie } from "@tanstack/react-start/server";

interface UseCustomerReturn {
  customerId: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useCustomer = (): UseCustomerReturn => {
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts

    const fetchCustomer = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const customer_id = await getCookie('customer_id');

        if (isMounted) {
          setCustomerId(customer_id);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load customer');
          setCustomerId(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCustomer();

    // Cleanup function
    return (): void => {
      isMounted = false;
    };
  }, []);

  return { customerId, isLoading, error };
};
