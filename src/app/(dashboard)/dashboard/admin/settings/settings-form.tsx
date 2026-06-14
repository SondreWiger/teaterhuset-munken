"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SettingsForm({
  settings,
}: {
  settings: Record<string, string>;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    site_name: settings.site_name || "",
    hero_title: settings.hero_title || "",
    hero_subtitle: settings.hero_subtitle || "",
    hero_image_url: settings.hero_image_url || "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Kunne ikke lagre");
      }

      setMessage({ type: "success", text: "Innstillinger lagret!" });
      router.refresh();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Noe gikk galt",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2 text-foreground/80">
          Sidenavn
        </label>
        <input
          type="text"
          value={form.site_name}
          onChange={(e) => setForm({ ...form, site_name: e.target.value })}
          className="w-full rounded-xl input-glass px-4 py-3 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground/80">
          Hero-tittel (stor overskrift)
        </label>
        <input
          type="text"
          value={form.hero_title}
          onChange={(e) => setForm({ ...form, hero_title: e.target.value })}
          className="w-full rounded-xl input-glass px-4 py-3 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground/80">
          Hero-underrubrikk
        </label>
        <textarea
          value={form.hero_subtitle}
          onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })}
          rows={3}
          className="w-full rounded-xl input-glass px-4 py-3 text-sm resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground/80">
          Hero-bilde (URL)
        </label>
        <input
          type="url"
          value={form.hero_image_url}
          onChange={(e) => setForm({ ...form, hero_image_url: e.target.value })}
          placeholder="https://images.unsplash.com/photo-..."
          className="w-full rounded-xl input-glass px-4 py-3 text-sm"
        />
        <p className="mt-2 text-xs text-muted">
          Lim inn en direktelenke til et bilde. Bildet vises som bakgrunn på
          forsiden.
        </p>
        {form.hero_image_url && (
          <div className="mt-4 rounded-xl overflow-hidden border border-white/[0.06]">
            <img
              src={form.hero_image_url}
              alt="Forhåndsvisning"
              className="w-full h-48 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-success/10 border-success/20 text-success"
              : "bg-danger/10 border-danger/20 text-danger"
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-gold rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-50"
      >
        <span>{saving ? "Lagrer..." : "Lagre innstillinger"}</span>
      </button>
    </div>
  );
}
