import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api";

interface RecipeReportRecord {
  id: number;
  recipe_id: number;
  recipe_title: string;
  recipe_image?: string | null;
  recipe_hidden: boolean;
  recipe_hidden_at?: string | null;
  recipe_hidden_reason?: string | null;
  reporter_user_id: number;
  reporter_emri: string;
  reporter_mbiemri: string;
  reason: string;
  data: string;
}

interface UserReportRecord {
  id: number;
  reported_user_id: number;
  reported_emri: string;
  reported_mbiemri: string;
  reported_email: string;
  reporter_user_id: number;
  reporter_emri: string;
  reporter_mbiemri: string;
  reason: string;
  data: string;
}

interface BugReportRecord {
  id: number;
  reporter_user_id: number;
  reporter_emri: string;
  reporter_mbiemri: string;
  reporter_email: string;
  subject: string;
  message: string;
  status: string;
  data: string;
}

type ActiveTab = "recipes" | "users" | "bugs";

function readCollection<T>(payload: unknown, keys: string[]): T[] {
  if (Array.isArray(payload)) return payload as T[];
  for (const key of keys) {
    const value = (payload as Record<string, unknown> | null)?.[key];
    if (Array.isArray(value)) return value as T[];
  }
  return [];
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString("sq-AL") : "-";
}

function resolveReportPayload<T>(response: unknown): T[] {
  return readCollection<T>(response, ["reports", "data"]);
}

export function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("recipes");
  const [recipeReports, setRecipeReports] = useState<RecipeReportRecord[]>([]);
  const [userReports, setUserReports] = useState<UserReportRecord[]>([]);
  const [bugReports, setBugReports] = useState<BugReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  async function loadReports() {
    setLoading(true);
    try {
      const [recipesResponse, usersResponse, bugsResponse] = await Promise.all([
        apiFetch("/interactions/reports/recipes"),
        apiFetch("/interactions/reports/users"),
        apiFetch("/interactions/reports/bugs"),
      ]);

      if (recipesResponse.ok) {
        setRecipeReports(resolveReportPayload<RecipeReportRecord>(recipesResponse));
      } else {
        setRecipeReports([]);
      }

      if (usersResponse.ok) {
        setUserReports(resolveReportPayload<UserReportRecord>(usersResponse));
      } else {
        setUserReports([]);
      }

      if (bugsResponse?.ok) {
        setBugReports(resolveReportPayload<BugReportRecord>(bugsResponse));
      } else {
        setBugReports([]);
      }

      if (!recipesResponse.ok || !usersResponse.ok || !bugsResponse?.ok) {
        throw new Error("Failed to load one or more report collections");
      }

      setActionError("");
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      setActionError("Nuk u ngarkuan raportet.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  const summary = useMemo(() => ({
    recipes: recipeReports.length,
    users: userReports.length,
    bugs: bugReports.length,
    total: recipeReports.length + userReports.length + bugReports.length,
  }), [recipeReports, userReports, bugReports]);

  async function keepRecipe(recipeId: number, recipeTitle: string) {
    if (!window.confirm(`Mbaje recetën "${recipeTitle}" dhe hiq raportet e saj?`)) return;
    setActionError("");
    setActionMessage("");

    try {
      const response = await apiFetch(`/interactions/reports/recipes/${recipeId}/keep`, { method: "PATCH" });
      if (!response.ok) throw new Error("Failed to keep recipe");
      setActionMessage(`Receta "${recipeTitle}" u rikthye.`);
      await loadReports();
    } catch (error) {
      console.error("Failed to keep recipe:", error);
      setActionError("Nuk u ruajt ndryshimi për recetën.");
    }
  }

  async function removeRecipe(recipeId: number, recipeTitle: string) {
    if (!window.confirm(`Fshijmë recetën "${recipeTitle}"?`)) return;
    setActionError("");
    setActionMessage("");

    try {
      const response = await apiFetch(`/interactions/reports/recipes/${recipeId}`, { method: "DELETE" });
      if (!response.ok && response.response.status !== 204) throw new Error("Failed to delete recipe");
      setActionMessage(`Receta "${recipeTitle}" u fshi.`);
      await loadReports();
    } catch (error) {
      console.error("Failed to remove recipe:", error);
      setActionError("Fshirja e recetës dështoi.");
    }
  }

  async function dismissUser(userId: number, userName: string) {
    if (!window.confirm(`Shëno raportet për "${userName}" si të shqyrtuara?`)) return;
    setActionError("");
    setActionMessage("");

    try {
      const response = await apiFetch(`/interactions/reports/users/${userId}/dismiss`, { method: "PATCH" });
      if (!response.ok) throw new Error("Failed to dismiss user reports");
      setActionMessage(`Raportet për "${userName}" u shënuan të shqyrtuara.`);
      await loadReports();
    } catch (error) {
      console.error("Failed to dismiss user reports:", error);
      setActionError("Përditësimi i raporteve të përdoruesit dështoi.");
    }
  }

  async function resolveBugReport(bugReportId: number, subject: string) {
    if (!window.confirm(`Shëno bug report-in "${subject}" si të zgjidhur?`)) return;
    setActionError("");
    setActionMessage("");

    try {
      const response = await apiFetch(`/interactions/reports/bugs/${bugReportId}/resolve`, { method: "PATCH" });
      if (!response.ok) throw new Error("Failed to resolve bug report");
      setActionMessage(`Bug report "${subject}" u shënua i zgjidhur.`);
      await loadReports();
    } catch (error) {
      console.error("Failed to resolve bug report:", error);
      setActionError("Përditësimi i bug report-it dështoi.");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold" style={{ fontFamily: "var(--font-headline-md)", color: "var(--color-on-surface)" }}>Reports & Moderation</h2>
          <p className="mt-2 text-base" style={{ color: "var(--color-on-surface-variant)" }}>Review reported recipes and users before making a final decision.</p>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Recipe reports", value: summary.recipes },
            { label: "User reports", value: summary.users },
            { label: "Bug reports", value: summary.bugs },
            { label: "Total", value: summary.total },
          ].map((item) => (
            <article key={item.label} className="rounded-xl px-4 py-3 shadow-sm" style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-outline-variant)" }}>
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>{item.label}</p>
              <p className="mt-1 text-2xl font-bold" style={{ fontFamily: "var(--font-headline-md)", color: "var(--color-on-surface)" }}>{item.value}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="flex gap-2 rounded-2xl border p-2 shadow-sm" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-outline-variant)" }}>
        {([
          ["recipes", "Recipe reports"],
          ["users", "User reports"],
          ["bugs", "Bug reports"],
        ] as Array<[ActiveTab, string]>).map(([key, label]) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
              style={active ? { backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" } : { color: "var(--color-on-surface-variant)" }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {actionMessage && <p className="rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">{actionMessage}</p>}
      {actionError && <p className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">{actionError}</p>}

      {activeTab === "recipes" ? (
        <section className="overflow-hidden rounded-2xl shadow-sm" style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-outline-variant)" }}>
          <div className="border-b px-5 py-4" style={{ borderBottomColor: "var(--color-outline-variant)" }}>
            <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-headline-md)", color: "var(--color-on-surface)" }}>Reported recipes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead style={{ backgroundColor: "var(--color-surface-container-low)" }}>
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Recipe</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Reporter</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Reason</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Date</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ divideColor: "var(--color-outline-variant)" }}>
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-sm font-medium" style={{ color: "var(--color-on-surface-variant)" }}>Loading recipe reports...</td></tr>
                ) : recipeReports.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-sm font-medium" style={{ color: "var(--color-on-surface-variant)" }}>No pending recipe reports.</td></tr>
                ) : (
                  recipeReports.map((report) => {
                    const reporterName = `${report.reporter_emri} ${report.reporter_mbiemri}`.trim();

                    return (
                      <tr key={report.id} className="transition-colors hover:bg-black/5">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-xl bg-surface-variant/20 flex items-center justify-center">
                              {report.recipe_image ? (
                                <img src={report.recipe_image} alt={report.recipe_title} className="h-full w-full object-cover" />
                              ) : (
                                <span className="material-symbols-outlined text-[20px]" style={{ color: "var(--color-on-surface-variant)" }}>restaurant</span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold" style={{ color: "var(--color-on-surface)" }}>{report.recipe_title}</p>
                              <p className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>ID {report.recipe_id} · {report.recipe_hidden ? "Hidden" : "Visible"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{reporterName || `User ${report.reporter_user_id}`}</td>
                        <td className="px-6 py-4 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{report.reason}</td>
                        <td className="px-6 py-4 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{formatDate(report.data)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-3">
                            <button type="button" className="font-semibold transition-opacity hover:opacity-80" style={{ color: "var(--color-primary)" }} onClick={() => keepRecipe(report.recipe_id, report.recipe_title)}>Keep</button>
                            <button type="button" className="font-semibold transition-opacity hover:opacity-80" style={{ color: "var(--color-error)" }} onClick={() => removeRecipe(report.recipe_id, report.recipe_title)}>Remove</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : activeTab === "users" ? (
        <section className="overflow-hidden rounded-2xl shadow-sm" style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-outline-variant)" }}>
          <div className="border-b px-5 py-4" style={{ borderBottomColor: "var(--color-outline-variant)" }}>
            <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-headline-md)", color: "var(--color-on-surface)" }}>Reported users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead style={{ backgroundColor: "var(--color-surface-container-low)" }}>
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>User</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Reporter</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Reason</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Date</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ divideColor: "var(--color-outline-variant)" }}>
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-sm font-medium" style={{ color: "var(--color-on-surface-variant)" }}>Loading user reports...</td></tr>
                ) : userReports.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-sm font-medium" style={{ color: "var(--color-on-surface-variant)" }}>No pending user reports.</td></tr>
                ) : (
                  userReports.map((report) => {
                    const reportedName = `${report.reported_emri} ${report.reported_mbiemri}`.trim();
                    const reporterName = `${report.reporter_emri} ${report.reporter_mbiemri}`.trim();

                    return (
                      <tr key={report.id} className="transition-colors hover:bg-black/5">
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold" style={{ color: "var(--color-on-surface)" }}>{reportedName || `User ${report.reported_user_id}`}</p>
                          <p className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>{report.reported_email}</p>
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{reporterName || `User ${report.reporter_user_id}`}</td>
                        <td className="px-6 py-4 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{report.reason}</td>
                        <td className="px-6 py-4 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{formatDate(report.data)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-3">
                            <button type="button" className="font-semibold transition-opacity hover:opacity-80" style={{ color: "var(--color-primary)" }} onClick={() => dismissUser(report.reported_user_id, reportedName || `User ${report.reported_user_id}`)}>Dismiss</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl shadow-sm" style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-outline-variant)" }}>
          <div className="border-b px-5 py-4" style={{ borderBottomColor: "var(--color-outline-variant)" }}>
            <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-headline-md)", color: "var(--color-on-surface)" }}>Bug reports</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead style={{ backgroundColor: "var(--color-surface-container-low)" }}>
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Reporter</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Subject</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Message</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Date</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ divideColor: "var(--color-outline-variant)" }}>
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-sm font-medium" style={{ color: "var(--color-on-surface-variant)" }}>Loading bug reports...</td></tr>
                ) : bugReports.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-sm font-medium" style={{ color: "var(--color-on-surface-variant)" }}>No pending bug reports.</td></tr>
                ) : (
                  bugReports.map((report) => {
                    const reporterName = `${report.reporter_emri} ${report.reporter_mbiemri}`.trim();

                    return (
                      <tr key={report.id} className="transition-colors hover:bg-black/5">
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold" style={{ color: "var(--color-on-surface)" }}>{reporterName || `User ${report.reporter_user_id}`}</p>
                          <p className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>{report.reporter_email}</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold" style={{ color: "var(--color-on-surface-variant)" }}>{report.subject}</td>
                        <td className="px-6 py-4 text-sm whitespace-pre-line" style={{ color: "var(--color-on-surface-variant)" }}>{report.message}</td>
                        <td className="px-6 py-4 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{formatDate(report.data)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-3">
                            <button type="button" className="font-semibold transition-opacity hover:opacity-80" style={{ color: "var(--color-primary)" }} onClick={() => resolveBugReport(report.id, report.subject)}>Resolve</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}