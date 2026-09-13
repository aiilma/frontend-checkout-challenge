import { type Payment, type Scenario, type Simulation } from '@checkout/contracts';

import { request, requestWithMeta } from '@/shared/api/request';

import { type Sandbox } from '../model/sandbox.types';

export interface SimulationInput {
  paymentId: string;
  scenario: Scenario;
}

export const getSandbox = (signal?: AbortSignal) =>
  request<Sandbox>({ method: 'GET', path: '/api/sandbox', public: true, signal });

export const listPayments = (orderId: string, signal?: AbortSignal) =>
  request<Payment[]>({ method: 'GET', path: `/api/orders/${orderId}/payments`, signal });

export const createPayment = (orderId: string, idempotencyKey: string) =>
  request<Payment>({
    method: 'POST',
    path: `/api/orders/${orderId}/payments`,
    body: {},
    idempotencyKey,
  });

export const simulatePayment = ({ paymentId, scenario }: SimulationInput) =>
  requestWithMeta<Simulation>({
    method: 'POST',
    path: `/api/payments/${paymentId}/simulations`,
    body: { scenario },
  });

export const getPayment = (paymentId: string, signal?: AbortSignal) =>
  request<Payment>({ method: 'GET', path: `/api/payments/${paymentId}`, signal });
