import { type Cart } from '@checkout/contracts';

import { type CartItem } from '@/entities/cart';

export const lampItem: CartItem = {
  productId: 'lamp-orbit',
  title: 'Настольная лампа «Орбита»',
  unitPrice: 249000,
  quantity: 2,
  lineTotal: 498000,
};

export const mugItem: CartItem = {
  productId: 'mug-line',
  title: 'Кружка «Линия»',
  unitPrice: 89000,
  quantity: 1,
  lineTotal: 89000,
};

export const makeCart = (items: CartItem[], version = items.length): Cart => {
  let quantity = 0;
  let subtotal = 0;
  for (const item of items) {
    quantity += item.quantity;
    subtotal += item.lineTotal;
  }
  return { id: 'cart-1', version, items, quantity, subtotal, currency: 'RUB' };
};
