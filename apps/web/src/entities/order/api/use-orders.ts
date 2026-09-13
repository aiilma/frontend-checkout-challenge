import { useQuery } from '@tanstack/react-query';

import { type Order } from '@checkout/contracts';

import { listOrders } from './order.api';
import { orderKeys } from './order.keys';

const noOrders: Order[] = [];

export const useOrders = () => {
  const query = useQuery({
    queryKey: orderKeys.list,
    queryFn: ({ signal }) => listOrders(signal),
  });

  return {
    orders: query.data ?? noOrders,
    isLoading: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
};
