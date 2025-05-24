import { ClientResponseError } from 'pocketbase';

export function handleError(error: ClientResponseError | any): Response {
  const message = error.message || 'An unexpected error occurred';
  const status = error.status as number;

  return new Response(JSON.stringify({ message }), {
    status: status,
  });
}
