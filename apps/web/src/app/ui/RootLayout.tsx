import { NavLink, Outlet } from 'react-router';

export const RootLayout = () => (
  <>
    <header className="fixed inset-x-0 top-0 z-10 flex h-13 items-center justify-between bg-page px-3 md:px-5">
      <NavLink to="/" className="font-medium">
        Магазин
      </NavLink>
      <nav className="flex gap-6">
        <NavLink to="/" className="hover:underline hover:underline-offset-2">
          Каталог
        </NavLink>
      </nav>
    </header>
    <main className="px-3 pt-25 pb-16 md:px-5">
      <Outlet />
    </main>
  </>
);
