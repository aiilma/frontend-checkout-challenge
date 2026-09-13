import { useQueryClient } from '@tanstack/react-query';

import { type Payment } from '@checkout/contracts';

import { useIdempotentMutation } from '@/shared/api/use-idempotent-mutation';

import { createPayment } from './payment.api';
import { paymentKeys } from './payment.keys';

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  const mutation = useIdempotentMutation({
    mutationFn: (orderId: string, idempotencyKey: string) => createPayment(orderId, idempotencyKey),
    onSuccess: (payment: Payment) => {
      queryClient.setQueryData(paymentKeys.detail(payment.id), payment);
    },
  });

  return { createAttempt: mutation.mutate, isPending: mutation.isPending, error: mutation.error };
};
