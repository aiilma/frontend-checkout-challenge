import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { type Cart } from '@checkout/contracts';

import { applyFieldErrors } from '@/shared/lib/form-errors';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';
import { ErrorBar } from '@/shared/ui/ErrorBar';
import { FormSection } from '@/shared/ui/FormSection';
import { InlineError } from '@/shared/ui/InlineError';
import { Button } from '@/shared/ui/shadcn/button';
import { type CheckoutOptions } from '@/entities/checkout';
import { useCreateOrder } from '@/entities/order';

import { useQuote } from '../api/use-quote';
import { useRefreshCheckout } from '../api/use-refresh-checkout';
import { isStaleCheckout } from '../model/checkout.errors';
import {
  type CheckoutFormValues,
  type CheckoutOrderInput,
  checkoutDefaults,
  checkoutSchema,
  deliveryFrom,
  checkoutFieldMessage,
  isCheckoutPath,
} from '../model/checkout.schema';
import { ContactsSection } from './ContactsSection';
import { DeliverySection } from './DeliverySection';
import { OrderSummary } from './OrderSummary';
import { PaymentSection } from './PaymentSection';

interface CheckoutFormProps {
  cart: Cart;
  options: CheckoutOptions;
}

const submitLabel = (isPending: boolean, paymentMethod: CheckoutFormValues['paymentMethod']) => {
  if (isPending) return 'Оформляем…';
  return paymentMethod === 'card' ? 'Перейти к оплате' : 'Подтвердить заказ';
};

export const CheckoutForm = ({ cart, options }: CheckoutFormProps) => {
  const form = useForm<CheckoutFormValues, unknown, CheckoutOrderInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: checkoutDefaults,
    mode: 'onTouched',
  });
  const deliveryValues = useWatch({ control: form.control, name: 'delivery' });
  const paymentMethod = useWatch({ control: form.control, name: 'paymentMethod' });
  const delivery = useDebouncedValue(deliveryFrom(deliveryValues), 400);
  const quote = useQuote(cart.version, delivery);
  const order = useCreateOrder();
  const refreshCheckout = useRefreshCheckout();
  const navigate = useNavigate();
  const rootError = form.formState.errors.root?.quote;

  const handleValidSubmit = ({ customer, paymentMethod: method }: CheckoutOrderInput) => {
    form.clearErrors('root.quote');
    if (!quote.quote) {
      form.setError('root.quote', { message: 'Дождитесь расчёта доставки и нажмите ещё раз.' });
      return;
    }
    order.createOrder(
      { quoteId: quote.quote.id, customer, paymentMethod: method },
      {
        onSuccess: (created) => {
          void navigate(
            created.paymentMethod === 'card'
              ? `/orders/${created.id}/payment`
              : `/orders/${created.id}`,
          );
        },
        onError: (error) => {
          if (isStaleCheckout(error)) void refreshCheckout();
          applyFieldErrors(error.fields, form.setError, isCheckoutPath, checkoutFieldMessage);
        },
      },
    );
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={(event) => void form.handleSubmit(handleValidSubmit)(event)}
        noValidate
        className="flex max-w-4xl flex-col gap-12"
      >
        <ContactsSection />
        <DeliverySection methods={options.deliveryMethods} />
        <PaymentSection methods={options.paymentMethods} />
        <FormSection>
          <OrderSummary
            cart={cart}
            quote={quote.quote}
            isCalculating={quote.isCalculating}
            error={quote.error}
            onRetry={() => void quote.retry()}
          />
          {order.error && <ErrorBar error={order.error} />}
          {rootError && <InlineError role="alert">{rootError.message}</InlineError>}
          <Button
            type="submit"
            className="self-start"
            disabled={quote.isCalculating || order.isPending}
          >
            {submitLabel(order.isPending, paymentMethod)}
          </Button>
        </FormSection>
      </form>
    </FormProvider>
  );
};
