import { useMutation, useQueryClient } from '@tanstack/react-query';

import { removeCartItem } from './cart.api';
import { cartKeys } from './cart.keys';

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: removeCartItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.all }),
  });

  return {
    removeItem: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
    productId: mutation.variables ?? null,
  };
};
