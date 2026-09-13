import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { makeCart, lampItem, mugItem } from '@test/factories/cart';
import { makeQuote } from '@test/factories/checkout';
import { makeOrder } from '@test/factories/order';
import { api, envelope } from '@test/mocks/api';
import { server } from '@test/mocks/server';
import { renderWithProviders } from '@test/utils/render';

import { OrdersPage } from '../OrdersPage';

const quote = makeQuote(makeCart([lampItem, mugItem]), {
  method: 'pickup',
  pickupPointId: 'point-center',
});
const customer = {
  name: 'Тестовый Покупатель',
  email: 'buyer@example.test',
  phone: '+79990000000',
};
const paid = {
  ...makeOrder(quote, { quoteId: quote.id, customer, paymentMethod: 'card' }, 'order-1'),
  status: 'paid' as const,
  paymentStatus: 'succeeded' as const,
};
const cash = {
  ...makeOrder(
    quote,
    { quoteId: quote.id, customer, paymentMethod: 'cash_on_delivery' },
    'order-2',
  ),
  number: 'DEMO-000002',
};

describe('OrdersPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('показывает заказы сессии со статусом, суммой и ссылкой на заказ', async () => {
    server.use(http.get(api('/api/orders'), () => HttpResponse.json(envelope([cash, paid]))));
    renderWithProviders(<OrdersPage />);

    expect(await screen.findByRole('link', { name: 'DEMO-000002' })).toHaveAttribute(
      'href',
      '/orders/order-2',
    );
    expect(screen.getByRole('link', { name: 'DEMO-000001' })).toHaveAttribute(
      'href',
      '/orders/order-1',
    );
    expect(screen.getByText('Оплачен')).toBeVisible();
    expect(screen.getByText('Оформлен, оплата при получении')).toBeVisible();
    expect(screen.getAllByText(/5\s870\s₽/)).toHaveLength(2);
  });

  it('без заказов показывает пустое состояние со ссылкой в каталог', async () => {
    server.use(http.get(api('/api/orders'), () => HttpResponse.json(envelope([]))));
    renderWithProviders(<OrdersPage />);

    expect(await screen.findByText('Заказов пока нет.')).toBeVisible();
    expect(screen.getByRole('link', { name: 'В каталог' })).toHaveAttribute('href', '/');
  });
});
