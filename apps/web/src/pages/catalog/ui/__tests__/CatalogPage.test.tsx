import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@test/utils/render';

import { CatalogPage } from '../CatalogPage';

describe('CatalogPage', () => {
  it('показывает заголовок каталога', () => {
    renderWithProviders(<CatalogPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Каталог' })).toBeInTheDocument();
  });
});
