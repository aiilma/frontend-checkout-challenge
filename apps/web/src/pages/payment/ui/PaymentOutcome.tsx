import { type Payment } from '@checkout/contracts';

import { ButtonLink } from '@/shared/ui/ButtonLink';
import { Button } from '@/shared/ui/shadcn/button';

interface PaymentOutcomeProps {
  status: Extract<Payment['status'], 'failed' | 'cancelled'>;
  orderId: string;
  isRetrying: boolean;
  onRetry: () => void;
}

const outcomeText: Record<PaymentOutcomeProps['status'], string> = {
  failed: 'Банк отклонил оплату.',
  cancelled: 'Оплата отменена.',
};

export const PaymentOutcome = ({ status, orderId, isRetrying, onRetry }: PaymentOutcomeProps) => (
  <>
    <p className="text-section" role="status">
      {outcomeText[status]}
    </p>
    <Button
      type="button"
      variant="brand"
      tone="inverse"
      className="self-start"
      onClick={onRetry}
      disabled={isRetrying}
    >
      Попробовать снова
    </Button>
    <ButtonLink
      variant="text"
      tone="inverse"
      glyph="arrow"
      to={`/orders/${orderId}`}
      className="self-start"
    >
      К заказу
    </ButtonLink>
  </>
);
