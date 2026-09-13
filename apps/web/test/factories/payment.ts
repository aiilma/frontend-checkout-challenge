import { type Order, type Payment, type Scenario } from '@checkout/contracts';

export const sandbox = {
  settlementDelayMs: 1200,
  cards: [
    {
      id: 'test-success',
      title: 'Тестовая карта: успешная оплата',
      maskedNumber: '•••• 4242',
      scenario: 'success' as const,
    },
    {
      id: 'test-decline',
      title: 'Тестовая карта: отказ банка',
      maskedNumber: '•••• 0002',
      scenario: 'decline' as const,
    },
  ],
};

export const makePayment = (
  order: Order,
  id: string,
  status: Payment['status'] = 'pending',
): Payment => ({
  id,
  orderId: order.id,
  status,
  amount: order.total,
  currency: 'RUB',
  createdAt: '2026-09-12T12:00:00.000Z',
  failureCode: status === 'failed' ? 'CARD_DECLINED' : null,
});

const settledStatuses: Record<Scenario, Payment['status']> = {
  success: 'succeeded',
  decline: 'failed',
  cancel: 'cancelled',
};

export const settledStatus = (scenario: Scenario) => settledStatuses[scenario];
