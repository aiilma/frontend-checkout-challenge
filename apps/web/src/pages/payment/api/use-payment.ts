import { skipToken, useQuery } from '@tanstack/react-query';

import { type Payment } from '@checkout/contracts';

import { pollingOptions } from '@/shared/api/polling';

import { isProcessing } from '../model/payment';
import { getPayment } from './payment.api';
import { paymentKeys } from './payment.keys';

export const usePayment = (paymentId: string | null, intervalMs: number) => {
  const query = useQuery({
    queryKey: paymentId ? paymentKeys.detail(paymentId) : paymentKeys.all,
    queryFn: paymentId ? ({ signal }) => getPayment(paymentId, signal) : skipToken,
    staleTime: intervalMs,
    ...pollingOptions<Payment>(isProcessing, intervalMs),
  });

  return { payment: paymentId ? query.data : undefined, error: query.error };
};
