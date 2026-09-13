import { type Cart, type Delivery, type Quote } from '@checkout/contracts';

export const deliveryMethods = [
  {
    id: 'pickup' as const,
    title: 'Самовывоз',
    price: 0,
    freeFrom: null,
    pickupPoints: [
      { id: 'point-center', title: 'Центральный пункт', address: 'г. Учебный, ул. Примерная, 1' },
      { id: 'point-north', title: 'Северный пункт', address: 'г. Учебный, ул. Макетная, 7' },
    ],
  },
  { id: 'courier' as const, title: 'Курьер', price: 39000, freeFrom: 500000, pickupPoints: [] },
];

export const paymentMethods = [
  { id: 'card' as const, title: 'Картой онлайн (тестовая оплата)' },
  { id: 'cash_on_delivery' as const, title: 'Наличными при получении' },
];

export const makeCheckoutOptions = (cart: Cart) => ({ cart, deliveryMethods, paymentMethods });

export const makeQuote = (cart: Cart, delivery: Delivery, id = 'quote-1'): Quote => {
  const shipping = delivery.method === 'courier' && cart.subtotal < 500000 ? 39000 : 0;
  return {
    id,
    cartVersion: cart.version,
    items: cart.items,
    delivery,
    subtotal: cart.subtotal,
    shipping,
    total: cart.subtotal + shipping,
    currency: 'RUB',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  };
};
