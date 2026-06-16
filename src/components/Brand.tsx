/** Logo + nombre de la marca (BulkAds). */
export default function Brand({ withName = true }: { withName?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden className="shrink-0">
        <defs>
          <linearGradient id="bulkads-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6366f1" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="url(#bulkads-grad)" />
        <rect x="8" y="9" width="16" height="3.6" rx="1.8" fill="#ffffff" />
        <rect x="8" y="14.2" width="16" height="3.6" rx="1.8" fill="#ffffff" opacity="0.8" />
        <rect x="8" y="19.4" width="16" height="3.6" rx="1.8" fill="#ffffff" opacity="0.55" />
      </svg>
      {withName && (
        <span className="text-lg font-bold tracking-tight text-slate-900">
          Bulk<span className="text-indigo-600">Ads</span>
        </span>
      )}
    </div>
  );
}
