import { type Order } from '@checkout/contracts';

export type OrderOutcome = 'paid' | 'confirmed' | 'pending' | 'unpaid';

export const orderOutcome = (order: Order): OrderOutcome => {
  if (order.paymentMethod === 'cash_on_delivery') return 'confirmed';
  if (order.status === 'paid' && order.paymentStatus === 'succeeded') return 'paid';
  if (order.paymentStatus === 'pending') return 'pending';
  return 'unpaid';
};
