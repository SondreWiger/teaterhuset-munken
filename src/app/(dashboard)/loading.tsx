export default function Loading() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-gold/20 border-t-gold animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted">Laster...</p>
      </div>
    </div>
  );
}
