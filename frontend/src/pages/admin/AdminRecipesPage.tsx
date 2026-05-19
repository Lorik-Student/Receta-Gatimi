import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api";

interface RecipeRecord {
  id: number;
  titulli: string;
  pershkrimi: string;
  koha_pergatitjes: number;
  koha_gatimit: number;
  porcione: number;
  veshtiresija: string;
  imazhi?: string;
  user_id: number;
  category_id: number;
}

type ModalMode = "create" | "edit" | "view";

function readCollection<T>(payload: unknown, keys: string[]): T[] {
  if (Array.isArray(payload)) return payload as T[];
  for (const key of keys) {
    const value = (payload as Record<string, unknown> | null)?.[key];
    if (Array.isArray(value)) return value as T[];
  }
  return [];
}

function makeCreateTemplate() {
  return JSON.stringify(
    {
      titulli: "",
      pershkrimi: "",
      koha_pergatitjes: 0,
      koha_gatimit: 0,
      porcione: 1,
      veshtiresija: "Lehte",
      imazhi: "",
      user_id: 1,
      category_id: 1,
      steps: [{ hapi_nr: 1, pershkrimi: "", imazhi: "" }],
      ingredients: [{ emertimi: "", sasia: 1, njesia: "g" }],
      tags: [],
    },
    null,
    2,
  );
}

function makeEditTemplate(recipe: RecipeRecord) {
  return JSON.stringify(
    {
      titulli: recipe.titulli,
      pershkrimi: recipe.pershkrimi,
      koha_pergatitjes: recipe.koha_pergatitjes,
      koha_gatimit: recipe.koha_gatimit,
      porcione: recipe.porcione,
      veshtiresija: recipe.veshtiresija,
      imazhi: recipe.imazhi ?? "",
      user_id: recipe.user_id,
      category_id: recipe.category_id,
    },
    null,
    2,
  );
}

export function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<RecipeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeRecord | null>(null);
  const [draft, setDraft] = useState(makeCreateTemplate());
  const [draftError, setDraftError] = useState("");

  async function loadRecipes() {
    setLoading(true);
    try {
      const response = await apiFetch("/recipes");
      setRecipes(readCollection<RecipeRecord>(response, ["recipes", "data"]));
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecipes();
  }, []);

  const filteredRecipes = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return recipes;
    return recipes.filter((recipe) => [recipe.titulli, recipe.pershkrimi, String(recipe.user_id), String(recipe.category_id), recipe.veshtiresija].some((value) => value.toLowerCase().includes(term)));
  }, [recipes, search]);

  function openCreate() {
    setModalMode("create");
    setSelectedRecipe(null);
    setDraft(makeCreateTemplate());
    setDraftError("");
    setModalOpen(true);
  }

  function openEdit(recipe: RecipeRecord) {
    setModalMode("edit");
    setSelectedRecipe(recipe);
    setDraft(makeEditTemplate(recipe));
    setDraftError("");
    setModalOpen(true);
  }

  function openView(recipe: RecipeRecord) {
    setModalMode("view");
    setSelectedRecipe(recipe);
    setDraft(JSON.stringify(recipe, null, 2));
    setDraftError("");
    setModalOpen(true);
  }

  async function saveRecipe() {
    try {
      const parsed = JSON.parse(draft) as Record<string, unknown>;

      if (modalMode === "create") {
        if (!Array.isArray(parsed.steps) || !Array.isArray(parsed.ingredients)) {
          setDraftError("Create payload must include steps and ingredients arrays.");
          return;
        }

        const response = await apiFetch("/recipes", {
          method: "POST",
          body: JSON.stringify(parsed),
        });

        if (!response.ok) {
          throw new Error("Failed to create recipe");
        }
      } else if (selectedRecipe) {
        const response = await apiFetch(`/recipes/${selectedRecipe.id}`, {
          method: "PATCH",
          body: JSON.stringify(parsed),
        });

        if (!response.ok) {
          throw new Error("Failed to update recipe");
        }
      }

      setModalOpen(false);
      await loadRecipes();
    } catch (error) {
      console.error("Failed to save recipe:", error);
      setDraftError(error instanceof SyntaxError ? "Draft must be valid JSON." : "Unable to save recipe.");
    }
  }

  async function deleteRecipe(recipe: RecipeRecord) {
    if (!window.confirm(`Delete ${recipe.titulli}?`)) return;
    try {
      await apiFetch(`/recipes/${recipe.id}`, { method: "DELETE" });
      await loadRecipes();
    } catch (error) {
      console.error("Failed to delete recipe:", error);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold" style={{ fontFamily: "var(--font-headline-md)", color: "var(--color-on-surface)" }}>Recipe Management</h2>
          <p className="mt-2 text-base" style={{ color: "var(--color-on-surface-variant)" }}>Browse, inspect, and edit the full recipe catalog.</p>
        </div>
        <button type="button" className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }} onClick={openCreate}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
          Add Recipe
        </button>
      </section>

      <div className="overflow-hidden rounded-2xl shadow-sm" style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-outline-variant)" }}>
        <div className="flex items-center justify-between gap-4 border-b p-5" style={{ borderBottomColor: "var(--color-outline-variant)" }}>
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-on-surface-variant)", fontSize: 20 }}>search</span>
            <input
              type="text"
              placeholder="Search recipes..."
              className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none"
              style={{ backgroundColor: "var(--color-surface-container)", borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <button type="button" className="hidden rounded-xl px-4 py-2 text-sm font-semibold md:inline-flex" style={{ color: "var(--color-primary)" }} onClick={loadRecipes}>Refresh</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead style={{ backgroundColor: "var(--color-surface-container-low)" }}>
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Recipe</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Time</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Owner / Category</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ divideColor: "var(--color-outline-variant)" }}>
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-sm font-medium" style={{ color: "var(--color-on-surface-variant)" }}>Loading recipes...</td></tr>
              ) : filteredRecipes.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-sm font-medium" style={{ color: "var(--color-on-surface-variant)" }}>No recipes found.</td></tr>
              ) : (
                filteredRecipes.map((recipe) => (
                  <tr key={recipe.id} className="transition-colors hover:bg-black/5">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold" style={{ color: "var(--color-on-surface)" }}>{recipe.titulli}</p>
                      <p className="mt-1 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>{recipe.pershkrimi}</p>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{recipe.koha_pergatitjes}m prep / {recipe.koha_gatimit}m cook</td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>User {recipe.user_id} / Cat {recipe.category_id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <button type="button" className="font-semibold transition-opacity hover:opacity-80" style={{ color: "var(--color-primary)" }} onClick={() => openView(recipe)}>View</button>
                        <button type="button" className="font-semibold transition-opacity hover:opacity-80" style={{ color: "var(--color-primary)" }} onClick={() => openEdit(recipe)}>Edit</button>
                        <button type="button" className="font-semibold transition-opacity hover:opacity-80" style={{ color: "var(--color-error)" }} onClick={() => deleteRecipe(recipe)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-outline-variant)" }}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold" style={{ fontFamily: "var(--font-headline-md)", color: "var(--color-on-surface)" }}>{modalMode === "view" ? "Recipe Details" : modalMode === "edit" ? "Edit Recipe" : "Create Recipe"}</h3>
                <p className="mt-1 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>Edit the JSON payload directly and save it to the API.</p>
              </div>
              <button type="button" className="rounded-full px-3 py-2 text-sm font-semibold" style={{ color: "var(--color-primary)" }} onClick={() => setModalOpen(false)}>Close</button>
            </div>

            <textarea
              className="min-h-[420px] w-full rounded-2xl border p-4 font-mono text-sm outline-none"
              style={{ backgroundColor: "var(--color-surface-container)", borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}
              value={draft}
              readOnly={modalMode === "view"}
              onChange={(event) => setDraft(event.target.value)}
            />

            <p className="mt-5 text-sm font-medium" style={{ color: "var(--color-error)" }}>{draftError}</p>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="rounded-xl px-4 py-2.5 text-sm font-semibold" style={{ color: "var(--color-on-surface-variant)" }} onClick={() => setModalOpen(false)}>Cancel</button>
              {modalMode !== "view" && (
                <button type="button" className="rounded-xl px-5 py-2.5 text-sm font-semibold" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }} onClick={saveRecipe}>
                  {modalMode === "edit" ? "Save Changes" : "Create Recipe"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
