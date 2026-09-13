import { type Payment } from '@checkout/contracts';

export const POLL_INTERVAL_MS = 1000;

export const isProcessing = (payment: Payment) => payment.status === 'processing';

export const isActive = (payment: Payment) =>
  payment.status === 'pending' || payment.status === 'processing';

export const activeAttempt = (payments: Payment[]) => payments.find(isActive);
