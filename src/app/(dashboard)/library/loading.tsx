export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <div className="h-9 w-48 rounded bg-white/[0.06] animate-shimmer mb-3" />
        <div className="h-4 w-32 rounded bg-white/[0.04] animate-shimmer" />
      </div>

      <div className="flex gap-2 mb-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-20 rounded-full bg-white/[0.04] animate-shimmer" />
        ))}
      </div>

      <div className="space-y-16">
        {[1, 2].map((i) => (
          <div key={i}>
            <div className="h-8 w-48 rounded bg-white/[0.06] animate-shimmer mb-6" />
            <div className="flex gap-5 overflow-hidden">
              {[1, 2, 3].map((j) => (
                <div key={j} className="shrink-0 w-72">
                  <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="aspect-video bg-white/[0.04] animate-shimmer" />
                    <div className="p-5 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-white/[0.06] animate-shimmer" />
                      <div className="h-3 w-full rounded bg-white/[0.04] animate-shimmer" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
