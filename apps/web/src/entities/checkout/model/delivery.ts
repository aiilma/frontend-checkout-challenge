import { type Delivery } from '@checkout/contracts';

import { type DeliveryMethod } from '../api/checkout-options.api';

export const describeDelivery = (delivery: Delivery, methods: DeliveryMethod[] | undefined) => {
  const method = methods?.find((candidate) => candidate.id === delivery.method);
  const title = method?.title ?? (delivery.method === 'pickup' ? 'Самовывоз' : 'Курьер');
  if (delivery.method === 'courier') {
    const { city, street, house, apartment } = delivery.address;
    const apartmentPart = apartment ? `, кв. ${apartment}` : '';
    return `${title}: ${city}, ${street}, д. ${house}${apartmentPart}`;
  }
  const point = method?.pickupPoints.find((candidate) => candidate.id === delivery.pickupPointId);
  return point ? `${title}: ${point.title}, ${point.address}` : title;
};
