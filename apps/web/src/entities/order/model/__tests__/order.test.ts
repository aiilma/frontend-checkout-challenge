import { describe, expect, it } from 'vitest';

import { type Order } from '@checkout/contracts';

import { makeCart, lampItem } from '@test/factories/cart';
import { makeQuote } from '@test/factories/checkout';
import { makeOrder } from '@test/factories/order';

import { orderOutcome } from '../order';

const quote = makeQuote(makeCart([lampItem]), { method: 'pickup', pickupPointId: 'point-center' });
const customer = {
  name: 'Тестовый Покупатель',
  email: 'buyer@example.test',
  phone: '+79990000000',
};
const cardOrder = makeOrder(quote, { quoteId: quote.id, customer, paymentMethod: 'card' });
const withPayment = (status: Order['status'], paymentStatus: Order['paymentStatus']): Order => ({
  ...cardOrder,
  status,
  paymentStatus,
});

describe('orderOutcome', () => {
  it('наличные подтверждены без онлайн-оплаты', () => {
    expect(
      orderOutcome(
        makeOrder(quote, { quoteId: quote.id, customer, paymentMethod: 'cash_on_delivery' }),
      ),
    ).toBe('confirmed');
  });

  it('карта оплачена только при paid и succeeded', () => {
    expect(orderOutcome(withPayment('paid', 'succeeded'))).toBe('paid');
    expect(orderOutcome(withPayment('awaiting_payment', 'succeeded'))).toBe('unpaid');
  });

  it('обрабатываемая оплата это ожидание', () => {
    expect(orderOutcome(withPayment('awaiting_payment', 'pending'))).toBe('pending');
  });

  it('отказ, отмена и отсутствие оплаты требуют оплаты', () => {
    expect(orderOutcome(withPayment('awaiting_payment', 'failed'))).toBe('unpaid');
    expect(orderOutcome(withPayment('awaiting_payment', 'cancelled'))).toBe('unpaid');
    expect(orderOutcome(withPayment('awaiting_payment', 'unpaid'))).toBe('unpaid');
  });
});
