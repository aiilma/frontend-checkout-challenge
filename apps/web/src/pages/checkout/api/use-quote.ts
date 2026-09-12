import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query';

import { type Delivery } from '@checkout/contracts';

import { createQuote } from './checkout.api';
import { checkoutKeys } from './checkout.keys';

export const useQuote = (cartVersion: number | undefined, delivery: Delivery | null) => {
  const input = cartVersion === undefined || delivery === null ? null : { cartVersion, delivery };
  const query = useQuery({
    queryKey: input ? checkoutKeys.quote(input) : checkoutKeys.quotes,
    queryFn: input ? ({ signal }) => createQuote(input, signal) : skipToken,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  });

  return {
    quote: input ? query.data : undefined,
    isCalculating: query.isFetching,
    error: query.error,
  };
};
