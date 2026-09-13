import { useEffect, useState } from 'react';

import { Navigate, useBlocker, useParams } from 'react-router';

import { ButtonLink } from '@/shared/ui/ButtonLink';
import { ErrorBar } from '@/shared/ui/ErrorBar';
import { MoneyText } from '@/shared/ui/MoneyText';
import { PageTitle } from '@/shared/ui/PageTitle';
import { TextAction } from '@/shared/ui/TextAction';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';
import { useOrder } from '@/entities/order';

import { useCreatePayment } from '../api/use-create-payment';
import { usePayment } from '../api/use-payment';
import { usePayments } from '../api/use-payments';
import { useSandbox } from '../api/use-sandbox';
import { useSimulatePayment } from '../api/use-simulate-payment';
import { activeAttempt, POLL_INTERVAL_MS } from '../model/payment';
import { type SandboxCard } from '../model/sandbox.types';
import { PaymentForm } from './PaymentForm';
import { PaymentOutcome } from './PaymentOutcome';
import { PaymentSheet } from './PaymentSheet';

const PaymentSkeleton = () => (
  <>
    <PageTitle>Оплата</PageTitle>
    <div className="flex flex-col gap-4" aria-busy="true">
      <span className="sr-only">Загружаем заказ</span>
      <Skeleton className="h-6 w-1/2 bg-surface" />
      <Skeleton className="h-6 w-1/3 bg-surface" />
    </div>
  </>
);

export const PaymentPage = () => {
  const { orderId = '' } = useParams();
  const { order, isLoading: orderLoading, error: orderError, refetch } = useOrder(orderId);
  const { payments, isLoading: paymentsLoading, error: paymentsError } = usePayments(orderId);
  const { sandbox, isLoading: sandboxLoading, error: sandboxError } = useSandbox();
  const attempt = useCreatePayment();
  const simulation = useSimulatePayment();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const paymentId = attemptId ?? activeAttempt(payments)?.id ?? null;
  const { payment, error: paymentError } = usePayment(
    paymentId,
    simulation.retryAfterMs ?? POLL_INTERVAL_MS,
  );
  const isLoading = orderLoading || paymentsLoading || sandboxLoading;
  const needsAttempt =
    !isLoading &&
    order !== undefined &&
    sandbox !== undefined &&
    paymentId === null &&
    !attempt.error;
  const { createAttempt, isPending: isCreating } = attempt;

  useBlocker(({ currentLocation, nextLocation }) => {
    if (payment?.status === 'pending' && currentLocation.pathname !== nextLocation.pathname) {
      simulation.simulate({ paymentId: payment.id, scenario: 'cancel' });
    }
    return false;
  });

  useEffect(() => {
    if (!needsAttempt || isCreating) return;
    createAttempt(orderId, {
      onSuccess: (created) => {
        setAttemptId(created.id);
      },
    });
  }, [createAttempt, isCreating, needsAttempt, orderId]);

  if (isLoading) return <PaymentSkeleton />;

  const loadError = orderError ?? paymentsError ?? sandboxError;
  if (!order || !sandbox) {
    return (
      <>
        <PageTitle>Оплата</PageTitle>
        {loadError && <ErrorBar error={loadError} onRetry={() => void refetch()} />}
      </>
    );
  }

  const status = payment?.status ?? 'pending';
  const isPaid =
    order.paymentMethod !== 'card' || order.paymentStatus === 'succeeded' || status === 'succeeded';
  if (isPaid) return <Navigate to={`/orders/${order.id}`} replace />;

  const actionError = attempt.error ?? simulation.error ?? paymentError;

  const handlePay = (card: SandboxCard) => {
    if (payment) simulation.simulate({ paymentId: payment.id, scenario: card.scenario });
  };

  const handleCancel = () => {
    if (!payment || status !== 'pending' || simulation.isPending) return;
    simulation.simulate({ paymentId: payment.id, scenario: 'cancel' });
  };

  const handleRetry = () => {
    createAttempt(orderId, {
      onSuccess: (created) => {
        setAttemptId(created.id);
      },
    });
  };

  return (
    <>
      <PageTitle>Оплата</PageTitle>
      <p className="flex flex-col gap-2">
        <span>Заказ {order.number}</span>
        <MoneyText kopecks={order.total} className="text-section" />
      </p>
      <ButtonLink variant="text" glyph="arrow" to={`/orders/${order.id}`} className="mt-6">
        К заказу
      </ButtonLink>
      <PaymentSheet order={order} isWaiting={status === 'processing'} onDismiss={handleCancel}>
        {actionError && (
          <div role="alert" className="text-caption">
            {actionError.message}
          </div>
        )}
        {!payment && !attempt.error && <p aria-live="polite">Готовим оплату…</p>}
        {attempt.error && (
          <TextAction
            glyph="arrow"
            tone="inverse"
            className="self-start"
            onClick={handleRetry}
            disabled={isCreating}
          >
            Повторить
          </TextAction>
        )}
        {payment && status === 'pending' && (
          <PaymentForm
            cards={sandbox.cards}
            isSubmitting={simulation.isPending}
            onPay={handlePay}
            onCancel={handleCancel}
          />
        )}
        {status === 'processing' && (
          <p aria-live="polite">
            {simulation.scenario === 'cancel' ? 'Отменяем оплату…' : 'Ждём ответ банка'}
          </p>
        )}
        {(status === 'failed' || status === 'cancelled') && (
          <PaymentOutcome
            status={status}
            orderId={order.id}
            isRetrying={isCreating}
            onRetry={handleRetry}
          />
        )}
      </PaymentSheet>
    </>
  );
};
