import { createBrowserRouter } from 'react-router';

import { CartPage } from '@/pages/cart';
import { CatalogPage } from '@/pages/catalog';
import { CheckoutPage } from '@/pages/checkout';
import { OrderPage } from '@/pages/order';
import { OrdersPage } from '@/pages/orders';
import { PaymentPage } from '@/pages/payment';

import { RootLayout } from './ui/RootLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: CatalogPage },
      { path: 'cart', Component: CartPage },
      { path: 'checkout', Component: CheckoutPage },
      { path: 'orders', Component: OrdersPage },
      { path: 'orders/:orderId', Component: OrderPage },
      { path: 'orders/:orderId/payment', Component: PaymentPage },
    ],
  },
]);
