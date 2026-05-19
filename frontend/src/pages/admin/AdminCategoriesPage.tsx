import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api";

interface CategoryRecord {
  id: number;
  emertimi: string;
  pershkrimi?: string;
  imazhi?: string;
}

type ModalMode = "create" | "edit";

function readCollection<T>(payload: unknown, keys: string[]): T[] {
  if (Array.isArray(payload)) return payload as T[];
  for (const key of keys) {
    const value = (payload as Record<string, unknown> | null)?.[key];
    if (Array.isArray(value)) return value as T[];
  }
  return [];
}

function makeCreateTemplate() {
  return JSON.stringify({ emertimi: "", pershkrimi: "", imazhi: "" }, null, 2);
}

function makeEditTemplate(category: CategoryRecord) {
  return JSON.stringify({ emertimi: category.emertimi, pershkrimi: category.pershkrimi ?? "", imazhi: category.imazhi ?? "" }, null, 2);
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedCategory, setSelectedCategory] = useState<CategoryRecord | null>(null);
  const [draft, setDraft] = useState(makeCreateTemplate());
  const [draftError, setDraftError] = useState("");

  async function loadCategories() {
    setLoading(true);
    try {
      const response = await apiFetch("/categories");
      setCategories(readCollection<CategoryRecord>(response, ["categories", "data"]));
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((category) => [category.emertimi, category.pershkrimi ?? ""].some((value) => value.toLowerCase().includes(term)));
  }, [categories, search]);

  function openCreate() {
    setModalMode("create");
    setSelectedCategory(null);
    setDraft(makeCreateTemplate());
    setDraftError("");
    setModalOpen(true);
  }

  function openEdit(category: CategoryRecord) {
    setModalMode("edit");
    setSelectedCategory(category);
    setDraft(makeEditTemplate(category));
    setDraftError("");
    setModalOpen(true);
  }

  async function saveCategory() {
    try {
      const parsed = JSON.parse(draft) as Record<string, unknown>;
      const response = selectedCategory
        ? await apiFetch(`/categories/${selectedCategory.id}`, { method: "PATCH", body: JSON.stringify(parsed) })
        : await apiFetch("/categories", { method: "POST", body: JSON.stringify(parsed) });

      if (!response.ok) {
        throw new Error("Failed to save category");
      }

      setModalOpen(false);
      await loadCategories();
    } catch (error) {
      console.error("Failed to save category:", error);
      setDraftError(error instanceof SyntaxError ? "Draft must be valid JSON." : "Unable to save category.");
    }
  }

  async function deleteCategory(category: CategoryRecord) {
    if (!window.confirm(`Delete ${category.emertimi}?`)) return;
    try {
      await apiFetch(`/categories/${category.id}`, { method: "DELETE" });
      await loadCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold" style={{ fontFamily: "var(--font-headline-md)", color: "var(--color-on-surface)" }}>Category Management</h2>
          <p className="mt-2 text-base" style={{ color: "var(--color-on-surface-variant)" }}>Create, edit, and delete the taxonomy used across recipes.</p>
        </div>
        <button type="button" className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }} onClick={openCreate}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
          Add Category
        </button>
      </section>

      <div className="overflow-hidden rounded-2xl shadow-sm" style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-outline-variant)" }}>
        <div className="flex items-center justify-between gap-4 border-b p-5" style={{ borderBottomColor: "var(--color-outline-variant)" }}>
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-on-surface-variant)", fontSize: 20 }}>search</span>
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none"
              style={{ backgroundColor: "var(--color-surface-container)", borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <button type="button" className="hidden rounded-xl px-4 py-2 text-sm font-semibold md:inline-flex" style={{ color: "var(--color-primary)" }} onClick={loadCategories}>Refresh</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead style={{ backgroundColor: "var(--color-surface-container-low)" }}>
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Category</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Description</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ divideColor: "var(--color-outline-variant)" }}>
              {loading ? (
                <tr><td colSpan={3} className="px-6 py-10 text-center text-sm font-medium" style={{ color: "var(--color-on-surface-variant)" }}>Loading categories...</td></tr>
              ) : filteredCategories.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-10 text-center text-sm font-medium" style={{ color: "var(--color-on-surface-variant)" }}>No categories found.</td></tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="transition-colors hover:bg-black/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--color-secondary-container)", color: "var(--color-on-secondary-container)" }}>
                          <span className="material-symbols-outlined text-lg">category</span>
                        </div>
                        <span className="text-sm font-semibold" style={{ color: "var(--color-on-surface)" }}>{category.emertimi}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{category.pershkrimi ?? "-"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <button type="button" className="font-semibold transition-opacity hover:opacity-80" style={{ color: "var(--color-primary)" }} onClick={() => openEdit(category)}>Edit</button>
                        <button type="button" className="font-semibold transition-opacity hover:opacity-80" style={{ color: "var(--color-error)" }} onClick={() => deleteCategory(category)}>Delete</button>
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
          <div className="w-full max-w-2xl rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-outline-variant)" }}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold" style={{ fontFamily: "var(--font-headline-md)", color: "var(--color-on-surface)" }}>{modalMode === "edit" ? "Edit Category" : "Create Category"}</h3>
                <p className="mt-1 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>Edit the JSON payload and save it to the API.</p>
              </div>
              <button type="button" className="rounded-full px-3 py-2 text-sm font-semibold" style={{ color: "var(--color-primary)" }} onClick={() => setModalOpen(false)}>Close</button>
            </div>

            <textarea
              className="min-h-72 w-full rounded-2xl border p-4 font-mono text-sm outline-none"
              style={{ backgroundColor: "var(--color-surface-container)", borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />

            <p className="mt-5 text-sm font-medium" style={{ color: "var(--color-error)" }}>{draftError}</p>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="rounded-xl px-4 py-2.5 text-sm font-semibold" style={{ color: "var(--color-on-surface-variant)" }} onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="button" className="rounded-xl px-5 py-2.5 text-sm font-semibold" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }} onClick={saveCategory}>{modalMode === "edit" ? "Save Changes" : "Create Category"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
