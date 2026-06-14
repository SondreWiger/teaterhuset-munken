"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

interface GiftCard {
  id: string;
  code: string;
  credit_amount: number;
  discount_percentage: number;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  created_at: string;
}

export function GiftCardManager() {
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    credit_amount: 0,
    discount_percentage: 0,
    max_uses: "",
    expires_days: "",
  });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch("/api/gift-cards")
      .then((r) => r.json())
      .then((data) => setCards(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const body: any = {
        credit_amount: form.credit_amount,
        discount_percentage: form.discount_percentage,
      };
      if (form.max_uses) body.max_uses = Number(form.max_uses);
      if (form.expires_days) {
        const d = new Date();
        d.setDate(d.getDate() + Number(form.expires_days));
        body.expires_at = d.toISOString();
      }
      const res = await fetch("/api/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const card = await res.json();
        setCards((prev) => [card, ...prev]);
        toast.success("Gavekort opprettet!");
        setForm({ credit_amount: 0, discount_percentage: 0, max_uses: "", expires_days: "" });
      } else {
        toast.error("Kunne ikke opprette gavekort");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/gift-cards?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setCards((prev) => prev.filter((c) => c.id !== id));
      toast.success("Slettet!");
    }
  };

  const downloadCSV = () => {
    const csv = [
      "Kode,Kreditt,Rabatt,Bruk,Bruk,Maks,Utløper",
      ...cards.map(
        (c) =>
          `${c.code},${c.credit_amount},${c.discount_percentage}%,${c.current_uses},${c.max_uses || "Ubegrenset"},${c.expires_at ? new Date(c.expires_at).toLocaleDateString("nb-NO") : "Aldri"}`
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gavekort.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Generer gavekort</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1">Kreditt (kr)</label>
            <input
              type="number"
              value={form.credit_amount || ""}
              onChange={(e) => setForm({ ...form, credit_amount: Number(e.target.value) })}
              className="w-full rounded-xl input-glass px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Rabatt (%)</label>
            <input
              type="number"
              value={form.discount_percentage || ""}
              onChange={(e) => setForm({ ...form, discount_percentage: Number(e.target.value) })}
              className="w-full rounded-xl input-glass px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Maks bruk (valgfritt)</label>
            <input
              type="number"
              value={form.max_uses}
              onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
              className="w-full rounded-xl input-glass px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Utløp om dager (valgfritt)</label>
            <input
              type="number"
              value={form.expires_days}
              onChange={(e) => setForm({ ...form, expires_days: e.target.value })}
              className="w-full rounded-xl input-glass px-4 py-2.5 text-sm"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-gold rounded-xl px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {generating ? "Genererer..." : "Generer gavekort"}
          </button>
          {cards.length > 0 && (
            <button
              onClick={downloadCSV}
              className="rounded-xl border border-white/[0.06] px-4 py-2.5 text-sm text-muted hover:text-foreground hover:border-gold/20 transition-all"
            >
              Last ned CSV
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">
          Gavekort ({cards.length})
        </h2>
        {loading && <p className="text-sm text-muted">Laster...</p>}
        {!loading && cards.length === 0 && (
          <p className="text-sm text-muted">Ingen gavekort opprettet ennå.</p>
        )}
        <div className="space-y-2">
          {cards.map((card) => (
            <div
              key={card.id}
              className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm font-bold text-gold">{card.code}</span>
                <div className="text-xs text-muted">
                  {card.credit_amount > 0 && <span>{card.credit_amount} kr</span>}
                  {card.discount_percentage > 0 && <span>{card.discount_percentage}% rabatt</span>}
                  <span className="ml-2">
                    {card.current_uses}/{card.max_uses || "∞"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(card.id)}
                className="text-xs text-muted hover:text-danger transition-colors"
              >
                Slett
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
