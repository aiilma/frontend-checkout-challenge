import { type Payment } from '@checkout/contracts';

import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router';

import { useOrder } from '@/entities/order';
import { ButtonLink } from '@/shared/ui/ButtonLink';
import { ErrorBar } from '@/shared/ui/ErrorBar';
import { MoneyText } from '@/shared/ui/MoneyText';
import { PageTitle } from '@/shared/ui/PageTitle';
import { RadioCards } from '@/shared/ui/RadioCards';
import { TextAction } from '@/shared/ui/TextAction';
import { Button } from '@/shared/ui/shadcn/button';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';

import { useCreatePayment } from '../api/use-create-payment';
import { usePayment } from '../api/use-payment';
import { usePayments } from '../api/use-payments';
import { useSandbox } from '../api/use-sandbox';
import { useSimulatePayment } from '../api/use-simulate-payment';
import { activeAttempt } from '../model/payment';
import { PaymentSheet } from './PaymentSheet';

const redCards =
  'border-white/60 text-white hover:border-white focus-visible:outline-white data-[state=checked]:border-white';
const whiteButton = 'bg-white text-ink hover:bg-white/90';
const whiteAction = 'text-white';

const outcomeText: Record<Payment['status'], string> = {
  pending: '',
  processing: 'Ждём ответ банка',
  succeeded: 'Оплата прошла.',
  failed: 'Банк отклонил оплату.',
  cancelled: 'Оплата отменена.',
};

export const PaymentPage = () => {
  const { orderId = '' } = useParams();
  const { order, isLoading: orderLoading, error: orderError, refetch } = useOrder(orderId);
  const { payments, isLoading: paymentsLoading, error: paymentsError } = usePayments(orderId);
  const { sandbox, isLoading: sandboxLoading, error: sandboxError } = useSandbox();
  const createPayment = useCreatePayment();
  const simulate = useSimulatePayment();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [cardId, setCardId] = useState('');
  const paymentId = attemptId ?? activeAttempt(payments)?.id ?? null;
  const { payment, error: paymentError } = usePayment(paymentId);
  const isLoading = orderLoading || paymentsLoading || sandboxLoading;
  const needsAttempt =
    !isLoading && Boolean(order && sandbox) && paymentId === null && !createPayment.error;
  const { mutate: createAttempt, isPending: isCreating } = createPayment;

  useEffect(() => {
    if (!needsAttempt || isCreating) return;
    createAttempt(orderId, {
      onSuccess: (created) => {
        setAttemptId(created.id);
      },
    });
  }, [createAttempt, isCreating, needsAttempt, orderId]);

  if (isLoading) {
    return (
      <>
        <PageTitle>Оплата</PageTitle>
        <div className="flex flex-col gap-4" aria-busy="true">
          <span className="sr-only">Загружаем заказ</span>
          <Skeleton className="h-6 w-1/2 bg-surface" />
          <Skeleton className="h-6 w-1/3 bg-surface" />
        </div>
      </>
    );
  }

  const loadError = orderError ?? paymentsError ?? sandboxError;
  if (!order || !sandbox) {
    return (
      <>
        <PageTitle>Оплата</PageTitle>
        {loadError && <ErrorBar error={loadError} onRetry={() => void refetch()} />}
      </>
    );
  }

  if (order.paymentMethod !== 'card' || order.paymentStatus === 'succeeded') {
    return <Navigate to={`/orders/${order.id}`} replace />;
  }

  if (payment?.status === 'succeeded') {
    return <Navigate to={`/orders/${order.id}`} replace />;
  }

  const status = payment?.status ?? 'pending';
  const isWaiting = status === 'processing';
  const isCancelling = isWaiting && simulate.variables?.scenario === 'cancel';
  const isForm = status === 'pending' && payment !== undefined;
  const isSettledOutcome = status === 'failed' || status === 'cancelled';
  const actionError = createPayment.error ?? simulate.error ?? paymentError;
  const selectedCard = sandbox.cards.find((card) => card.id === cardId);

  const pay = () => {
    if (!payment || !selectedCard) return;
    simulate.mutate({ paymentId: payment.id, scenario: selectedCard.scenario });
  };

  const cancel = () => {
    if (!payment || status !== 'pending') return;
    simulate.mutate({ paymentId: payment.id, scenario: 'cancel' });
  };

  const retry = () => {
    setCardId('');
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
      <PaymentSheet order={order} isWaiting={isWaiting} onDismiss={cancel}>
        {actionError && (
          <div role="alert" className="text-caption">
            {actionError.message}
          </div>
        )}
        {!payment && !createPayment.error && <p aria-live="polite">Готовим оплату…</p>}
        {createPayment.error && (
          <TextAction glyph="arrow" className={whiteAction} onClick={retry} disabled={isCreating}>
            Повторить
          </TextAction>
        )}
        {isForm && (
          <>
            <RadioCards
              label="Тестовая карта"
              value={cardId}
              onChange={setCardId}
              itemClassName={redCards}
              options={sandbox.cards.map((card) => ({
                value: card.id,
                title: card.title,
                description: card.maskedNumber,
              }))}
            />
            <Button
              type="button"
              variant="brand"
              className={`self-start ${whiteButton}`}
              disabled={!selectedCard || simulate.isPending}
              onClick={pay}
            >
              {simulate.isPending ? 'Отправляем…' : 'Оплатить'}
            </Button>
            <TextAction
              glyph="arrow"
              className={whiteAction}
              onClick={cancel}
              disabled={simulate.isPending}
            >
              Отменить оплату
            </TextAction>
          </>
        )}
        {isWaiting && (
          <p aria-live="polite">{isCancelling ? 'Отменяем оплату…' : outcomeText.processing}</p>
        )}
        {isSettledOutcome && (
          <>
            <p className="text-section" role="status">
              {outcomeText[status]}
            </p>
            <Button
              type="button"
              variant="brand"
              className={`self-start ${whiteButton}`}
              onClick={retry}
              disabled={isCreating}
            >
              Попробовать снова
            </Button>
            <ButtonLink
              variant="text"
              glyph="arrow"
              to={`/orders/${order.id}`}
              className={whiteAction}
            >
              К заказу
            </ButtonLink>
          </>
        )}
      </PaymentSheet>
    </>
  );
};
