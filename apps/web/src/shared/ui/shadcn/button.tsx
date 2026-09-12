import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { type ComponentProps } from 'react';

import { cn } from '@/shared/lib/cn';

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap transition-colors outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'h-11 bg-ink px-5 font-medium text-white hover:bg-ink/90',
        brand: 'h-11 bg-accent-deep px-5 font-medium text-white hover:bg-accent-deep/90',
        text: 'gap-1 text-ink hover:underline hover:underline-offset-2',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
);

interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = ({ className, variant = 'primary', asChild = false, ...props }: ButtonProps) => {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      className={cn(buttonVariants({ variant, className }))}
      {...props}
    />
  );
};

export { Button, buttonVariants };
