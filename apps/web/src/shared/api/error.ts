import { type AxiosResponse, isAxiosError } from 'axios';
import { z } from 'zod';

import { type ApiError as ErrorResponse } from '@checkout/contracts';

export type ApiErrorKind = 'network' | 'http' | 'parse';

export type ApiErrorField = NonNullable<ErrorResponse['error']['fields']>[number];

interface ApiErrorInit {
  kind: ApiErrorKind;
  code: string;
  message: string;
  status?: number | null;
  fields?: ApiErrorField[];
  requestId?: string | null;
  cause?: unknown;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly code: string;
  readonly status: number | null;
  readonly fields: ApiErrorField[];
  readonly requestId: string | null;

  constructor({
    kind,
    code,
    message,
    status = null,
    fields = [],
    requestId = null,
    cause,
  }: ApiErrorInit) {
    super(message, { cause });
    this.name = 'ApiError';
    this.kind = kind;
    this.code = code;
    this.status = status;
    this.fields = fields;
    this.requestId = requestId;
  }

  get isRetryable() {
    return this.kind === 'network';
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

const errorBodySchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fields: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
  }),
  meta: z.object({ requestId: z.string() }),
});

const requestIdOf = (response: AxiosResponse<unknown>) => {
  const header: unknown = response.headers['x-request-id'];
  return typeof header === 'string' ? header : null;
};

export const parseFailure = (response: AxiosResponse<unknown>, cause?: unknown) =>
  new ApiError({
    kind: 'parse',
    code: 'UNEXPECTED_RESPONSE',
    message: 'Сервер ответил в неожиданном формате.',
    status: response.status,
    requestId: requestIdOf(response),
    cause,
  });

const httpFailure = (response: AxiosResponse<unknown>, cause: unknown) => {
  const body = errorBodySchema.safeParse(response.data);
  if (!body.success) return parseFailure(response, cause);
  return new ApiError({
    kind: 'http',
    code: body.data.error.code,
    message: body.data.error.message,
    status: response.status,
    fields: body.data.error.fields ?? [],
    requestId: body.data.meta.requestId,
    cause,
  });
};

const networkFailure = (cause: unknown) =>
  new ApiError({
    kind: 'network',
    code: 'NETWORK_ERROR',
    message: 'Нет связи с сервером. Проверьте подключение и повторите.',
    cause,
  });

export const toApiError = (error: unknown): ApiError => {
  if (isApiError(error)) return error;
  if (isAxiosError(error) && error.response) return httpFailure(error.response, error);
  return networkFailure(error);
};
