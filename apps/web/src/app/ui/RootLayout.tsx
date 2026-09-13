import { NavLink, Outlet } from 'react-router';

import { hoverUnderline } from '@/shared/lib/classes';
import { cn } from '@/shared/lib/cn';
import { useCart } from '@/entities/cart';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'font-medium' : hoverUnderline;

const cartLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(navLinkClass({ isActive }), 'flex gap-1');

const formatCount = (quantity: number) => (quantity > 99 ? '99+' : String(quantity));

export const RootLayout = () => {
  const { cart } = useCart();
  const quantity = cart?.quantity ?? 0;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-3 focus:top-2 focus:z-20 focus:bg-surface focus:px-3 focus:py-2"
      >
        К содержимому
      </a>
      <header className="fixed inset-x-0 top-0 z-10 bg-page">
        <div className="mx-auto flex h-13 w-full max-w-7xl items-center justify-between px-3 md:px-5">
          <NavLink to="/" className="font-medium">
            Магазин
          </NavLink>
          <nav className="flex gap-6">
            <NavLink to="/" end className={navLinkClass}>
              Каталог
            </NavLink>
            <NavLink to="/orders" end className={navLinkClass}>
              Заказы
            </NavLink>
            <NavLink to="/cart" className={cartLinkClass}>
              Корзина{' '}
              <span className="w-10 tabular-nums">
                {quantity > 0 ? `· ${formatCount(quantity)}` : ''}
              </span>
            </NavLink>
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-7xl px-3 pt-25 pb-16 md:px-5">
        <Outlet />
      </main>
    </>
  );
};
