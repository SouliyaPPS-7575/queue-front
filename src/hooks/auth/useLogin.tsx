import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { LoginForm } from '~/models/auth';
import { loginServer } from '~/server/auth';
import { localStorageData } from '~/server/cache';

export const useLogin = () => {
  const navigate = useNavigate();

  // TanStack Query mutation for login
  const login = useMutation({
    mutationFn: loginServer,
    onSuccess: ({ authData }) => {
      localStorageData('customer_id').setLocalStorage(authData.record.id);
      navigate({ to: '/' });
    },
  });

  const form = useForm({
    defaultValues: {
      identity: '',
      password: '',
    } as LoginForm,
    onSubmit: async ({ value }) => {
      login.mutate({
        data: value,
      });
    },
  });
  return { form };
};
