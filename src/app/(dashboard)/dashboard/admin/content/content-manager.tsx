"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ActorOverridePanel } from "@/components/actor-override-panel";

interface Video {
  id: string;
  team_id: string;
  title: string;
  description: string | null;
  youtube_url: string | null;
  vimeo_url: string | null;
  trailer_url: string | null;
  price: number;
  sort_order: number;
  published: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

interface TeamRole {
  id: string;
  team_id: string;
  role_id: string;
  actor_name: string | null;
  roles: Role;
}

interface Team {
  id: string;
  show_id: string;
  name: string;
  color: string;
  description: string | null;
  videos: Video[];
  team_roles: TeamRole[];
}

interface Show {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  year: number;
  published: boolean;
  teams: Team[];
}

export function ContentManager({ shows: initialShows }: { shows: Show[] }) {
  const [shows, setShows] = useState(initialShows);
  const [selectedShowId, setSelectedShowId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"teams" | "roles" | "tags" | "overrides">("teams");
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState({
    title: "",
    description: "",
    image_url: "",
    year: new Date().getFullYear(),
    published: false,
    publish_at: "",
    bundle_price: "",
  });
  const [showFormOpen, setShowFormOpen] = useState(false);

  const selectedShow = shows.find((s) => s.id === selectedShowId);

  const [teamForm, setTeamForm] = useState({ name: "", color: "#a855f7" });
  const [videoForm, setVideoForm] = useState<{
    team_id: string;
    title: string;
    youtube_url: string;
    vimeo_url: string;
    trailer_url: string;
    price: number;
    sort_order: number;
    published: boolean;
  } | null>(null);

  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [roleAssignForm, setRoleAssignForm] = useState({ role_id: "", actor_name: "" });
  const [roleFormName, setRoleFormName] = useState("");
  const [showTags, setShowTags] = useState<Record<string, string[]>>({});
  const [tagInput, setTagInput] = useState("");

  const api = async (path: string, method: string, body?: any) => {
    const res = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Noe gikk galt");
    return data;
  };

  const reload = () => window.location.reload();

  // --- Show CRUD ---
  const handleCreateShow = async () => {
    if (!showForm.title) return;
    setLoading(true);
    try {
      await api("/api/admin/content/show", "POST", {
        ...showForm,
        publish_at: showForm.publish_at || null,
        bundle_price: showForm.bundle_price ? Number(showForm.bundle_price) : null,
      });
      toast.success("Forestilling opprettet!");
      setShowForm({ title: "", description: "", image_url: "", year: new Date().getFullYear(), published: false, publish_at: "", bundle_price: "" });
      setShowFormOpen(false);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Feil");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShow = async (id: string) => {
    if (!confirm("Slette denne forestillingen og alt innholdet?")) return;
    setLoading(true);
    try {
      await api(`/api/admin/content/show?id=${id}`, "DELETE");
      toast.success("Slettet!");
      setSelectedShowId(null);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Feil");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShow = async (id: string, published: boolean) => {
    try {
      await api("/api/admin/content/show", "PATCH", { id, published });
      setShows((prev) => prev.map((s) => s.id === id ? { ...s, published } : s));
      toast.success(published ? "Publisert!" : "Skjult!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Feil");
    }
  };

  // --- Team CRUD ---
  const handleCreateTeam = async () => {
    if (!teamForm.name || !selectedShowId) return;
    setLoading(true);
    try {
      await api("/api/admin/content/team", "POST", { ...teamForm, show_id: selectedShowId });
      toast.success("Lag opprettet!");
      setTeamForm({ name: "", color: "#a855f7" });
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Feil");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("Slette laget og alle videoene?")) return;
    setLoading(true);
    try {
      await api(`/api/admin/content/team?id=${id}`, "DELETE");
      toast.success("Slettet!");
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Feil");
    } finally {
      setLoading(false);
    }
  };

  // --- Video CRUD ---
  const handleCreateVideo = async () => {
    if (!videoForm?.title || !videoForm.team_id) return;
    setLoading(true);
    try {
      await api("/api/admin/content/video", "POST", videoForm);
      toast.success("Video lagt til!");
      setVideoForm(null);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Feil");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Slette videoen?")) return;
    setLoading(true);
    try {
      await api(`/api/admin/content/video?id=${id}`, "DELETE");
      toast.success("Slettet!");
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Feil");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVideo = async (id: string, published: boolean) => {
    try {
      await api("/api/admin/content/video", "PATCH", { id, published });
      setShows((prev) =>
        prev.map((s) => ({
          ...s,
          teams: s.teams.map((t) => ({
            ...t,
            videos: t.videos.map((v) => v.id === id ? { ...v, published } : v),
          })),
        }))
      );
      toast.success(published ? "Synlig!" : "Skjult!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Feil");
    }
  };

  // --- Roles ---
  const loadRoles = async () => {
    const data = await api("/api/admin/content/role", "GET");
    setAllRoles(data);
  };

  const handleCreateRole = async () => {
    if (!roleFormName.trim()) return;
    setLoading(true);
    try {
      await api("/api/admin/content/role", "POST", { name: roleFormName.trim() });
      toast.success("Rolle opprettet!");
      setRoleFormName("");
      loadRoles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Feil");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (teamId: string) => {
    if (!roleAssignForm.role_id) return;
    setLoading(true);
    try {
      const data = await api("/api/admin/content/team-role", "POST", {
        team_id: teamId,
        role_id: roleAssignForm.role_id,
        actor_name: roleAssignForm.actor_name || null,
      });
      const roleData = allRoles.find((r) => r.id === roleAssignForm.role_id);
      const newTeamRole = { ...data, roles: roleData! };
      setShows((prev) =>
        prev.map((s) => ({
          ...s,
          teams: s.teams.map((t) =>
            t.id === teamId ? { ...t, team_roles: [...t.team_roles, newTeamRole] } : t
          ),
        }))
      );
      toast.success("Rolle tildelt!");
      setRoleAssignForm({ role_id: "", actor_name: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Feil");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (teamRoleId: string) => {
    setLoading(true);
    try {
      await api(`/api/admin/content/team-role?id=${teamRoleId}`, "DELETE");
      setShows((prev) =>
        prev.map((s) => ({
          ...s,
          teams: s.teams.map((t) => ({
            ...t,
            team_roles: t.team_roles.filter((tr) => tr.id !== teamRoleId),
          })),
        }))
      );
      toast.success("Fjernet!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Feil");
    } finally {
      setLoading(false);
    }
  };

  // --- Tags ---
  const loadTags = async (showId: string) => {
    const data = await api(`/api/tags?show_id=${showId}`, "GET");
    setShowTags((prev) => ({ ...prev, [showId]: data.map((t: any) => t.tag) }));
  };

  const handleAddTag = async () => {
    if (!selectedShowId || !tagInput.trim()) return;
    const newTags = [...(showTags[selectedShowId] || []), ...tagInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)];
    try {
      await api("/api/tags", "POST", { show_id: selectedShowId, tags: newTags });
      setShowTags((prev) => ({ ...prev, [selectedShowId]: newTags }));
      setTagInput("");
      toast.success("Tagg oppdatert!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Feil");
    }
  };

  const handleRemoveTag = async (tag: string) => {
    if (!selectedShowId) return;
    const existing = (showTags[selectedShowId] || []).filter((t) => t !== tag);
    try {
      await api("/api/tags", "POST", { show_id: selectedShowId, tags: existing });
      setShowTags((prev) => ({ ...prev, [selectedShowId]: existing }));
      toast.success("Fjernet!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Feil");
    }
  };

  const inputClass = "w-full rounded-xl input-glass px-4 py-3 text-sm";
  const smInput = "rounded-lg input-glass px-3 py-2 text-sm";

  const tabs = [
    { id: "teams" as const, label: "Lag & Videoer" },
    { id: "roles" as const, label: "Roller" },
    { id: "tags" as const, label: "Tagger" },
    { id: "overrides" as const, label: "Vikar" },
  ];

  return (
    <div className="flex gap-6 min-h-[60vh]">
      {/* Sidebar — show list */}
      <div className="w-64 shrink-0 space-y-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Forestillinger</h2>
          <button
            onClick={() => setShowFormOpen(!showFormOpen)}
            className="w-8 h-8 rounded-lg bg-gold/10 text-gold hover:bg-gold/20 transition-colors flex items-center justify-center text-lg font-bold"
          >
            +
          </button>
        </div>

        {showFormOpen && (
          <div className="glass-card rounded-xl p-3 space-y-2 mb-3">
            <input
              type="text"
              placeholder="Tittel"
              value={showForm.title}
              onChange={(e) => setShowForm({ ...showForm, title: e.target.value })}
              className={smInput}
            />
            <input
              type="number"
              placeholder="År"
              value={showForm.year}
              onChange={(e) => setShowForm({ ...showForm, year: Number(e.target.value) })}
              className={smInput}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateShow}
                disabled={loading || !showForm.title}
                className="btn-gold rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
              >
                Opprett
              </button>
              <button
                onClick={() => setShowFormOpen(false)}
                className="text-xs text-muted hover:text-foreground px-2 py-1.5"
              >
                Avbryt
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1">
          {shows.map((show) => (
            <button
              key={show.id}
              onClick={() => {
                setSelectedShowId(show.id);
                setActiveTab("teams");
                loadTags(show.id);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                selectedShowId === show.id
                  ? "bg-gold/10 text-gold border border-gold/15"
                  : "text-muted hover:text-foreground hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">{show.title}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  show.published ? "bg-success/10 text-success" : "bg-white/[0.06] text-muted"
                }`}>
                  {show.published ? "✓" : "·"}
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                {show.year} · {show.teams.length} lag
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {!selectedShow ? (
          <div className="flex items-center justify-center h-full text-muted text-sm">
            Velg en forestilling fra listen
          </div>
        ) : (
          <div className="space-y-6">
            {/* Show header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{selectedShow.title}</h2>
                <p className="text-sm text-muted">{selectedShow.year}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleShow(selectedShow.id, !selectedShow.published)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedShow.published
                      ? "bg-success/10 text-success hover:bg-success/20"
                      : "bg-white/[0.06] text-muted hover:text-foreground"
                  }`}
                >
                  {selectedShow.published ? "Publisert" : "Utkast"}
                </button>
                <button
                  onClick={() => handleDeleteShow(selectedShow.id)}
                  className="px-3 py-1.5 rounded-lg text-xs text-danger/70 hover:text-danger hover:bg-danger/10 transition-colors"
                >
                  Slett
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-white/[0.06] pb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === tab.id
                      ? "text-gold border-b-2 border-gold -mb-px"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Teams & Videos */}
            {activeTab === "teams" && (
              <div className="space-y-6">
                {selectedShow.teams.map((team) => (
                  <div key={team.id} className="glass-card rounded-xl overflow-hidden">
                    {/* Team header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
                        <span className="font-medium text-sm" style={{ color: team.color }}>
                          {team.name}
                        </span>
                        <span className="text-xs text-muted">{team.videos.length} videoer</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            if (videoForm?.team_id === team.id) {
                              setVideoForm(null);
                            } else {
                              setVideoForm({
                                team_id: team.id,
                                title: "",
                                youtube_url: "",
                                vimeo_url: "",
                                trailer_url: "",
                                price: 0,
                                sort_order: team.videos.length,
                                published: false,
                              });
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                            videoForm?.team_id === team.id
                              ? "bg-gold/10 text-gold"
                              : "text-gold hover:bg-gold/10"
                          }`}
                        >
                          {videoForm?.team_id === team.id ? "Lukk" : "+ Video"}
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(team.id)}
                          className="px-2 py-1 text-xs text-danger/60 hover:text-danger transition-colors"
                        >
                          Slett
                        </button>
                      </div>
                    </div>

                    {/* Video list */}
                    <div className="divide-y divide-white/[0.04]">
                      {team.videos.length === 0 ? (
                        <p className="px-4 py-6 text-xs text-muted text-center">
                          Ingen videoer ennå
                        </p>
                      ) : (
                        team.videos
                          .sort((a, b) => a.sort_order - b.sort_order)
                          .map((video) => (
                            <div key={video.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${video.published ? "bg-success" : "bg-muted/40"}`} />
                                <span className="text-sm truncate">{video.title}</span>
                                <span className="text-xs text-muted shrink-0">{video.price} kr</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => handleToggleVideo(video.id, !video.published)}
                                  className="text-xs text-muted hover:text-foreground px-2 py-1 transition-colors"
                                >
                                  {video.published ? "Skjul" : "Vis"}
                                </button>
                                <button
                                  onClick={() => handleDeleteVideo(video.id)}
                                  className="text-xs text-danger/60 hover:text-danger px-2 py-1 transition-colors"
                                >
                                  Slett
                                </button>
                              </div>
                            </div>
                          ))
                      )}
                    </div>

                    {/* Add video form */}
                    {videoForm?.team_id === team.id && (
                      <div className="border-t border-white/[0.04] px-4 py-3 bg-white/[0.02] space-y-2">
                        <input
                          type="text"
                          placeholder="Videonavn"
                          value={videoForm.title}
                          onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                          className={smInput}
                          autoFocus
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="url"
                            placeholder="YouTube URL"
                            value={videoForm.youtube_url}
                            onChange={(e) => setVideoForm({ ...videoForm, youtube_url: e.target.value })}
                            className={smInput}
                          />
                          <input
                            type="url"
                            placeholder="Vimeo URL"
                            value={videoForm.vimeo_url}
                            onChange={(e) => setVideoForm({ ...videoForm, vimeo_url: e.target.value })}
                            className={smInput}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            placeholder="Pris kr"
                            value={videoForm.price || ""}
                            onChange={(e) => setVideoForm({ ...videoForm, price: Number(e.target.value) })}
                            className={smInput}
                          />
                          <input
                            type="number"
                            placeholder="Rekkefølge"
                            value={videoForm.sort_order}
                            onChange={(e) => setVideoForm({ ...videoForm, sort_order: Number(e.target.value) })}
                            className={smInput}
                          />
                          <label className="flex items-center gap-1.5 text-xs text-muted px-2">
                            <input
                              type="checkbox"
                              checked={videoForm.published}
                              onChange={(e) => setVideoForm({ ...videoForm, published: e.target.checked })}
                              className="rounded border-border"
                            />
                            Publisert
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCreateVideo}
                            disabled={loading || !videoForm.title}
                            className="btn-gold rounded-lg px-4 py-1.5 text-xs font-medium disabled:opacity-50"
                          >
                            + Legg til
                          </button>
                          <button
                            onClick={() => setVideoForm(null)}
                            className="text-xs text-muted hover:text-foreground px-3 py-1.5"
                          >
                            Avbryt
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add team */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nytt lag..."
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateTeam()}
                    className={`${smInput} flex-1`}
                  />
                  <input
                    type="color"
                    value={teamForm.color}
                    onChange={(e) => setTeamForm({ ...teamForm, color: e.target.value })}
                    className="w-10 h-9 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <button
                    onClick={handleCreateTeam}
                    disabled={loading || !teamForm.name}
                    className="btn-gold rounded-lg px-4 py-1.5 text-xs font-medium disabled:opacity-50"
                  >
                    + Lag
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Roles */}
            {activeTab === "roles" && (
              <div className="space-y-6">
                {selectedShow.teams.map((team) => (
                  <div key={team.id} className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
                      <span className="font-medium text-sm" style={{ color: team.color }}>
                        {team.name}
                      </span>
                    </div>

                    {/* Assigned roles */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {team.team_roles.length === 0 ? (
                        <p className="text-xs text-muted">Ingen roller tildelt</p>
                      ) : (
                        team.team_roles.map((tr) => (
                          <span
                            key={tr.id}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] px-2.5 py-1.5 text-xs"
                          >
                            <span className="font-medium">{tr.roles.name}</span>
                            {tr.actor_name && <span className="text-muted">({tr.actor_name})</span>}
                            <button
                              onClick={() => handleRemoveRole(tr.id)}
                              className="text-muted hover:text-danger ml-1"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    {/* Assign form */}
                    <div className="flex gap-2">
                      <select
                        value={roleAssignForm.role_id}
                        onChange={(e) => setRoleAssignForm({ ...roleAssignForm, role_id: e.target.value })}
                        className={`${smInput} flex-1`}
                        onFocus={loadRoles}
                      >
                        <option value="">Velg rolle...</option>
                        {allRoles.map((r) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Skuespiller"
                        value={roleAssignForm.actor_name}
                        onChange={(e) => setRoleAssignForm({ ...roleAssignForm, actor_name: e.target.value })}
                        className={`${smInput} w-32`}
                      />
                      <button
                        onClick={() => handleAssignRole(team.id)}
                        disabled={loading || !roleAssignForm.role_id}
                        className="btn-gold rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                      >
                        Tildel
                      </button>
                    </div>
                  </div>
                ))}

                {/* Create new role */}
                <div className="glass-card rounded-xl p-4">
                  <h4 className="text-xs font-medium text-muted mb-3">Opprett ny rolle</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Rolle..."
                      value={roleFormName}
                      onChange={(e) => setRoleFormName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreateRole()}
                      className={`${smInput} flex-1`}
                    />
                    <button
                      onClick={handleCreateRole}
                      disabled={loading || !roleFormName.trim()}
                      className="btn-gold rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                    >
                      + Ny
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Tags */}
            {activeTab === "tags" && (
              <div className="glass-card rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-medium text-muted">Tagger for søk og relaterede forestillinger</h4>
                {showTags[selectedShow.id] && showTags[selectedShow.id].length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {showTags[selectedShow.id].map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-gold/[0.08] border border-gold/15 px-2.5 py-1 text-xs text-gold">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="text-gold/60 hover:text-danger ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Legg til tagger (kommadelt)..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                    className={`${smInput} flex-1`}
                  />
                  <button
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                    className="btn-gold rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Overrides */}
            {activeTab === "overrides" && (
              <ActorOverridePanel
                showId={selectedShow.id}
                teamRoles={selectedShow.teams.flatMap((team) =>
                  (team.team_roles || []).flatMap((tr) =>
                    (team.videos || []).map((v) => ({
                      video_id: v.id,
                      video_title: v.title,
                      team_id: team.id,
                      team_name: team.name,
                      team_color: team.color,
                      role_id: tr.role_id,
                      role_name: tr.roles.name,
                      default_actor: tr.actor_name,
                    }))
                  )
                )}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
