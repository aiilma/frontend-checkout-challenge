import { type Path } from 'react-hook-form';
import { z } from 'zod';

import { type CreateOrder, type Delivery } from '@checkout/contracts';

const fieldMessages = {
  'customer.name': 'Введите имя',
  'customer.email': 'Введите корректный email',
  'customer.phone': 'Телефон в формате +79990000000',
  'delivery.pickupPointId': 'Выберите пункт выдачи',
  'delivery.address.city': 'Укажите город',
  'delivery.address.street': 'Укажите улицу',
  'delivery.address.house': 'Укажите дом',
  'delivery.address.apartment': 'Проверьте номер квартиры',
} as const;

const customerSchema = z.object({
  name: z.string().trim().min(2, fieldMessages['customer.name']).max(100, 'Слишком длинное имя'),
  email: z.email(fieldMessages['customer.email']).max(150, 'Слишком длинный email'),
  phone: z.string().regex(/^\+[1-9]\d{9,14}$/, fieldMessages['customer.phone']),
});

const addressSchema = z.object({
  city: z
    .string()
    .min(2, fieldMessages['delivery.address.city'])
    .max(100, 'Слишком длинное название'),
  street: z
    .string()
    .min(2, fieldMessages['delivery.address.street'])
    .max(150, 'Слишком длинное название'),
  house: z
    .string()
    .min(1, fieldMessages['delivery.address.house'])
    .max(20, 'Слишком длинный номер'),
  apartment: z.string().max(20, fieldMessages['delivery.address.apartment']).optional(),
});

const deliverySchema = z.discriminatedUnion('method', [
  z.object({
    method: z.literal('pickup'),
    pickupPointId: z.string().min(1, fieldMessages['delivery.pickupPointId']),
  }),
  z.object({ method: z.literal('courier'), address: addressSchema }),
]);

const deliveryFormSchema = z.object({
  method: z.enum(['pickup', 'courier']) satisfies z.ZodType<Delivery['method']>,
  pickupPointId: z.string(),
  address: z.object({
    city: z.string(),
    street: z.string(),
    house: z.string(),
    apartment: z.string(),
  }),
});

export const paymentMethodSchema = z.enum(['card', 'cash_on_delivery']) satisfies z.ZodType<
  CreateOrder['paymentMethod']
>;

type DeliveryFormValues = z.input<typeof deliveryFormSchema>;

const normalizeDelivery = ({ method, pickupPointId, address }: DeliveryFormValues) => {
  const apartment = address.apartment.trim();
  return method === 'pickup'
    ? { method, pickupPointId }
    : {
        method,
        address: {
          city: address.city.trim(),
          street: address.street.trim(),
          house: address.house.trim(),
          apartment: apartment === '' ? undefined : apartment,
        },
      };
};

export const checkoutSchema = z
  .object({
    customer: customerSchema,
    delivery: deliveryFormSchema,
    paymentMethod: paymentMethodSchema,
  })
  .superRefine((values, ctx) => {
    const delivery = deliverySchema.safeParse(normalizeDelivery(values.delivery));
    if (delivery.success) return;
    for (const issue of delivery.error.issues) {
      ctx.addIssue({ code: 'custom', message: issue.message, path: ['delivery', ...issue.path] });
    }
  })
  .transform((values) => ({
    customer: values.customer,
    delivery: normalizeDelivery(values.delivery) as Delivery,
    paymentMethod: values.paymentMethod,
  }));

export type CheckoutFormValues = z.input<typeof checkoutSchema>;
export type CheckoutOrderInput = z.output<typeof checkoutSchema>;

export const checkoutDefaults: CheckoutFormValues = {
  customer: { name: '', email: '', phone: '' },
  delivery: {
    method: 'pickup',
    pickupPointId: '',
    address: { city: '', street: '', house: '', apartment: '' },
  },
  paymentMethod: 'card',
};

export const deliveryFrom = (values: DeliveryFormValues): Delivery | null => {
  const delivery = deliverySchema.safeParse(normalizeDelivery(values));
  return delivery.success ? delivery.data : null;
};

type CheckoutFieldPath = Extract<Path<CheckoutFormValues>, keyof typeof fieldMessages>;

export const isCheckoutPath = (path: string): path is CheckoutFieldPath => path in fieldMessages;

export const checkoutFieldMessage = (path: CheckoutFieldPath) => fieldMessages[path];
