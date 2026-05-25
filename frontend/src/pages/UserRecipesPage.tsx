import React, { useMemo } from "react";
import { Link, useLoaderData, useParams } from "react-router-dom";
import { apiFetch } from "../api";
import { Cards, RecipeCardData } from "../components/Cards";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { resolveImageSrc } from "../utils/image";

const RECIPE_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80";

export async function userRecipesLoader({ params }: any) {
  const result = await apiFetch(params?.id ? `/users/${params.id}/profile` : "/users/me/profile");
  if (!result.response.ok) {
    throw new Error((result as any).error?.message || "Dështoi ngarkimi i recetave");
  }

  return result;
}

export function UserRecipesPage() {
  const data = useLoaderData() as any;
  const params = useParams();
  const user = data.user;

  const recipeCards: RecipeCardData[] = useMemo(() => {
    const recipes = Array.isArray(user?.recipes) ? user.recipes : [];

    return recipes.map((recipe: any) => ({
      id: String(recipe.id),
      title: recipe.titulli || recipe.title || "Recetë pa titull",
      description: recipe.pershkrimi || recipe.description || "Nuk ka përshkrim.",
      image: resolveImageSrc(recipe.imazhi) || RECIPE_FALLBACK_IMAGE,
      badge: "Recetë",
      time: `${recipe.koha_pergatitjes || 0} Min`,
      difficulty: "Mesatare",
      rating: "4.8",
      authorId: Number(recipe.author_id || 0) || undefined,
      authorName: [recipe.author_emri, recipe.author_mbiemri].filter(Boolean).join(" ") || undefined,
    }));
  }, [user]);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <Header brand="Receta Gatimi" activePath="" />
      <main className="flex-1 max-w-[1280px] mx-auto px-margin-desktop py-12 w-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10 border-b border-outline-variant/30 pb-6">
          <div>
            <h1 className="font-display-lg text-on-surface mb-2">
              {user ? `Recetat e ${user.emri} ${user.mbiemri}` : "Recetat"}
            </h1>
            <p className="font-body-lg text-on-surface-variant">Të gjitha recetat publike që ky përdorues ka publikuar.</p>
          </div>
          <Link
            to={params.id ? `/users/${params.id}/profile` : "/profile"}
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface px-4 py-2 font-label-md text-on-surface transition-colors hover:bg-surface-variant/20"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Kthehu te profili
          </Link>
        </div>

        {recipeCards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface px-4 py-10 text-center text-on-surface-variant">
            Nuk ka receta për t'u shfaqur.
          </div>
        ) : (
          <Cards items={recipeCards} />
        )}
      </main>
      <Footer />
    </div>
  );
}
