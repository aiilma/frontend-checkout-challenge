import { Controller, useFormContext, useFormState, useWatch } from 'react-hook-form';

import { formatMoney } from '@/shared/lib/money';
import { FormSection } from '@/shared/ui/FormSection';
import { RadioCards } from '@/shared/ui/RadioCards';
import { TextField } from '@/shared/ui/TextField';
import { type DeliveryMethod } from '@/entities/checkout';

import { type CheckoutFormValues } from '../model/checkout.schema';

interface DeliverySectionProps {
  methods: DeliveryMethod[];
}

const describeDeliveryMethod = (method: DeliveryMethod) => {
  if (method.price === 0) return 'Бесплатно';
  const price = formatMoney(method.price);
  return method.freeFrom === null
    ? price
    : `${price}, бесплатно от ${formatMoney(method.freeFrom)}`;
};

export const DeliverySection = ({ methods }: DeliverySectionProps) => {
  const { control, register } = useFormContext<CheckoutFormValues>();
  const { errors } = useFormState({ control });
  const method = useWatch({ control, name: 'delivery.method' });
  const pickupPoints = methods.find((candidate) => candidate.id === 'pickup')?.pickupPoints ?? [];

  return (
    <FormSection title="Доставка">
      <Controller
        control={control}
        name="delivery.method"
        render={({ field }) => (
          <RadioCards
            label="Способ доставки"
            value={field.value}
            onChange={field.onChange}
            options={methods.map((candidate) => ({
              value: candidate.id,
              title: candidate.title,
              description: describeDeliveryMethod(candidate),
            }))}
          />
        )}
      />
      {method === 'pickup' ? (
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
  );
};
