import { useQuery } from '@tanstack/react-query';

import { getCheckoutOptions } from './checkout-options.api';
import { checkoutOptionsKeys } from './checkout-options.keys';

const CATALOG_STALE_MS = 60_000;

export const useCheckoutOptions = () => {
  const query = useQuery({
    queryKey: checkoutOptionsKeys.all,
    queryFn: ({ signal }) => getCheckoutOptions(signal),
    staleTime: CATALOG_STALE_MS,
  });

  return {
    options: query.data,
    isLoading: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
};
