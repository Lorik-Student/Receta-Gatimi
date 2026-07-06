import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api";
import { readArrayPayload } from "../../lib/apiPayload";

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
  is_hidden?: boolean;
  hidden_at?: string | null;
  hidden_reason?: string | null;
}

interface LookupRecord {
  id: number;
  emri?: string;
  mbiemri?: string;
  email?: string;
  emertimi?: string;
}

type ModalMode = "create" | "edit" | "view";
type Difficulty = "Lehte" | "Mesatare" | "Veshtire";

interface RecipeStepDraft {
  hapi_nr: number;
  pershkrimi: string;
  imazhi: string;
}

interface RecipeIngredientDraft {
  emertimi: string;
  sasia: number;
  njesia: string;
}

interface RecipeDraft {
  titulli: string;
  pershkrimi: string;
  koha_pergatitjes: number;
  koha_gatimit: number;
  porcione: number;
  veshtiresija: Difficulty;
  imazhi: string;
  user_id: number;
  category_id: number;
  steps: RecipeStepDraft[];
  ingredients: RecipeIngredientDraft[];
  tags: string[];
}

function emptyRecipeDraft(): RecipeDraft {
  return {
    titulli: "",
    pershkrimi: "",
    koha_pergatitjes: 0,
    koha_gatimit: 0,
    porcione: 1,
    veshtiresija: "Lehte",
    imazhi: "",
    user_id: 0,
    category_id: 0,
    steps: [{ hapi_nr: 1, pershkrimi: "", imazhi: "" }],
    ingredients: [{ emertimi: "", sasia: 1, njesia: "g" }],
    tags: [""],
  };
}

function toRecipeDraft(recipe: RecipeRecord): RecipeDraft {
  return {
    titulli: recipe.titulli ?? "",
    pershkrimi: recipe.pershkrimi ?? "",
    koha_pergatitjes: recipe.koha_pergatitjes ?? 0,
    koha_gatimit: recipe.koha_gatimit ?? 0,
    porcione: recipe.porcione ?? 1,
    veshtiresija: (recipe.veshtiresija as Difficulty) ?? "Lehte",
    imazhi: recipe.imazhi ?? "",
    user_id: recipe.user_id ?? 0,
    category_id: recipe.category_id ?? 0,
    steps: [{ hapi_nr: 1, pershkrimi: "", imazhi: "" }],
    ingredients: [{ emertimi: "", sasia: 1, njesia: "g" }],
    tags: [""],
  };
}

function normalizeTags(tags: string[]) {
  return tags.map((tag) => tag.trim()).filter(Boolean);
}

function formatOwner(users: LookupRecord[], userId: number) {
  const user = users.find((item) => item.id === userId);
  if (!user) {
    return `User ${userId}`;
  }

  const fullName = [user.emri, user.mbiemri].filter(Boolean).join(" ").trim();
  return fullName || user.email || `User ${userId}`;
}

function formatCategory(categories: LookupRecord[], categoryId: number) {
  const category = categories.find((item) => item.id === categoryId);
  return category?.emertimi || `Category ${categoryId}`;
}

export function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<RecipeRecord[]>([]);
  const [users, setUsers] = useState<LookupRecord[]>([]);
  const [categories, setCategories] = useState<LookupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeRecord | null>(null);
  const [draft, setDraft] = useState<RecipeDraft>(emptyRecipeDraft());
  const [draftError, setDraftError] = useState("");

  async function loadRecipes() {
    setLoading(true);
    try {
      const [recipesResponse, usersResponse, categoriesResponse] = await Promise.all([
        apiFetch("/recipes/admin"),
        apiFetch("/users"),
        apiFetch("/categories"),
      ]);

      setRecipes(readArrayPayload<RecipeRecord>(recipesResponse, ["recipes", "data"]));
      setUsers(readArrayPayload<LookupRecord>(usersResponse, ["users", "data"]));
      setCategories(readArrayPayload<LookupRecord>(categoriesResponse, ["categories", "data"]));
    } catch (error) {
      console.error("Failed to fetch admin recipe data:", error);
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

    return recipes.filter((recipe) => {
      const ownerName = formatOwner(users, recipe.user_id).toLowerCase();
      const categoryName = formatCategory(categories, recipe.category_id).toLowerCase();
      return [recipe.titulli, recipe.pershkrimi, recipe.veshtiresija, ownerName, categoryName].some((value) => value.toLowerCase().includes(term));
    });
  }, [recipes, users, categories, search]);

  function openCreate() {
    const nextDraft = emptyRecipeDraft();
    if (users.length > 0) {
      nextDraft.user_id = users[0].id;
    }
    if (categories.length > 0) {
      nextDraft.category_id = categories[0].id;
    }

    setModalMode("create");
    setSelectedRecipe(null);
    setDraft(nextDraft);
    setDraftError("");
    setModalOpen(true);
  }

  function openEdit(recipe: RecipeRecord) {
    setModalMode("edit");
    setSelectedRecipe(recipe);
    setDraft(toRecipeDraft(recipe));
    setDraftError("");
    setModalOpen(true);
  }

  function openView(recipe: RecipeRecord) {
    setModalMode("view");
    setSelectedRecipe(recipe);
    setDraft(toRecipeDraft(recipe));
    setDraftError("");
    setModalOpen(true);
  }

  function updateStep(index: number, patch: Partial<RecipeStepDraft>) {
    setDraft((current) => ({
      ...current,
      steps: current.steps.map((step, stepIndex) => (stepIndex === index ? { ...step, ...patch } : step)),
    }));
  }

  function addStep() {
    setDraft((current) => ({
      ...current,
      steps: [...current.steps, { hapi_nr: current.steps.length + 1, pershkrimi: "", imazhi: "" }],
    }));
  }

  function removeStep(index: number) {
    setDraft((current) => ({
      ...current,
      steps: current.steps.filter((_, stepIndex) => stepIndex !== index).map((step, stepIndex) => ({ ...step, hapi_nr: stepIndex + 1 })),
    }));
  }

  function updateIngredient(index: number, patch: Partial<RecipeIngredientDraft>) {
    setDraft((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient, ingredientIndex) => (ingredientIndex === index ? { ...ingredient, ...patch } : ingredient)),
    }));
  }

  function addIngredient() {
    setDraft((current) => ({
      ...current,
      ingredients: [...current.ingredients, { emertimi: "", sasia: 1, njesia: "g" }],
    }));
  }

  function removeIngredient(index: number) {
    setDraft((current) => ({
      ...current,
      ingredients: current.ingredients.filter((_, ingredientIndex) => ingredientIndex !== index),
    }));
  }

  function updateTag(index: number, value: string) {
    setDraft((current) => ({
      ...current,
      tags: current.tags.map((tag, tagIndex) => (tagIndex === index ? value : tag)),
    }));
  }

  function addTag() {
    setDraft((current) => ({
      ...current,
      tags: [...current.tags, ""],
    }));
  }

  function removeTag(index: number) {
    setDraft((current) => ({
      ...current,
      tags: current.tags.filter((_, tagIndex) => tagIndex !== index),
    }));
  }

  async function saveRecipe() {
    const payload = {
      titulli: draft.titulli.trim(),
      pershkrimi: draft.pershkrimi.trim(),
      koha_pergatitjes: Number(draft.koha_pergatitjes) || 0,
      koha_gatimit: Number(draft.koha_gatimit) || 0,
      porcione: Number(draft.porcione) || 1,
      veshtiresija: draft.veshtiresija,
      imazhi: draft.imazhi.trim() || undefined,
      user_id: Number(draft.user_id) || undefined,
      category_id: Number(draft.category_id) || undefined,
      ...(modalMode === "create"
        ? {
            steps: draft.steps.map((step, index) => ({
              hapi_nr: Number(step.hapi_nr) || index + 1,
              pershkrimi: step.pershkrimi.trim(),
              imazhi: step.imazhi.trim() || undefined,
            })),
            ingredients: draft.ingredients.map((ingredient) => ({
              emertimi: ingredient.emertimi.trim(),
              sasia: Number(ingredient.sasia) || 0,
              njesia: ingredient.njesia.trim(),
            })),
            tags: normalizeTags(draft.tags),
          }
        : {}),
    };

    if (!payload.titulli || !payload.pershkrimi) {
      setDraftError("Titulli dhe përshkrimi janë të detyrueshëm.");
      return;
    }

    if (!payload.user_id || !payload.category_id) {
      setDraftError("Zgjidh një autor dhe një kategori.");
      return;
    }

    if (modalMode === "create") {
      const typedPayload = payload as Record<string, unknown>;
      if (!Array.isArray(typedPayload.steps) || typedPayload.steps.length === 0) {
        setDraftError("Shto të paktën një hap.");
        return;
      }

      if (!Array.isArray(typedPayload.ingredients) || typedPayload.ingredients.length === 0) {
        setDraftError("Shto të paktën një përbërës.");
        return;
      }
    }

    try {
      const response = modalMode === "create"
        ? await apiFetch("/recipes", { method: "POST", body: JSON.stringify(payload) })
        : await apiFetch(`/recipes/${selectedRecipe?.id}`, { method: "PATCH", body: JSON.stringify(payload) });

      if (!response.ok) {
        throw new Error("Failed to save recipe");
      }

      setModalOpen(false);
      await loadRecipes();
    } catch (error) {
      console.error("Failed to save recipe:", error);
      setDraftError("Unable to save recipe.");
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
          <p className="mt-2 text-base" style={{ color: "var(--color-on-surface-variant)" }}>Browse recipes in a table, then edit them with structured fields instead of raw JSON.</p>
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
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold" style={{ color: "var(--color-on-surface)" }}>{recipe.titulli}</p>
                          {recipe.is_hidden && (
                            <span className="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider" style={{ backgroundColor: "var(--color-error-container)", color: "var(--color-on-error-container)" }}>
                              Hidden
                            </span>
                          )}
                        </div>
                        {recipe.hidden_reason && (
                          <p className="text-xs italic" style={{ color: "var(--color-on-surface-variant)" }}>{recipe.hidden_reason}</p>
                        )}
                        <p className="mt-1 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>{recipe.pershkrimi}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{recipe.koha_pergatitjes}m prep / {recipe.koha_gatimit}m cook</td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{formatOwner(users, recipe.user_id)} / {formatCategory(categories, recipe.category_id)}</td>
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
          <div className="flex max-h-[calc(100vh-2rem)] w-[min(96vw,96rem)] flex-col overflow-hidden rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-outline-variant)" }}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold" style={{ fontFamily: "var(--font-headline-md)", color: "var(--color-on-surface)" }}>
                  {modalMode === "view" ? "Recipe Details" : modalMode === "edit" ? "Edit Recipe" : "Create Recipe"}
                </h3>
                <p className="mt-1 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                  {modalMode === "view" ? "Review the current recipe record." : "Fill out structured fields and save without touching raw JSON."}
                </p>
              </div>
              <button type="button" className="rounded-full px-3 py-2 text-sm font-semibold" style={{ color: "var(--color-primary)" }} onClick={() => setModalOpen(false)}>Close</button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
                Title
                <input
                  className="rounded-xl border px-4 py-2.5 outline-none"
                  style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
                  value={draft.titulli}
                  disabled={modalMode === "view"}
                  onChange={(event) => setDraft((current) => ({ ...current, titulli: event.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
                Difficulty
                <select
                  className="rounded-xl border px-4 py-2.5 outline-none"
                  style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
                  value={draft.veshtiresija}
                  disabled={modalMode === "view"}
                  onChange={(event) => setDraft((current) => ({ ...current, veshtiresija: event.target.value as Difficulty }))}
                >
                  <option value="Lehte">Lehte</option>
                  <option value="Mesatare">Mesatare</option>
                  <option value="Veshtire">Veshtire</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium md:col-span-2" style={{ color: "var(--color-on-surface)" }}>
                Description
                <textarea
                  className="min-h-28 rounded-xl border px-4 py-2.5 outline-none"
                  style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
                  value={draft.pershkrimi}
                  disabled={modalMode === "view"}
                  onChange={(event) => setDraft((current) => ({ ...current, pershkrimi: event.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
                Prep time
                <input
                  type="number"
                  min={0}
                  className="rounded-xl border px-4 py-2.5 outline-none"
                  style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
                  value={draft.koha_pergatitjes}
                  disabled={modalMode === "view"}
                  onChange={(event) => setDraft((current) => ({ ...current, koha_pergatitjes: Number(event.target.value) }))}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
                Cook time
                <input
                  type="number"
                  min={0}
                  className="rounded-xl border px-4 py-2.5 outline-none"
                  style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
                  value={draft.koha_gatimit}
                  disabled={modalMode === "view"}
                  onChange={(event) => setDraft((current) => ({ ...current, koha_gatimit: Number(event.target.value) }))}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
                Portions
                <input
                  type="number"
                  min={1}
                  className="rounded-xl border px-4 py-2.5 outline-none"
                  style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
                  value={draft.porcione}
                  disabled={modalMode === "view"}
                  onChange={(event) => setDraft((current) => ({ ...current, porcione: Number(event.target.value) }))}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
                Image URL
                <input
                  className="rounded-xl border px-4 py-2.5 outline-none"
                  style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
                  value={draft.imazhi}
                  disabled={modalMode === "view"}
                  onChange={(event) => setDraft((current) => ({ ...current, imazhi: event.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
                Author
                <select
                  className="rounded-xl border px-4 py-2.5 outline-none"
                  style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
                  value={draft.user_id}
                  disabled={modalMode === "view"}
                  onChange={(event) => setDraft((current) => ({ ...current, user_id: Number(event.target.value) }))}
                >
                  <option value={0}>Select author</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{formatOwner(users, user.id)}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
                Category
                <select
                  className="rounded-xl border px-4 py-2.5 outline-none"
                  style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
                  value={draft.category_id}
                  disabled={modalMode === "view"}
                  onChange={(event) => setDraft((current) => ({ ...current, category_id: Number(event.target.value) }))}
                >
                  <option value={0}>Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.emertimi}</option>
                  ))}
                </select>
              </label>
            </div>

            {modalMode === "create" && (
              <div className="mt-6 grid gap-6 xl:grid-cols-3">
                <section className="overflow-hidden rounded-2xl border" style={{ borderColor: "var(--color-outline-variant)" }}>
                  <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderBottomColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container-low)" }}>
                    <h4 className="font-semibold" style={{ color: "var(--color-on-surface)" }}>Steps</h4>
                    <button type="button" className="text-sm font-semibold" style={{ color: "var(--color-primary)" }} onClick={addStep}>Add step</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead style={{ backgroundColor: "var(--color-surface-container-low)" }}>
                        <tr>
                          <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>#</th>
                          <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Description</th>
                          <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ divideColor: "var(--color-outline-variant)" }}>
                        {draft.steps.map((step, index) => (
                          <tr key={`${step.hapi_nr}-${index}`}>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min={1}
                                className="w-20 rounded-lg border px-3 py-2 outline-none"
                                style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
                                value={step.hapi_nr}
                                onChange={(event) => updateStep(index, { hapi_nr: Number(event.target.value) })}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <textarea
                                className="min-h-20 w-full rounded-lg border px-3 py-2 outline-none"
                                style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
                                value={step.pershkrimi}
                                onChange={(event) => updateStep(index, { pershkrimi: event.target.value })}
                              />
                              <input
                                className="mt-2 w-full rounded-lg border px-3 py-2 outline-none"
                                placeholder="Step image URL"
                                style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
                                value={step.imazhi}
                                onChange={(event) => updateStep(index, { imazhi: event.target.value })}
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button type="button" className="font-semibold" style={{ color: "var(--color-error)" }} onClick={() => removeStep(index)}>Remove</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="overflow-hidden rounded-2xl border" style={{ borderColor: "var(--color-outline-variant)" }}>
                  <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderBottomColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container-low)" }}>
                    <h4 className="font-semibold" style={{ color: "var(--color-on-surface)" }}>Ingredients</h4>
                    <button type="button" className="text-sm font-semibold" style={{ color: "var(--color-primary)" }} onClick={addIngredient}>Add ingredient</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead style={{ backgroundColor: "var(--color-surface-container-low)" }}>
                        <tr>
                          <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Ingredient</th>
                          <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Amount</th>
                          <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Unit</th>
                          <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ divideColor: "var(--color-outline-variant)" }}>
                        {draft.ingredients.map((ingredient, index) => (
                          <tr key={`${ingredient.emertimi}-${index}`}>
                            <td className="px-4 py-3">
                              <input
                                className="w-full rounded-lg border px-3 py-2 outline-none"
                                style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
                                value={ingredient.emertimi}
                                onChange={(event) => updateIngredient(index, { emertimi: event.target.value })}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min={0}
                                step="0.1"
                                className="w-24 rounded-lg border px-3 py-2 outline-none"
                                style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
                                value={ingredient.sasia}
                                onChange={(event) => updateIngredient(index, { sasia: Number(event.target.value) })}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                className="w-24 rounded-lg border px-3 py-2 outline-none"
                                style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
                                value={ingredient.njesia}
                                onChange={(event) => updateIngredient(index, { njesia: event.target.value })}
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button type="button" className="font-semibold" style={{ color: "var(--color-error)" }} onClick={() => removeIngredient(index)}>Remove</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="overflow-hidden rounded-2xl border" style={{ borderColor: "var(--color-outline-variant)" }}>
                  <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderBottomColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container-low)" }}>
                    <h4 className="font-semibold" style={{ color: "var(--color-on-surface)" }}>Tags</h4>
                    <button type="button" className="text-sm font-semibold" style={{ color: "var(--color-primary)" }} onClick={addTag}>Add tag</button>
                  </div>
                  <div className="space-y-3 p-4">
                    {draft.tags.map((tag, index) => (
                      <div key={`${tag}-${index}`} className="flex items-center gap-2">
                        <input
                          className="min-w-0 flex-1 rounded-lg border px-3 py-2 outline-none"
                          placeholder="Tag label"
                          style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
                          value={tag}
                          onChange={(event) => updateTag(index, event.target.value)}
                        />
                        <button type="button" className="font-semibold" style={{ color: "var(--color-error)" }} onClick={() => removeTag(index)}>Remove</button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {modalMode !== "create" && (
              <div className="mt-6 rounded-2xl border p-4" style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container-low)" }}>
                <p className="text-sm font-medium" style={{ color: "var(--color-on-surface-variant)" }}>
                  Recipe content such as steps, ingredients, and tags is edited during creation. This keeps the admin workflow table-driven and avoids the old JSON textarea.
                </p>
              </div>
            )}

            <p className="mt-5 text-sm font-medium" style={{ color: "var(--color-error)" }}>{draftError}</p>

            </div>

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
