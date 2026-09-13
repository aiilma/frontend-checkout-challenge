import { type Product } from '@checkout/contracts';

export const isAvailable = (product: Product) => product.stock > 0;
