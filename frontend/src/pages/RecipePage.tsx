import React from "react";
import { useLoaderData, Link } from "react-router-dom";
import { apiFetch } from "../api";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const RECIPE_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Recipes", to: "/recipes" },
  { label: "Categories", to: "/categories" },
  { label: "About Us", to: "/about" },
];

export async function recipeLoader({ params }: any) {
  const result = await apiFetch(`/recipes/${params.id}`);
  if (!result.ok) throw new Error("Receta nuk u gjet");
  return result;
}

export function RecipePage() {
  const rawData = useLoaderData() as any;
  const recipe = rawData.data || rawData;

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <Header brand="Receta Gatimi" navItems={navItems} activePath="/recipes" />
      <main className="flex-1 max-w-4xl mx-auto px-margin-desktop py-12 w-full">
        <Link to="/recipes" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-label-md transition-colors mb-8">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to recipes
        </Link>

        <div className="bg-surface rounded-2xl overflow-hidden shadow-sm border border-outline-variant/30 mb-8">
          <div className="h-80 w-full relative">
            <img src={recipe.imazhi || RECIPE_FALLBACK_IMAGE} alt={recipe.titulli || recipe.title || "Recipe"} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <span className="bg-primary text-white px-3 py-1 rounded-full font-label-sm mb-3 inline-block">Recipe</span>
              <h1 className="font-display-lg text-white mb-2 leading-tight">{recipe.titulli || recipe.title || "Untitled Recipe"}</h1>
            </div>
          </div>

          <div className="p-8">
            <p className="font-body-lg text-on-surface-variant mb-8 leading-relaxed">
              {recipe.pershkrimi || recipe.description || "Nuk ka përshkrim për këtë recetë."}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-surface-variant/30 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-primary mb-2">schedule</span>
                <span className="text-on-surface-variant font-label-sm">Prep Time</span>
                <strong className="text-on-surface font-label-lg">{recipe.koha_pergatitjes || 0} min</strong>
              </div>
              <div className="bg-surface-variant/30 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-primary mb-2">cooking</span>
                <span className="text-on-surface-variant font-label-sm">Cook Time</span>
                <strong className="text-on-surface font-label-lg">{recipe.koha_gatimit || 0} min</strong>
              </div>
              <div className="bg-surface-variant/30 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-primary mb-2">restaurant</span>
                <span className="text-on-surface-variant font-label-sm">Portions</span>
                <strong className="text-on-surface font-label-lg">{recipe.porcione || 0}</strong>
              </div>
              <div className="bg-surface-variant/30 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-primary mb-2">bar_chart</span>
                <span className="text-on-surface-variant font-label-sm">Difficulty</span>
                <strong className="text-on-surface font-label-lg capitalize">{recipe.veshtiresija || "N/A"}</strong>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <h2 className="font-headline-md text-on-surface flex items-center gap-2 mb-4 border-b border-outline-variant/30 pb-2">
                  <span className="material-symbols-outlined text-primary">kitchen</span>
                  Ingredients
                </h2>
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  <ul className="space-y-3">
                    {recipe.ingredients.map((ing: any, i: number) => (
                      <li key={ing.id || i} className="flex justify-between items-center bg-surface-variant/20 p-2 py-3 rounded-lg px-4 border border-outline-variant/20">
                        <span className="font-body-md text-on-surface-variant">{ing.emertimi || `Përbërësi ${i + 1}`}</span>
                        <span className="font-label-md text-on-surface font-medium bg-surface px-2 py-1 rounded shadow-sm">{ing.sasia} {ing.njesia}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-on-surface-variant/70 italic text-sm">Nuk ka përbërës të listuar.</p>
                )}
              </div>

              <div className="md:col-span-2">
                <h2 className="font-headline-md text-on-surface flex items-center gap-2 mb-4 border-b border-outline-variant/30 pb-2">
                  <span className="material-symbols-outlined text-primary">list_alt</span>
                  Instructions
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
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
