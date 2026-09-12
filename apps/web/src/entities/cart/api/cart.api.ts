import { type Cart } from '@checkout/contracts';

import { request } from '@/shared/api/request';

export type CartItem = Cart['items'][number];

export interface CartItemInput {
  productId: string;
  quantity: number;
}

export const getCart = (signal?: AbortSignal) =>
  request<Cart>({ method: 'GET', path: '/api/cart', signal });

export const setCartItem = ({ productId, quantity }: CartItemInput) =>
  request<CartItem>({ method: 'PUT', path: `/api/cart/items/${productId}`, body: { quantity } });

export const removeCartItem = (productId: string) =>
  request<void>({ method: 'DELETE', path: `/api/cart/items/${productId}` });
