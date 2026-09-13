import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, type RouteObject } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { createTestQueryClient } from './query-client';

interface RenderRouterOptions {
  route?: string;
  queryClient?: QueryClient;
}

export const renderWithRouter = (
  routes: RouteObject[],
  { route = '/', queryClient = createTestQueryClient() }: RenderRouterOptions = {},
) => {
  const user = userEvent.setup();
  const router = createMemoryRouter(routes, { initialEntries: [route] });
  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return { user, router, ...result };
};
