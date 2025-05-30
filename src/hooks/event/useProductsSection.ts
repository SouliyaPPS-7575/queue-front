import { useEvents } from '~/hooks/event/useProducts';
import { useRanking } from '~/hooks/event/useRanking';
import type { ProductItem, ProductRankingItem } from '~/models/shop';

export const useProductsSection = () => {
  const { events: productsData } = useEvents();
  const { productsRankingData = [], isLoading } = useRanking();

  // create function filter products by ranking refer from ranking.rank
  const filteredProductsRanking = productsRankingData
    .filter((ranking: ProductRankingItem) => ranking.rank <= 100)
    .sort((a: ProductRankingItem, b: ProductRankingItem) => a.rank - b.rank)
    .map((ranking: ProductRankingItem) => {
      const product = productsData.find(
        (product: ProductItem) => product.id === ranking.product_id,
      );
      return {
        ...product,
        rank: ranking.rank,
      };
    });

  return {
    filteredProductsRanking,
    isLoading,
  };
};
