export const orderKeys = {
  all: ['orders'] as const,
  detail: (orderId: string) => ['orders', orderId] as const,
};
