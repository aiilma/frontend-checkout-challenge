import { useQuery } from '@tanstack/react-query';

import { getSandbox } from './payment.api';
import { paymentKeys } from './payment.keys';

export const useSandbox = () => {
  const query = useQuery({
    queryKey: paymentKeys.sandbox,
    queryFn: ({ signal }) => getSandbox(signal),
    staleTime: Infinity,
  });

  return { sandbox: query.data, isLoading: query.isPending, error: query.error };
};
