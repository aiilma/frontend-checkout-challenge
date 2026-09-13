import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';

import { api, emptyCart, envelope } from '@test/mocks/api';
import { server } from '@test/mocks/server';
import { renderWithProviders } from '@test/utils/render';

import { RootLayout } from '../RootLayout';

const renderLayout = () =>
  renderWithProviders(
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<p>Содержимое страницы</p>} />
      </Route>
    </Routes>,
  );

describe('RootLayout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('показывает количество товаров в ссылке на корзину', async () => {
    server.use(
      http.get(api('/api/cart'), () => HttpResponse.json(envelope({ ...emptyCart, quantity: 3 }))),
    );
    renderLayout();

    expect(await screen.findByRole('link', { name: 'Корзина · 3' })).toHaveAttribute(
      'href',
      '/cart',
    );
    expect(screen.getByText('Содержимое страницы')).toBeVisible();
  });

  it('пустая корзина без счётчика', async () => {
    renderLayout();

    expect(await screen.findByRole('link', { name: 'Корзина' })).toBeVisible();
  });
});
