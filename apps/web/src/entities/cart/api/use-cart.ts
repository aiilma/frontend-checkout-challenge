import { useQuery } from '@tanstack/react-query';

import { indexBy } from '@/shared/lib/index-by';

import { type CartItem, getCart } from './cart.api';
import { cartKeys } from './cart.keys';

const noItems: CartItem[] = [];

export const useCart = () => {
  const query = useQuery({
    queryKey: cartKeys.all,
    queryFn: ({ signal }) => getCart(signal),
  });
  const items = query.data?.items ?? noItems;
  const itemsById = indexBy(items, (item) => item.productId);

  return {
    cart: query.data,
    items,
    itemsById,
    isLoading: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
};
