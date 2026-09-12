import { type Order } from '@checkout/contracts';

import { MoneyText } from '@/shared/ui/MoneyText';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/shadcn/sheet';

interface PaymentSheetProps {
  order: Order;
  isWaiting: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
}

export const PaymentSheet = ({ order, isWaiting, onDismiss, children }: PaymentSheetProps) => (
  <Sheet
    open
    onOpenChange={(open) => {
      if (!open) onDismiss();
    }}
  >
    <SheetContent
      className="bg-accent-deep text-white"
      onInteractOutside={(event) => {
        event.preventDefault();
      }}
    >
      {isWaiting && (
        <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-white/30">
          <div className="h-full w-1/3 animate-progress bg-white motion-reduce:animate-none" />
        </div>
      )}
      <SheetHeader>
        <SheetTitle className="text-white">Оплата заказа {order.number}</SheetTitle>
        <SheetDescription className="text-white">Сумма к оплате</SheetDescription>
        <MoneyText kopecks={order.total} className="text-display" />
      </SheetHeader>
      <div className="flex flex-col gap-6 px-5 pb-5">{children}</div>
    </SheetContent>
  </Sheet>
);
