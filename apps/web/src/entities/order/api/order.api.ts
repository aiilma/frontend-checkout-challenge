import { type CreateOrder, type Order } from '@checkout/contracts';

import { request } from '@/shared/api/request';

export const createOrder = (body: CreateOrder, idempotencyKey: string) =>
  request<Order>({ method: 'POST', path: '/api/orders', body, idempotencyKey });

export const getOrder = (orderId: string, signal?: AbortSignal) =>
  request<Order>({ method: 'GET', path: `/api/orders/${orderId}`, signal });
