import { type ComponentProps } from 'react';

import { cn } from '@/shared/lib/cn';
import { formatMoney } from '@/shared/lib/money';

interface MoneyTextProps extends ComponentProps<'span'> {
  kopecks: number;
}

export const MoneyText = ({ kopecks, className, ...props }: MoneyTextProps) => (
  <span className={cn('tabular-nums', className)} {...props}>
    {formatMoney(kopecks)}
  </span>
);
