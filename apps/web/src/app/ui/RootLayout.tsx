import { NavLink, Outlet } from 'react-router';

import { useCart } from '@/entities/cart';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'font-medium' : 'hover:underline hover:underline-offset-2';

export const RootLayout = () => {
  const { cart } = useCart();
  const quantity = cart?.quantity ?? 0;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-10 flex h-13 items-center justify-between bg-page px-3 md:px-5">
        <NavLink to="/" className="font-medium">
          Магазин
        </NavLink>
        <nav className="flex gap-6">
          <NavLink to="/" end className={navLinkClass}>
            Каталог
          </NavLink>
          <NavLink to="/cart" className={navLinkClass}>
            {quantity > 0 ? `Корзина · ${quantity}` : 'Корзина'}
          </NavLink>
        </nav>
      </header>
      <main className="px-3 pt-25 pb-16 md:px-5">
        <Outlet />
      </main>
    </>
  );
};
