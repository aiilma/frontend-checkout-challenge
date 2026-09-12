import { type Payment } from '@checkout/contracts';

export const POLL_INTERVAL_MS = 1000;

export const isSettled = (payment: Payment) =>
  payment.status !== 'pending' && payment.status !== 'processing';

export const activeAttempt = (payments: Payment[]) =>
  payments.find((payment) => !isSettled(payment));
