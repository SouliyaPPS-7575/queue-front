import { useState, useEffect } from 'react';
import { getToken } from '~/server/auth';

export const useAuthToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { token } = await getToken();
        setToken(token || null);
      } catch (error) {
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, []);

  return { token, loading };
};
