import { skipToken, useQuery } from '@tanstack/react-query';

import { getOrder } from './order.api';
import { orderKeys } from './order.keys';

export const useOrder = (orderId: string | undefined) => {
  const query = useQuery({
    queryKey: orderId ? orderKeys.detail(orderId) : orderKeys.all,
    queryFn: orderId ? ({ signal }) => getOrder(orderId, signal) : skipToken,
    staleTime: 0,
  });

  return {
    order: orderId ? query.data : undefined,
    isLoading: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
};
