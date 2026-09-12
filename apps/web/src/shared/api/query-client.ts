import { QueryClient } from '@tanstack/react-query';

import { type ApiError } from './error';

const MAX_NETWORK_RETRIES = 2;
const STALE_TIME_MS = 60_000;

const retryNetworkFailures = (failureCount: number, error: ApiError) =>
  error.isRetryable && failureCount < MAX_NETWORK_RETRIES;

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: retryNetworkFailures,
        refetchOnWindowFocus: false,
        staleTime: STALE_TIME_MS,
      },
      mutations: { retry: false },
    },
  });
