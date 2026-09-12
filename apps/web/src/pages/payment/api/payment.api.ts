import { type Payment, type Scenario, type Simulation } from '@checkout/contracts';

import { request } from '@/shared/api/request';

export interface SandboxCard {
  id: string;
  title: string;
  maskedNumber: string;
  scenario: 'success' | 'decline';
}

export interface Sandbox {
  settlementDelayMs: number;
  cards: SandboxCard[];
}

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
  request<Simulation>({
    method: 'POST',
    path: `/api/payments/${paymentId}/simulations`,
    body: { scenario },
  });

export const getPayment = (paymentId: string, signal?: AbortSignal) =>
  request<Payment>({ method: 'GET', path: `/api/payments/${paymentId}`, signal });
