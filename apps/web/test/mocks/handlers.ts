import { http, HttpResponse } from 'msw';

import { demoProducts } from '@test/factories/products';

import { api, cartHandler, envelope, sessionHandler, sessionToken } from './api';

export const handlers = [
  sessionHandler(),
  cartHandler(sessionToken),
  http.get(api('/api/products'), () => HttpResponse.json(envelope(demoProducts))),
];
