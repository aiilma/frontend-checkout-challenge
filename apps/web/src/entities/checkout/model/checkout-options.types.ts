import { type Static } from '@sinclair/typebox';

import { type CheckoutOptionsSchema } from '@checkout/contracts';

export type CheckoutOptions = Static<typeof CheckoutOptionsSchema>;
export type DeliveryMethod = CheckoutOptions['deliveryMethods'][number];
export type PaymentMethod = CheckoutOptions['paymentMethods'][number];
