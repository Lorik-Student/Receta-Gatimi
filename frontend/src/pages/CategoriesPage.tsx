import React, { useMemo, useState } from "react";
import { useLoaderData, Link } from "react-router-dom";
import { apiFetch } from "../api";
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Cards, RecipeCardData } from '../components/Cards';
import { NavigationBar } from '../components/NavigationBar';

const CATEGORY_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80";

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Recipes', to: '/recipes' },
  { label: 'Categories', to: '/categories' },
  { label: 'About Us', to: '/about' },
];

export async function categoriesLoader() {
    const [categoriesResult, recipesResult] = await Promise.all([
        apiFetch("/categories"),
        apiFetch("/recipes")
    ]);

    if (!categoriesResult.ok) {
        throw new Error((categoriesResult as any).error?.message || "Dështoi ngarkimi i kategorive");
    }
    if (!recipesResult.ok) {
        throw new Error((recipesResult as any).error?.message || "Dështoi ngarkimi i recetave");
    }

    const categories = Array.isArray(categoriesResult) ? categoriesResult : ((categoriesResult as any).data || Object.values(categoriesResult).filter(v => typeof v === "object" && v !== null && "id" in v));
    const recipes = Array.isArray(recipesResult) ? recipesResult : ((recipesResult as any).data || Object.values(recipesResult).filter(v => typeof v === "object" && v !== null && "id" in v));

    return { categories, recipes };
}

export function CategoriesPage() {
    const data = useLoaderData() as any;
    const categories = data.categories || [];
    const recipes = data.recipes || [];
    const [activeCategoryId, setActiveCategoryId] = useState<number | "all">("all");

    const categoryNavItems = useMemo(() => {
        return [
            { label: 'Të gjitha', isActive: activeCategoryId === "all", onClick: () => setActiveCategoryId("all") },
            ...categories.map((c: any) => ({
                label: c.emertimi || c.name || "Kategori",
                isActive: activeCategoryId === c.id,
                onClick: () => setActiveCategoryId(c.id)
            }))
        ];
    }, [categories, activeCategoryId]);

    const filteredRecipes = useMemo(() => {
        return activeCategoryId === "all"
            ? recipes
            : recipes.filter((r: any) => Number(r.category_id) === Number(activeCategoryId));
    }, [recipes, activeCategoryId]);

    const recipeCards: RecipeCardData[] = filteredRecipes.map((r: any) => ({
        title: r.titulli || "Recetë pa titull",
        description: r.pershkrimi || "Pa përshkrim",
        image: r.imazhi || CATEGORY_FALLBACK_IMAGE,
        badge: categories.find((c:any) => c.id === r.category_id)?.emertimi || 'General',
        time: `${r.koha_pergatitjes || 0} Min`,
        difficulty: 'Medium',
        rating: '4.5',
    }));

    return (
        <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
            <Header brand="Receta Gatimi" navItems={navItems} activePath="/categories" />
            <main className="flex-1 max-w-container-max-width mx-auto px-margin-desktop py-12 w-full">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="font-display-lg text-on-surface mb-2">Kategoritë</h2>
                        <p className="font-body-lg text-on-surface-variant">Eksploro recetat përkrah kategorive.</p>
                    </div>
                </div>

                <div className="mb-10 w-full overflow-x-auto pb-4">
                    <div className="flex gap-2 min-w-max">
                        {categoryNavItems.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={item.onClick}
                                className={`px-5 py-2 rounded-full font-label-md transition-colors whitespace-nowrap ${
                                    item.isActive
                                      ? 'bg-secondary text-on-secondary'
                                      : 'bg-surface border border-outline-variant/30 text-on-surface hover:bg-surface-variant/50'
                                  }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {recipeCards.length === 0 ? (
                    <div className="text-center py-16 bg-surface rounded-2xl border border-outline-variant/20">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">search_off</span>
                        <h3 className="font-headline-md text-on-surface mb-2">Nuk u gjetën receta.</h3>
                    </div>
                ) : (
                    <Cards items={recipeCards} />
                )}
            </main>
            <Footer />
        </div>
    );
}
