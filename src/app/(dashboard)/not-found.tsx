import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="min-h-[40vh] flex flex-col items-center justify-center text-center">
        <p className="text-6xl font-bold text-gradient-gold mb-4">404</p>
        <h2 className="text-xl font-semibold mb-2">Siden ble ikke funnet</h2>
        <p className="text-muted mb-8">Siden du leter etter finnes ikke.</p>
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm font-medium hover:bg-gold/20 transition-colors"
        >
          Tilbake til dashbordet
        </Link>
      </div>
    </div>
  );
}
