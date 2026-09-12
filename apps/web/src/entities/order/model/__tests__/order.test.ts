import { describe, expect, it } from 'vitest';

import { type Order } from '@checkout/contracts';

import { cartWith, lampItem } from '@test/factories/cart';
import { quoteFor } from '@test/factories/checkout';
import { orderFor } from '@test/factories/order';

import { orderOutcome } from '../order';

const quote = quoteFor(cartWith([lampItem]), { method: 'pickup', pickupPointId: 'point-center' });
const customer = {
  name: 'Тестовый Покупатель',
  email: 'buyer@example.test',
  phone: '+79990000000',
};
const cardOrder = orderFor(quote, { quoteId: quote.id, customer, paymentMethod: 'card' });
const withPayment = (status: Order['status'], paymentStatus: Order['paymentStatus']): Order => ({
  ...cardOrder,
  status,
  paymentStatus,
});

describe('orderOutcome', () => {
  it('наличные подтверждены без онлайн-оплаты', () => {
    expect(
      orderOutcome(
        orderFor(quote, { quoteId: quote.id, customer, paymentMethod: 'cash_on_delivery' }),
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
