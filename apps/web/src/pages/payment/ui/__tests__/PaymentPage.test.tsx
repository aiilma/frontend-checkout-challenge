import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { Route, Routes, useParams } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';

import { type Order, type Payment, type Scenario } from '@checkout/contracts';

import { makeCart, lampItem } from '@test/factories/cart';
import { makeQuote } from '@test/factories/checkout';
import { makeOrder } from '@test/factories/order';
import { makePayment, sandbox, settledStatus } from '@test/factories/payment';
import { api, envelope, errorEnvelope, errorResponse } from '@test/mocks/api';
import { server } from '@test/mocks/server';
import { renderWithProviders } from '@test/utils/render';

import { PaymentPage } from '../PaymentPage';

const cart = makeCart([lampItem]);
const quote = makeQuote(cart, { method: 'pickup', pickupPointId: 'point-center' });
const order = makeOrder(
  quote,
  {
    quoteId: quote.id,
    customer: { name: 'Тестовый Покупатель', email: 'buyer@example.test', phone: '+79990000000' },
    paymentMethod: 'card',
  },
  'order-1',
);

interface PaymentsState {
  payments: Payment[];
  scenarios: Map<string, Scenario>;
  createKeys: (string | null)[];
  polls: number;
}

const usePaymentsApi = (initial: Payment[] = [], pollsUntilSettled = 2) => {
  const state: PaymentsState = {
    payments: initial,
    scenarios: new Map(),
    createKeys: [],
    polls: 0,
  };
  const orderView = (): Order => {
    const latest = state.payments.at(-1);
    if (!latest) return order;
    return {
      ...order,
      status: latest.status === 'succeeded' ? 'paid' : 'awaiting_payment',
      paymentStatus: latest.status === 'processing' ? 'pending' : latest.status,
    };
  };
  const settle = (payment: Payment): Payment => {
    const scenario = state.scenarios.get(payment.id);
    if (payment.status !== 'processing' || !scenario) return payment;
    state.polls += 1;
    if (state.polls < pollsUntilSettled) return payment;
    const status = settledStatus(scenario);
    return { ...payment, status, failureCode: status === 'failed' ? 'CARD_DECLINED' : null };
  };
  server.use(
    http.get(api('/api/orders/order-1'), () => HttpResponse.json(envelope(orderView()))),
    http.get(api('/api/sandbox'), () => HttpResponse.json(envelope(sandbox))),
    http.get(api('/api/orders/order-1/payments'), () =>
      HttpResponse.json(envelope([...state.payments].reverse())),
    ),
    http.post(api('/api/orders/order-1/payments'), ({ request }) => {
      state.createKeys.push(request.headers.get('Idempotency-Key'));
      if (state.payments.some((p) => p.status === 'pending' || p.status === 'processing')) {
        return HttpResponse.json(errorEnvelope('PAYMENT_IN_PROGRESS', 'Есть активная попытка.'), {
          status: 409,
        });
      }
      const payment = makePayment(order, `payment-${state.payments.length + 1}`);
      state.payments.push(payment);
      return HttpResponse.json(envelope(payment), { status: 201 });
    }),
    http.post<{ paymentId: string }, { scenario: Scenario }>(
      api('/api/payments/:paymentId/simulations'),
      async ({ params, request }) => {
        const { scenario } = await request.json();
        state.scenarios.set(params.paymentId, scenario);
        state.payments = state.payments.map((p) =>
          p.id === params.paymentId ? { ...p, status: 'processing' } : p,
        );
        return HttpResponse.json(
          envelope({ id: 'sim-1', paymentId: params.paymentId, scenario, status: 'processing' }),
          { status: 202 },
        );
      },
    ),
    http.get<{ paymentId: string }>(api('/api/payments/:paymentId'), ({ params }) => {
      const payment = state.payments.find((p) => p.id === params.paymentId);
      if (!payment) return errorResponse(404, 'PAYMENT_NOT_FOUND', 'Нет');
      const settled = settle(payment);
      state.payments = state.payments.map((p) => (p.id === settled.id ? settled : p));
      return HttpResponse.json(envelope(settled));
    }),
  );
  return state;
};

const OrderStub = () => {
  const { orderId } = useParams();
  return <p>Заказ {orderId}</p>;
};

const renderPayment = () =>
  renderWithProviders(
    <Routes>
      <Route path="/orders/:orderId/payment" element={<PaymentPage />} />
      <Route path="/orders/:orderId" element={<OrderStub />} />
    </Routes>,
    { route: '/orders/order-1/payment' },
  );

describe('PaymentPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('открывает форму с тестовыми картами из API и создаёт попытку с ключом', async () => {
    const state = usePaymentsApi();
    renderPayment();

    expect(await screen.findByRole('radio', { name: /успешная оплата.*4242/ })).toBeVisible();
    expect(screen.getByRole('radio', { name: /отказ банка.*0002/ })).toBeVisible();
    expect(screen.getByRole('dialog', { name: /DEMO-000001/ })).toHaveTextContent(/4\s980\s₽/);
    await waitFor(() => {
      expect(state.createKeys).toHaveLength(1);
    });
    expect(state.createKeys[0]).toMatch(/^[A-Za-z0-9_-]{8,128}$/);
  });

  it('оплата без выбранной карты подсвечивает группу карт', async () => {
    const state = usePaymentsApi();
    const { user } = renderPayment();
    await screen.findByRole('radio', { name: /успешная оплата/ });

    await user.click(screen.getByRole('button', { name: 'Оплатить' }));

    expect(await screen.findByText('Выберите карту')).toBeVisible();
    expect(state.scenarios.size).toBe(0);
  });

  it('успешная оплата: имитация, ожидание, опрос до succeeded и переход к заказу', async () => {
    const state = usePaymentsApi();
    const { user } = renderPayment();
    await screen.findByRole('radio', { name: /успешная оплата/ });

    await user.click(screen.getByRole('radio', { name: /успешная оплата/ }));
    await user.click(screen.getByRole('button', { name: 'Оплатить' }));

    expect(await screen.findByText('Ждём ответ банка')).toBeVisible();
    expect(await screen.findByText('Заказ order-1', undefined, { timeout: 4000 })).toBeVisible();
    expect(state.scenarios.get('payment-1')).toBe('success');
    expect(state.polls).toBeGreaterThanOrEqual(2);
  });

  it('отказ банка различим и даёт новую попытку с новым ключом', async () => {
    const state = usePaymentsApi();
    const { user } = renderPayment();
    await screen.findByRole('radio', { name: /отказ банка/ });

    await user.click(screen.getByRole('radio', { name: /отказ банка/ }));
    await user.click(screen.getByRole('button', { name: 'Оплатить' }));

    expect(
      await screen.findByText('Банк отклонил оплату.', undefined, { timeout: 4000 }),
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Попробовать снова' }));

    expect(await screen.findByRole('button', { name: 'Оплатить' })).toBeVisible();
    await waitFor(() => {
      expect(state.createKeys).toHaveLength(2);
    });
    expect(state.createKeys[1]).not.toBe(state.createKeys[0]);
    expect(state.payments.map((p) => p.status)).toEqual(['failed', 'pending']);
  });

  it('отмена помечает попытку отменённой и отличается от отказа', async () => {
    const state = usePaymentsApi();
    const { user } = renderPayment();
    await screen.findByRole('radio', { name: /успешная оплата/ });

    await user.click(screen.getByRole('button', { name: 'Отменить оплату' }));

    expect(await screen.findByText('Оплата отменена.', undefined, { timeout: 4000 })).toBeVisible();
    expect(state.scenarios.get('payment-1')).toBe('cancel');
    expect(screen.getByRole('button', { name: 'Попробовать снова' })).toBeVisible();
  });

  it('после перезагрузки незавершённая оплата отслеживается до результата', async () => {
    const state = usePaymentsApi([makePayment(order, 'payment-1', 'processing')]);
    state.scenarios.set('payment-1', 'success');
    renderPayment();

    expect(await screen.findByText('Ждём ответ банка')).toBeVisible();
    expect(await screen.findByText('Заказ order-1', undefined, { timeout: 4000 })).toBeVisible();
    expect(state.createKeys).toHaveLength(0);
  });
});
