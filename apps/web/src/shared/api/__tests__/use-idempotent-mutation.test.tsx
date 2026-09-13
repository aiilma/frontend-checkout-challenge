import { act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderHookWithProviders } from '@test/utils/render-hook';

import { ApiError } from '../error';
import { useIdempotentMutation } from '../use-idempotent-mutation';

interface OrderBody {
  quoteId: string;
}

const networkFailure = () =>
  new ApiError({ kind: 'network', code: 'NETWORK_ERROR', message: 'Нет связи' });
const conflict = () =>
  new ApiError({ kind: 'http', code: 'QUOTE_EXPIRED', message: 'Расчёт устарел', status: 409 });

const setup = (outcomes: (() => Promise<{ id: string }>)[]) => {
  const keys: string[] = [];
  const mutationFn = vi.fn((_body: OrderBody, key: string) => {
    keys.push(key);
    const next = outcomes.shift();
    return next ? next() : Promise.resolve({ id: 'order-1' });
  });
  const rendered = renderHookWithProviders(() => useIdempotentMutation({ mutationFn }));

  return { keys, ...rendered };
};

describe('useIdempotentMutation', () => {
  it('повторный вызов с тем же телом до ответа сервера использует тот же ключ', async () => {
    const pending = () => new Promise<{ id: string }>(() => undefined);
    const { keys, result } = setup([pending, pending]);

    act(() => {
      result.current.mutate({ quoteId: 'q1' });
      result.current.mutate({ quoteId: 'q1' });
    });

    await waitFor(() => {
      expect(keys).toHaveLength(2);
    });
    expect(keys[0]).toBe(keys[1]);
  });

  it('после сетевой ошибки повтор с тем же телом использует тот же ключ', async () => {
    const { keys, result } = setup([() => Promise.reject(networkFailure())]);

    act(() => {
      result.current.mutate({ quoteId: 'q1' });
    });
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    act(() => {
      result.current.mutate({ quoteId: 'q1' });
    });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(keys).toHaveLength(2);
    expect(keys[0]).toBe(keys[1]);
  });

  it('после успешного ответа следующий вызов получает новый ключ', async () => {
    const { keys, result } = setup([]);

    act(() => {
      result.current.mutate({ quoteId: 'q1' });
    });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    act(() => {
      result.current.mutate({ quoteId: 'q1' });
    });
    await waitFor(() => {
      expect(keys).toHaveLength(2);
    });

    expect(keys[0]).not.toBe(keys[1]);
  });

  it('после ошибки API следующий вызов получает новый ключ', async () => {
    const { keys, result } = setup([() => Promise.reject(conflict())]);

    act(() => {
      result.current.mutate({ quoteId: 'q1' });
    });
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    act(() => {
      result.current.mutate({ quoteId: 'q1' });
    });
    await waitFor(() => {
      expect(keys).toHaveLength(2);
    });

    expect(keys[0]).not.toBe(keys[1]);
  });

  it('другое тело получает новый ключ даже после сетевой ошибки', async () => {
    const { keys, result } = setup([() => Promise.reject(networkFailure())]);

    act(() => {
      result.current.mutate({ quoteId: 'q1' });
    });
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    act(() => {
      result.current.mutate({ quoteId: 'q2' });
    });
    await waitFor(() => {
      expect(keys).toHaveLength(2);
    });

    expect(keys[0]).not.toBe(keys[1]);
  });
});
