import { useQueryClient } from '@tanstack/react-query';

import { type Order } from '@checkout/contracts';

import { cartKeys } from '@/entities/cart';
import { useIdempotentMutation } from '@/shared/api/use-idempotent-mutation';

import { createOrder } from './order.api';
import { orderKeys } from './order.keys';

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useIdempotentMutation({
    mutationFn: createOrder,
    onSuccess: (order: Order) => {
      queryClient.setQueryData(orderKeys.detail(order.id), order);
      return queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
};
