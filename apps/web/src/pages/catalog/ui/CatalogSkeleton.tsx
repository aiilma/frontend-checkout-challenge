import { Skeleton } from '@/shared/ui/shadcn/skeleton';

const placeholders = [0, 1, 2];

export const CatalogSkeleton = () => (
  <ul className="grid gap-5 md:grid-cols-3" aria-busy="true">
    <li className="sr-only">Загружаем каталог</li>
    {placeholders.map((key) => (
      <li key={key} className="flex flex-col gap-3 bg-surface p-4 md:p-6">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-auto h-5 w-24" />
      </li>
    ))}
  </ul>
);
