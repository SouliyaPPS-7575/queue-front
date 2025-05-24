import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { getBanners } from '~/server/banners';

export const bannersQueryOption = () =>
  queryOptions({
    queryKey: ['banners'],
    queryFn: getBanners,
  });

export const useBanners = () => {
  const { data: bannersData, isLoading } =
    useSuspenseQuery(bannersQueryOption());

  return {
    bannersData,
    isLoading,
  };
};
