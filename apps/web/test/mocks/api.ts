import { http, HttpResponse, type HttpResponseResolver } from 'msw';

import { type Cart } from '@checkout/contracts';

import { apiBaseUrl } from '@/shared/config/env';
import { type ApiErrorField } from '@/shared/api/error';

export const api = (path: string) => `${apiBaseUrl}${path}`;

export const envelope = (data: unknown) => ({ data, meta: { requestId: 'req-1' } });

export const errorEnvelope = (code: string, message: string, fields?: ApiErrorField[]) => ({
  error: { code, message, ...(fields ? { fields } : {}) },
  meta: { requestId: 'req-err' },
});

export const errorResponse = (status: number, code: string, message: string) =>
  HttpResponse.json(errorEnvelope(code, message), { status });

export const counting = (resolver: HttpResponseResolver) => {
  let calls = 0;
  const resolve: HttpResponseResolver = (info) => {
    calls += 1;
    return resolver(info);
  };
  return { resolve, calls: () => calls };
};

export const sessionToken = '11111111-1111-4111-8111-111111111111';
export const emptyCart: Cart = {
  id: 'cart-1',
  version: 0,
  items: [],
  quantity: 0,
  subtotal: 0,
  currency: 'RUB',
};

export const sessionHandler = () =>
  http.post(api('/api/sessions'), () =>
    HttpResponse.json(envelope({ id: 's1', token: sessionToken, cart: emptyCart })),
  );

export const cartHandler = (expectedToken: string) =>
  http.get(api('/api/cart'), ({ request }) =>
    request.headers.get('Authorization') === `Bearer ${expectedToken}`
      ? HttpResponse.json(envelope(emptyCart))
      : errorResponse(401, 'SESSION_INVALID', 'Сессия не найдена.'),
  );
