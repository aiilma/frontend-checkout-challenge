import { Link } from 'react-router';

import { hoverUnderline } from '@/shared/lib/classes';
import { formatDateTime } from '@/shared/lib/date';
import { ButtonLink } from '@/shared/ui/ButtonLink';
import { ErrorBar } from '@/shared/ui/ErrorBar';
import { MoneyText } from '@/shared/ui/MoneyText';
import { PageTitle } from '@/shared/ui/PageTitle';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';
import { orderOutcome, outcomeLabel, useOrders } from '@/entities/order';

export const OrdersPage = () => {
  const { orders, isLoading, error, refetch } = useOrders();

  if (isLoading) {
    return (
      <>
        <PageTitle>Заказы</PageTitle>
        <div className="flex flex-col gap-4" aria-busy="true">
          <span className="sr-only">Загружаем заказы</span>
          <Skeleton className="h-6 w-2/3 bg-surface" />
          <Skeleton className="h-6 w-1/2 bg-surface" />
        </div>
      </>
    );
  }

  if (orders.length === 0) {
    return (
      <>
        <PageTitle>Заказы</PageTitle>
        {error && <ErrorBar error={error} onRetry={refetch} />}
        {!error && (
          <div className="flex flex-col items-start gap-6">
            <p className="text-display">Заказов пока нет.</p>
            <ButtonLink variant="text" glyph="arrow" to="/">
              В каталог
            </ButtonLink>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <PageTitle>Заказы</PageTitle>
      {error && <ErrorBar error={error} onRetry={refetch} />}
      <table className="w-full table-fixed border-t border-hairline">
        <colgroup>
          <col className="w-36" />
          <col />
          <col className="w-28" />
        </colgroup>
        <thead className="sr-only">
          <tr>
            <th scope="col">Номер</th>
            <th scope="col">Статус</th>
            <th scope="col">Сумма</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-hairline align-top">
              <th scope="row" className="py-3 pe-3 text-start font-normal">
                <Link to={`/orders/${order.id}`} className={hoverUnderline}>
                  {order.number}
                </Link>
                <span className="block text-caption text-muted">
                  {formatDateTime(order.createdAt)}
                </span>
              </th>
              <td className="px-3 py-3">{outcomeLabel[orderOutcome(order)]}</td>
              <td className="py-3 ps-3 text-end">
                <MoneyText kopecks={order.total} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
