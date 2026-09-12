import { type ComponentProps } from 'react';

import { cn } from '@/shared/lib/cn';

const Input = ({ className, type, ...props }: ComponentProps<'input'>) => (
  <input
    type={type}
    data-slot="input"
    className={cn(
      'h-11 w-full min-w-0 border-b border-hairline bg-transparent text-body text-ink transition-colors placeholder:text-muted focus-visible:border-ink disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-accent',
      className,
    )}
    {...props}
  />
);

export { Input };
