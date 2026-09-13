import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type SimulationInput, simulatePayment } from './payment.api';
import { paymentKeys } from './payment.keys';

export const useSimulatePayment = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: simulatePayment,
    onSuccess: (_result, { paymentId }: SimulationInput) =>
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(paymentId) }),
  });

  return {
    simulate: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
    scenario: mutation.data?.data.scenario ?? null,
    retryAfterMs: mutation.data?.retryAfterMs ?? null,
  };
};
