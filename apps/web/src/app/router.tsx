import { createBrowserRouter } from 'react-router';

import { CatalogPage } from '@/pages/catalog';

import { RootLayout } from './ui/RootLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [{ index: true, Component: CatalogPage }],
  },
]);
