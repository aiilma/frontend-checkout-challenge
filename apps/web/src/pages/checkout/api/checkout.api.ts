import { type Delivery, type Quote } from '@checkout/contracts';

import { request } from '@/shared/api/request';

export interface QuoteInput {
  cartVersion: number;
  delivery: Delivery;
}

export const createQuote = (body: QuoteInput, signal?: AbortSignal) =>
  request<Quote>({ method: 'POST', path: '/api/quotes', body, signal });
