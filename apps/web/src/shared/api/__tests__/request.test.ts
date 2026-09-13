import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  api,
  cartHandler,
  emptyCart,
  envelope,
  errorEnvelope,
  errorResponse,
  sessionHandler,
  sessionToken,
} from '@test/mocks/api';
import { server } from '@test/mocks/server';

import { ApiError } from '../error';
import { request, requestWithMeta } from '../request';

const failure = (promise: Promise<unknown>) => promise.catch((caught: unknown) => caught);

describe('request', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('отдаёт data из конверта ответа', async () => {
    server.use(
      http.get(api('/api/products'), () => HttpResponse.json(envelope([{ id: 'lamp-orbit' }]))),
    );

    await expect(request({ method: 'GET', path: '/api/products', public: true })).resolves.toEqual([
      { id: 'lamp-orbit' },
    ]);
  });

  it('пустой ответ 204 отдаёт undefined', async () => {
    server.use(
      http.delete(api('/api/cart/items/lamp-orbit'), () => new HttpResponse(null, { status: 204 })),
    );

    await expect(
      request({ method: 'DELETE', path: '/api/cart/items/lamp-orbit', public: true }),
    ).resolves.toBeUndefined();
  });

  describe('ошибки приводятся к ApiError', () => {
    it('ответ без конверта это ошибка разбора', async () => {
      server.use(http.get(api('/api/products'), () => HttpResponse.json({ items: [] })));

      const error = await failure(request({ method: 'GET', path: '/api/products', public: true }));

      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ kind: 'parse', status: 200, isRetryable: false });
    });

    it('обрыв сети это сетевая ошибка, которую можно повторить', async () => {
      server.use(http.get(api('/api/products'), () => HttpResponse.error()));

      const error = await failure(request({ method: 'GET', path: '/api/products', public: true }));

      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ kind: 'network', status: null, isRetryable: true });
    });

    it('ошибка API отдаёт код, статус, поля и requestId сервера', async () => {
      const fields = [{ path: 'body/cartVersion', message: 'must be integer' }];
      server.use(
        http.post(api('/api/quotes'), () =>
          HttpResponse.json(errorEnvelope('VALIDATION_ERROR', 'Проверьте поля.', fields), {
            status: 400,
          }),
        ),
      );

      const error = await failure(
        request({ method: 'POST', path: '/api/quotes', body: {}, public: true }),
      );

      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({
        kind: 'http',
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Проверьте поля.',
        fields,
        requestId: 'req-err',
        isRetryable: false,
      });
    });
  });

  describe('сессия', () => {
    it('защищённый запрос сам создаёт сессию и отправляет её токен', async () => {
      server.use(sessionHandler(), cartHandler(sessionToken));

      await expect(request({ method: 'GET', path: '/api/cart' })).resolves.toEqual(emptyCart);
    });

    it('сохранённый токен переиспользуется без новой сессии', async () => {
      localStorage.setItem('checkout.session.token', sessionToken);
      server.use(
        http.post(api('/api/sessions'), () => errorResponse(500, 'INTERNAL_ERROR', 'Сбой')),
        cartHandler(sessionToken),
      );

      await expect(request({ method: 'GET', path: '/api/cart' })).resolves.toEqual(emptyCart);
    });

    it('после 401 сессия создаётся заново и запрос повторяется', async () => {
      localStorage.setItem('checkout.session.token', '00000000-0000-4000-8000-000000000000');
      server.use(sessionHandler(), cartHandler(sessionToken));

      await expect(request({ method: 'GET', path: '/api/cart' })).resolves.toEqual(emptyCart);
      expect(localStorage.getItem('checkout.session.token')).toBe(sessionToken);
    });

    it('сбой создания сессии приходит как ApiError', async () => {
      server.use(
        http.post(api('/api/sessions'), () => errorResponse(500, 'INTERNAL_ERROR', 'Сбой')),
      );

      const error = await failure(request({ method: 'GET', path: '/api/cart' }));

      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ kind: 'http', status: 500, code: 'INTERNAL_ERROR' });
    });

    it('параллельные первые запросы создают одну сессию', async () => {
      let created = 0;
      server.use(
        http.post(api('/api/sessions'), () => {
          created += 1;
          return HttpResponse.json(envelope({ id: 's1', token: sessionToken, cart: emptyCart }));
        }),
        cartHandler(sessionToken),
      );

      await Promise.all([
        request({ method: 'GET', path: '/api/cart' }),
        request({ method: 'GET', path: '/api/cart' }),
      ]);

      expect(created).toBe(1);
    });
  });

  it('заголовок Retry-After приходит вместе с данными в миллисекундах', async () => {
    server.use(
      http.post(api('/api/payments/p1/simulations'), () =>
        HttpResponse.json(envelope({ status: 'processing' }), {
          status: 202,
          headers: { 'Retry-After': '2' },
        }),
      ),
    );

    await expect(
      requestWithMeta({
        method: 'POST',
        path: '/api/payments/p1/simulations',
        body: {},
        public: true,
      }),
    ).resolves.toEqual({ data: { status: 'processing' }, retryAfterMs: 2000 });
  });

  it('ответ без Retry-After отдаёт null вместо интервала', async () => {
    server.use(
      http.get(api('/api/products'), () => HttpResponse.json(envelope([{ id: 'lamp-orbit' }]))),
    );

    await expect(
      requestWithMeta({ method: 'GET', path: '/api/products', public: true }),
    ).resolves.toMatchObject({ retryAfterMs: null });
  });

  it('ключ идемпотентности уходит в заголовке Idempotency-Key', async () => {
    server.use(
      sessionHandler(),
      http.post(api('/api/orders'), ({ request: incoming }) =>
        HttpResponse.json(envelope({ key: incoming.headers.get('Idempotency-Key') })),
      ),
    );

    await expect(
      request({ method: 'POST', path: '/api/orders', body: {}, idempotencyKey: 'key-123' }),
    ).resolves.toEqual({ key: 'key-123' });
  });
});
