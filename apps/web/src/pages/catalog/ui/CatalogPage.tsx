import { useCart, useSetCartItem } from '@/entities/cart';
import { useProducts } from '@/entities/product';
import { ErrorBar } from '@/shared/ui/ErrorBar';
import { PageTitle } from '@/shared/ui/PageTitle';

import { CatalogSkeleton } from './CatalogSkeleton';
import { ProductCard } from './ProductCard';

export const CatalogPage = () => {
  const { products, isLoading, error, refetch } = useProducts();
  const { itemsById } = useCart();
  const setItem = useSetCartItem();
  const targetId = setItem.variables?.productId;

  return (
    <>
      <PageTitle>Каталог</PageTitle>
      {error && <ErrorBar error={error} onRetry={() => void refetch()} />}
      {isLoading ? (
        <CatalogSkeleton />
      ) : (
        <ul className="grid gap-5 md:grid-cols-3">
          {products.map((product) => {
            const inCart = itemsById.get(product.id)?.quantity ?? 0;
            const isTarget = targetId === product.id;
            return (
              <li key={product.id}>
                <ProductCard
                  product={product}
                  inCart={inCart}
                  isAdding={isTarget && setItem.isPending}
                  addError={isTarget ? setItem.error : null}
                  onAdd={() => {
                    setItem.mutate({ productId: product.id, quantity: inCart + 1 });
                  }}
                />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
};
