import { request } from '@/shared/api/request';

import { type CheckoutOptions } from '../model/checkout-options.types';

export const getCheckoutOptions = (signal?: AbortSignal) =>
  request<CheckoutOptions>({ method: 'GET', path: '/api/checkout/options', signal });
