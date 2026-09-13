import { Controller, useFormContext } from 'react-hook-form';

import { FormSection } from '@/shared/ui/FormSection';
import { RadioCards } from '@/shared/ui/RadioCards';
import { type PaymentMethod } from '@/entities/checkout';

import { type CheckoutFormValues } from '../model/checkout.schema';

interface PaymentSectionProps {
  methods: PaymentMethod[];
}

export const PaymentSection = ({ methods }: PaymentSectionProps) => {
  const { control } = useFormContext<CheckoutFormValues>();

  return (
    <FormSection title="Оплата">
      <Controller
        control={control}
        name="paymentMethod"
        render={({ field }) => (
          <RadioCards
            label="Способ оплаты"
            value={field.value}
            onChange={field.onChange}
            options={methods.map((method) => ({ value: method.id, title: method.title }))}
          />
        )}
      />
    </FormSection>
  );
};
