import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type SimulationInput, simulatePayment } from './payment.api';
import { paymentKeys } from './payment.keys';

export const useSimulatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: simulatePayment,
    onSuccess: (_simulation, { paymentId }: SimulationInput) =>
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(paymentId) }),
  });
};
