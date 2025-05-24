import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { Route } from '~/routes/shop/view.$productID.$categoryID';
import { getProductsByCategory } from '~/server/shop';
import { useEvents } from './useProducts';

export const productsByCategoryQueryOption = (categoryId: string) =>
  queryOptions({
    queryKey: ['productsByCategory', categoryId],
    queryFn: () =>
      getProductsByCategory({
        data: { category_id: categoryId },
      }),
  });

export const useProductsByCategory = () => {
  const { categoryID } = Route.useParams();

  const { data: productsByCategoryData, isLoading } = useSuspenseQuery(
    productsByCategoryQueryOption(categoryID),
  );

  const { productsData } = useEvents();

  // Filter products by category
  const filteredProductsByCategory = productsData.filter(
    (product) => product.category_id === categoryID,
  );

  return {
    productsByCategoryData,
    isLoading,

    filteredProductsByCategory,
  };
};
