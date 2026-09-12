import { type Delivery, type Quote } from '@checkout/contracts';

import { request } from '@/shared/api/request';

export interface DeliveryMethod {
  id: 'pickup' | 'courier';
  title: string;
  price: number;
  freeFrom: number | null;
  pickupPoints: { id: string; title: string; address: string }[];
}

export interface PaymentMethod {
  id: 'card' | 'cash_on_delivery';
  title: string;
}

export interface CheckoutOptions {
  deliveryMethods: DeliveryMethod[];
  paymentMethods: PaymentMethod[];
}

export interface QuoteInput {
  cartVersion: number;
  delivery: Delivery;
}

export const getCheckoutOptions = (signal?: AbortSignal) =>
  request<CheckoutOptions>({ method: 'GET', path: '/api/checkout/options', signal });

export const createQuote = (body: QuoteInput, signal?: AbortSignal) =>
  request<Quote>({ method: 'POST', path: '/api/quotes', body, signal });
