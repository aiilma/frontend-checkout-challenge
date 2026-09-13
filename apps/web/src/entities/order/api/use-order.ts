import { useQuery } from '@tanstack/react-query';

import { getOrder } from './order.api';
import { orderKeys } from './order.keys';

export const useOrder = (orderId: string) => {
  const query = useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: ({ signal }) => getOrder(orderId, signal),
  });

  return {
    order: query.data,
    isLoading: query.isPending || !query.isFetchedAfterMount,
    error: query.error,
    refetch: query.refetch,
  };
};
