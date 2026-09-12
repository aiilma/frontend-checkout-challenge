import { type CartItem } from '@/entities/cart';
import { type ApiError } from '@/shared/api/error';
import { Glyph } from '@/shared/ui/Glyph';
import { MoneyText } from '@/shared/ui/MoneyText';
import { TextAction } from '@/shared/ui/TextAction';

interface CartRowProps {
  item: CartItem;
  canAddMore: boolean;
  isBusy: boolean;
  error: ApiError | null;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export const CartRow = ({
  item,
  canAddMore,
  isBusy,
  error,
  onQuantity,
  onRemove,
}: CartRowProps) => (
  <tr className="border-b border-hairline align-top">
    <th scope="row" className="py-3 pe-3 text-start font-normal">
      <div className="flex flex-col items-start gap-1">
        <span>{item.title}</span>
        <span className="text-caption text-muted">
          <MoneyText kopecks={item.unitPrice} /> за шт.
        </span>
        <TextAction glyph="arrow" className="mt-1" onClick={onRemove} disabled={isBusy}>
          Удалить
        </TextAction>
        {error && (
          <span className="mt-2 flex items-center gap-1 text-caption">
            <Glyph name="arrow" className="text-warning" />
            {error.message}
          </span>
        )}
      </div>
    </th>
    <td className="px-3 py-3">
      <div className="flex items-center justify-center gap-2">
        <TextAction
          glyph="minus"
          aria-label="Меньше"
          className="size-11 md:size-8"
          disabled={isBusy || item.quantity <= 1}
          onClick={() => onQuantity(item.quantity - 1)}
        />
        <span className="min-w-6 text-center tabular-nums">{item.quantity}</span>
        <TextAction
          glyph="plus"
          aria-label="Больше"
          className="size-11 md:size-8"
          disabled={isBusy || !canAddMore}
          onClick={() => onQuantity(item.quantity + 1)}
        />
      </div>
    </td>
    <td className="py-3 ps-3 text-end">
      <MoneyText kopecks={item.lineTotal} />
    </td>
  </tr>
);
