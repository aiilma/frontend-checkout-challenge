export const paymentKeys = {
  sandbox: ['sandbox'] as const,
  all: ['payments'] as const,
  list: (orderId: string) => ['payments', 'order', orderId] as const,
  detail: (paymentId: string) => ['payments', paymentId] as const,
};
