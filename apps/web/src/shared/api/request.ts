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

interface Session {
  token: string;
}

const headersFor = (endpoint: Endpoint, token: string | null) => ({
  ...(token === null ? {} : { Authorization: `Bearer ${token}` }),
  ...('idempotencyKey' in endpoint && endpoint.idempotencyKey
    ? { 'Idempotency-Key': endpoint.idempotencyKey }
    : {}),
});

const send = async <T>(endpoint: Endpoint, token: string | null): Promise<T> => {
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
    return parseEnvelope(response) as T;
  } catch (error) {
    throw toApiError(error);
  }
};

const createSession = () =>
  send<Session>({ method: 'POST', path: '/api/sessions', body: {}, public: true }, null).then(
    (session) => session.token,
  );

export const request = async <T>(endpoint: Endpoint): Promise<T> => {
  if (endpoint.public) return send<T>(endpoint, null);
  try {
    return await send<T>(endpoint, await ensureToken(createSession));
  } catch (error) {
    if (toApiError(error).status !== 401) throw error;
    return send<T>(endpoint, await renewToken(createSession));
  }
};
