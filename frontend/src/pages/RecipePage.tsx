import React, { useEffect, useMemo, useState } from "react";
import { useLoaderData, Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { resolveImageSrc } from "../utils/image";

const RECIPE_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80";

interface ReviewRecord {
  id: number;
  recipe_id: number;
  user_id: number;
  vleresimi: number;
  komenti: string;
  data?: string;
  reviewer_emri?: string;
  reviewer_mbiemri?: string;
}

interface FavoriteRecipe {
  favorite_id: number;
  recipe_id: number;
  titulli: string;
  imazhi?: string;
}

interface FavoriteCategory {
  id: number;
  emertimi: string;
  is_public: boolean;
  imazhi?: string;
  recipes: FavoriteRecipe[];
}

type ReviewDraft = {
  vleresimi: number;
  komenti: string;
};

type ReportTargetType = "recipe" | "user";

type ReportTarget = {
  type: ReportTargetType;
  id: number;
  label: string;
};

type ReportDraft = {
  reason: string;
};

function readCollection<T>(payload: unknown, keys: string[] = ["reviews", "data"]): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  for (const key of keys) {
    const value = (payload as Record<string, unknown> | null)?.[key];
    if (Array.isArray(value)) {
      return value as T[];
    }
  }

  return [];
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString("sq-AL") : "-";
}

function renderStars(value: number) {
  return Array.from({ length: 5 }, (_, index) => (
    <span
      key={index}
      className={`material-symbols-outlined text-[18px] ${index < value ? "text-amber-500" : "text-outline-variant/60"}`}
      aria-hidden="true"
    >
      star
    </span>
  ));
}

function getCategoryThumbnail(category: FavoriteCategory) {
  return resolveImageSrc(category.imazhi || category.recipes?.[0]?.imazhi);
}

export async function recipeLoader({ params }: any) {
  const result = await apiFetch(`/recipes/${params.id}`);
  if (!result.ok) throw new Error("Receta nuk u gjet");
  return result;
}

export function RecipePage() {
  const rawData = useLoaderData() as any;
  const recipe = rawData.data || rawData;
  const navigate = useNavigate();
  const recipeId = Number(recipe?.id ?? rawData?.id ?? 0);
  const isAuthenticated = Boolean(localStorage.getItem("accessToken"));
  const authorId = Number(recipe?.author_id || recipe?.user_id || 0) || undefined;
  const authorName = [recipe?.author_emri, recipe?.author_mbiemri].filter(Boolean).join(" ") || (authorId ? `Përdorues #${authorId}` : "Përdorues");

  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [draft, setDraft] = useState<ReviewDraft>({ vleresimi: 5, komenti: "" });
  const [favoriteCategories, setFavoriteCategories] = useState<FavoriteCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteSubmitting, setFavoriteSubmitting] = useState(false);
  const [categoryCreating, setCategoryCreating] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState("");
  const [favoriteError, setFavoriteError] = useState("");
  const [favoriteMenuOpen, setFavoriteMenuOpen] = useState(false);
  const [categoryDraftName, setCategoryDraftName] = useState("");
  const [shoppingMessage, setShoppingMessage] = useState("");
  const [shoppingError, setShoppingError] = useState("");
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [reportDraft, setReportDraft] = useState<ReportDraft>({ reason: "" });
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<number[]>([]);

  async function loadReviews() {
    if (!Number.isInteger(recipeId) || recipeId <= 0) {
      setReviews([]);
      setLoadingReviews(false);
      return;
    }

    setLoadingReviews(true);
    try {
      const response = await apiFetch(`/interactions/reviews/recipe/${recipeId}`);
      setReviews(readCollection<ReviewRecord>(response));
    } catch (error) {
      console.error("Failed to load reviews:", error);
      setReviewError("Nuk mund të ngarkohen komentet për këtë recetë.");
    } finally {
      setLoadingReviews(false);
    }
  }

  useEffect(() => {
    void loadReviews();
  }, [recipeId]);

  useEffect(() => {
    const ingredientIds = Array.isArray(recipe?.ingredients)
      ? recipe.ingredients
          .map((ingredient: any) => Number(ingredient.ingredient_id || ingredient.id))
          .filter((ingredientId: number) => Number.isInteger(ingredientId) && ingredientId > 0)
      : [];

    setSelectedIngredientIds(ingredientIds);
  }, [recipeId]);

  async function loadFavoriteState() {
    if (!isAuthenticated || !Number.isInteger(recipeId) || recipeId <= 0) {
      setFavoriteCategories([]);
      setIsFavorited(false);
      return;
    }

    setFavoriteLoading(true);
    setFavoriteError("");

    try {
      const response = await apiFetch("/interactions/favorites");
      const favoritesPayload = (response as any)?.favorites;
      const categories = Array.isArray(favoritesPayload?.categories) ? favoritesPayload.categories : [];
      const uncategorized = Array.isArray(favoritesPayload?.uncategorized) ? favoritesPayload.uncategorized : [];

      setFavoriteCategories(categories);

      const inCategories = categories.some((category: FavoriteCategory) =>
        Array.isArray(category.recipes) && category.recipes.some((item: FavoriteRecipe) => Number(item.recipe_id) === recipeId)
      );
      const inUncategorized = uncategorized.some((item: FavoriteRecipe) => Number(item.recipe_id) === recipeId);

      setIsFavorited(inCategories || inUncategorized);
    } catch (error) {
      console.error("Failed to load favorite state:", error);
      setFavoriteError("Nuk u ngarkuan të preferuarat.");
    } finally {
      setFavoriteLoading(false);
    }
  }

  useEffect(() => {
    void loadFavoriteState();
  }, [isAuthenticated, recipeId]);

  const reviewSummary = useMemo(() => {
    const count = reviews.length;
    const average = count > 0 ? reviews.reduce((sum, review) => sum + Number(review.vleresimi || 0), 0) / count : 0;

    return {
      count,
      average,
      rounded: Math.round(average),
    };
  }, [reviews]);

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAuthenticated) {
      setReviewError("Hyni në llogari për të lënë një vlerësim.");
      return;
    }

    if (!Number.isInteger(recipeId) || recipeId <= 0) {
      setReviewError("Receta nuk është e vlefshme.");
      return;
    }

    const rating = Number(draft.vleresimi);
    const comment = draft.komenti.trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setReviewError("Vlerësimi duhet të jetë midis 1 dhe 5.");
      return;
    }

    if (comment.length > 1000) {
      setReviewError("Komenti nuk mund të tejkalojë 1000 karaktere.");
      return;
    }

    setSubmittingReview(true);
    setReviewError("");
    setReviewSuccess("");

    try {
      const response = await apiFetch("/interactions/reviews", {
        method: "POST",
        body: JSON.stringify({
          recipe_id: recipeId,
          vleresimi: rating,
          komenti: comment,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create review");
      }

      setDraft({ vleresimi: 5, komenti: "" });
      setReviewSuccess("Vlerësimi u publikua me sukses.");
      await loadReviews();
    } catch (error) {
      console.error("Failed to submit review:", error);
      setReviewError("Dështoi publikimi i vlerësimit. Ju lutemi provoni përsëri.");
    } finally {
      setSubmittingReview(false);
    }
  }

  function openFavoriteMenu() {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    setFavoriteError("");
    setFavoriteMessage("");
    setCategoryDraftName("");
    setFavoriteMenuOpen(true);
  }

  async function createFavoriteCategory() {
    const name = categoryDraftName.trim();
    if (name.length < 2) {
      setFavoriteError("Emri i kategorisë duhet të ketë të paktën 2 karaktere.");
      return;
    }

    setCategoryCreating(true);
    setFavoriteError("");
    setFavoriteMessage("");

    try {
      const response = await apiFetch("/interactions/favorites/categories", {
        method: "POST",
        body: JSON.stringify({ emertimi: name, is_public: false })
      });

      const createdCategoryId = Number((response as any)?.id);
      setCategoryDraftName("");
      await loadFavoriteState();
      if (Number.isInteger(createdCategoryId) && createdCategoryId > 0) {
        setSelectedCategoryId(String(createdCategoryId));
      } else {
        const match = favoriteCategories.find((category) => category.emertimi.trim().toLowerCase() === name.toLowerCase());
        if (match) {
          setSelectedCategoryId(String(match.id));
        }
      }
      setFavoriteMessage("Kategoria u krijua.");
    } catch (error) {
      console.error("Failed to create favorite category:", error);
      try {
        const refresh = await apiFetch("/interactions/favorites");
        const refreshedPayload = (refresh as any)?.favorites;
        const refreshedCategories = Array.isArray(refreshedPayload?.categories) ? refreshedPayload.categories : [];
        const match = refreshedCategories.find((category: FavoriteCategory) => category.emertimi.trim().toLowerCase() === name.toLowerCase());

        if (match) {
          setFavoriteCategories(refreshedCategories);
          setSelectedCategoryId(String(match.id));
          setCategoryDraftName("");
          setFavoriteMessage("Kategoria u krijua.");
          setFavoriteError("");
          return;
        }
      } catch {
        // fall through to the user-facing error below
      }

      setFavoriteError("Krijimi i kategorisë dështoi.");
    } finally {
      setCategoryCreating(false);
    }
  }

  async function saveFavoriteToCategory() {
    if (!isAuthenticated) {
      setFavoriteError("Duhet të hyni në llogari për të ruajtur receta te të preferuarat.");
      return;
    }

    if (!Number.isInteger(recipeId) || recipeId <= 0) {
      setShoppingError("Receta nuk është e vlefshme.");
      return;
    }

    setFavoriteSubmitting(true);
    setFavoriteError("");
    setFavoriteMessage("");

    try {
      const parsedCategoryId = selectedCategoryId ? Number(selectedCategoryId) : undefined;
      const response = await apiFetch("/interactions/favorites", {
        method: "POST",
        body: JSON.stringify({
          recipeId,
          categoryId: Number.isInteger(parsedCategoryId) && (parsedCategoryId as number) > 0 ? parsedCategoryId : undefined
        })
      });

      if (!response.ok) {
        throw new Error("Failed to add favorite");
      }

      setIsFavorited(true);
      setFavoriteMessage("Receta u ruajt te të preferuarat.");

      await loadFavoriteState();
    } catch (error) {
      console.error("Favorite action failed:", error);
      setFavoriteError("Ruajtja te të preferuarat dështoi. Provoni përsëri.");
    } finally {
      setFavoriteSubmitting(false);
    }
  }

  async function removeFavoriteFromRecipe() {
    if (!Number.isInteger(recipeId) || recipeId <= 0) {
      setFavoriteError("Receta nuk është e vlefshme.");
      return;
    }

    setFavoriteSubmitting(true);
    setFavoriteError("");
    setFavoriteMessage("");

    try {
      const response = await apiFetch(`/interactions/favorites/recipe/${recipeId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to remove favorite");
      }
      setIsFavorited(false);
      setFavoriteMessage("Receta u hoq nga të preferuarat.");
      await loadFavoriteState();
    } catch (error) {
      console.error("Favorite remove failed:", error);
      setFavoriteError("Heqja nga të preferuarat dështoi. Provoni përsëri.");
    } finally {
      setFavoriteSubmitting(false);
    }
  }

  function openRecipeReportDialog() {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    setReportError("");
    setReportMessage("");
    setReportDraft({ reason: "" });
    setReportTarget({
      type: "recipe",
      id: recipeId,
      label: recipe.titulli || recipe.title || "recetën",
    });
  }

  function openUserReportDialog(review: ReviewRecord, reviewerName: string) {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    setReportError("");
    setReportMessage("");
    setReportDraft({ reason: "" });
    setReportTarget({
      type: "user",
      id: review.user_id,
      label: reviewerName,
    });
  }

  async function submitReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!reportTarget) {
      return;
    }

    if (!isAuthenticated) {
      setReportError("Hyni në llogari për të raportuar.");
      return;
    }

    const reason = reportDraft.reason.trim();
    if (reason.length < 10 || reason.length > 500) {
      setReportError("Arsyeja duhet të ketë nga 10 deri në 500 karaktere.");
      return;
    }

    setReportSubmitting(true);
    setReportError("");
    setReportMessage("");

    try {
      const response = await apiFetch(`/interactions/reports/${reportTarget.type === "recipe" ? "recipes" : "users"}`, {
        method: "POST",
        body: JSON.stringify(
          reportTarget.type === "recipe"
            ? { recipe_id: reportTarget.id, reason }
            : { user_id: reportTarget.id, reason }
        ),
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      setReportTarget(null);
      setReportDraft({ reason: "" });
      setReportMessage(
        reportTarget.type === "recipe"
          ? "Raporti për recetën u dërgua te administrimi."
          : "Raporti për përdoruesin u dërgua te administrimi."
      );
    } catch (error) {
      console.error("Failed to submit report:", error);
      setReportError("Dërgimi i raportit dështoi. Provoni përsëri.");
    } finally {
      setReportSubmitting(false);
    }
  }

  function toggleIngredientSelection(ingredientId: number) {
    setSelectedIngredientIds((current) => {
      if (current.includes(ingredientId)) {
        return current.filter((currentId) => currentId !== ingredientId);
      }

      return [...current, ingredientId];
    });
  }

  async function sendIngredientsToShoppingList() {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    if (!Number.isInteger(recipeId) || recipeId <= 0) {
      setFavoriteError("Receta nuk është e vlefshme.");
      return;
    }

    const ingredientIds = selectedIngredientIds.length > 0
      ? selectedIngredientIds
      : (Array.isArray(recipe?.ingredients)
          ? recipe.ingredients.map((ingredient: any) => Number(ingredient.ingredient_id || ingredient.id)).filter((ingredientId: number) => Number.isInteger(ingredientId) && ingredientId > 0)
          : []);

    if (!ingredientIds.length) {
      setShoppingError("Nuk ka përbërës për t'u dërguar në listën e blerjeve.");
      return;
    }

    setFavoriteSubmitting(true);
    setShoppingError("");
    setShoppingMessage("");

    try {
      const response = await apiFetch("/shopping-lists/current/items/from-recipe", {
        method: "POST",
        body: JSON.stringify({ recipeId, ingredientIds })
      });

      if (!response.ok) {
        throw new Error("Failed to add recipe ingredients to shopping list");
      }

      setShoppingMessage("Përbërësit u dërguan te lista e blerjeve.");
      navigate("/profile/shopping-list");
    } catch (error) {
      console.error("Failed to send ingredients to shopping list:", error);
      setShoppingError("Dërgimi i përbërësve në listën e blerjeve dështoi.");
    } finally {
      setFavoriteSubmitting(false);
    }
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <Header brand="Receta Gatimi" activePath="/recipes" />
      <main className="flex-1 max-w-3xl mx-auto px-margin-desktop py-12 w-full">
        <Link to="/recipes" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-label-md transition-colors mb-8">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Kthehu te recetat
        </Link>

        <div className="bg-surface rounded-2xl overflow-hidden shadow-sm border border-outline-variant/30 mb-8">
          <div className="h-64 md:h-72 w-full relative">
            <img src={recipe.imazhi || RECIPE_FALLBACK_IMAGE} alt={recipe.titulli || recipe.title || "Recetë"} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <button
              type="button"
              onClick={openFavoriteMenu}
              className={`absolute top-5 right-5 z-10 rounded-full bg-white/90 backdrop-blur-sm p-2.5 shadow-sm transition-colors ${isFavorited ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}
              aria-label="Ruaj recetën te të preferuarat"
            >
              <span className="material-symbols-outlined text-[22px]" style={isFavorited ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                favorite
              </span>
            </button>
            <button
              type="button"
              onClick={openRecipeReportDialog}
              className="absolute bottom-5 right-5 z-10 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/90 px-4 py-2 text-sm font-semibold text-on-surface shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
              aria-label="Raporto recetën"
            >
              <span className="material-symbols-outlined text-[18px] text-error">flag</span>
              Raporto recetën
            </button>
            <div className="absolute bottom-6 left-6 right-6">
              <span className="bg-primary text-white px-3 py-1 rounded-full font-label-sm mb-3 inline-block">Recetë</span>
              <h1 className="font-display-lg text-white mb-2 leading-tight">{recipe.titulli || recipe.title || "Recetë pa titull"}</h1>
              {authorId && (
                <Link
                  to={`/users/${authorId}/profile`}
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25"
                >
                  <span className="material-symbols-outlined text-[16px]">person</span>
                  {authorName}
                </Link>
              )}
            </div>
          </div>

          <div className="p-6 md:p-8">
            <p className="font-body-lg text-on-surface-variant mb-8 leading-relaxed">
              {recipe.pershkrimi || recipe.description || "Nuk ka përshkrim për këtë recetë."}
            </p>

            {authorId && (
              <div className="mb-8 rounded-2xl border border-outline-variant/30 bg-surface-variant/10 px-4 py-3">
                <span className="text-sm text-on-surface-variant">Postuar nga </span>
                <Link to={`/users/${authorId}/profile`} className="font-semibold text-primary hover:underline">
                  {authorName}
                </Link>
              </div>
            )}

            {reportMessage && (
              <p className="mb-6 rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
                {reportMessage}
              </p>
            )}

            {shoppingMessage && (
              <p className="mb-6 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-700">
                {shoppingMessage}
              </p>
            )}

            {shoppingError && (
              <p className="mb-6 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
                {shoppingError}
              </p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-surface-variant/30 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-primary mb-2">schedule</span>
                <span className="text-on-surface-variant font-label-sm">Koha e përgatitjes</span>
                <strong className="text-on-surface font-label-lg">{recipe.koha_pergatitjes || 0} min</strong>
              </div>
              <div className="bg-surface-variant/30 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-primary mb-2">cooking</span>
                <span className="text-on-surface-variant font-label-sm">Koha e gatimit</span>
                <strong className="text-on-surface font-label-lg">{recipe.koha_gatimit || 0} min</strong>
              </div>
              <div className="bg-surface-variant/30 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-primary mb-2">restaurant</span>
                <span className="text-on-surface-variant font-label-sm">Porcione</span>
                <strong className="text-on-surface font-label-lg">{recipe.porcione || 0}</strong>
              </div>
              <div className="bg-surface-variant/30 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-primary mb-2">bar_chart</span>
                <span className="text-on-surface-variant font-label-sm">Vështirësia</span>
                <strong className="text-on-surface font-label-lg capitalize">{recipe.veshtiresija || "N/A"}</strong>
              </div>
            </div>

            <div className="flex flex-col gap-8 lg:gap-10">
              <div>
                <h2 className="font-headline-md text-on-surface flex items-center gap-2 mb-4 border-b border-outline-variant/30 pb-2">
                  <span className="material-symbols-outlined text-primary">kitchen</span>
                  Përbërësit
                </h2>
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  <ul className="space-y-3">
                    {recipe.ingredients.map((ing: any, i: number) => (
                      <li key={ing.id || ing.ingredient_id || i} className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant/20 bg-surface-variant/20 px-4 py-3">
                        <label className="flex min-w-0 items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedIngredientIds.includes(Number(ing.ingredient_id || ing.id))}
                            onChange={() => toggleIngredientSelection(Number(ing.ingredient_id || ing.id))}
                            className="h-5 w-5 shrink-0 rounded-md border-outline-variant text-primary accent-primary cursor-pointer shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                          />
                          <span className="min-w-0 font-body-md text-on-surface-variant">{ing.emertimi || `Përbërësi ${i + 1}`}</span>
                        </label>
                        <span className="font-label-md text-on-surface font-medium bg-surface px-2 py-1 rounded shadow-sm">{ing.sasia} {ing.njesia}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-on-surface-variant/70 italic text-sm">Nuk ka përbërës të listuar.</p>
                )}

                {recipe.ingredients && recipe.ingredients.length > 0 && (
                  <button
                    type="button"
                    onClick={() => void sendIngredientsToShoppingList()}
                    disabled={favoriteSubmitting}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-600 px-5 py-3 font-label-md text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                    {favoriteSubmitting ? "Duke dërguar..." : "Dergo ne listen e blerjeve"}
                  </button>
                )}
              </div>

              <div>
                <h2 className="font-headline-md text-on-surface flex items-center gap-2 mb-4 border-b border-outline-variant/30 pb-2">
                  <span className="material-symbols-outlined text-primary">list_alt</span>
                  Udhëzimet
                </h2>
                {recipe.steps && recipe.steps.length > 0 ? (
                  <div className="space-y-6">
                    {recipe.steps
                      .slice()
                      .sort((a: any, b: any) => a.hapi_nr - b.hapi_nr)
                      .map((step: any, i: number) => (
                        <div key={step.id || i} className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-label-md font-bold mt-1">{i + 1}</div>
                          <p className="font-body-md text-on-surface-variant leading-relaxed pt-1.5">{step.pershkrimi}</p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-on-surface-variant/70 italic p-4 bg-surface-variant/20 rounded-lg">{recipe.instructions || "Nuk ka udhëzime të listuara."}</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-outline-variant/30 bg-surface-variant/10 p-6 mt-10">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-6">
                <div>
                  <h2 className="font-headline-md text-on-surface flex items-center gap-2">Vlerësimet dhe komentet</h2>
                  <p className="text-on-surface-variant text-sm mt-1">
                    Shiko si e kanë vlerësuar të tjerët recetën dhe lër edhe ti mendimin tënd.
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-full bg-surface px-4 py-2 shadow-sm border border-outline-variant/20">
                  <div className="flex items-center gap-0.5">{renderStars(reviewSummary.rounded)}</div>
                  <div className="text-sm text-on-surface-variant">
                    <strong className="text-on-surface">{reviewSummary.average.toFixed(1)}</strong> · {reviewSummary.count} vlerësime
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <aside className="rounded-2xl border border-outline-variant/20 bg-surface p-5 shadow-sm">
                  <h3 className="font-headline-sm text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">edit_note</span>
                    Lër një vlerësim
                  </h3>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Vetëm përdoruesit e regjistruar mund të shtojnë vlerësime dhe komente.
                  </p>

                  {isAuthenticated ? (
                    <form className="mt-5 space-y-4" onSubmit={submitReview}>
                      <div className="flex flex-col gap-2 text-sm font-medium text-on-surface">
                        <span>Vlerësimi</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, index) => {
                            const ratingValue = index + 1;
                            const active = ratingValue <= draft.vleresimi;

                            return (
                              <button
                                key={ratingValue}
                                type="button"
                                aria-label={`Zgjidh ${ratingValue} yje`}
                                onClick={() => setDraft((current) => ({ ...current, vleresimi: ratingValue }))}
                                className="rounded-md p-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                              >
                                <span className={`material-symbols-outlined text-[26px] ${active ? "text-amber-500" : "text-outline-variant/60"}`}>
                                  star
                                </span>
                              </button>
                            );
                          })}
                          <span className="ml-2 text-sm text-on-surface-variant">{draft.vleresimi}/5</span>
                        </div>
                      </div>

                      <label className="flex flex-col gap-2 text-sm font-medium text-on-surface">
                        Komenti
                        <textarea
                          value={draft.komenti}
                          onChange={(event) => setDraft((current) => ({ ...current, komenti: event.target.value }))}
                          maxLength={1000}
                          rows={5}
                          className="min-h-32 rounded-xl border border-outline-variant/40 bg-surface-variant/20 px-4 py-3 outline-none focus:border-primary resize-none"
                          placeholder="Shkruaj një koment të shkurtër për këtë recetë"
                        />
                      </label>

                      <div className="flex items-center justify-between text-xs text-on-surface-variant">
                        <span>Komenti është opsional, por ndihmon komunitetin.</span>
                        <span>{draft.komenti.length}/1000</span>
                      </div>

                      {reviewError && (
                        <p className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
                          {reviewError}
                        </p>
                      )}

                      {reviewSuccess && (
                        <p className="rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
                          {reviewSuccess}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="w-full rounded-full bg-primary px-5 py-3 font-label-md text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submittingReview ? "Duke publikuar..." : "Publiko vlerësimin"}
                      </button>
                    </form>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-outline-variant/30 bg-surface-variant/20 p-4 text-sm text-on-surface-variant">
                      <p className="mb-4 leading-relaxed">
                        Hyni në llogarinë tuaj për të lënë një vlerësim ose koment mbi recetën.
                      </p>
                      <Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-label-md text-white transition-colors hover:bg-primary/90">
                        <span className="material-symbols-outlined text-[18px]">login</span>
                        Hyr
                      </Link>
                    </div>
                  )}
                </aside>

                <div className="space-y-4">
                  {loadingReviews ? (
                    <div className="rounded-2xl border border-outline-variant/20 bg-surface px-5 py-6 text-sm text-on-surface-variant">
                      Duke ngarkuar komentet...
                    </div>
                  ) : reviews.length > 0 ? (
                    reviews.map((review) => {
                      const reviewerName = [review.reviewer_emri, review.reviewer_mbiemri].filter(Boolean).join(" ") || `Përdorues #${review.user_id}`;
                      const reviewerProfilePath = `/users/${review.user_id}/profile`;

                      return (
                        <article key={review.id} className="relative rounded-2xl border border-outline-variant/20 bg-surface px-5 py-4 pb-4 shadow-sm">
                          <div className="pr-24 sm:pr-28">
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary font-label-md">
                                  {reviewerName
                                    .split(" ")
                                    .filter(Boolean)
                                    .map((part) => part[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </div>
                                <div>
                                  <Link to={reviewerProfilePath} className="font-label-md text-on-surface hover:text-primary transition-colors">
                                    {reviewerName}
                                  </Link>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-0.5">{renderStars(Number(review.vleresimi || 0))}</div>
                                    <span className="text-xs text-on-surface-variant">{formatDate(review.data)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => openUserReportDialog(review, reviewerName)}
                            className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-[#efc9aa] bg-[#fffaf5] px-2.5 py-1 text-[11px] font-semibold text-[#d97706] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-[#fff2e4] hover:text-[#b45309] whitespace-nowrap"
                            aria-label={`Raporto përdoruesin ${reviewerName}`}
                          >
                            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 0" }}>flag</span>
                            Report
                          </button>

                          <p className="mt-4 text-sm leading-relaxed text-on-surface-variant whitespace-pre-line">
                            {review.komenti?.trim() || "Nuk është shtuar koment për këtë vlerësim."}
                          </p>
                        </article>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface px-5 py-8 text-sm text-on-surface-variant">
                      Ende nuk ka komente për këtë recetë. Bëhu i pari që lë një vlerësim.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {reportTarget && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" onClick={() => setReportTarget(null)}>
                <div className="w-full max-w-[28rem] rounded-3xl border border-outline-variant/30 bg-surface p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-headline-sm text-on-surface">
                        {reportTarget.type === "recipe" ? "Raporto recetën" : "Raporto përdoruesin"}
                      </h3>
                      <p className="mt-1 text-sm text-on-surface-variant">
                        {reportTarget.type === "recipe"
                          ? `Po raporton: ${reportTarget.label}`
                          : `Po raporton përdoruesin: ${reportTarget.label}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="rounded-full px-3 py-2 text-sm font-semibold text-primary"
                      onClick={() => setReportTarget(null)}
                    >
                      Mbyll
                    </button>
                  </div>

                  <form className="mt-5 space-y-4" onSubmit={submitReport}>
                    <label className="flex flex-col gap-2 text-sm font-medium text-on-surface">
                      Arsyeja e raportit
                      <textarea
                        value={reportDraft.reason}
                        onChange={(event) => setReportDraft((current) => ({ ...current, reason: event.target.value }))}
                        maxLength={500}
                        rows={5}
                        className="min-h-32 rounded-xl border border-outline-variant/40 bg-surface-variant/20 px-4 py-3 outline-none focus:border-primary resize-none"
                        placeholder="Shkruaj pse po e raporton këtë recetë ose përdorues"
                      />
                    </label>

                    <div className="flex items-center justify-between text-xs text-on-surface-variant">
                      <span>Raportet shqyrtohen nga administrimi.</span>
                      <span>{reportDraft.reason.length}/500</span>
                    </div>

                    {reportError && (
                      <p className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
                        {reportError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={reportSubmitting}
                      className="w-full rounded-full bg-primary px-5 py-3 font-label-md text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {reportSubmitting ? "Duke dërguar..." : "Dërgo raportin"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {favoriteMenuOpen && (
              <div className="fixed inset-0 z-[100] bg-black/35 backdrop-blur-[1px] flex items-center justify-center p-4" onClick={() => setFavoriteMenuOpen(false)}>
                <div className="w-full max-w-[26rem] rounded-2xl border border-outline-variant/30 bg-surface p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-headline-sm text-on-surface">Ruaj në koleksion</h3>
                      <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">{recipe.titulli || recipe.title || "Recetë"}</p>
                    </div>
                    <span className={`material-symbols-outlined text-[22px] ${isFavorited ? 'text-primary' : 'text-on-surface-variant'}`} style={isFavorited ? { fontVariationSettings: "'FILL' 1" } : undefined}>
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
                      onClick={() => void createFavoriteCategory()}
                      disabled={categoryCreating}
                      className="mt-7 whitespace-nowrap rounded-full bg-primary px-4 py-2.5 text-white font-label-md hover:bg-primary/90 disabled:opacity-60"
                    >
                      Krijo kategori
                    </button>
                  </div>

                  <div className="mt-4 border-t border-outline-variant/20 pt-4">
                    <div className="max-h-[18rem] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(180,120,70,0.45)_transparent]">
                      <div className="grid grid-cols-3 gap-3">
                        {favoriteCategories.length < 3 && Array.from({ length: 3 - favoriteCategories.length }).map((_, index) => (
                          <div key={`empty-top-${index}`} className="aspect-square rounded-2xl border border-dashed border-outline-variant/30 bg-surface-variant/10" />
                        ))}

                        {favoriteCategories.map((category) => {
                          const isSelected = Number(selectedCategoryId) === category.id;
                          const thumbnail = getCategoryThumbnail(category);

                          return (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => setSelectedCategoryId(String(category.id))}
                              className={`aspect-square rounded-2xl border p-3 text-left transition-colors ${isSelected ? 'border-primary bg-primary/10' : 'border-outline-variant/30 bg-surface-variant/10 hover:bg-surface-variant/20'}`}
                            >
                              <div className="flex h-full flex-col justify-between">
                                <div>
                                  <div className="mb-2 overflow-hidden rounded-xl bg-surface-variant/20 aspect-square flex items-center justify-center">
                                    {thumbnail ? (
                                      <img src={thumbnail} alt={category.emertimi} className="h-full w-full object-cover" />
                                    ) : (
                                      <span className={`material-symbols-outlined text-[20px] ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>
                                        folder
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-2 line-clamp-2 text-sm font-semibold text-on-surface">{category.emertimi}</p>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                                  <span>{category.is_public ? 'Publike' : 'Private'}</span>
                                  {isSelected && <span className="text-primary">Zgjedhur</span>}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {favoriteMessage && (
                    <p className="mt-4 rounded-xl bg-primary/10 px-4 py-2.5 text-sm text-primary">{favoriteMessage}</p>
                  )}
                  {favoriteError && (
                    <p className="mt-4 rounded-xl bg-error/10 px-4 py-2.5 text-sm text-error">{favoriteError}</p>
                  )}

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void saveFavoriteToCategory()}
                      disabled={favoriteLoading || favoriteSubmitting || !recipeId}
                      className="rounded-full bg-primary px-5 py-2.5 text-white font-label-md hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {favoriteSubmitting ? "Duke ruajtur..." : "Ruaj"}
                    </button>
                    {isFavorited && (
                      <button
                        type="button"
                        onClick={() => void removeFavoriteFromRecipe()}
                        disabled={favoriteSubmitting}
                        className="inline-flex items-center gap-2 rounded-full border border-outline-variant/40 px-5 py-2.5 text-on-surface font-label-md hover:bg-surface-variant/20 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                        Unfavorite
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
