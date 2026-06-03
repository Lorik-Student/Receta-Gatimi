import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLoaderData, useSearchParams } from "react-router-dom";
import { apiFetch } from "../api";
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Cards, RecipeCardData } from '../components/Cards';

const RECIPE_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80";

type RecipeRecord = {
  id?: number | string;
  recipe_id?: number | string;
  titulli?: string;
  title?: string;
  pershkrimi?: string;
  description?: string;
  imazhi?: string;
  koha_pergatitjes?: number | string;
  author_id?: number | string;
  user_id?: number | string;
  author_emri?: string;
  author_mbiemri?: string;
  category_id?: number | string;
  ingredients?: Array<{ emertimi?: string }>;
  categories?: Array<{ emertimi?: string; name?: string }>;
  tags?: Array<{ emertimi?: string; name?: string }>;
};

type CategoryRecord = {
  id?: number | string;
  emertimi?: string;
  name?: string;
  pershkrimi?: string;
  imazhi?: string;
};

type RecipesLoaderData = {
  recipes?: RecipeRecord[];
  categories?: CategoryRecord[];
};

function readCollection<T>(payload: unknown, keys: string[]): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value as T[];
    }
  }

  return Object.values(record).filter(
    (value): value is T => typeof value === "object" && value !== null && "id" in value
  );
}

function isValidCategory(category: CategoryRecord): category is CategoryRecord & { id: number; emertimi: string } {
  const parsedId = Number(category.id);
  return Number.isInteger(parsedId) && parsedId > 0 && typeof category.emertimi === "string" && category.emertimi.trim().length > 0;
}

function isValidRecipe(recipe: RecipeRecord): recipe is RecipeRecord {
  const parsedId = Number(recipe.id ?? recipe.recipe_id);
  return Number.isInteger(parsedId) && parsedId > 0;
}

function getRecipeId(recipe: RecipeRecord) {
  return Number(recipe.id ?? recipe.recipe_id ?? 0);
}

function getCategoryLabel(category: CategoryRecord) {
  return (category.emertimi || category.name || "Kategori").trim();
}

export async function recipesLoader() {
  const [recipesResult, categoriesResult] = await Promise.all([
    apiFetch("/recipes"),
    apiFetch("/categories")
  ]);

  if (!recipesResult.ok) {
    throw new Error((recipesResult as any).error?.message || "Dështoi ngarkimi i recetave");
  }

  if (!categoriesResult.ok) {
    throw new Error((categoriesResult as any).error?.message || "Dështoi ngarkimi i kategorive");
  }

  return {
    recipes: readCollection<RecipeRecord>(recipesResult, ["recipes", "data"]),
    categories: readCollection<CategoryRecord>(categoriesResult, ["categories", "data"])
  };
}

export function RecipesPage() {
  const data = useLoaderData() as RecipesLoaderData;
  const recipes = useMemo(() => (data.recipes || []).filter(isValidRecipe), [data.recipes]);
  const categories = useMemo(() => (data.categories || []).filter(isValidCategory), [data.categories]);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<number | "all">("all");
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const urlQuery = searchParams.get("q");
    setSearchQuery(urlQuery ?? "");
  }, [searchParams]);

  useEffect(() => {
    const categoryQuery = searchParams.get("category");
    if (!categoryQuery) {
      setActiveCategoryId("all");
      return;
    }

    const parsedCategoryId = Number(categoryQuery);
    if (!Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0) {
      setActiveCategoryId("all");
      return;
    }

    const categoryExists = categories.some((category) => Number(category.id) === parsedCategoryId);
    setActiveCategoryId(categoryExists ? parsedCategoryId : "all");
  }, [categories, searchParams]);

  useEffect(() => {
    if (activeCategoryId === "all") {
      return;
    }

    const categoryExists = categories.some((category) => Number(category.id) === activeCategoryId);
    if (!categoryExists) {
      setActiveCategoryId("all");
    }
  }, [activeCategoryId, categories]);

  useEffect(() => {
    const container = categoryScrollRef.current;

    if (!container) {
      return;
    }

    const syncScrollState = () => {
      setCanScrollLeft(container.scrollLeft > 2);
      setCanScrollRight(container.scrollLeft + container.clientWidth < container.scrollWidth - 2);
    };

    syncScrollState();
    container.addEventListener("scroll", syncScrollState, { passive: true });
    window.addEventListener("resize", syncScrollState);

    return () => {
      container.removeEventListener("scroll", syncScrollState);
      window.removeEventListener("resize", syncScrollState);
    };
  }, [categories.length]);

  useEffect(() => {
    const container = categoryScrollRef.current;
    if (container) {
      container.scrollTo({ left: 0, behavior: "auto" });
    }
  }, [categories.length]);

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const activeCategoryLabel = useMemo(() => {
    if (activeCategoryId === "all") {
      return "Të gjitha recetat";
    }

    return categories.find((category) => Number(category.id) === activeCategoryId)?.emertimi || "këtë kategori";
  }, [activeCategoryId, categories]);

  // Filter recipes based on search query
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const categoryMatches = activeCategoryId === "all" || Number(recipe.category_id) === activeCategoryId;
      if (!categoryMatches) {
        return false;
      }

      if (!normalizedSearchQuery) {
        return true;
      }

      const title = (recipe.titulli || recipe.title || "").toLowerCase();
      const description = (recipe.pershkrimi || recipe.description || "").toLowerCase();

      if (title.includes(normalizedSearchQuery) || description.includes(normalizedSearchQuery)) {
        return true;
      }

      if (Array.isArray(recipe.ingredients)) {
        const hasIngredient = recipe.ingredients.some((ingredient) =>
          (ingredient.emertimi || "").toLowerCase().includes(normalizedSearchQuery)
        );

        if (hasIngredient) {
          return true;
        }
      }

      if (Array.isArray(recipe.categories)) {
        const hasCategory = recipe.categories.some((category) =>
          (category.emertimi || category.name || "").toLowerCase().includes(normalizedSearchQuery)
        );

        if (hasCategory) {
          return true;
        }
      }

      if (Array.isArray(recipe.tags)) {
        const hasTag = recipe.tags.some((tag) =>
          (tag.emertimi || tag.name || "").toLowerCase().includes(normalizedSearchQuery)
        );

        if (hasTag) {
          return true;
        }
      }

      return false;
    });
  }, [activeCategoryId, normalizedSearchQuery, recipes]);

  const visibleCategoryCount = Math.min(3, Math.max(1, categories.length));

  function updateCategoryScroll(direction: "left" | "right") {
    const container = categoryScrollRef.current;
    if (!container) {
      return;
    }

    const firstChip = container.querySelector<HTMLElement>("[data-category-chip='true']");
    const chipWidth = firstChip ? firstChip.getBoundingClientRect().width + 12 : 160;
    container.scrollBy({
      left: chipWidth * visibleCategoryCount * (direction === "right" ? 1 : -1),
      behavior: "smooth"
    });
  }

  const recipeCards: RecipeCardData[] = filteredRecipes.map((recipe) => ({
    id: String(getRecipeId(recipe)),
    title: recipe.titulli || recipe.title || "Recetë pa titull",
    description: recipe.pershkrimi || recipe.description || "Nuk ka përshkrim.",
    image: recipe.imazhi || RECIPE_FALLBACK_IMAGE,
    badge: "Recetë",
    time: `${recipe.koha_pergatitjes || 0} Min`,
    difficulty: "Mesatare",
    rating: "4.8",
    authorId: Number(recipe.author_id || recipe.user_id || 0) || undefined,
    authorName: [recipe.author_emri, recipe.author_mbiemri].filter(Boolean).join(" ") || undefined,
  }));

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <Header brand="Receta Gatimi" activePath="/recipes" />
      <main className="flex-1 max-w-container-max-width mx-auto px-margin-desktop py-12 w-full">
        <div className="flex justify-between items-end mb-10 border-b border-outline-variant/30 pb-6">
          <div>
            <h2 className="font-display-lg text-on-surface mb-2">Recetat</h2>
            <p className="font-body-lg text-on-surface-variant">Një pamje moderne dhe e pastër për të gjitha recetat.</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="bg-surface border border-outline-variant/30 px-4 py-2 rounded-xl text-sm font-label-md">
              Totali i recetave: <strong className="text-primary">{filteredRecipes.length}</strong>
            </div>
            <Link to="/recipes/create" className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full font-label-md transition-colors">
              Krijo recetë të re
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              placeholder="Kërko recetat sipas titullit, përbërësve ose kategorive..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface border border-outline-variant/30 rounded-xl font-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                aria-label="Pastro kërkimin"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>
        </div>

        <section id="recipe-categories" className="mb-8 rounded-2xl border border-outline-variant/20 bg-surface px-4 py-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-headline-sm text-on-surface">Eksploro kategoritë</h3>
              <p className="text-sm text-on-surface-variant">Zgjidh një kategori për të filtruar recetat poshtë kërkimit.</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {categories.length} kategori
            </span>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <button
              type="button"
              onClick={() => setActiveCategoryId("all")}
              className={`inline-flex shrink-0 items-center justify-center rounded-full px-5 py-2.5 font-label-md transition-colors ${
                activeCategoryId === "all"
                  ? "bg-secondary text-on-secondary"
                  : "border border-outline-variant/30 bg-surface text-on-surface hover:bg-surface-variant/50"
              }`}
              aria-pressed={activeCategoryId === "all"}
            >
              Të gjitha recetat
            </button>

            <div className="relative min-w-0 flex-1">
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => updateCategoryScroll("left")}
                  className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-outline-variant/30 bg-surface px-2 py-2 text-on-surface shadow-sm transition-colors hover:bg-surface-variant/50"
                  aria-label="Shko te kategoritë e mëparshme"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </button>
              )}

              <div ref={categoryScrollRef} className="no-scrollbar overflow-x-auto scroll-smooth px-11">
                <div className="flex min-w-max gap-2 py-1">
                  {categories.map((category) => {
                    const categoryId = Number(category.id);
                    const isActive = activeCategoryId === categoryId;

                    return (
                      <button
                        key={categoryId}
                        type="button"
                        data-category-chip="true"
                        onClick={() => setActiveCategoryId(categoryId)}
                        className={`inline-flex shrink-0 items-center justify-center rounded-full px-5 py-2.5 font-label-md whitespace-nowrap transition-colors ${
                          isActive
                            ? "bg-primary text-white shadow-sm"
                            : "border border-outline-variant/30 bg-surface text-on-surface hover:bg-surface-variant/50"
                        }`}
                        aria-pressed={isActive}
                      >
                        {getCategoryLabel(category)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => updateCategoryScroll("right")}
                  className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-outline-variant/30 bg-surface px-2 py-2 text-on-surface shadow-sm transition-colors hover:bg-surface-variant/50"
                  aria-label="Shko te kategoritë e tjera"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {recipeCards.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-2xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">menu_book</span>
            <h3 className="font-headline-md text-on-surface mb-2">
              {normalizedSearchQuery
                ? "Nuk u gjet asnjë recetë për këtë kërkim."
                : activeCategoryId === "all"
                  ? "Nuk ka asnjë recetë."
                  : `Nuk ka receta në ${activeCategoryLabel}.`}
            </h3>
            {normalizedSearchQuery ? (
              <p className="text-on-surface-variant mb-4">Provo të kërkosh me fjalë kyçe të ndryshme.</p>
            ) : (
              <Link to="/recipes/create" className="bg-secondary hover:bg-secondary/90 text-on-secondary px-6 py-3 rounded-full font-label-md transition-colors inline-block mt-4">
                Krijo të parën
              </Link>
            )}
          </div>
        ) : (
          <Cards items={recipeCards} />
        )}
      </main>
      <Footer />
    </div>
  );
}
