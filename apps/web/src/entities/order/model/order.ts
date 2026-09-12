import { type Order } from '@checkout/contracts';

export type OrderOutcome = 'paid' | 'confirmed' | 'pending' | 'unpaid';

export const outcomeLabel: Record<OrderOutcome, string> = {
  paid: 'Оплачен',
  confirmed: 'Оформлен, оплата при получении',
  pending: 'Ожидает оплаты',
  unpaid: 'Ожидает оплаты',
};

export const orderOutcome = (order: Order): OrderOutcome => {
  if (order.paymentMethod === 'cash_on_delivery') return 'confirmed';
  if (order.status === 'paid' && order.paymentStatus === 'succeeded') return 'paid';
  if (order.paymentStatus === 'pending') return 'pending';
  return 'unpaid';
};
