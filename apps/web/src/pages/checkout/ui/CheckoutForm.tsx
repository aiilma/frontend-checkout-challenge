import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { type Cart } from '@checkout/contracts';

import { type CheckoutOptions, type DeliveryMethod } from '@/entities/checkout';
import { useCreateOrder } from '@/entities/order';
import { applyFieldErrors } from '@/shared/lib/form-errors';
import { formatMoney } from '@/shared/lib/money';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';
import { ErrorBar } from '@/shared/ui/ErrorBar';
import { FormSection } from '@/shared/ui/FormSection';
import { Glyph } from '@/shared/ui/Glyph';
import { RadioCards } from '@/shared/ui/RadioCards';
import { TextField } from '@/shared/ui/TextField';
import { Button } from '@/shared/ui/shadcn/button';

import { useQuote } from '../api/use-quote';
import { useRefreshCheckout } from '../api/use-refresh-checkout';
import { isStaleCheckout } from '../model/checkout.errors';
import {
  type CheckoutFormValues,
  type CheckoutOrderInput,
  checkoutDefaults,
  checkoutSchema,
  deliveryFrom,
} from '../model/checkout.schema';
import { OrderSummary } from './OrderSummary';

interface CheckoutFormProps {
  cart: Cart;
  options: CheckoutOptions;
}

const describeDelivery = (method: DeliveryMethod) => {
  if (method.price === 0) return 'Бесплатно';
  const price = formatMoney(method.price);
  return method.freeFrom === null
    ? price
    : `${price}, бесплатно от ${formatMoney(method.freeFrom)}`;
};

export const CheckoutForm = ({ cart, options }: CheckoutFormProps) => {
  const form = useForm<CheckoutFormValues, unknown, CheckoutOrderInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: checkoutDefaults,
    mode: 'onTouched',
  });
  const { register, control, formState } = form;
  const { errors } = formState;
  const deliveryValues = useWatch({ control, name: 'delivery' });
  const paymentMethod = useWatch({ control, name: 'paymentMethod' });
  const delivery = useDebouncedValue(deliveryFrom(deliveryValues), 400);
  const { quote, isCalculating, error: quoteError } = useQuote(cart.version, delivery);
  const pickupPoints =
    options.deliveryMethods.find((method) => method.id === 'pickup')?.pickupPoints ?? [];
  const createOrder = useCreateOrder();
  const refreshCheckout = useRefreshCheckout();
  const navigate = useNavigate();

  const onSubmit = ({ customer, paymentMethod: method }: CheckoutOrderInput) => {
    form.clearErrors('root.quote');
    if (!quote) {
      form.setError('root.quote', { message: 'Дождитесь расчёта доставки и нажмите ещё раз.' });
      return;
    }
    createOrder.mutate(
      { quoteId: quote.id, customer, paymentMethod: method },
      {
        onSuccess: (order) => {
          void navigate(
            order.paymentMethod === 'card' ? `/orders/${order.id}/payment` : `/orders/${order.id}`,
          );
        },
        onError: (error) => {
          if (isStaleCheckout(error)) void refreshCheckout();
          applyFieldErrors(error.fields, form.setError);
        },
      },
    );
  };

  return (
    <form
      onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
      noValidate
      className="flex max-w-4xl flex-col gap-12"
    >
      <FormSection title="О вас">
        <TextField
          label="Имя"
          autoComplete="name"
          error={errors.customer?.name?.message}
          {...register('customer.name')}
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.customer?.email?.message}
          {...register('customer.email')}
        />
        <TextField
          label="Телефон"
          type="tel"
          autoComplete="tel"
          placeholder="+79990000000"
          error={errors.customer?.phone?.message}
          {...register('customer.phone')}
        />
      </FormSection>

      <FormSection title="Доставка">
        <Controller
          control={control}
          name="delivery.method"
          render={({ field }) => (
            <RadioCards
              label="Способ доставки"
              value={field.value}
              onChange={field.onChange}
              options={options.deliveryMethods.map((method) => ({
                value: method.id,
                title: method.title,
                description: describeDelivery(method),
              }))}
            />
          )}
        />
        {deliveryValues.method === 'pickup' ? (
          <Controller
            control={control}
            name="delivery.pickupPointId"
            render={({ field, fieldState }) => (
              <RadioCards
                label="Пункт выдачи"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                options={pickupPoints.map((point) => ({
                  value: point.id,
                  title: point.title,
                  description: point.address,
                }))}
              />
            )}
          />
        ) : (
          <>
            <TextField
              label="Город"
              autoComplete="address-level2"
              error={errors.delivery?.address?.city?.message}
              {...register('delivery.address.city')}
            />
            <TextField
              label="Улица"
              autoComplete="address-line1"
              error={errors.delivery?.address?.street?.message}
              {...register('delivery.address.street')}
            />
            <div className="grid grid-cols-2 gap-6">
              <TextField
                label="Дом"
                error={errors.delivery?.address?.house?.message}
                {...register('delivery.address.house')}
              />
              <TextField
                label="Квартира"
                error={errors.delivery?.address?.apartment?.message}
                {...register('delivery.address.apartment')}
              />
            </div>
          </>
        )}
      </FormSection>

      <FormSection title="Оплата">
        <Controller
          control={control}
          name="paymentMethod"
          render={({ field }) => (
            <RadioCards
              label="Способ оплаты"
              value={field.value}
              onChange={field.onChange}
              options={options.paymentMethods.map((method) => ({
                value: method.id,
                title: method.title,
              }))}
            />
          )}
        />
      </FormSection>

      <div className="flex flex-col gap-6 md:ms-[calc(200px+1.5rem)]">
        <OrderSummary cart={cart} quote={quote} isCalculating={isCalculating} error={quoteError} />
        {createOrder.error && <ErrorBar error={createOrder.error} />}
        {errors.root?.quote && (
          <p role="alert" className="flex items-center gap-1 text-caption">
            <Glyph name="arrow" className="text-warning" />
            {errors.root.quote.message}
          </p>
        )}
        <Button
          type="submit"
          className="self-start"
          disabled={isCalculating || createOrder.isPending}
        >
          {createOrder.isPending
            ? 'Оформляем…'
            : paymentMethod === 'card'
              ? 'Перейти к оплате'
              : 'Подтвердить заказ'}
        </Button>
      </div>
    </form>
  );
};
