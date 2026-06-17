export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="min-h-[40vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-gold/30 border-t-gold animate-spin mb-4" />
        <p className="text-sm text-muted">Laster...</p>
      </div>
    </div>
  );
}
