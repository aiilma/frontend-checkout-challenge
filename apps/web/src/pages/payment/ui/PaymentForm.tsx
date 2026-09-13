import { useState } from 'react';

import { RadioCards } from '@/shared/ui/RadioCards';
import { TextAction } from '@/shared/ui/TextAction';
import { Button } from '@/shared/ui/shadcn/button';

import { type SandboxCard } from '../model/sandbox.types';

interface PaymentFormProps {
  cards: SandboxCard[];
  isSubmitting: boolean;
  onPay: (card: SandboxCard) => void;
  onCancel: () => void;
}

export const PaymentForm = ({ cards, isSubmitting, onPay, onCancel }: PaymentFormProps) => {
  const [cardId, setCardId] = useState('');
  const [cardError, setCardError] = useState<string | undefined>(undefined);
  const selectedCard = cards.find((card) => card.id === cardId);

  const handleChooseCard = (id: string) => {
    setCardId(id);
    setCardError(undefined);
  };

  const handlePay = () => {
    if (!selectedCard) {
      setCardError('Выберите карту');
      return;
    }
    onPay(selectedCard);
  };

  return (
    <>
      <RadioCards
        label="Тестовая карта"
        tone="inverse"
        value={cardId}
        onChange={handleChooseCard}
        error={cardError}
        options={cards.map((card) => ({
          value: card.id,
          title: card.title,
          description: card.maskedNumber,
        }))}
      />
      <Button
        type="button"
        variant="brand"
        tone="inverse"
        className="self-start"
        disabled={isSubmitting}
        onClick={handlePay}
      >
        {isSubmitting ? 'Отправляем…' : 'Оплатить'}
      </Button>
      <TextAction
        glyph="arrow"
        tone="inverse"
        className="self-start"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Отменить оплату
      </TextAction>
    </>
  );
};
