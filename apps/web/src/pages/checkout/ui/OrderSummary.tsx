import { type Cart, type Quote } from '@checkout/contracts';

import { type ApiError } from '@/shared/api/error';
import { MoneyText } from '@/shared/ui/MoneyText';

interface OrderSummaryProps {
  cart: Cart;
  quote: Quote | undefined;
  isCalculating: boolean;
  error: ApiError | null;
}

export const OrderSummary = ({ cart, quote, isCalculating, error }: OrderSummaryProps) => (
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
    {isCalculating && (
      <p className="text-caption text-muted" aria-live="polite">
        Пересчитываем…
      </p>
    )}
  </section>
);
