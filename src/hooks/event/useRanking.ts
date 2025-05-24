import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { getProductsRanking } from '~/server/shop';

export const productsRankingQueryOption = () =>
  queryOptions({
    queryKey: ['productsRanking'],
    queryFn: getProductsRanking,
  });

export const useRanking = () => {
  const { data: productsRankingData, isLoading } = useSuspenseQuery(
    productsRankingQueryOption(),
  );

  return { productsRankingData, isLoading };
};
