import React, { useEffect, useMemo, useState } from "react";
import { Link, useLoaderData, useParams } from "react-router-dom";
import { apiFetch } from "../api";
import { Cards, RecipeCardData } from "../components/Cards";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { resolveImageSrc } from "../utils/image";

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
  pershkrimi?: string | null;
  imazhi?: string;
  recipes: FavoriteRecipe[];
}

interface FavoritesPayload {
  favorites?: {
    categories?: FavoriteCategory[];
    uncategorized?: FavoriteRecipe[];
  };
}

const RECIPE_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80";

export function favoriteCategoryLoader() {
  return apiFetch("/interactions/favorites");
}

export function FavoriteCategoryPage() {
  const data = useLoaderData() as FavoritesPayload;
  const params = useParams();
  const categoryId = Number(params.id);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [savingDescription, setSavingDescription] = useState(false);
  const [pageMessage, setPageMessage] = useState("");
  const [pageError, setPageError] = useState("");

  const category = useMemo(() => {
    const categories = Array.isArray(data?.favorites?.categories) ? data.favorites.categories : [];
    return categories.find((item) => item.id === categoryId) || null;
  }, [data, categoryId]);

  useEffect(() => {
    setDescriptionDraft(category?.pershkrimi || "");
  }, [category?.id, category?.pershkrimi]);

  useEffect(() => {
    async function loadRecipes() {
      setRecipesLoading(true);

      try {
        const result = await apiFetch("/recipes");
        const loadedRecipes = Array.isArray(result)
          ? result
          : (result.data || Object.values(result).filter((value) => typeof value === "object" && value !== null && "id" in value));

        setRecipes(Array.isArray(loadedRecipes) ? loadedRecipes : []);
      } catch (error) {
        console.error("Failed to load recipes for favorite category page:", error);
        setPageError("Nuk u ngarkuan recetat.");
      } finally {
        setRecipesLoading(false);
      }
    }

    void loadRecipes();
  }, []);

  const categoryRecipeIds = useMemo(
    () => new Set((category?.recipes || []).map((recipe) => Number(recipe.recipe_id))),
    [category]
  );

  const recipeCards: RecipeCardData[] = useMemo(() => {
    return recipes
      .filter((recipe: any) => categoryRecipeIds.has(Number(recipe.id || recipe.recipe_id)))
      .map((recipe: any) => ({
        id: recipe.id || recipe.recipe_id || "",
        title: recipe.titulli || recipe.title || "Recetë pa titull",
        description: recipe.pershkrimi || recipe.description || "Nuk ka përshkrim.",
        image: recipe.imazhi || RECIPE_FALLBACK_IMAGE,
        badge: "Recetë",
        time: `${recipe.koha_pergatitjes || 0} Min`,
        difficulty: recipe.veshtiresija || "Mesatare",
        rating: "4.8",
        authorId: Number(recipe.author_id || recipe.user_id || 0) || undefined,
        authorName: [recipe.author_emri, recipe.author_mbiemri].filter(Boolean).join(" ") || undefined,
      }));
  }, [categoryRecipeIds, recipes]);

  const thumbnail = category ? resolveImageSrc(category.imazhi || category.recipes?.[0]?.imazhi) : "";

  async function saveDescription() {
    if (!category) {
      return;
    }

    setSavingDescription(true);
    setPageError("");
    setPageMessage("");

    try {
      const response = await apiFetch(`/interactions/favorites/categories/${category.id}`, {
        method: "PATCH",
        body: JSON.stringify({ pershkrimi: descriptionDraft })
      });

      if (!response.ok) {
        throw new Error("Failed to update favorite category description");
      }

      setPageMessage("Përshkrimi u ruajt.");
    } catch (error) {
      console.error("Failed to save favorite category description:", error);
      setPageError("Ruajtja e përshkrimit dështoi.");
    } finally {
      setSavingDescription(false);
    }
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <Header brand="Receta Gatimi" activePath="/profile" />
      <main className="flex-1 max-w-container-max-width mx-auto px-margin-desktop py-12 w-full">
        <div className="mb-8 flex items-center justify-between gap-4 border-b border-outline-variant/30 pb-6">
          <div>
            <h1 className="font-display-lg text-on-surface mb-2">Koleksioni i ruajtur</h1>
            <p className="font-body-lg text-on-surface-variant">Këtu janë recetat e ruajtura në këtë kategori.</p>
          </div>
          <Link
            to="/profile/favorites"
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface px-4 py-2 font-label-md text-on-surface transition-colors hover:bg-surface-variant/20"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Kthehu
          </Link>
        </div>

        {!category ? (
          <div className="rounded-2xl border border-outline-variant/30 bg-surface p-6 text-on-surface-variant shadow-sm">
            Kjo kategori nuk u gjet.
          </div>
        ) : (
          <>
            <section className="overflow-hidden rounded-3xl border border-outline-variant/30 bg-surface shadow-sm">
              <div className="flex flex-col lg:flex-row">
                <div className="relative h-56 w-full lg:h-auto lg:min-h-[18rem] lg:w-[19rem] bg-surface-variant/20">
                  {thumbnail ? (
                    <img src={thumbnail} alt={category.emertimi} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full min-h-[18rem] items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-[44px]">folder</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-5 p-6 md:p-8">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-on-surface-variant">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{category.is_public ? "Publike" : "Private"}</span>
                      <span className="rounded-full bg-surface-variant/20 px-3 py-1">{category.recipes.length} receta</span>
                    </div>
                    <h2 className="mt-3 font-headline-md text-on-surface">{category.emertimi}</h2>
                  </div>

                  <div className="grid gap-3">
                    <label className="text-sm font-medium text-on-surface">
                      Përshkrimi
                      <textarea
                        value={descriptionDraft}
                        onChange={(event) => setDescriptionDraft(event.target.value)}
                        rows={4}
                        placeholder="Shto një përshkrim për këtë koleksion..."
                        className="mt-2 w-full rounded-2xl border border-outline-variant/40 bg-background px-4 py-3 outline-none transition-colors focus:border-primary resize-none"
                      />
                    </label>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => void saveDescription()}
                        disabled={savingDescription}
                        className="rounded-full bg-primary px-5 py-2.5 text-white font-label-md hover:bg-primary/90 disabled:opacity-60"
                      >
                        {savingDescription ? "Duke ruajtur..." : "Ruaj përshkrimin"}
                      </button>
                      <p className="text-sm text-on-surface-variant">
                        {descriptionDraft.trim().length > 0 ? "Përshkrimi ruhet për këtë koleksion." : "Mund ta lësh bosh nëse nuk do përshkrim."}
                      </p>
                    </div>

                    {pageMessage && <p className="rounded-xl bg-primary/10 px-4 py-2.5 text-sm text-primary">{pageMessage}</p>}
                    {pageError && <p className="rounded-xl bg-error/10 px-4 py-2.5 text-sm text-error">{pageError}</p>}
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-10">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h3 className="font-headline-sm text-on-surface">Recetat e ruajtura</h3>
                  <p className="text-sm text-on-surface-variant">Pamja është e njëjtë me faqen kryesore të recetave.</p>
                </div>
                <p className="text-sm text-on-surface-variant">{recipesLoading ? "Duke ngarkuar..." : `${recipeCards.length} receta`}</p>
              </div>

              {recipeCards.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface px-4 py-5 text-sm text-on-surface-variant">
                  Nuk ka receta në këtë kategori.
                </div>
              ) : (
                <Cards items={recipeCards} />
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}