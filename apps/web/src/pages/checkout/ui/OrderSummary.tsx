import { type Cart, type Quote } from '@checkout/contracts';

import { type ApiError } from '@/shared/api/error';
import { MoneyText } from '@/shared/ui/MoneyText';
import { TextAction } from '@/shared/ui/TextAction';

interface OrderSummaryProps {
  cart: Cart;
  quote: Quote | undefined;
  isCalculating: boolean;
  error: ApiError | null;
  onRetry: () => void;
}

export const OrderSummary = ({ cart, quote, isCalculating, error, onRetry }: OrderSummaryProps) => (
  <section aria-label="Итог заказа" className="flex flex-col gap-2 border-t border-hairline pt-6">
    <p className="flex justify-between gap-4">
      <span className="text-muted">Товары, {cart.quantity} шт.</span>
      <MoneyText kopecks={cart.subtotal} />
    </p>
    {quote ? (
      <>
        <p className="flex justify-between gap-4">
          <span className="text-muted">Доставка</span>
          <MoneyText kopecks={quote.shipping} />
        </p>
        <p className="flex justify-between gap-4 text-section">
          <span>Итого</span>
          <MoneyText kopecks={quote.total} />
        </p>
      </>
    ) : (
      <p className="text-caption text-muted">
        {error ? error.message : 'Выберите доставку, чтобы рассчитать итог.'}
      </p>
    )}
    {error && (
      <TextAction glyph="arrow" className="self-start" onClick={onRetry}>
        Повторить
      </TextAction>
    )}
    {isCalculating && (
      <p className="text-caption text-muted" aria-live="polite">
        Пересчитываем…
      </p>
    )}
  </section>
);
