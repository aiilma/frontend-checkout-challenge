import { type Product } from '@checkout/contracts';

import { type ApiError } from '@/shared/api/error';
import { cn } from '@/shared/lib/cn';
import { InlineError } from '@/shared/ui/InlineError';
import { MoneyText } from '@/shared/ui/MoneyText';
import { TextAction } from '@/shared/ui/TextAction';
import { isAvailable } from '@/entities/product';

interface ProductCardProps {
  product: Product;
  inCart: number;
  isAdding: boolean;
  addError: ApiError | null;
  onAdd: () => void;
}

const captionFor = (inCart: number, canAddMore: boolean) => {
  if (inCart === 0) return '';
  return canAddMore ? `В корзине: ${inCart}` : `В корзине: ${inCart}, это весь остаток`;
};

export const ProductCard = ({ product, inCart, isAdding, addError, onAdd }: ProductCardProps) => {
  const available = isAvailable(product);
  const canAddMore = inCart < product.stock;

  return (
    <article
      className={cn(
        'flex h-full flex-col gap-3 p-4 md:p-6',
        available ? 'bg-surface' : 'border border-hairline',
      )}
    >
      <span className="text-caption text-muted uppercase">{product.sku}</span>
      <h2 className="text-section">{product.title}</h2>
      <p className="text-muted">{product.description}</p>
      <MoneyText kopecks={product.price} className="mt-auto" />
      {available ? (
        <div className="flex flex-col items-start gap-1">
          <TextAction glyph="plus" onClick={onAdd} disabled={isAdding || !canAddMore}>
            {isAdding ? 'Добавляем…' : 'В корзину'}
          </TextAction>
          <span className="flex min-h-5 items-center text-caption text-muted">
            {addError ? (
              <InlineError>{addError.message}</InlineError>
            ) : (
              captionFor(inCart, canAddMore)
            )}
          </span>
        </div>
      ) : (
        <span className="text-caption text-muted">Нет в наличии</span>
      )}
    </article>
  );
};
