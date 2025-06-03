import {
  queryOptions,
  useMutation,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { localStorageData } from '~/server/cache';
import {
  createAddCart,
  deleteCartItem,
  editCartItem,
  getCartItems,
  getCountCartItems,
} from '~/server/shop';
import { queryClient } from '~/services/queryClient';
import { useEvents } from './useProducts';

export const getCartItemsQueryOption = () =>
  queryOptions({
    queryKey: ['addCartItems'],
    queryFn: getCartItems,
    staleTime: 0, // make sure it's not considered "fresh" forever
    refetchInterval: 5000, // poll every 5 seconds
  });

// Mock data fetching with TanStack Query
export const useCountCartItems = () => {
  return useQuery({
    queryKey: ['countCartItems'],
    queryFn: getCountCartItems,
    initialData: 0,
    staleTime: 1,
  });
};

export const useAddCart = () => {
  const { t } = useTranslation();
  const { mutateAsync: addCart } = useMutation({
    mutationFn: createAddCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countCartItems'] });
      toast.success(t('item_added_cart'));
    },
  });

  return { addCart };
};

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string[];
}

export function useCartPage() {
  const navigate = useNavigate();

  const { data: cartItem } = useSuspenseQuery(getCartItemsQueryOption());

  const { events: productsData }: { events: Product[] } = useEvents();


  const enrichedCartItems = useMemo(() => {
    return Array.from(
      new Map(
        (cartItem || []).map((item) => [
          item.id,
          {
            ...item,
            name:
              productsData?.find((p) => p.id === item.product_id)?.name ?? '',
            price:
              productsData?.find((p) => p.id === item.product_id)?.price ?? 0,
            image_url:
              productsData?.find((p) => p.id === item.product_id)
                ?.image_url?.[0] ?? '',
          },
        ]),
      ).values(),
    );
  }, [cartItem, productsData]);

  const { mutate: deleteMutation } = useMutation({
    mutationFn: deleteCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countCartItems'] });
      queryClient.invalidateQueries(getCartItemsQueryOption());
    },
  });

  const { mutate: editMutation } = useMutation({
    mutationFn: editCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countCartItems'] });
      queryClient.invalidateQueries(getCartItemsQueryOption());
    },
  });

  // --- Patch: local cart state and handlers ---
  const [localCartState, setLocalCartState] = useState(
    () =>
      enrichedCartItems?.map((item) => ({
        ...item,
        quantity: Math.max(item.quantity, 1),
      })) || [],
  );

  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const selectedItemStorage = localStorageData('selected_cart_items');

  useEffect(() => {
    const saved = selectedItemStorage.getLocalStorage();
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSelectedItemIds(parsed);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    setLocalCartState((prev) => {
      const updated = enrichedCartItems.map((item) => {
        const existing = prev.find((i) => i.id === item.id);
        const ensuredQuantity = Math.max(item.quantity, 1);
        return existing?.quantity === ensuredQuantity
          ? existing
          : { ...item, quantity: ensuredQuantity };
      });
      return updated;
    });
  }, [enrichedCartItems]);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setLocalCartState((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(newQuantity, 1) } : item,
      ),
    );
  };

  const handleRemoveItem = (id: string) => {
    setLocalCartState((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) => {
      const newSelection = prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id];
      selectedItemStorage.setLocalStorage(JSON.stringify(newSelection));
      return newSelection;
    });
  };

  const selectAllItems = () => {
    setSelectedItemIds((prev) => {
      const newSelection =
        prev.length === localCartState.length
          ? []
          : localCartState.map((item) => item.id);
      selectedItemStorage.setLocalStorage(JSON.stringify(newSelection));
      return newSelection;
    });
  };

  const calculateSubtotal = () =>
    localCartState.reduce(
      (total, item) =>
        selectedItemIds.includes(item.id)
          ? total + item.price * item.quantity
          : total,
      0,
    );

  const onClose = () => {
    const originalMap = new Map(
      enrichedCartItems.map((item) => [item.id, item]),
    );

    localCartState.forEach((item) => {
      const original = originalMap.get(item.id);
      if (!original) {
        if (
          !enrichedCartItems.find((enrichedItem) => enrichedItem.id === item.id)
        ) {
          deleteMutation({ data: { id: item.id } });
        }
        return;
      }

      if (original.quantity !== item.quantity) {
        editMutation({
          data: {
            id: item.id,
            formData: {
              customer_id: localStorageData('customer_id').getLocalStorage(),
              product_id: item.product_id,
              quantity: item.quantity,
              status: item.status,
            },
          },
        });
      }
    });

    enrichedCartItems.forEach((item) => {
      if (!localCartState.find((localItem) => localItem.id === item.id)) {
        deleteMutation({ data: { id: item.id } });
      }
    });

    history.back();
  };

  const handleCheckout = () => {
    navigate({ to: '/queue' });
  };

  return {
    // Data
    enrichedCartItems: localCartState,
    selectedItemIds,

    // Function
    handleQuantityChange,
    handleRemoveItem,
    toggleSelectItem,
    selectAllItems,
    calculateSubtotal,

    onClose,
    handleCheckout,
  };
}
