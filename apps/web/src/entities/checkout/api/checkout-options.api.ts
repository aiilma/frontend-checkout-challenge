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

export const getCheckoutOptions = (signal?: AbortSignal) =>
  request<CheckoutOptions>({ method: 'GET', path: '/api/checkout/options', signal });
