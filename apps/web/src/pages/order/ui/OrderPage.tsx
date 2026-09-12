import { type Order } from '@checkout/contracts';

import { useParams } from 'react-router';

import { describeDelivery, useCheckoutOptions } from '@/entities/checkout';
import { type OrderOutcome, orderOutcome, useOrder } from '@/entities/order';
import { ButtonLink } from '@/shared/ui/ButtonLink';
import { ErrorBar } from '@/shared/ui/ErrorBar';
import { MoneyText } from '@/shared/ui/MoneyText';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';

const headlineFor = (order: Order, outcome: OrderOutcome) => {
  switch (outcome) {
    case 'paid':
      return `Заказ ${order.number} оплачен.`;
    case 'confirmed':
      return `Заказ ${order.number} оформлен, оплата при получении.`;
    case 'pending':
      return `Заказ ${order.number} ожидает оплаты.`;
    case 'unpaid':
      return `Заказ ${order.number} ожидает оплаты.`;
  }
};

export const OrderPage = () => {
  const { orderId = '' } = useParams();
  const { order, isLoading, error, refetch } = useOrder(orderId);
  const { options } = useCheckoutOptions();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <span className="sr-only">Проверяем заказ</span>
        <Skeleton className="h-10 w-2/3 bg-surface" />
        <Skeleton className="h-6 w-1/2 bg-surface" />
        <Skeleton className="h-6 w-1/3 bg-surface" />
      </div>
    );
  }

  if (!order) {
    return (
      <>
        <h1 className="mb-12 text-title">Заказ</h1>
        {error && <ErrorBar error={error} onRetry={() => void refetch()} />}
      </>
    );
  }

  const outcome = orderOutcome(order);
  const paymentPath = `/orders/${order.id}/payment`;

  return (
    <>
      <h1 className="mb-12 text-display">{headlineFor(order, outcome)}</h1>
      {(outcome === 'unpaid' || outcome === 'pending') && (
        <div className="mb-12">
          <ButtonLink to={paymentPath}>
            {outcome === 'pending' ? 'Продолжить оплату' : 'Оплатить'}
          </ButtonLink>
        </div>
      )}
      <table className="w-full table-fixed border-t border-hairline">
        <colgroup>
          <col />
          <col className="w-16" />
          <col className="w-28" />
        </colgroup>
        <thead className="sr-only">
          <tr>
            <th scope="col">Товар</th>
            <th scope="col">Количество</th>
            <th scope="col">Сумма</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.productId} className="border-b border-hairline">
              <th scope="row" className="py-3 pe-3 text-start font-normal">
                {item.title}
              </th>
              <td className="px-3 py-3 text-muted tabular-nums">× {item.quantity}</td>
              <td className="py-3 ps-3 text-end">
                <MoneyText kopecks={item.lineTotal} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="mt-6 flex flex-col gap-2">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Доставка</dt>
          <dd className="text-end">{describeDelivery(order.delivery, options?.deliveryMethods)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Товары</dt>
          <dd>
            <MoneyText kopecks={order.subtotal} />
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Стоимость доставки</dt>
          <dd>
            <MoneyText kopecks={order.shipping} />
          </dd>
        </div>
        <div className="flex justify-between gap-4 text-section">
          <dt>Итого</dt>
          <dd>
            <MoneyText kopecks={order.total} />
          </dd>
        </div>
      </dl>
      <ButtonLink variant="text" glyph="arrow" to="/" className="mt-12">
        В каталог
      </ButtonLink>
    </>
  );
};
