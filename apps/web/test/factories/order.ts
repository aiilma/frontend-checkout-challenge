import { type CreateOrder, type Order, type Quote } from '@checkout/contracts';

export const makeOrder = (quote: Quote, body: CreateOrder, id = 'order-1'): Order => ({
  id,
  number: 'DEMO-000001',
  status: body.paymentMethod === 'card' ? 'awaiting_payment' : 'confirmed',
  paymentStatus: 'unpaid',
  paymentMethod: body.paymentMethod,
  customer: body.customer,
  items: quote.items,
  delivery: quote.delivery,
  subtotal: quote.subtotal,
  shipping: quote.shipping,
  total: quote.total,
  currency: 'RUB',
  createdAt: '2026-09-12T12:00:00.000Z',
});
