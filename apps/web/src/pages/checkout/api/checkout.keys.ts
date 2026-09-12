import { type QuoteInput } from './checkout.api';

export const checkoutKeys = {
  quotes: ['checkout', 'quote'] as const,
  quote: (input: QuoteInput) => ['checkout', 'quote', input] as const,
};
