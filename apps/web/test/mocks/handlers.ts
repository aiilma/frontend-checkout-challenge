import { http, HttpResponse } from 'msw';

import { checkoutOptions } from '@test/factories/checkout';
import { demoProducts } from '@test/factories/products';

import { api, cartHandler, emptyCart, envelope, sessionHandler, sessionToken } from './api';

export const handlers = [
  sessionHandler(),
  cartHandler(sessionToken),
  http.get(api('/api/products'), () => HttpResponse.json(envelope(demoProducts))),
  http.get(api('/api/checkout/options'), () =>
    HttpResponse.json(envelope(checkoutOptions(emptyCart))),
  ),
];
