import { skipToken, useQuery } from '@tanstack/react-query';

import { type Payment } from '@checkout/contracts';

import { pollingOptions } from '@/shared/api/polling';

import { isSettled, POLL_INTERVAL_MS } from '../model/payment';
import { getPayment } from './payment.api';
import { paymentKeys } from './payment.keys';

export const usePayment = (paymentId: string | null) => {
  const query = useQuery({
    queryKey: paymentId ? paymentKeys.detail(paymentId) : paymentKeys.all,
    queryFn: paymentId ? ({ signal }) => getPayment(paymentId, signal) : skipToken,
    staleTime: 0,
    ...pollingOptions<Payment>(isSettled, POLL_INTERVAL_MS),
  });

  return { payment: paymentId ? query.data : undefined, error: query.error };
};
