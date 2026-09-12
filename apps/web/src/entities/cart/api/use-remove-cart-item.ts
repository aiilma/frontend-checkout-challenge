import { useMutation, useQueryClient } from '@tanstack/react-query';

import { removeCartItem } from './cart.api';
import { cartKeys } from './cart.keys';

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeCartItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.all }),
  });
};
