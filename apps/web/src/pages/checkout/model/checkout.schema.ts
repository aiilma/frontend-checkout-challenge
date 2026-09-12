import { z } from 'zod';

import { type Delivery } from '@checkout/contracts';

const customerSchema = z.object({
  name: z.string().trim().min(2, 'Введите имя').max(100, 'Слишком длинное имя'),
  email: z.email('Введите корректный email').max(150, 'Слишком длинный email'),
  phone: z.string().regex(/^\+[1-9]\d{9,14}$/, 'Телефон в формате +79990000000'),
});

const addressSchema = z.object({
  city: z.string().trim().min(2, 'Укажите город').max(100, 'Слишком длинное название'),
  street: z.string().trim().min(2, 'Укажите улицу').max(150, 'Слишком длинное название'),
  house: z.string().trim().min(1, 'Укажите дом').max(20, 'Слишком длинный номер'),
  apartment: z
    .string()
    .trim()
    .max(20, 'Слишком длинный номер')
    .transform((apartment) => (apartment === '' ? undefined : apartment)),
});

const deliverySchema = z.discriminatedUnion('method', [
  z.object({
    method: z.literal('pickup'),
    pickupPointId: z.string().min(1, 'Выберите пункт выдачи'),
  }),
  z.object({ method: z.literal('courier'), address: addressSchema }),
]);

const deliveryFormSchema = z.object({
  method: z.enum(['pickup', 'courier']),
  pickupPointId: z.string(),
  address: z.object({
    city: z.string(),
    street: z.string(),
    house: z.string(),
    apartment: z.string(),
  }),
});

export const paymentMethodSchema = z.enum(['card', 'cash_on_delivery']);

export const checkoutSchema = z
  .object({
    customer: customerSchema,
    delivery: deliveryFormSchema,
    paymentMethod: paymentMethodSchema,
  })
  .superRefine((values, ctx) => {
    const delivery = deliverySchema.safeParse(values.delivery);
    if (delivery.success) return;
    for (const issue of delivery.error.issues) {
      ctx.addIssue({ code: 'custom', message: issue.message, path: ['delivery', ...issue.path] });
    }
  })
  .transform((values) => ({
    customer: values.customer,
    delivery: deliverySchema.parse(values.delivery),
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

export const deliveryFrom = (values: CheckoutFormValues['delivery']): Delivery | null => {
  const delivery = deliverySchema.safeParse(values);
  return delivery.success ? delivery.data : null;
};
