export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero skeleton */}
      <div className="relative min-h-[42vh] flex items-end mb-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="absolute inset-0 hero-mesh" />
        <div className="relative z-10 w-full max-w-3xl">
          <div className="h-4 w-20 rounded bg-white/[0.06] mb-8 animate-shimmer" />
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-64 rounded-xl bg-white/[0.06] animate-shimmer" />
            <div className="h-8 w-16 rounded-full bg-white/[0.06] animate-shimmer" />
          </div>
          <div className="h-5 w-96 rounded bg-white/[0.04] mb-6 animate-shimmer" />
          <div className="flex gap-5">
            <div className="h-4 w-16 rounded bg-white/[0.04] animate-shimmer" />
            <div className="h-4 w-20 rounded bg-white/[0.04] animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Video grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-14 py-14">
        {[1, 2].map((i) => (
          <div key={i}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3.5 h-3.5 rounded-full bg-white/[0.06] animate-shimmer" />
              <div className="h-7 w-32 rounded bg-white/[0.06] animate-shimmer" />
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 ml-6">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="glass-card rounded-2xl overflow-hidden">
                  <div className="aspect-video bg-white/[0.04] animate-shimmer" />
                  <div className="p-5 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-white/[0.06] animate-shimmer" />
                    <div className="h-3 w-full rounded bg-white/[0.04] animate-shimmer" />
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
