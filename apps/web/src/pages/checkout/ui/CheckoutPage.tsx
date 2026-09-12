import { useCart } from '@/entities/cart';
import { useCheckoutOptions } from '@/entities/checkout';
import { ButtonLink } from '@/shared/ui/ButtonLink';
import { ErrorBar } from '@/shared/ui/ErrorBar';
import { PageTitle } from '@/shared/ui/PageTitle';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';

import { CheckoutForm } from './CheckoutForm';

export const CheckoutPage = () => {
  const cart = useCart();
  const checkout = useCheckoutOptions();

  if (cart.isLoading || checkout.isLoading) {
    return (
      <>
        <PageTitle>Оформление</PageTitle>
        <div className="flex flex-col gap-6" aria-busy="true">
          <span className="sr-only">Загружаем оформление</span>
          <Skeleton className="h-11 w-full bg-surface" />
          <Skeleton className="h-11 w-full bg-surface" />
          <Skeleton className="h-11 w-2/3 bg-surface" />
        </div>
      </>
    );
  }

  if (!cart.cart || !checkout.options) {
    const failure = cart.error ?? checkout.error;
    return (
      <>
        <PageTitle>Оформление</PageTitle>
        {failure && (
          <ErrorBar
            error={failure}
            onRetry={() => {
              void cart.refetch();
              void checkout.refetch();
            }}
          />
        )}
      </>
    );
  }

  if (cart.cart.items.length === 0) {
    return (
      <>
        <PageTitle>Оформление</PageTitle>
        <div className="flex flex-col items-start gap-6">
          <p className="text-display">В корзине пусто.</p>
          <ButtonLink variant="text" glyph="arrow" to="/">
            В каталог
          </ButtonLink>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle>Оформление</PageTitle>
      <CheckoutForm cart={cart.cart} options={checkout.options} />
    </>
  );
};
