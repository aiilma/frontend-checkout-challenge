import { type Path } from 'react-hook-form';
import { z } from 'zod';

import { type CreateOrder, type Delivery } from '@checkout/contracts';

const customerSchema = z.object({
  name: z.string().trim().min(2, 'Введите имя').max(100, 'Слишком длинное имя'),
  email: z.email('Введите корректный email').max(150, 'Слишком длинный email'),
  phone: z.string().regex(/^\+[1-9]\d{9,14}$/, 'Телефон в формате +79990000000'),
});

const addressSchema = z.object({
  city: z.string().min(2, 'Укажите город').max(100, 'Слишком длинное название'),
  street: z.string().min(2, 'Укажите улицу').max(150, 'Слишком длинное название'),
  house: z.string().min(1, 'Укажите дом').max(20, 'Слишком длинный номер'),
  apartment: z.string().max(20, 'Слишком длинный номер').optional(),
});

const deliverySchema = z.discriminatedUnion('method', [
  z.object({
    method: z.literal('pickup'),
    pickupPointId: z.string().min(1, 'Выберите пункт выдачи'),
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

const checkoutPaths = [
  'customer.name',
  'customer.email',
  'customer.phone',
  'delivery.pickupPointId',
  'delivery.address.city',
  'delivery.address.street',
  'delivery.address.house',
  'delivery.address.apartment',
] as const satisfies readonly Path<CheckoutFormValues>[];

const knownPaths: ReadonlySet<string> = new Set(checkoutPaths);

export const isCheckoutPath = (path: string): path is Path<CheckoutFormValues> =>
  knownPaths.has(path);
