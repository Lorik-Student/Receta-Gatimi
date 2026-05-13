import React, { useState, useMemo, useEffect } from "react";
import { useLoaderData, Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "../api";
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Cards, RecipeCardData } from '../components/Cards';

const RECIPE_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80";

export async function recipesLoader() {
  const result = await apiFetch("/recipes");
  if (!result.ok) {
    throw new Error((result as any).error?.message || "Dështoi ngarkimi i recetave");
  }
  return result;
}

export function RecipesPage() {
  const data = useLoaderData() as any;
  const recipes = Array.isArray(data) ? data : (data.data || Object.values(data).filter(v => typeof v === "object" && v !== null && "id" in v));
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  // Set search query from URL parameter on mount
  useEffect(() => {
    const urlQuery = searchParams.get("q");
    if (urlQuery) {
      setSearchQuery(urlQuery);
    }
  }, [searchParams]);

  // Filter recipes based on search query
  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return recipes;

    const query = searchQuery.toLowerCase();
    return recipes.filter((r: any) => {
      const title = (r.titulli || r.title || "").toLowerCase();
      const description = (r.pershkrimi || r.description || "").toLowerCase();
      
      // Search in title and description
      if (title.includes(query) || description.includes(query)) return true;

      // Search in ingredients
      if (r.ingredients && Array.isArray(r.ingredients)) {
        const hasIngredient = r.ingredients.some((ing: any) =>
          (ing.emertimi || "").toLowerCase().includes(query)
        );
        if (hasIngredient) return true;
      }

      // Search in categories/tags
      if (r.categories && Array.isArray(r.categories)) {
        const hasCategory = r.categories.some((cat: any) =>
          (cat.emertimi || cat.name || "").toLowerCase().includes(query)
        );
        if (hasCategory) return true;
      }

      return false;
    });
  }, [recipes, searchQuery]);

  const recipeCards: RecipeCardData[] = filteredRecipes.map((r: any) => ({
    id: r.id || r.recipe_id || "",
    title: r.titulli || r.title || "Recetë pa titull",
    description: r.pershkrimi || r.description || "Nuk ka përshkrim.",
    image: r.imazhi || RECIPE_FALLBACK_IMAGE,
    badge: "Recetë",
    time: `${r.koha_pergatitjes || 0} Min`,
    difficulty: "Mesatare",
    rating: "4.8",
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

        {recipeCards.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-2xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">menu_book</span>
            <h3 className="font-headline-md text-on-surface mb-2">
              {searchQuery ? "Nuk u gjet asnjë recetë për këtë kërkimin." : "Nuk ka asnjë recetë."}
            </h3>
            {searchQuery ? (
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
