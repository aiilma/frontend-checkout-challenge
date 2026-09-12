import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactElement } from 'react';
import { MemoryRouter } from 'react-router';

import { createTestQueryClient } from './query-client';

interface RenderOptions {
  route?: string;
}

export const renderWithProviders = (ui: ReactElement, { route = '/' }: RenderOptions = {}) => {
  const user = userEvent.setup();
  const result = render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );

  return { user, ...result };
};
