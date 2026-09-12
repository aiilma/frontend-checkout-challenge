import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';

import { type Order } from '@checkout/contracts';

import { cartWith, lampItem, mugItem } from '@test/factories/cart';
import { quoteFor } from '@test/factories/checkout';
import { orderFor } from '@test/factories/order';
import { api, envelope } from '@test/mocks/api';
import { server } from '@test/mocks/server';
import { createTestQueryClient } from '@test/utils/query-client';
import { renderWithProviders } from '@test/utils/render';

import { orderKeys } from '@/entities/order';

import { OrderPage } from '../OrderPage';

const quote = quoteFor(cartWith([lampItem, mugItem]), {
  method: 'pickup',
  pickupPointId: 'point-center',
});
const customer = {
  name: 'Тестовый Покупатель',
  email: 'buyer@example.test',
  phone: '+79990000000',
};
const cardOrder = orderFor(quote, { quoteId: quote.id, customer, paymentMethod: 'card' });

const serveOrder = (order: Order) => {
  server.use(http.get(api('/api/orders/order-1'), () => HttpResponse.json(envelope(order))));
};

const renderOrder = (queryClient = createTestQueryClient()) =>
  renderWithProviders(
    <Routes>
      <Route path="/orders/:orderId" element={<OrderPage />} />
    </Routes>,
    { route: '/orders/order-1', queryClient },
  );

describe('OrderPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('оплаченный заказ показывает номер, товары, доставку и сумму с сервера', async () => {
    serveOrder({ ...cardOrder, status: 'paid', paymentStatus: 'succeeded' });
    renderOrder();

    expect(
      await screen.findByRole('heading', { name: 'Заказ DEMO-000001 оплачен.' }),
    ).toBeVisible();
    expect(screen.getByText('Настольная лампа «Орбита»')).toBeVisible();
    expect(screen.getByText('Кружка «Линия»')).toBeVisible();
    expect(await screen.findByText(/Самовывоз: Центральный пункт/)).toBeVisible();
    expect(screen.getByText('Итого').parentElement).toHaveTextContent(/5\s870\s₽/);
    expect(screen.queryByRole('link', { name: 'Оплатить' })).not.toBeInTheDocument();
  });

  it('заказ за наличные подтверждён без онлайн-оплаты', async () => {
    serveOrder(orderFor(quote, { quoteId: quote.id, customer, paymentMethod: 'cash_on_delivery' }));
    renderOrder();

    expect(
      await screen.findByRole('heading', {
        name: 'Заказ DEMO-000001 оформлен, оплата при получении.',
      }),
    ).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Оплатить' })).not.toBeInTheDocument();
  });

  it('неоплаченный заказ картой предлагает оплатить', async () => {
    serveOrder({ ...cardOrder, paymentStatus: 'failed' });
    renderOrder();

    expect(
      await screen.findByRole('heading', { name: 'Заказ DEMO-000001 ожидает оплаты.' }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Оплатить' })).toHaveAttribute(
      'href',
      '/orders/order-1/payment',
    );
  });

  it('статус берётся с сервера, а не из кэша после создания заказа', async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(orderKeys.detail('order-1'), cardOrder);
    serveOrder({ ...cardOrder, status: 'paid', paymentStatus: 'succeeded' });
    renderOrder(queryClient);

    expect(
      await screen.findByRole('heading', { name: 'Заказ DEMO-000001 оплачен.' }),
    ).toBeVisible();
  });
});
