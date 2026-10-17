/**
 * Shown straight away when moving between admin pages (Dashboard → Cars → Inquiries),
 * while the next page checks the login and loads its data on the server.
 * Without it, the old page would stay on screen until the new one was ready.
 */
export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="grid gap-6">
      <span className="sr-only">Loading…</span>
      <div className="h-9 w-48 animate-pulse rounded-field bg-line" />
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-card border border-line bg-paper" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-card border border-line bg-paper" />
    </div>
  );
}
