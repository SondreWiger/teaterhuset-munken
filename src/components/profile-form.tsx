"use client";

import { useState } from "react";

interface Profile {
  id: string;
  email: string;
  name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [form, setForm] = useState({
    display_name: profile.display_name || profile.name || "",
    avatar_url: profile.avatar_url || "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Kunne ikke lagre");
      setMessage({ type: "success", text: "Profil oppdatert!" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Feil" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar preview */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center text-2xl font-bold text-gold overflow-hidden">
          {form.avatar_url ? (
            <img src={form.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            form.display_name?.[0]?.toUpperCase() || "U"
          )}
        </div>
        <div>
          <p className="font-medium">{form.display_name || "Uten navn"}</p>
          <p className="text-sm text-muted">{profile.email}</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground/80">
          Visningsnavn
        </label>
        <input
          type="text"
          value={form.display_name}
          onChange={(e) => setForm({ ...form, display_name: e.target.value })}
          placeholder="Ditt navn"
          className="w-full rounded-xl input-glass px-4 py-3 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground/80">
          Avatar URL
        </label>
        <input
          type="url"
          value={form.avatar_url}
          onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
          placeholder="https://..."
          className="w-full rounded-xl input-glass px-4 py-3 text-sm"
        />
        <p className="mt-2 text-xs text-muted">Direktelenke til et bilde</p>
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
        {saving ? "Lagrer..." : "Lagre profil"}
      </button>
    </div>
  );
}
