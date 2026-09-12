import { Skeleton } from '@/shared/ui/shadcn/skeleton';

const placeholders = [0, 1];

export const CartSkeleton = () => (
  <div className="flex flex-col gap-4" aria-busy="true">
    <span className="sr-only">Загружаем корзину</span>
    {placeholders.map((key) => (
      <div
        key={key}
        className="flex items-center justify-between gap-4 border-b border-hairline py-3"
      >
        <Skeleton className="h-5 w-1/2 bg-surface" />
        <Skeleton className="h-5 w-16 bg-surface" />
        <Skeleton className="h-5 w-20 bg-surface" />
      </div>
    ))}
  </div>
);
