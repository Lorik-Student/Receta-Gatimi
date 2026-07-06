import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api";

interface ReviewRecord {
  id: number;
  recipe_id: number;
  user_id: number;
  vleresimi: number;
  komenti: string;
  data?: string;
  recipe_title?: string;
  reviewer_emri?: string;
  reviewer_mbiemri?: string;
}

type ReviewDraft = {
  vleresimi: number;
  komenti: string;
};

function readCollection<T>(payload: unknown, keys: string[]): T[] {
  if (Array.isArray(payload)) return payload as T[];
  for (const key of keys) {
    const value = (payload as Record<string, unknown> | null)?.[key];
    if (Array.isArray(value)) return value as T[];
  }
  return [];
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString() : "-";
}

export function AdminInteractionsPage() {
  const [recipeId, setRecipeId] = useState("");
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewRecord | null>(null);
  const [draft, setDraft] = useState<ReviewDraft>({ vleresimi: 5, komenti: "" });
  const [draftError, setDraftError] = useState("");

  async function loadReviews() {
    const trimmedRecipeId = recipeId.trim();
    const parsedRecipeId = Number(trimmedRecipeId);

    if (trimmedRecipeId && (!Number.isInteger(parsedRecipeId) || parsedRecipeId <= 0)) {
      setDraftError("Enter a valid recipe ID, or leave it empty to load all reviews.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch(trimmedRecipeId ? `/interactions/reviews/recipe/${parsedRecipeId}` : "/interactions/reviews/admin");
      setReviews(readCollection<ReviewRecord>(response, ["reviews", "data"]));
      setDraftError("");
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  const summary = useMemo(() => ({
    count: reviews.length,
    average: reviews.length ? (reviews.reduce((sum, review) => sum + Number(review.vleresimi || 0), 0) / reviews.length).toFixed(1) : "0.0",
  }), [reviews]);

  function openEdit(review: ReviewRecord) {
    setSelectedReview(review);
    setDraft({ vleresimi: review.vleresimi, komenti: review.komenti });
    setDraftError("");
    setModalOpen(true);
  }

  async function saveReview() {
    if (!selectedReview) return;

    try {
      const response = await apiFetch(`/interactions/reviews/admin/${selectedReview.id}`, {
        method: "PATCH",
        body: JSON.stringify(draft),
      });

      if (!response.ok) {
        throw new Error("Failed to update review");
      }

      setModalOpen(false);
      await loadReviews();
    } catch (error) {
      console.error("Failed to save review:", error);
      setDraftError("Unable to save review.");
    }
  }

  async function deleteReview(review: ReviewRecord) {
    if (!window.confirm(`Delete review #${review.id}?`)) return;
    try {
      const response = await apiFetch(`/interactions/reviews/admin/${review.id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete review");
      }
      await loadReviews();
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold" style={{ fontFamily: "var(--font-headline-md)", color: "var(--color-on-surface)" }}>Interaction Management</h2>
          <p className="mt-2 text-base" style={{ color: "var(--color-on-surface-variant)" }}>Inspect and moderate review data across the platform or by recipe ID.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            placeholder="All"
            className="w-32 rounded-xl border px-4 py-2.5 text-sm outline-none"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}
            value={recipeId}
            onChange={(event) => setRecipeId(event.target.value)}
          />
          <button type="button" className="rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }} onClick={loadReviews}>
            Load Reviews
          </button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-outline-variant)" }}>
          <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Reviews Loaded</p>
          <p className="mt-2 text-3xl font-bold" style={{ fontFamily: "var(--font-headline-md)", color: "var(--color-on-surface)" }}>{summary.count}</p>
        </article>
        <article className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-outline-variant)" }}>
          <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Average Score</p>
          <p className="mt-2 text-3xl font-bold" style={{ fontFamily: "var(--font-headline-md)", color: "var(--color-on-surface)" }}>{summary.average}</p>
        </article>
        <article className="rounded-2xl p-5 shadow-sm xl:col-span-2" style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-outline-variant)" }}>
          <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>How this page works</p>
          <p className="mt-2 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>Leave the recipe ID empty for all reviews, or enter one recipe ID to narrow the table.</p>
        </article>
      </div>

      <div className="overflow-hidden rounded-2xl shadow-sm" style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-outline-variant)" }}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead style={{ backgroundColor: "var(--color-surface-container-low)" }}>
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Review</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Rating</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Comment</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Date</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ divideColor: "var(--color-outline-variant)" }}>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm font-medium" style={{ color: "var(--color-on-surface-variant)" }}>Loading reviews...</td></tr>
              ) : reviews.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm font-medium" style={{ color: "var(--color-on-surface-variant)" }}>No reviews found.</td></tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="transition-colors hover:bg-black/5">
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--color-on-surface)" }}>
                      #{review.id} - {review.recipe_title || `Recipe ${review.recipe_id}`} - {[review.reviewer_emri, review.reviewer_mbiemri].filter(Boolean).join(" ") || `user ${review.user_id}`}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold" style={{ color: "var(--color-on-surface)" }}>{review.vleresimi}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{review.komenti}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{formatDate(review.data)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <button type="button" className="font-semibold transition-opacity hover:opacity-80" style={{ color: "var(--color-primary)" }} onClick={() => openEdit(review)}>Edit</button>
                        <button type="button" className="font-semibold transition-opacity hover:opacity-80" style={{ color: "var(--color-error)" }} onClick={() => deleteReview(review)}>Delete</button>
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
                <h3 className="text-2xl font-bold" style={{ fontFamily: "var(--font-headline-md)", color: "var(--color-on-surface)" }}>Edit Review</h3>
                <p className="mt-1 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>Update the review payload directly.</p>
              </div>
              <button type="button" className="rounded-full px-3 py-2 text-sm font-semibold" style={{ color: "var(--color-primary)" }} onClick={() => setModalOpen(false)}>Close</button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>Rating<input type="number" min={1} max={5} className="rounded-xl border px-4 py-2.5 outline-none" style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }} value={draft.vleresimi} onChange={(event) => setDraft((current) => ({ ...current, vleresimi: Number(event.target.value) }))} /></label>
              <label className="flex flex-col gap-2 text-sm font-medium md:col-span-2" style={{ color: "var(--color-on-surface)" }}>Comment<textarea className="min-h-32 rounded-xl border px-4 py-2.5 outline-none" style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }} value={draft.komenti} onChange={(event) => setDraft((current) => ({ ...current, komenti: event.target.value }))} /></label>
            </div>

            <p className="mt-5 text-sm font-medium" style={{ color: "var(--color-error)" }}>{draftError}</p>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="rounded-xl px-4 py-2.5 text-sm font-semibold" style={{ color: "var(--color-on-surface-variant)" }} onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="button" className="rounded-xl px-5 py-2.5 text-sm font-semibold" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }} onClick={saveReview}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
