import { useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { cartKeys } from '@/entities/cart';

import { checkoutKeys } from './checkout.keys';

export const useRefreshCheckout = () => {
  const queryClient = useQueryClient();

  return useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: cartKeys.all }),
        queryClient.invalidateQueries({ queryKey: checkoutKeys.quotes }),
      ]),
    [queryClient],
  );
};
