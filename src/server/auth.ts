import { queryOptions } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import {
  deleteCookie,
  getCookie,
  setCookie,
} from '@tanstack/react-start/server';
import { LoginForm, SignupForm } from '~/models/auth';
import pb, { createPb } from '~/services/pocketbaseService';
import { handleError } from './errorHandler';

// Login API function
export const loginServer = createServerFn({ method: 'POST' })
  .validator((d: LoginForm) => d)
  .handler(async ({ data }) => {
    try {
      const authData = await pb
        .collection('customers')
        .authWithPassword(data.identity, data.password);

      pb.authStore.save(authData.token);

      const farFutureDate = new Date();
      farFutureDate.setFullYear(farFutureDate.getFullYear() + 20);

      setCookie('token', authData.token, {
        sameSite: 'lax',
        expires: farFutureDate,
      });

      setCookie('customer_id', authData.record.id, {
        sameSite: 'lax',
        expires: farFutureDate,
      });

      return { success: true, authData };
    } catch (error) {
      throw handleError(error);
    }
  });

// Logout API function
export const logoutServer = createServerFn({ method: 'POST' }).handler(
  async () => {
    try {
      deleteCookie('token');
      deleteCookie('customer_id');
      pb.authStore.clear();
      return { success: true };
    } catch (error) {
      throw handleError(error);
    }
  },
);

// Get token
export const getTokenQueryOption = () =>
  queryOptions({ queryKey: ['token'], queryFn: getToken });

export const getToken = createServerFn({
  method: 'GET',
}).handler(async () => {
  const token = getCookie('token');
  return {
    token,
  };
});

export const signupServer = createServerFn({ method: 'POST' })
  .validator((d: SignupForm) => d)
  .handler(async ({ data }) => {
    try {
      const user = await createPb<SignupForm>('customers', data);

      return { success: true, user };
    } catch (error) {
      throw handleError(error);
    }
  });

export const verifyEmailServer = createServerFn({ method: 'POST' })
  .validator((d: { email: string }) => d)
  .handler(async ({ data }) => {
    try {
      return await pb.collection('customers').requestVerification(data.email);
    } catch (error) {
      throw handleError(error);
    }
  });
