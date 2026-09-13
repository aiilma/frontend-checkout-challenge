import { useQueryClient } from '@tanstack/react-query';

import { type Order } from '@checkout/contracts';

import { useIdempotentMutation } from '@/shared/api/use-idempotent-mutation';
import { cartKeys } from '@/entities/cart';

import { createOrder } from './order.api';
import { orderKeys } from './order.keys';

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const mutation = useIdempotentMutation({
    mutationFn: createOrder,
    onSuccess: (order: Order) => {
      queryClient.setQueryData(orderKeys.detail(order.id), order);
      return queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });

  return { createOrder: mutation.mutate, isPending: mutation.isPending, error: mutation.error };
};
