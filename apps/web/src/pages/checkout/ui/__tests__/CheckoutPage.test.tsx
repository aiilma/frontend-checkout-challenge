import { screen, waitFor, within } from '@testing-library/react';
import { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route, Routes, useParams } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';

import { type CreateOrder, type Delivery, type Quote } from '@checkout/contracts';

import { makeCart, lampItem, mugItem } from '@test/factories/cart';
import { makeCheckoutOptions, makeQuote } from '@test/factories/checkout';
import { makeOrder } from '@test/factories/order';
import { api, counting, envelope, errorEnvelope, errorResponse } from '@test/mocks/api';
import { server } from '@test/mocks/server';
import { renderWithProviders } from '@test/utils/render';

import { CheckoutPage } from '../CheckoutPage';

const cart = makeCart([{ ...lampItem, quantity: 1, lineTotal: 249000 }, mugItem]);

const useCheckoutState = () => {
  const quotes: Quote[] = [];
  server.use(
    http.get(api('/api/cart'), () => HttpResponse.json(envelope(cart))),
    http.get(api('/api/checkout/options'), () =>
      HttpResponse.json(envelope(makeCheckoutOptions(cart))),
    ),
    http.post<never, { cartVersion: number; delivery: Delivery }>(
      api('/api/quotes'),
      async ({ request }) => {
        const body = await request.json();
        const quote = makeQuote(cart, body.delivery, `quote-${quotes.length + 1}`);
        quotes.push(quote);
        return HttpResponse.json(envelope(quote), { status: 201 });
      },
    ),
  );
  return quotes;
};

const summary = () => within(screen.getByRole('region', { name: 'Итог заказа' }));

const OrderStub = ({ title }: { title: string }) => {
  const { orderId } = useParams();
  return (
    <p>
      {title} {orderId}
    </p>
  );
};

const renderCheckout = () =>
  renderWithProviders(
    <Routes>
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/orders/:orderId/payment" element={<OrderStub title="Оплата заказа" />} />
      <Route path="/orders/:orderId" element={<OrderStub title="Заказ" />} />
    </Routes>,
    { route: '/checkout' },
  );

const fillContacts = async (user: UserEvent, phone = '+79990000000') => {
  await user.type(screen.getByLabelText('Имя'), 'Тестовый Покупатель');
  await user.type(screen.getByLabelText('Email'), 'buyer@example.test');
  await user.type(screen.getByLabelText('Телефон'), phone);
};

const choosePickupPoint = async (user: UserEvent) => {
  await user.click(screen.getByRole('radio', { name: /Центральный пункт/ }));
  await waitFor(() => {
    expect(summary().getByText('Итого')).toBeVisible();
  });
};

interface OrdersLog {
  bodies: CreateOrder[];
  keys: (string | null)[];
}

const useOrdersApi = (quotes: Quote[], responses: (() => Response | null)[] = []) => {
  const log: OrdersLog = { bodies: [], keys: [] };
  server.use(
    http.post<never, CreateOrder>(api('/api/orders'), async ({ request }) => {
      const body = await request.json();
      log.bodies.push(body);
      log.keys.push(request.headers.get('Idempotency-Key'));
      const custom = responses.shift()?.();
      if (custom) return custom;
      const quote = quotes.find((candidate) => candidate.id === body.quoteId);
      if (!quote)
        return HttpResponse.json(errorEnvelope('QUOTE_NOT_FOUND', 'Нет'), { status: 404 });
      return HttpResponse.json(envelope(makeOrder(quote, body, `order-${log.bodies.length}`)), {
        status: 201,
      });
    }),
  );
  return log;
};

describe('CheckoutPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('показывает способы доставки и оплаты из API и сумму товаров', async () => {
    useCheckoutState();
    renderWithProviders(<CheckoutPage />);

    expect(await screen.findByRole('radio', { name: /Самовывоз/ })).toBeVisible();
    expect(screen.getByRole('radio', { name: /Курьер/ })).toBeVisible();
    expect(screen.getByRole('radio', { name: /Картой онлайн/ })).toBeVisible();
    expect(screen.getByRole('radio', { name: /Наличными/ })).toBeVisible();
    expect(summary().getByText(/3\s380\s₽/)).toBeVisible();
  });

  it('выбор пункта выдачи запрашивает расчёт, курьер меняет доставку и итог', async () => {
    const quotes = useCheckoutState();
    const { user } = renderWithProviders(<CheckoutPage />);
    await screen.findByRole('radio', { name: /Самовывоз/ });

    await user.click(screen.getByRole('radio', { name: /Центральный пункт/ }));

    await waitFor(() => {
      expect(summary().getByText('Доставка')).toBeVisible();
    });
    expect(quotes.at(-1)?.delivery).toEqual({ method: 'pickup', pickupPointId: 'point-center' });
    expect(summary().getByText(/^0\s₽/)).toBeVisible();

    await user.click(screen.getByRole('radio', { name: /Курьер/ }));
    await user.type(screen.getByLabelText('Город'), 'Учебный');
    await user.type(screen.getByLabelText('Улица'), 'Примерная');
    await user.type(screen.getByLabelText('Дом'), '10');

    await waitFor(() => {
      expect(summary().getByText(/^390\s₽/)).toBeVisible();
    });
    expect(summary().getByText(/3\s770\s₽/)).toBeVisible();
    expect(quotes.at(-1)?.delivery).toEqual({
      method: 'courier',
      address: { city: 'Учебный', street: 'Примерная', house: '10' },
    });
  });

  it('конфликт версии корзины при расчёте перечитывает корзину и повторяет расчёт', async () => {
    useCheckoutState();
    const cartCalls = counting(() => HttpResponse.json(envelope(cart)));
    const quoteCalls = counting(() =>
      quoteCalls.calls() === 1
        ? errorResponse(409, 'CART_VERSION_CONFLICT', 'Корзина изменилась. Обновите расчёт.')
        : undefined,
    );
    server.use(
      http.get(api('/api/cart'), cartCalls.resolve),
      http.post(api('/api/quotes'), quoteCalls.resolve),
    );
    const { user } = renderWithProviders(<CheckoutPage />);
    await screen.findByRole('radio', { name: /Самовывоз/ });
    await user.type(screen.getByLabelText('Имя'), 'Тестовый Покупатель');

    await user.click(screen.getByRole('radio', { name: /Центральный пункт/ }));

    await waitFor(() => {
      expect(summary().getByText('Итого')).toBeVisible();
    });
    expect(quoteCalls.calls()).toBe(2);
    expect(cartCalls.calls()).toBeGreaterThanOrEqual(2);
    expect(screen.getByLabelText('Имя')).toHaveValue('Тестовый Покупатель');
  });

  it('сбой расчёта показывает ошибку в итоге и повторяется по действию', async () => {
    useCheckoutState();
    const quoteCalls = counting(() =>
      quoteCalls.calls() === 1 ? errorResponse(500, 'INTERNAL_ERROR', 'Сбой расчёта.') : undefined,
    );
    server.use(http.post(api('/api/quotes'), quoteCalls.resolve));
    const { user } = renderWithProviders(<CheckoutPage />);
    await screen.findByRole('radio', { name: /Самовывоз/ });

    await user.click(screen.getByRole('radio', { name: /Центральный пункт/ }));

    expect(await summary().findByText('Сбой расчёта.')).toBeVisible();
    await user.click(summary().getByRole('button', { name: 'Повторить' }));

    await waitFor(() => {
      expect(summary().getByText('Итого')).toBeVisible();
    });
    expect(quoteCalls.calls()).toBe(2);
  });

  it('некорректный email подсвечивается после ухода из поля, до отправки', async () => {
    useCheckoutState();
    const { user } = renderWithProviders(<CheckoutPage />);
    await screen.findByRole('radio', { name: /Самовывоз/ });

    await user.type(screen.getByLabelText('Email'), '43');
    await user.tab();

    expect(await screen.findByText('Введите корректный email')).toBeVisible();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('некорректный телефон не отправляется и подсвечивается у поля', async () => {
    const quotes = useCheckoutState();
    const orders = useOrdersApi(quotes);
    const { user } = renderCheckout();
    await screen.findByRole('radio', { name: /Самовывоз/ });
    await fillContacts(user, '123');
    await choosePickupPoint(user);

    await user.click(screen.getByRole('button', { name: 'Перейти к оплате' }));

    const phone = screen.getByLabelText('Телефон');
    expect(await screen.findByText('Телефон в формате +79990000000')).toBeVisible();
    expect(phone).toHaveAttribute('aria-invalid', 'true');
    expect(orders.bodies).toHaveLength(0);
  });

  it('заказ картой создаётся с ключом идемпотентности и ведёт на оплату', async () => {
    const quotes = useCheckoutState();
    const orders = useOrdersApi(quotes);
    const { user } = renderCheckout();
    await screen.findByRole('radio', { name: /Самовывоз/ });
    await fillContacts(user);
    await choosePickupPoint(user);

    await user.click(screen.getByRole('button', { name: 'Перейти к оплате' }));

    expect(await screen.findByText('Оплата заказа order-1')).toBeVisible();
    expect(orders.bodies).toEqual([
      {
        quoteId: 'quote-1',
        customer: {
          name: 'Тестовый Покупатель',
          email: 'buyer@example.test',
          phone: '+79990000000',
        },
        paymentMethod: 'card',
      },
    ]);
    expect(orders.keys[0]).toMatch(/^[A-Za-z0-9_-]{8,128}$/);
  });

  it('наличные подтверждают заказ без онлайн-оплаты', async () => {
    const quotes = useCheckoutState();
    useOrdersApi(quotes);
    const { user } = renderCheckout();
    await screen.findByRole('radio', { name: /Самовывоз/ });
    await fillContacts(user);
    await choosePickupPoint(user);
    await user.click(screen.getByRole('radio', { name: /Наличными/ }));

    await user.click(screen.getByRole('button', { name: 'Подтвердить заказ' }));

    expect(await screen.findByText('Заказ order-1')).toBeVisible();
  });

  it('устаревший расчёт обновляется, форма сохраняется, повтор создаёт заказ', async () => {
    const quotes = useCheckoutState();
    const orders = useOrdersApi(quotes, [
      () =>
        HttpResponse.json(
          errorEnvelope('QUOTE_EXPIRED', 'Расчёт устарел. Рассчитайте доставку заново.'),
          {
            status: 409,
          },
        ),
    ]);
    const { user } = renderCheckout();
    await screen.findByRole('radio', { name: /Самовывоз/ });
    await fillContacts(user);
    await choosePickupPoint(user);

    await user.click(screen.getByRole('button', { name: 'Перейти к оплате' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Расчёт устарел.');
    await waitFor(() => {
      expect(quotes).toHaveLength(2);
    });
    expect(screen.getByLabelText('Имя')).toHaveValue('Тестовый Покупатель');

    await user.click(screen.getByRole('button', { name: 'Перейти к оплате' }));

    expect(await screen.findByText('Оплата заказа order-2')).toBeVisible();
    expect(orders.bodies[1]?.quoteId).toBe('quote-2');
    expect(orders.keys[1]).not.toBe(orders.keys[0]);
  });

  it('ошибки полей от сервера привязываются к полям формы', async () => {
    const quotes = useCheckoutState();
    useOrdersApi(quotes, [
      () =>
        HttpResponse.json(
          errorEnvelope('VALIDATION_ERROR', 'Проверьте формат и поля запроса.', [
            { path: 'body/customer/email', message: 'must match format email' },
          ]),
          { status: 400 },
        ),
    ]);
    const { user } = renderCheckout();
    await screen.findByRole('radio', { name: /Самовывоз/ });
    await fillContacts(user);
    await choosePickupPoint(user);

    await user.click(screen.getByRole('button', { name: 'Перейти к оплате' }));

    expect(await screen.findByText('Введите корректный email')).toBeVisible();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('отправка без пункта выдачи подсвечивает группу и не создаёт заказ', async () => {
    const quotes = useCheckoutState();
    const orders = useOrdersApi(quotes);
    const { user } = renderCheckout();
    await screen.findByRole('radio', { name: /Самовывоз/ });
    await fillContacts(user);

    await user.click(screen.getByRole('button', { name: 'Перейти к оплате' }));

    expect(await screen.findByText('Выберите пункт выдачи')).toBeVisible();
    expect(screen.getByRole('radiogroup', { name: 'Пункт выдачи' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(orders.bodies).toHaveLength(0);
  });

  it('пустая корзина не даёт оформить заказ', async () => {
    server.use(http.get(api('/api/cart'), () => HttpResponse.json(envelope(makeCart([])))));
    renderWithProviders(<CheckoutPage />);

    expect(await screen.findByText('В корзине пусто.')).toBeVisible();
    expect(screen.queryByRole('button', { name: /оплате|заказ/ })).not.toBeInTheDocument();
  });
});
