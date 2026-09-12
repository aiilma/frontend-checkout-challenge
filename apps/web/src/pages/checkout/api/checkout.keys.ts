import { type QuoteInput } from './checkout.api';

export const checkoutKeys = {
  options: ['checkout', 'options'] as const,
  quotes: ['checkout', 'quote'] as const,
  quote: (input: QuoteInput) => ['checkout', 'quote', input] as const,
};
