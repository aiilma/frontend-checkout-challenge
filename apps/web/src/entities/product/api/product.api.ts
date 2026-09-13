import { type Product } from '@checkout/contracts';

import { request } from '@/shared/api/request';

export const listProducts = (signal?: AbortSignal) =>
  request<Product[]>({ method: 'GET', path: '/api/products', public: true, signal });
