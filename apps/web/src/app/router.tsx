import { createBrowserRouter } from 'react-router';

import { CartPage } from '@/pages/cart';
import { CatalogPage } from '@/pages/catalog';
import { CheckoutPage } from '@/pages/checkout';

import { RootLayout } from './ui/RootLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: CatalogPage },
      { path: 'cart', Component: CartPage },
      { path: 'checkout', Component: CheckoutPage },
    ],
  },
]);
