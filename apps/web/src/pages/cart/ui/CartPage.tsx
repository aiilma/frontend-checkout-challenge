import { useCart, useRemoveCartItem, useSetCartItem } from '@/entities/cart';
import { useProducts } from '@/entities/product';
import { indexBy } from '@/shared/lib/index-by';
import { ButtonLink } from '@/shared/ui/ButtonLink';
import { ErrorBar } from '@/shared/ui/ErrorBar';
import { MoneyText } from '@/shared/ui/MoneyText';
import { PageTitle } from '@/shared/ui/PageTitle';

import { CartRow } from './CartRow';
import { CartSkeleton } from './CartSkeleton';

export const CartPage = () => {
  const { cart, items, isLoading, error, refetch } = useCart();
  const { products } = useProducts();
  const productsById = indexBy(products, (product) => product.id);
  const setItem = useSetCartItem();
  const removeItem = useRemoveCartItem();
  const settingId = setItem.variables?.productId;
  const removingId = removeItem.variables;

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
      <table className="w-full border-t border-hairline">
        <tbody>
          {items.map((item) => {
            const stock = productsById.get(item.productId)?.stock;
            const isSetting = settingId === item.productId;
            const isRemoving = removingId === item.productId;
            const rowError = isSetting ? setItem.error : isRemoving ? removeItem.error : null;
            return (
              <CartRow
                key={item.productId}
                item={item}
                canAddMore={stock === undefined || item.quantity < stock}
                isBusy={(isSetting && setItem.isPending) || (isRemoving && removeItem.isPending)}
                error={rowError}
                onQuantity={(quantity) => {
                  setItem.mutate({ productId: item.productId, quantity });
                }}
                onRemove={() => {
                  removeItem.mutate(item.productId);
                }}
              />
            );
          })}
        </tbody>
      </table>
      <div className="mt-6 flex flex-col items-end gap-4">
        <p className="text-muted">Товары: {cart.quantity} шт.</p>
        <p className="flex items-baseline gap-4">
          <span>Итого</span>
          <MoneyText kopecks={cart.subtotal} className="text-section" />
        </p>
        <ButtonLink to="/checkout">Оформить</ButtonLink>
      </div>
    </>
  );
};
