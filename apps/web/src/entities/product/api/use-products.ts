import { useQuery } from '@tanstack/react-query';

import { type Product } from '@checkout/contracts';

import { listProducts } from './product.api';
import { productKeys } from './product.keys';

const noProducts: Product[] = [];

const CATALOG_STALE_MS = 60_000;

export const useProducts = () => {
  const query = useQuery({
    queryKey: productKeys.all,
    queryFn: ({ signal }) => listProducts(signal),
    staleTime: CATALOG_STALE_MS,
  });

  return {
    products: query.data ?? noProducts,
    isLoading: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
};
