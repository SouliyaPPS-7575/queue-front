import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { getCurrency } from '~/server/shop';

export const currencyQueryOption = () =>
  queryOptions({
    queryKey: ['currency'],
    queryFn: getCurrency,
  });

export const useCurrency = () => {
  const { data: currencies } = useSuspenseQuery(currencyQueryOption());

  return {
     currencies,
  };
};
