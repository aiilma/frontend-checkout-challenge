import { indexBy } from '@/shared/lib/index-by';
import { ButtonLink } from '@/shared/ui/ButtonLink';
import { ErrorBar } from '@/shared/ui/ErrorBar';
import { MoneyText } from '@/shared/ui/MoneyText';
import { PageTitle } from '@/shared/ui/PageTitle';
import { useCart, useRemoveCartItem, useSetCartItem } from '@/entities/cart';
import { useProducts } from '@/entities/product';

import { CartRow } from './CartRow';
import { CartSkeleton } from './CartSkeleton';

export const CartPage = () => {
  const { cart, items, isLoading, error, refetch } = useCart();
  const { products } = useProducts();
  const productsById = indexBy(products, (product) => product.id);
  const setting = useSetCartItem();
  const removing = useRemoveCartItem();

  const rowErrorFor = (productId: string) => {
    if (setting.productId === productId) return setting.error;
    if (removing.productId === productId) return removing.error;
    return null;
  };

  const isRowBusy = (productId: string) =>
    (setting.productId === productId && setting.isPending) ||
    (removing.productId === productId && removing.isPending);

  if (isLoading) {
    return (
      <>
        <PageTitle>Корзина</PageTitle>
        <CartSkeleton />
      </>
    );
  }

  if (!cart || items.length === 0) {
    return (
      <>
        <PageTitle>Корзина</PageTitle>
        {error && <ErrorBar error={error} onRetry={() => void refetch()} />}
        {cart && (
          <div className="flex flex-col items-start gap-6">
            <p className="text-display">В корзине пусто.</p>
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
      <PageTitle>Корзина</PageTitle>
      {error && <ErrorBar error={error} onRetry={() => void refetch()} />}
      <table className="w-full table-fixed border-t border-hairline">
        <colgroup>
          <col />
          <col className="w-40" />
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
          {items.map((item) => {
            const stock = productsById.get(item.productId)?.stock;
            return (
              <CartRow
                key={item.productId}
                item={item}
                canAddMore={stock === undefined || item.quantity < stock}
                isBusy={isRowBusy(item.productId)}
                error={rowErrorFor(item.productId)}
                onQuantity={(quantity) => {
                  setting.setItem({ productId: item.productId, quantity });
                }}
                onRemove={() => {
                  removing.removeItem(item.productId);
                }}
              />
            );
          })}
        </tbody>
      </table>
      <div className="mt-6 flex flex-col items-end gap-4">
        <p className="text-muted">Товары, {cart.quantity} шт.</p>
        <p className="flex items-baseline gap-4">
          <span>Итого</span>
          <MoneyText kopecks={cart.subtotal} className="text-section" />
        </p>
        <ButtonLink to="/checkout">Оформить</ButtonLink>
      </div>
    </>
  );
};
