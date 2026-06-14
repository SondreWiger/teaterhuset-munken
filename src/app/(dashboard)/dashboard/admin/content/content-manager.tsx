"use client";

import { useState } from "react";
import { toast } from "sonner";

interface Video {
  id: string;
  team_id: string;
  title: string;
  description: string | null;
  youtube_url: string | null;
  vimeo_url: string | null;
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
  const [activeTab, setActiveTab] = useState<"shows" | "add-show">("shows");
  const [expandedShow, setExpandedShow] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState({
    title: "",
    description: "",
    image_url: "",
    year: new Date().getFullYear(),
    published: false,
  });

  const [teamForm, setTeamForm] = useState({
    show_id: "",
    name: "",
    color: "#a855f7",
    description: "",
  });

  const [videoForm, setVideoForm] = useState({
    team_id: "",
    title: "",
    description: "",
    youtube_url: "",
    vimeo_url: "",
    price: 0,
    sort_order: 0,
    published: false,
  });

  const [editingVideo, setEditingVideo] = useState<string | null>(null);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);

  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [roleFormName, setRoleFormName] = useState("");
  const [expandedTeamRoles, setExpandedTeamRoles] = useState<string | null>(null);
  const [roleAssignForm, setRoleAssignForm] = useState({ role_id: "", actor_name: "" });

  const loadRoles = async () => {
    try {
      const res = await fetch("/api/admin/content/role");
      const data = await res.json();
      setAllRoles(data);
    } catch {}
  };

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

  const handleCreateShow = async () => {
    if (!showForm.title) return;
    setLoading(true);
    try {
      await api("/api/admin/content/show", "POST", showForm);
      toast.success("Forestilling opprettet!");
      setShowForm({ title: "", description: "", image_url: "", year: new Date().getFullYear(), published: false });
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Feil");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShow = async (id: string) => {
    if (!confirm("Er du sikker på at du vil slette denne forestillingen og alt innholdet?")) return;
    setLoading(true);
    try {
      await api(`/api/admin/content/show?id=${id}`, "DELETE");
      toast.success("Forestilling slettet!");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Feil");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShow = async (id: string, published: boolean) => {
    try {
      await api("/api/admin/content/show", "PATCH", { id, published });
      toast.success(published ? "Publisert!" : "Skjult!");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Feil");
    }
  };

  const handleCreateTeam = async () => {
    if (!teamForm.name || !teamForm.show_id) return;
    setLoading(true);
    try {
      await api("/api/admin/content/team", "POST", teamForm);
      toast.success("Lag opprettet!");
      setTeamForm({ show_id: "", name: "", color: "#a855f7", description: "" });
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Feil");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("Slette dette laget og alle videoene?")) return;
    setLoading(true);
    try {
      await api(`/api/admin/content/team?id=${id}`, "DELETE");
      toast.success("Lag slettet!");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Feil");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVideo = async () => {
    if (!videoForm.title || !videoForm.team_id) return;
    setLoading(true);
    try {
      await api("/api/admin/content/video", "POST", videoForm);
      toast.success("Video opprettet!");
      setVideoForm({
        team_id: "",
        title: "",
        description: "",
        youtube_url: "",
        vimeo_url: "",
        price: 0,
        sort_order: 0,
        published: false,
      });
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Feil");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Slette denne videoen?")) return;
    setLoading(true);
    try {
      await api(`/api/admin/content/video?id=${id}`, "DELETE");
      toast.success("Video slettet!");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Feil");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVideo = async (id: string, published: boolean) => {
    try {
      await api("/api/admin/content/video", "PATCH", { id, published });
      toast.success(published ? "Publisert!" : "Skjult!");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Feil");
    }
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
        prev.map((show) => ({
          ...show,
          teams: show.teams.map((team) =>
            team.id === teamId
              ? { ...team, team_roles: [...team.team_roles, newTeamRole] }
              : team
          ),
        }))
      );
      toast.success("Rolle tildelt!");
      setRoleAssignForm({ role_id: "", actor_name: "" });
      setExpandedTeamRoles(null);
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
        prev.map((show) => ({
          ...show,
          teams: show.teams.map((team) => ({
            ...team,
            team_roles: team.team_roles.filter((tr) => tr.id !== teamRoleId),
          })),
        }))
      );
      toast.success("Rolle fjernet!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Feil");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl input-glass px-4 py-3 text-sm";
  const smallInputClass =
    "rounded-lg input-glass px-3 py-2 text-sm";

  return (
    <div className="space-y-8">
      <div className="flex gap-2 border-b border-border/50 pb-2">
        <button
          onClick={() => setActiveTab("shows")}
          className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all ${
            activeTab === "shows"
              ? "btn-gold"
              : "text-muted hover:text-foreground hover:bg-white/[0.04]"
          }`}
        >
          Forestillinger
        </button>
        <button
          onClick={() => setActiveTab("add-show")}
          className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all ${
            activeTab === "add-show"
              ? "btn-gold"
              : "text-muted hover:text-foreground hover:bg-white/[0.04]"
          }`}
        >
          + Ny forestilling
        </button>
      </div>

      {activeTab === "add-show" && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground/90">Ny forestilling</h2>
          <input
            type="text"
            placeholder="Tittel"
            value={showForm.title}
            onChange={(e) => setShowForm({ ...showForm, title: e.target.value })}
            className={inputClass}
          />
          <textarea
            placeholder="Beskrivelse (valgfritt)"
            value={showForm.description}
            onChange={(e) =>
              setShowForm({ ...showForm, description: e.target.value })
            }
            rows={3}
            className={inputClass}
          />
          <input
            type="url"
            placeholder="Bilde-URL (valgfritt)"
            value={showForm.image_url}
            onChange={(e) =>
              setShowForm({ ...showForm, image_url: e.target.value })
            }
            className={inputClass}
          />
          <input
            type="number"
            placeholder="År"
            value={showForm.year}
            onChange={(e) =>
              setShowForm({ ...showForm, year: Number(e.target.value) })
            }
            min={1900}
            max={2100}
            className={inputClass}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showForm.published}
              onChange={(e) =>
                setShowForm({ ...showForm, published: e.target.checked })
              }
              className="rounded border-border"
            />
            Publisert (synlig på forsiden)
          </label>
          <button
            onClick={handleCreateShow}
            disabled={loading || !showForm.title}
            className="btn-gold rounded-xl px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? "Oppretter..." : "Opprett forestilling"}
          </button>
        </div>
      )}

      {activeTab === "shows" && (
        <div className="space-y-4">
          {shows.length === 0 && (
            <p className="text-center text-muted py-12">
              Ingen forestillinger ennå. Klikk &quot;+ Ny forestilling&quot; for å komme i gang.
            </p>
          )}

          {shows.map((show) => (
            <div
              key={show.id}
              className="glass-card rounded-2xl overflow-hidden"
            >
              <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() =>
                  setExpandedShow(expandedShow === show.id ? null : show.id)
                }
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-muted text-sm transition-transform ${
                      expandedShow === show.id ? "rotate-90" : ""
                    }`}
                  >
                    ▶
                  </span>
                  <div>
                    <h3 className="font-semibold">{show.title}</h3>
                    <p className="text-xs text-muted">
                      {show.teams.length} lag ·{" "}
                      {show.teams.reduce(
                        (acc, t) => acc + t.videos.length,
                        0
                      )}{" "}
                      videoer
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      show.published
                        ? "bg-success/10 text-success"
                        : "bg-muted/10 text-muted"
                    }`}
                  >
                    {show.published ? "Publisert" : "Utkast"}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleShow(show.id, !show.published);
                    }}
                    className="text-xs text-muted hover:text-foreground transition-colors px-2 py-1"
                  >
                    {show.published ? "Skjul" : "Publiser"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteShow(show.id);
                    }}
                    className="text-xs text-danger hover:text-danger/80 transition-colors px-2 py-1"
                  >
                    Slett
                  </button>
                </div>
              </div>

              {expandedShow === show.id && (
                <div className="border-t border-white/[0.04] p-5 space-y-6">
                  {show.teams.map((team) => (
                    <div key={team.id} className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: team.color }}
                          />
                          <h4 className="font-medium">{team.name}</h4>
                          <span className="text-xs text-muted">
                            {team.videos.length} videoer
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteTeam(team.id)}
                          className="text-xs text-danger hover:text-danger/80 transition-colors"
                        >
                          Slett lag
                        </button>
                      </div>

                      {team.videos.map((video) => (
                        <div
                          key={video.id}
                          className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2.5 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                video.published ? "bg-success" : "bg-muted"
                              }`}
                            />
                            <span>{video.title}</span>
                            <span className="text-xs text-muted">
                              {video.price} kr
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleToggleVideo(video.id, !video.published)
                              }
                              className="text-xs text-muted hover:text-foreground transition-colors"
                            >
                              {video.published ? "Skjul" : "Vis"}
                            </button>
                            <button
                              onClick={() => handleDeleteVideo(video.id)}
                              className="text-xs text-danger hover:text-danger/80 transition-colors"
                            >
                              Slett
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Roles section */}
                      <div className="border-t border-white/[0.04] pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-xs font-medium text-muted">
                            Roller i {team.name}
                          </h5>
                          <button
                            onClick={() => {
                              loadRoles();
                              setExpandedTeamRoles(expandedTeamRoles === team.id ? null : team.id);
                            }}
                            className="text-xs text-gold hover:text-gold-light transition-colors"
                          >
                            {expandedTeamRoles === team.id ? "Lukk" : "+ Tildel rolle"}
                          </button>
                        </div>

                        {team.team_roles && team.team_roles.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {team.team_roles.map((tr: TeamRole) => (
                              <span
                                key={tr.id}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.03] border border-white/[0.04] px-2.5 py-1.5 text-xs"
                              >
                                <span className="font-medium">{tr.roles.name}</span>
                                {tr.actor_name && (
                                  <span className="text-muted">({tr.actor_name})</span>
                                )}
                                <button
                                  onClick={() => handleRemoveRole(tr.id)}
                                  className="text-muted hover:text-danger transition-colors ml-1"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        {expandedTeamRoles === team.id && (
                          <div className="mt-2 rounded-lg bg-white/[0.02] border border-white/[0.04] p-3 space-y-2">
                            <select
                              value={roleAssignForm.role_id}
                              onChange={(e) =>
                                setRoleAssignForm({ ...roleAssignForm, role_id: e.target.value })
                              }
                              className="w-full rounded-lg input-glass px-3 py-2 text-xs"
                            >
                              <option value="">Velg rolle...</option>
                              {allRoles.map((role) => (
                                <option key={role.id} value={role.id}>
                                  {role.name}
                                </option>
                              ))}
                            </select>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Skuespiller (valgfritt)"
                                value={roleAssignForm.actor_name}
                                onChange={(e) =>
                                  setRoleAssignForm({ ...roleAssignForm, actor_name: e.target.value })
                                }
                                className={`${smallInputClass} flex-1`}
                              />
                              <button
                                onClick={() => handleAssignRole(team.id)}
                                disabled={loading || !roleAssignForm.role_id}
                                className="btn-gold rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                              >
                                <span>Tildel</span>
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Eller lag ny rolle..."
                                value={roleFormName}
                                onChange={(e) => setRoleFormName(e.target.value)}
                                className={`${smallInputClass} flex-1`}
                              />
                              <button
                                onClick={handleCreateRole}
                                disabled={loading || !roleFormName.trim()}
                                className="rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-muted hover:text-foreground hover:border-gold/20 transition-all disabled:opacity-50"
                              >
                                + Ny
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-white/[0.02] rounded-lg p-3 space-y-2 border border-white/[0.04]">
                        <h5 className="text-xs font-medium text-muted">
                          Legg til video i {team.name}
                        </h5>
                        <input
                          type="text"
                          placeholder="Videonavn"
                          value={editingTeam === team.id ? videoForm.title : ""}
                          onFocus={() => {
                            setEditingTeam(team.id);
                            setVideoForm({ ...videoForm, team_id: team.id });
                          }}
                          onChange={(e) =>
                            setVideoForm({ ...videoForm, title: e.target.value })
                          }
                          className={smallInputClass}
                        />
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="YouTube URL"
                            value={
                              editingTeam === team.id ? videoForm.youtube_url : ""
                            }
                            onFocus={() => {
                              setEditingTeam(team.id);
                              setVideoForm({ ...videoForm, team_id: team.id });
                            }}
                            onChange={(e) =>
                              setVideoForm({
                                ...videoForm,
                                youtube_url: e.target.value,
                              })
                            }
                            className={`${smallInputClass} flex-1`}
                          />
                          <input
                            type="url"
                            placeholder="Vimeo URL"
                            value={
                              editingTeam === team.id ? videoForm.vimeo_url : ""
                            }
                            onFocus={() => {
                              setEditingTeam(team.id);
                              setVideoForm({ ...videoForm, team_id: team.id });
                            }}
                            onChange={(e) =>
                              setVideoForm({
                                ...videoForm,
                                vimeo_url: e.target.value,
                              })
                            }
                            className={`${smallInputClass} flex-1`}
                          />
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Pris (kr)"
                            value={
                              editingTeam === team.id
                                ? videoForm.price || ""
                                : ""
                            }
                            onFocus={() => {
                              setEditingTeam(team.id);
                              setVideoForm({ ...videoForm, team_id: team.id });
                            }}
                            onChange={(e) =>
                              setVideoForm({
                                ...videoForm,
                                price: Number(e.target.value),
                              })
                            }
                            className={`${smallInputClass} w-24`}
                          />
                          <input
                            type="number"
                            placeholder="Rekkefølge"
                            value={
                              editingTeam === team.id
                                ? videoForm.sort_order || ""
                                : ""
                            }
                            onFocus={() => {
                              setEditingTeam(team.id);
                              setVideoForm({ ...videoForm, team_id: team.id });
                            }}
                            onChange={(e) =>
                              setVideoForm({
                                ...videoForm,
                                sort_order: Number(e.target.value),
                              })
                            }
                            className={`${smallInputClass} w-24`}
                          />
                          <label className="flex items-center gap-1 text-xs text-muted">
                            <input
                              type="checkbox"
                              checked={
                                editingTeam === team.id
                                  ? videoForm.published
                                  : false
                              }
                              onChange={(e) =>
                                setVideoForm({
                                  ...videoForm,
                                  published: e.target.checked,
                                })
                              }
                              className="rounded border-border"
                            />
                            Publisert
                          </label>
                          <button
                            onClick={handleCreateVideo}
                            disabled={loading || !videoForm.title}
                            className="btn-gold rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                          >
                            <span>+ Legg til</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="rounded-xl border border-dashed border-white/[0.06] p-4 space-y-2">
                    <h5 className="text-xs font-medium text-muted">
                      Legg til nytt lag
                    </h5>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Lagnavn"
                        value={teamForm.show_id === show.id ? teamForm.name : ""}
                        onFocus={() => {
                          setTeamForm({ ...teamForm, show_id: show.id });
                        }}
                        onChange={(e) =>
                          setTeamForm({ ...teamForm, name: e.target.value })
                        }
                        className={`${smallInputClass} flex-1`}
                      />
                      <input
                        type="color"
                        value={teamForm.color}
                        onChange={(e) =>
                          setTeamForm({ ...teamForm, color: e.target.value })
                        }
                        className="w-10 h-8 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <button
                        onClick={handleCreateTeam}
                        disabled={loading || !teamForm.name}
                        className="btn-gold rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                      >
                        <span>+ Lag</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
