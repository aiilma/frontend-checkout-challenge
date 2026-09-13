import { type ApiError } from '@/shared/api/error';

const staleCheckoutCodes = new Set(['QUOTE_EXPIRED', 'CART_VERSION_CONFLICT']);

export const isStaleCheckout = (error: ApiError) => staleCheckoutCodes.has(error.code);
