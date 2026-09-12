import { XIcon } from 'lucide-react';
import { Dialog as SheetPrimitive } from 'radix-ui';
import { type ComponentProps } from 'react';

import { cn } from '@/shared/lib/cn';

const Sheet = ({ ...props }: ComponentProps<typeof SheetPrimitive.Root>) => (
  <SheetPrimitive.Root data-slot="sheet" {...props} />
);

const SheetTrigger = ({ ...props }: ComponentProps<typeof SheetPrimitive.Trigger>) => (
  <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
);

const SheetClose = ({ ...props }: ComponentProps<typeof SheetPrimitive.Close>) => (
  <SheetPrimitive.Close data-slot="sheet-close" {...props} />
);

const SheetPortal = ({ ...props }: ComponentProps<typeof SheetPrimitive.Portal>) => (
  <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
);

const SheetOverlay = ({ className, ...props }: ComponentProps<typeof SheetPrimitive.Overlay>) => (
  <SheetPrimitive.Overlay
    data-slot="sheet-overlay"
    className={cn(
      'fixed inset-0 z-50 bg-ink/40 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in motion-reduce:animate-none',
      className,
    )}
    {...props}
  />
);

interface SheetContentProps extends ComponentProps<typeof SheetPrimitive.Content> {
  showCloseButton?: boolean;
}

const SheetContent = ({
  className,
  children,
  showCloseButton = true,
  ...props
}: SheetContentProps) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      data-slot="sheet-content"
      className={cn(
        'fixed inset-y-0 right-0 z-50 flex h-full w-full flex-col gap-4 bg-surface text-ink data-[state=closed]:animate-sheet-out data-[state=open]:animate-sheet-in motion-reduce:animate-none sm:max-w-md',
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <SheetPrimitive.Close className="absolute top-4 right-4 opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Закрыть</span>
        </SheetPrimitive.Close>
      )}
    </SheetPrimitive.Content>
  </SheetPortal>
);

const SheetHeader = ({ className, ...props }: ComponentProps<'div'>) => (
  <div data-slot="sheet-header" className={cn('flex flex-col gap-2 p-5', className)} {...props} />
);

const SheetFooter = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="sheet-footer"
    className={cn('mt-auto flex flex-col gap-3 p-5', className)}
    {...props}
  />
);

const SheetTitle = ({ className, ...props }: ComponentProps<typeof SheetPrimitive.Title>) => (
  <SheetPrimitive.Title
    data-slot="sheet-title"
    className={cn('text-section', className)}
    {...props}
  />
);

const SheetDescription = ({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Description>) => (
  <SheetPrimitive.Description
    data-slot="sheet-description"
    className={cn('text-caption text-muted', className)}
    {...props}
  />
);

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
