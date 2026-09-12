import { useQuery } from '@tanstack/react-query';

import { getCheckoutOptions } from './checkout-options.api';
import { checkoutOptionsKeys } from './checkout-options.keys';

export const useCheckoutOptions = () => {
  const query = useQuery({
    queryKey: checkoutOptionsKeys.all,
    queryFn: ({ signal }) => getCheckoutOptions(signal),
  });

  return {
    options: query.data,
    isLoading: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
};
