import { useQuery } from '@tanstack/react-query';

import { type Product } from '@checkout/contracts';

import { listProducts } from './product.api';
import { productKeys } from './product.keys';

const noProducts: Product[] = [];

export const useProducts = () => {
  const query = useQuery({
    queryKey: productKeys.all,
    queryFn: ({ signal }) => listProducts(signal),
  });

  return {
    products: query.data ?? noProducts,
    isLoading: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
};
