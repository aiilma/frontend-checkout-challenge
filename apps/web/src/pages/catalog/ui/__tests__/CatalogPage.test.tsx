import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { demoProducts } from '@test/factories/products';
import { api, emptyCart, envelope, errorResponse } from '@test/mocks/api';
import { server } from '@test/mocks/server';
import { renderWithProviders } from '@test/utils/render';

import { type CartItem } from '@/entities/cart';

import { CatalogPage } from '../CatalogPage';

describe('CatalogPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('показывает товары из API с ценой в рублях', async () => {
    renderWithProviders(<CatalogPage />);

    expect(await screen.findByRole('heading', { name: 'Настольная лампа «Орбита»' })).toBeVisible();
    expect(screen.getByText(/2\s490\s₽/)).toBeVisible();
    expect(screen.getByText(/890\s₽/)).toBeVisible();
  });

  it('товар без остатка не предлагает добавление', async () => {
    renderWithProviders(<CatalogPage />);
    await screen.findByRole('heading', { name: 'Часы «Точка»' });

    expect(screen.getAllByRole('button', { name: 'В корзину' })).toHaveLength(2);
    expect(screen.getByText('Нет в наличии')).toBeVisible();
  });

  it('добавление кладёт товар в серверную корзину и показывает количество', async () => {
    const items: CartItem[] = [];
    server.use(
      http.get(api('/api/cart'), () => HttpResponse.json(envelope({ ...emptyCart, items }))),
      http.put<{ productId: string }, { quantity: number }>(
        api('/api/cart/items/:productId'),
        async ({ params, request }) => {
          const { quantity } = await request.json();
          items.push({
            productId: params.productId,
            title: 'Настольная лампа «Орбита»',
            unitPrice: 249000,
            quantity,
            lineTotal: 249000 * quantity,
          });
          return HttpResponse.json(envelope(items[0]), { status: 201 });
        },
      ),
    );
    const { user } = renderWithProviders(<CatalogPage />);
    const [addLamp] = await screen.findAllByRole('button', { name: 'В корзину' });
    if (!addLamp) throw new Error('Нет кнопки добавления');

    await user.click(addLamp);

    expect(await screen.findByText('В корзине: 1')).toBeVisible();
    expect(items).toEqual([expect.objectContaining({ productId: 'lamp-orbit', quantity: 1 })]);
  });

  it('при достижении остатка добавление недоступно', async () => {
    const lamp = { ...demoProducts[0], stock: 1 };
    server.use(
      http.get(api('/api/products'), () => HttpResponse.json(envelope([lamp]))),
      http.get(api('/api/cart'), () =>
        HttpResponse.json(
          envelope({
            ...emptyCart,
            items: [
              {
                productId: lamp.id,
                title: lamp.title,
                unitPrice: lamp.price,
                quantity: 1,
                lineTotal: lamp.price,
              },
            ],
          }),
        ),
      ),
    );
    renderWithProviders(<CatalogPage />);

    expect(await screen.findByText('В корзине: 1, больше нет')).toBeVisible();
    expect(screen.getByRole('button', { name: 'В корзину' })).toBeDisabled();
  });

  it('ошибка каталога показывает сообщение, повтор загружает товары', async () => {
    let failing = true;
    server.use(
      http.get(api('/api/products'), () =>
        failing
          ? errorResponse(500, 'INTERNAL_ERROR', 'Не удалось выполнить запрос.')
          : HttpResponse.json(envelope(demoProducts)),
      ),
    );
    const { user } = renderWithProviders(<CatalogPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось выполнить запрос.');

    failing = false;
    await user.click(screen.getByRole('button', { name: 'Повторить' }));

    expect(await screen.findByRole('heading', { name: 'Кружка «Линия»' })).toBeVisible();
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
