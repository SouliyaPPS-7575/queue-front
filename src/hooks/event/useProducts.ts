import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { listEvents } from '~/server/shop';

export const productsQueryOption = () =>
  queryOptions({
    queryKey: ['products'],
    queryFn: listEvents,
  });

export const useEvents = () => {
  const { data: events, isLoading } = useSuspenseQuery(
    productsQueryOption(),
  );

  return { events, isLoading };
};
