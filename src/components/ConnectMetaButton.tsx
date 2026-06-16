/**
 * Botón que inicia el flujo OAuth con Meta.
 * Enlace a /api/meta/connect (que redirige a Facebook).
 */
export default function ConnectMetaButton({
  label = "Conectar con Meta",
  subtle = false,
}: {
  label?: string;
  subtle?: boolean;
}) {
  if (subtle) {
    return (
      <a
        href="/api/meta/connect"
        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        {label}
      </a>
    );
  }
  return (
    <a
      href="/api/meta/connect"
      className="inline-flex items-center gap-2 rounded-xl bg-[#1877F2] px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-[#166fe0]"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.469h-2.796v8.385C19.612 22.954 24 17.99 24 12z" />
      </svg>
      {label}
    </a>
  );
}
