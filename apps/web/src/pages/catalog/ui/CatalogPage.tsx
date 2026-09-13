import { ErrorBar } from '@/shared/ui/ErrorBar';
import { PageTitle } from '@/shared/ui/PageTitle';
import { useCart, useSetCartItem } from '@/entities/cart';
import { useProducts } from '@/entities/product';

import { CatalogSkeleton } from './CatalogSkeleton';
import { ProductCard } from './ProductCard';

export const CatalogPage = () => {
  const { products, isLoading, error, refetch } = useProducts();
  const { itemsById } = useCart();
  const adding = useSetCartItem();

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
            const isTarget = adding.productId === product.id;
            return (
              <li key={product.id}>
                <ProductCard
                  product={product}
                  inCart={inCart}
                  isAdding={isTarget && adding.isPending}
                  addError={isTarget ? adding.error : null}
                  onAdd={() => {
                    adding.setItem({ productId: product.id, quantity: inCart + 1 });
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
