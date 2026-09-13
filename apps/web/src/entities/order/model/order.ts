import { type Order } from '@checkout/contracts';

export type OrderOutcome = 'paid' | 'confirmed' | 'pending' | 'unpaid';

export const outcomeLabel: Record<OrderOutcome, string> = {
  paid: 'Оплачен',
  confirmed: 'Оформлен, оплата при получении',
  pending: 'Ожидает оплаты',
  unpaid: 'Не оплачен',
};

const outcomeHeadline: Record<OrderOutcome, string> = {
  paid: 'оплачен.',
  confirmed: 'оформлен, оплата при получении.',
  pending: 'ожидает оплаты.',
  unpaid: 'не оплачен.',
};

export const orderOutcome = (order: Order): OrderOutcome => {
  if (order.paymentMethod === 'cash_on_delivery') return 'confirmed';
  if (order.status === 'paid' && order.paymentStatus === 'succeeded') return 'paid';
  if (order.paymentStatus === 'pending') return 'pending';
  return 'unpaid';
};

export const orderHeadline = (order: Order, outcome: OrderOutcome) =>
  `Заказ ${order.number} ${outcomeHeadline[outcome]}`;

export const needsPayment = (outcome: OrderOutcome) =>
  outcome === 'unpaid' || outcome === 'pending';
