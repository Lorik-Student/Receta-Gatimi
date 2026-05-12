import React from "react";
import { useLoaderData, Link } from "react-router-dom";
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

  const recipeCards: RecipeCardData[] = recipes.map((r: any) => ({
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
              Totali i recetave: <strong className="text-primary">{recipes.length}</strong>
            </div>
            <Link to="/recipes/create" className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full font-label-md transition-colors">
              Krijo recetë të re
            </Link>
          </div>
        </div>

        {recipeCards.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-2xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">menu_book</span>
            <h3 className="font-headline-md text-on-surface mb-2">Nuk ka asnjë recetë.</h3>
            <Link to="/recipes/create" className="bg-secondary hover:bg-secondary/90 text-on-secondary px-6 py-3 rounded-full font-label-md transition-colors inline-block mt-4">
              Krijo të parën
            </Link>
          </div>
        ) : (
          <Cards items={recipeCards} />
        )}
      </main>
      <Footer />
    </div>
  );
}
