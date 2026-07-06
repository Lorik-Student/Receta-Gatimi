import { useMemo, useState } from "react";
import { resolveImageSrc } from "../../utils/image";
import {
  createFavoriteCategory,
  removeFavorite,
  saveFavorite,
} from "./favoritesApi";
import type { FavoriteCategory } from "./types";

type FavoriteRecipeDialogProps = {
  categories: FavoriteCategory[];
  isFavorited: boolean;
  loading?: boolean;
  recipeId: number;
  recipeTitle: string;
  onClose: () => void;
  onChanged: () => Promise<void> | void;
};

function getCategoryThumbnail(category: FavoriteCategory) {
  return resolveImageSrc(category.imazhi || category.recipes?.[0]?.imazhi);
}

function parseSelectedCategoryId(value: string) {
  const categoryId = Number(value);
  return Number.isInteger(categoryId) && categoryId > 0 ? categoryId : undefined;
}

export function FavoriteRecipeDialog({
  categories,
  isFavorited,
  loading = false,
  recipeId,
  recipeTitle,
  onClose,
  onChanged,
}: FavoriteRecipeDialogProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categoryDraftName, setCategoryDraftName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const validRecipeId = Number.isInteger(recipeId) && recipeId > 0;
  const selectedCategory = useMemo(
    () => categories.find((category) => String(category.id) === selectedCategoryId),
    [categories, selectedCategoryId],
  );

  async function handleCreateCategory() {
    const name = categoryDraftName.trim();
    if (name.length < 2) {
      setError("Emri i kategorisë duhet të ketë të paktën 2 karaktere.");
      return;
    }

    setCreatingCategory(true);
    setError("");
    setMessage("");

    try {
      const createdId = await createFavoriteCategory(name);
      setCategoryDraftName("");
      await onChanged();
      setSelectedCategoryId(createdId ? String(createdId) : "");
      setMessage("Kategoria u krijua.");
    } catch (createError) {
      console.error("Failed to create favorite category:", createError);
      setError("Krijimi i kategorisë dështoi.");
    } finally {
      setCreatingCategory(false);
    }
  }

  async function handleSaveFavorite() {
    if (!validRecipeId) {
      setError("Receta nuk është e vlefshme.");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await saveFavorite(recipeId, parseSelectedCategoryId(selectedCategoryId));
      setMessage(selectedCategory ? `Receta u ruajt te ${selectedCategory.emertimi}.` : "Receta u ruajt te të preferuarat.");
      await onChanged();
    } catch (saveError) {
      console.error("Failed to save favorite:", saveError);
      setError("Ruajtja dështoi. Provoni përsëri.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemoveFavorite() {
    if (!validRecipeId) {
      setError("Receta nuk është e vlefshme.");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await removeFavorite(recipeId);
      setMessage("Receta u hoq nga të preferuarat.");
      await onChanged();
    } catch (removeError) {
      console.error("Failed to remove favorite:", removeError);
      setError("Heqja dështoi. Provoni përsëri.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/35 backdrop-blur-[1px] flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-[26rem] rounded-2xl border border-outline-variant/30 bg-surface p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h3 className="font-headline-sm text-on-surface">Ruaj në koleksion</h3>
            <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">{recipeTitle}</p>
          </div>
          <span className={`material-symbols-outlined text-[22px] ${isFavorited ? "text-primary" : "text-on-surface-variant"}`} style={isFavorited ? { fontVariationSettings: "'FILL' 1" } : undefined}>
            favorite
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <label className="flex-1 text-sm font-medium text-on-surface">
            Kategoria e re
            <input
              value={categoryDraftName}
              onChange={(event) => setCategoryDraftName(event.target.value)}
              className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-surface-variant/10 px-4 py-2.5 outline-none focus:border-primary"
              placeholder="P.sh. Darka"
            />
          </label>
          <button
            type="button"
            onClick={() => void handleCreateCategory()}
            disabled={creatingCategory}
            className="mt-7 whitespace-nowrap rounded-full bg-primary px-4 py-2.5 text-white font-label-md hover:bg-primary/90 disabled:opacity-60"
          >
            Krijo kategori
          </button>
        </div>

        <div className="mt-4 border-t border-outline-variant/20 pt-4">
          <div className="max-h-[18rem] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(180,120,70,0.45)_transparent]">
            <div className="grid grid-cols-3 gap-3">
              {categories.length < 3 && Array.from({ length: 3 - categories.length }).map((_, index) => (
                <div key={`empty-top-${index}`} className="aspect-square rounded-2xl border border-dashed border-outline-variant/30 bg-surface-variant/10" />
              ))}

              {categories.map((category) => {
                const isSelected = selectedCategoryId === String(category.id);
                const thumbnail = getCategoryThumbnail(category);

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(String(category.id))}
                    className={`aspect-square rounded-2xl border p-3 text-left transition-colors ${isSelected ? "border-primary bg-primary/10" : "border-outline-variant/30 bg-surface-variant/10 hover:bg-surface-variant/20"}`}
                  >
                    <div className="flex h-full flex-col justify-between">
                      <div>
                        <div className="mb-2 overflow-hidden rounded-xl bg-surface-variant/20 aspect-square flex items-center justify-center">
                          {thumbnail ? (
                            <img src={thumbnail} alt={category.emertimi} className="h-full w-full object-cover" />
                          ) : (
                            <span className={`material-symbols-outlined text-[20px] ${isSelected ? "text-primary" : "text-on-surface-variant"}`}>
                              folder
                            </span>
                          )}
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm font-semibold text-on-surface">{category.emertimi}</p>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                        <span>{category.is_public ? "Publike" : "Private"}</span>
                        {isSelected && <span className="text-primary">Zgjedhur</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {message && <p className="mt-4 rounded-xl bg-primary/10 px-4 py-2.5 text-sm text-primary">{message}</p>}
        {error && <p className="mt-4 rounded-xl bg-error/10 px-4 py-2.5 text-sm text-error">{error}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleSaveFavorite()}
            disabled={loading || submitting || !validRecipeId}
            className="rounded-full bg-primary px-5 py-2.5 text-white font-label-md hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Duke ruajtur..." : "Ruaj"}
          </button>
          {isFavorited && (
            <button
              type="button"
              onClick={() => void handleRemoveFavorite()}
              disabled={submitting || !validRecipeId}
              className="inline-flex items-center gap-2 rounded-full border border-outline-variant/40 px-5 py-2.5 text-on-surface font-label-md hover:bg-surface-variant/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              Unfavorite
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
