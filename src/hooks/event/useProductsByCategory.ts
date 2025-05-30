import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { getProductsByCategory } from '~/server/shop';
import { useEvents } from './useProducts';
import type { ProductItem } from '~/models/shop';

export const productsByCategoryQueryOption = (categoryId: string) =>
  queryOptions({
    queryKey: ['productsByCategory', categoryId],
    queryFn: () =>
      getProductsByCategory({ data: { category_id: categoryId } }),
  });

export const useProductsByCategory = (categoryId: string) => {
  const { data: productsByCategoryData = [], isLoading } = useSuspenseQuery(
    productsByCategoryQueryOption(categoryId),
  );

  const { events: productsData } = useEvents();

  const filteredProductsByCategory = productsData.filter(
    (product: ProductItem) => product.category_id === categoryId,
  );

  return {
    productsByCategoryData,
    isLoading,
    filteredProductsByCategory,
  };
};
