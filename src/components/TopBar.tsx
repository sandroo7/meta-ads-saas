import Brand from "./Brand";

/** Barra superior para páginas autenticadas. */
export default function TopBar({ email }: { email?: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Brand />
        <div className="flex items-center gap-3">
          {email && (
            <span className="hidden text-sm text-slate-500 sm:block">{email}</span>
          )}
          <form action="/auth/signout" method="post">
            <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              Salir
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
