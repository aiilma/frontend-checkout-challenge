import { useQuery } from '@tanstack/react-query';

import { type Payment } from '@checkout/contracts';

import { listPayments } from './payment.api';
import { paymentKeys } from './payment.keys';

const noPayments: Payment[] = [];

export const usePayments = (orderId: string) => {
  const query = useQuery({
    queryKey: paymentKeys.list(orderId),
    queryFn: ({ signal }) => listPayments(orderId, signal),
  });

  return { payments: query.data ?? noPayments, isLoading: query.isPending, error: query.error };
};
