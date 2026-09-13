import { useEffect } from 'react';

import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query';

import { type Delivery } from '@checkout/contracts';

import { isStaleCheckout } from '../model/checkout.errors';
import { createQuote } from './checkout.api';
import { checkoutKeys } from './checkout.keys';
import { useRefreshCheckout } from './use-refresh-checkout';

export const useQuote = (cartVersion: number | undefined, delivery: Delivery | null) => {
  const input = cartVersion === undefined || delivery === null ? null : { cartVersion, delivery };
  const refreshCheckout = useRefreshCheckout();
  const query = useQuery({
    queryKey: input ? checkoutKeys.quote(input) : checkoutKeys.quotes,
    queryFn: input ? ({ signal }) => createQuote(input, signal) : skipToken,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  });
  const isStale = query.error !== null && isStaleCheckout(query.error);

  useEffect(() => {
    if (isStale) void refreshCheckout();
  }, [isStale, refreshCheckout]);

  return {
    quote: input ? query.data : undefined,
    isCalculating: query.isFetching,
    error: query.error,
    retry: refreshCheckout,
  };
};
