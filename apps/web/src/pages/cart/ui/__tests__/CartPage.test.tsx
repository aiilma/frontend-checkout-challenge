import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { api, emptyCart, envelope, errorResponse } from '@test/mocks/api';
import { server } from '@test/mocks/server';
import { renderWithProviders } from '@test/utils/render';

import { type CartItem } from '@/entities/cart';

import { CartPage } from '../CartPage';

const lamp: CartItem = {
  productId: 'lamp-orbit',
  title: 'Настольная лампа «Орбита»',
  unitPrice: 249000,
  quantity: 2,
  lineTotal: 498000,
};
const mug: CartItem = {
  productId: 'mug-line',
  title: 'Кружка «Линия»',
  unitPrice: 89000,
  quantity: 1,
  lineTotal: 89000,
};

const cartWith = (items: CartItem[]) => {
  let quantity = 0;
  let subtotal = 0;
  for (const item of items) {
    quantity += item.quantity;
    subtotal += item.lineTotal;
  }
  return { ...emptyCart, version: items.length, items, quantity, subtotal };
};

const useCartState = (initial: CartItem[]) => {
  let items = initial;
  server.use(
    http.get(api('/api/cart'), () => HttpResponse.json(envelope(cartWith(items)))),
    http.put<{ productId: string }, { quantity: number }>(
      api('/api/cart/items/:productId'),
      async ({ params, request }) => {
        const { quantity } = await request.json();
        items = items.map((item) =>
          item.productId === params.productId
            ? { ...item, quantity, lineTotal: item.unitPrice * quantity }
            : item,
        );
        return HttpResponse.json(envelope(items.find((i) => i.productId === params.productId)));
      },
    ),
    http.delete<{ productId: string }>(api('/api/cart/items/:productId'), ({ params }) => {
      items = items.filter((item) => item.productId !== params.productId);
      return new HttpResponse(null, { status: 204 });
    }),
  );
  return () => items;
};

const row = (title: string) => within(screen.getByRole('row', { name: new RegExp(title) }));

describe('CartPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('показывает позиции, суммы строк и итог из API', async () => {
    useCartState([lamp, mug]);
    renderWithProviders(<CartPage />);

    expect(await screen.findByRole('row', { name: /Орбита/ })).toBeVisible();
    expect(row('Орбита').getByText(/4\s980\s₽/)).toBeVisible();
    expect(screen.getByText('Итого')).toBeVisible();
    expect(screen.getByText(/5\s870\s₽/)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Оформить' })).toHaveAttribute('href', '/checkout');
  });

  it('пустая корзина ведёт в каталог и не даёт оформить заказ', async () => {
    useCartState([]);
    renderWithProviders(<CartPage />);

    expect(await screen.findByText('В корзине пусто.')).toBeVisible();
    expect(screen.getByRole('link', { name: 'В каталог' })).toHaveAttribute('href', '/');
    expect(screen.queryByRole('link', { name: 'Оформить' })).not.toBeInTheDocument();
  });

  it('плюс увеличивает количество на сервере, минус при единице недоступен', async () => {
    const items = useCartState([lamp, mug]);
    const { user } = renderWithProviders(<CartPage />);
    await screen.findByRole('row', { name: /Орбита/ });

    await user.click(row('Орбита').getByRole('button', { name: 'Больше' }));

    await waitFor(() => {
      expect(row('Орбита').getByText('3')).toBeVisible();
    });
    expect(items()[0]?.quantity).toBe(3);
    expect(row('Линия').getByRole('button', { name: 'Меньше' })).toBeDisabled();
  });

  it('удаление убирает позицию', async () => {
    const items = useCartState([lamp, mug]);
    const { user } = renderWithProviders(<CartPage />);
    await screen.findByRole('row', { name: /Линия/ });

    await user.click(row('Линия').getByRole('button', { name: 'Удалить' }));

    await waitFor(() => {
      expect(screen.queryByRole('row', { name: /Линия/ })).not.toBeInTheDocument();
    });
    expect(items()).toHaveLength(1);
  });

  it('плюс недоступен при достижении остатка товара', async () => {
    useCartState([{ ...mug, quantity: 20, lineTotal: 89000 * 20 }]);
    renderWithProviders(<CartPage />);
    await screen.findByRole('row', { name: /Линия/ });

    await waitFor(() => {
      expect(row('Линия').getByRole('button', { name: 'Больше' })).toBeDisabled();
    });
  });

  it('ошибка изменения количества показывается в строке', async () => {
    useCartState([lamp]);
    server.use(
      http.put(api('/api/cart/items/:productId'), () =>
        errorResponse(409, 'INSUFFICIENT_STOCK', 'Доступно не более 10 шт.'),
      ),
    );
    const { user } = renderWithProviders(<CartPage />);
    await screen.findByRole('row', { name: /Орбита/ });

    await user.click(row('Орбита').getByRole('button', { name: 'Больше' }));

    expect(await row('Орбита').findByText('Доступно не более 10 шт.')).toBeVisible();
  });
});
