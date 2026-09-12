import { useQuery } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { api, counting, envelope, errorResponse } from '@test/mocks/api';
import { server } from '@test/mocks/server';
import { renderHookWithProviders } from '@test/utils/render-hook';

import { pollingOptions } from '../polling';
import { request } from '../request';

interface Payment {
  status: 'processing' | 'succeeded';
}

const isSettled = (payment: Payment) => payment.status !== 'processing';

const paymentSequence = (statuses: Payment['status'][]) => {
  const { resolve, calls } = counting(() => {
    const status = statuses[calls() - 1] ?? statuses.at(-1);
    return HttpResponse.json(envelope({ status }));
  });
  server.use(http.get(api('/api/payments/p1'), resolve));
  return calls;
};

const usePayment = () =>
  useQuery({
    queryKey: ['payment', 'p1'],
    queryFn: () => request<Payment>({ method: 'GET', path: '/api/payments/p1', public: true }),
    ...pollingOptions<Payment>(isSettled, 20),
  });

const settle = () => new Promise((resolve) => setTimeout(resolve, 120));

describe('pollingOptions', () => {
  it('опрос идёт до терминального статуса и останавливается', async () => {
    const calls = paymentSequence(['processing', 'processing', 'succeeded']);
    const { result } = renderHookWithProviders(usePayment);

    await waitFor(() => {
      expect(result.current.data?.status).toBe('succeeded');
    });
    await settle();

    expect(calls()).toBe(3);
  });

  it('размонтирование останавливает опрос', async () => {
    const calls = paymentSequence(['processing']);
    const { result, unmount } = renderHookWithProviders(usePayment);

    await waitFor(() => {
      expect(result.current.data?.status).toBe('processing');
    });
    unmount();
    const atUnmount = calls();
    await settle();

    expect(calls()).toBeLessThanOrEqual(atUnmount + 1);
  });

  it('ошибка API останавливает опрос', async () => {
    const { resolve, calls } = counting(() => errorResponse(404, 'PAYMENT_NOT_FOUND', 'Нет'));
    server.use(http.get(api('/api/payments/p1'), resolve));
    const { result } = renderHookWithProviders(usePayment);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    await settle();

    expect(calls()).toBe(1);
  });
});
