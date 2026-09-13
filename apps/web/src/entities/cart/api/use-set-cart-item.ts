import { useMutation, useQueryClient } from '@tanstack/react-query';

import { setCartItem } from './cart.api';
import { cartKeys } from './cart.keys';

export const useSetCartItem = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: setCartItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.all }),
  });

  return {
    setItem: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
    productId: mutation.variables?.productId ?? null,
  };
};
