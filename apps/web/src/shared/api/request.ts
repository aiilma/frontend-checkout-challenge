import { type AxiosResponse } from 'axios';
import { type Static } from '@sinclair/typebox';

import { type SessionSchema } from '@checkout/contracts';

import { client } from './client';
import { parseEnvelope } from './envelope';
import { toApiError } from './error';
import { ensureToken, renewToken } from './session';

interface EndpointBase {
  path: string;
  public?: boolean;
  signal?: AbortSignal;
}

interface ReadEndpoint extends EndpointBase {
  method: 'GET' | 'DELETE';
}

interface WriteEndpoint extends EndpointBase {
  method: 'POST' | 'PUT';
  body: unknown;
  idempotencyKey?: string;
}

export type Endpoint = ReadEndpoint | WriteEndpoint;

export interface ApiResponse<T> {
  data: T;
  retryAfterMs: number | null;
}

type Session = Static<typeof SessionSchema>;

const headersFor = (endpoint: Endpoint, token: string | null) => ({
  ...(token === null ? {} : { Authorization: `Bearer ${token}` }),
  ...('idempotencyKey' in endpoint && endpoint.idempotencyKey
    ? { 'Idempotency-Key': endpoint.idempotencyKey }
    : {}),
});

const retryAfterOf = (response: AxiosResponse<unknown>) => {
  const header: unknown = response.headers['retry-after'];
  const seconds = typeof header === 'string' ? Number(header) : Number.NaN;
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : null;
};

const send = async <T>(endpoint: Endpoint, token: string | null): Promise<ApiResponse<T>> => {
  const { method, path, signal } = endpoint;
  const data = 'body' in endpoint ? endpoint.body : undefined;
  try {
    const response = await client.request<unknown>({
      method,
      url: path,
      data,
      headers: headersFor(endpoint, token),
      signal,
    });
    return { data: parseEnvelope(response) as T, retryAfterMs: retryAfterOf(response) };
  } catch (error) {
    throw toApiError(error);
  }
};

const createSession = () =>
  send<Session>({ method: 'POST', path: '/api/sessions', body: {}, public: true }, null).then(
    ({ data }) => data.token,
  );

export const requestWithMeta = async <T>(endpoint: Endpoint): Promise<ApiResponse<T>> => {
  if (endpoint.public) return send<T>(endpoint, null);
  try {
    return await send<T>(endpoint, await ensureToken(createSession));
  } catch (error) {
    if (toApiError(error).status !== 401) throw error;
    return send<T>(endpoint, await renewToken(createSession));
  }
};

export const request = <T>(endpoint: Endpoint): Promise<T> =>
  requestWithMeta<T>(endpoint).then(({ data }) => data);
