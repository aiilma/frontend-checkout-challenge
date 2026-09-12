import { useQuery } from '@tanstack/react-query';

import { getCheckoutOptions } from './checkout.api';
import { checkoutKeys } from './checkout.keys';

export const useCheckoutOptions = () => {
  const query = useQuery({
    queryKey: checkoutKeys.options,
    queryFn: ({ signal }) => getCheckoutOptions(signal),
  });

  return {
    options: query.data,
    isLoading: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
};
