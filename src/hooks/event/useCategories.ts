import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { getCategories } from '~/server/shop';

export const categoriesQueryOption = () =>
  queryOptions({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

export const useCategories = () => {
  const { data: categoriesData, isLoading } = useSuspenseQuery(
    categoriesQueryOption(),
  );

  return {
    categoriesData,
    isLoading,
  };
};
