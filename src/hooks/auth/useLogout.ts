import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { logoutServer } from '~/server/auth';
import { localStorageData } from '~/server/cache';

export const useLogout = () => {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: logoutServer,
    onSuccess: () => {
      localStorageData('customer_id').removeLocalStorage();
      // localStorageData('selected_cart_items').removeLocalStorage();

      navigate({ to: '/login' });
    },
  });

  const handleClose = () => {
    navigate({ to: '/' });
  };

  const handleConfirm = () => {
    mutation.mutate({});
  };

  return {
    // ✅ Event Handlers
    handleClose,
    handleConfirm,
  };
};
