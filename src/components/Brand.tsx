/** Logo + nombre de la marca. */
export default function Brand({ withName = true }: { withName?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l0-8Z"
            fill="currentColor"
          />
        </svg>
      </div>
      {withName && (
        <span className="text-lg font-bold tracking-tight text-slate-900">
          Auto<span className="text-indigo-600">Ads</span>
        </span>
      )}
    </div>
  );
}
