import { useFormContext, useFormState } from 'react-hook-form';

import { FormSection } from '@/shared/ui/FormSection';
import { TextField } from '@/shared/ui/TextField';

import { type CheckoutFormValues } from '../model/checkout.schema';

export const ContactsSection = () => {
  const { control, register } = useFormContext<CheckoutFormValues>();
  const { errors } = useFormState({ control });

  return (
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
  );
};
