import { type Query } from '@tanstack/react-query';

import { type ApiError } from './error';

export const pollingOptions = <TData>(isSettled: (data: TData) => boolean, intervalMs: number) => ({
  refetchInterval: (query: Query<TData, ApiError>) => {
    const { data, error } = query.state;
    if (error !== null && !error.isRetryable) return false;
    if (data !== undefined && isSettled(data)) return false;
    return intervalMs;
  },
});
