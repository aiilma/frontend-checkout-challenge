import { useMutation, useQueryClient } from '@tanstack/react-query';

import { setCartItem } from './cart.api';
import { cartKeys } from './cart.keys';

export const useSetCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setCartItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.all }),
  });
};
